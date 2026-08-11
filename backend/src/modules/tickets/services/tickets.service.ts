import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createAppLogger } from '#/common/logging/app-logger.js';
import { TenantAccessService } from '#/common/tenancy/tenant-access.service.js';
import type { Prisma } from '#/generated/prisma/client.js';
import {
  TicketPriority,
  TicketServiceCategory,
  TicketStatus,
} from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import type { AppConfigType } from '#/utils/config/app.config.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';
import { isWebsiteRequiredForService, TICKET_SERVICE_CATALOG } from '../ticket-service-catalog.js';
import { mapTicketDetail, mapTicketListItem, mapAdminTicketDetail, mapAdminTicketListItem } from '../ticket.mapper.js';
import { TicketNumberService } from './ticket-number.service.js';

const websiteSelect = {
  id: true,
  domain: true,
  displayName: true,
} as const;

const messageAuthorSelect = {
  id: true,
  fullName: true,
  role: true,
} as const;

@Injectable()
export class TicketsService {
  private readonly logger = createAppLogger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantAccess: TenantAccessService,
    private readonly ticketNumbers: TicketNumberService,
    private readonly config: ConfigService<AppConfigType, true>,
  ) {}

  listServices() {
    return {
      items: TICKET_SERVICE_CATALOG.map((item) => ({
        code: item.code,
        websiteRequired: item.websiteRequired,
      })),
    };
  }

  async listForUser(
    userId: string,
    params?: {
      status?: TicketStatus;
      service?: TicketServiceCategory;
      websiteId?: string;
      skip?: number;
      take?: number;
    },
  ) {
    const tenantIds = await this.tenantAccess.getAccessibleTenantIds(userId);
    const where: Prisma.TicketWhereInput = {
      tenantId: { in: tenantIds },
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.service ? { service: params.service } : {}),
      ...(params?.websiteId ? { websiteId: params.websiteId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: {
          website: { select: websiteSelect },
          messages: {
            where: { isInternal: false },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { author: { select: messageAuthorSelect } },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      items: items.map((ticket) => mapTicketListItem(ticket)),
      total,
    };
  }

  async getForUser(userId: string, id: string) {
    const ticket = await this.loadCustomerTicket(id);
    await this.tenantAccess.requireMembership(userId, ticket.tenantId);
    return mapTicketDetail(ticket);
  }

  async create(
    userId: string,
    input: {
      service: TicketServiceCategory;
      subject: string;
      description: string;
      websiteId?: string;
      tenantId?: string;
      attachments?: Array<{
        fileName: string;
        contentType: string;
        sizeBytes: number;
        storageKey: string;
      }>;
    },
  ) {
    const tenantId =
      input.tenantId ?? (await this.tenantAccess.resolvePrimaryTenantId(userId));
    await this.tenantAccess.requireMembership(userId, tenantId);

    if (isWebsiteRequiredForService(input.service) && !input.websiteId) {
      throw new BadRequestException(ERROR_MESSAGES.fa.ticketWebsiteRequired);
    }

    if (input.websiteId) {
      const website = await this.tenantAccess.assertWebsiteAccess(
        userId,
        input.websiteId,
      );
      if (website.tenantId !== tenantId) {
        throw new BadRequestException(ERROR_MESSAGES.fa.validation);
      }
    }

    const number = await this.ticketNumbers.allocate();

    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId,
        websiteId: input.websiteId,
        createdById: userId,
        number,
        subject: input.subject.trim(),
        service: input.service,
        priority: TicketPriority.NORMAL,
        status: TicketStatus.SUBMITTED,
        messages: {
          create: {
            authorId: userId,
            body: input.description.trim(),
            isInternal: false,
          },
        },
        attachments: input.attachments?.length
          ? {
              create: input.attachments.map((attachment) => ({
                fileName: attachment.fileName,
                contentType: attachment.contentType,
                sizeBytes: attachment.sizeBytes,
                storageKey: attachment.storageKey,
              })),
            }
          : undefined,
      },
      include: {
        website: { select: websiteSelect },
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: messageAuthorSelect } },
        },
        attachments: true,
      },
    });

    this.logger.log('ticket.created', {
      ticketId: ticket.id,
      number: ticket.number,
      tenantId,
      userId,
      service: ticket.service,
    });

    return mapTicketDetail(ticket);
  }

  async addCustomerMessage(
    userId: string,
    ticketId: string,
    bodyOrInput: string | { body: string; idempotencyKey?: string },
  ) {
    const input =
      typeof bodyOrInput === 'string'
        ? { body: bodyOrInput }
        : bodyOrInput;
    const idempotencyKey = input.idempotencyKey?.trim() || undefined;

    const ticket = await this.loadCustomerTicket(ticketId);
    await this.tenantAccess.requireMembership(userId, ticket.tenantId);

    if (ticket.status === TicketStatus.CLOSED) {
      throw new ConflictException(ERROR_MESSAGES.fa.ticketClosed);
    }

    const message = await this.prisma.$transaction(async (tx) => {
      if (idempotencyKey) {
        const existing = await tx.ticketMessage.findFirst({
          where: {
            ticketId: ticket.id,
            idempotencyKey,
          },
          include: { author: { select: messageAuthorSelect } },
        });
        if (existing) {
          return { message: existing, created: false as const };
        }
      }

      const created = await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: userId,
          body: input.body.trim(),
          isInternal: false,
          ...(idempotencyKey ? { idempotencyKey } : {}),
        },
        include: { author: { select: messageAuthorSelect } },
      });

      if (ticket.status === TicketStatus.WAITING_CUSTOMER) {
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.IN_PROGRESS },
        });
      } else {
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { updatedAt: new Date() },
        });
      }

      return { message: created, created: true as const };
    });

    if (message.created) {
      this.logger.log('ticket.message.created', {
        ticketId,
        messageId: message.message.id,
        isInternal: false,
      });
    }

    return {
      id: message.message.id,
      body: message.message.body,
      sender: 'USER' as const,
      author: {
        id: message.message.author.id,
        fullName: message.message.author.fullName,
      },
      attachments: [],
      createdAt: message.message.createdAt.toISOString(),
    };
  }

  async addAttachment(
    userId: string,
    ticketId: string,
    input: {
      fileName: string;
      contentType: string;
      sizeBytes: number;
      storageKey: string;
    },
  ) {
    const ticket = await this.loadCustomerTicket(ticketId);
    await this.tenantAccess.requireMembership(userId, ticket.tenantId);

    if (ticket.status === TicketStatus.CLOSED) {
      throw new ConflictException(ERROR_MESSAGES.fa.ticketClosed);
    }

    const attachment = await this.prisma.ticketAttachment.create({
      data: {
        ticketId,
        ...input,
      },
    });

    return {
      id: attachment.id,
      fileName: attachment.fileName,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
      storageKey: attachment.storageKey,
      createdAt: attachment.createdAt.toISOString(),
    };
  }

  async closeForUser(userId: string, ticketId: string) {
    const ticket = await this.loadCustomerTicket(ticketId);
    await this.tenantAccess.requireMembership(userId, ticket.tenantId);

    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new ConflictException(ERROR_MESSAGES.fa.invalidTicketTransition);
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.CLOSED,
        autoCloseAt: null,
      },
      include: {
        website: { select: websiteSelect },
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: messageAuthorSelect } },
        },
        attachments: true,
      },
    });

    this.logger.log('ticket.closed', { ticketId, by: 'customer' });
    return mapTicketDetail(updated);
  }

  async reopenForUser(userId: string, ticketId: string) {
    const ticket = await this.loadCustomerTicket(ticketId);
    await this.tenantAccess.requireMembership(userId, ticket.tenantId);

    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new ConflictException(ERROR_MESSAGES.fa.invalidTicketTransition);
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.IN_PROGRESS,
        resolvedAt: null,
        autoCloseAt: null,
      },
      include: {
        website: { select: websiteSelect },
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: messageAuthorSelect } },
        },
        attachments: true,
      },
    });

    this.logger.log('ticket.reopened', { ticketId, by: 'customer' });
    return mapTicketDetail(updated);
  }

  async listAdmin(params?: {
    status?: TicketStatus;
    skip?: number;
    take?: number;
  }) {
    const where = params?.status ? { status: params.status } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: {
          tenant: true,
          website: { select: websiteSelect },
          assignee: { select: { id: true, fullName: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return {
      items: items.map((ticket) => mapAdminTicketListItem(ticket)),
      total,
    };
  }

  async getAdmin(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        tenant: true,
        website: { select: websiteSelect },
        assignee: { select: { id: true, fullName: true } },
        createdBy: { select: { id: true, fullName: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: messageAuthorSelect } },
        },
        attachments: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return mapAdminTicketDetail(ticket);
  }

  async assign(ticketId: string, assigneeId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
    });
    if (!assignee) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assigneeId,
        status:
          ticket.status === TicketStatus.SUBMITTED
            ? TicketStatus.IN_PROGRESS
            : ticket.status,
      },
    });

    this.logger.log('ticket.assigned', { ticketId, assigneeId });
    return updated;
  }

  async requestCustomerInfo(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    if (ticket.status !== TicketStatus.IN_PROGRESS) {
      throw new ConflictException(ERROR_MESSAGES.fa.invalidTicketTransition);
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.WAITING_CUSTOMER },
    });

    this.logger.log('ticket.request_customer_info', { ticketId });
    return updated;
  }

  async resolve(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    if (
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.CLOSED
    ) {
      throw new ConflictException(ERROR_MESSAGES.fa.invalidTicketTransition);
    }

    const graceDays = this.config.get('app', { infer: true }).tickets
      .autoCloseGraceDays;
    const resolvedAt = new Date();
    const autoCloseAt = new Date(
      resolvedAt.getTime() + graceDays * 24 * 60 * 60 * 1000,
    );

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        resolvedAt,
        autoCloseAt,
      },
    });

    this.logger.log('ticket.resolved', {
      ticketId,
      resolvedAt: resolvedAt.toISOString(),
      autoCloseAt: autoCloseAt.toISOString(),
      graceDays,
    });

    return updated;
  }

  async addAdminMessage(
    authorId: string,
    ticketId: string,
    input: { body: string; isInternal?: boolean },
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId,
        body: input.body,
        isInternal: input.isInternal ?? false,
      },
    });

    this.logger.log('ticket.message.created', {
      ticketId,
      messageId: message.id,
      isInternal: message.isInternal,
    });
    return message;
  }

  /** Defensive helper: customers must never see internal notes. */
  assertCustomerVisible(isInternal: boolean) {
    if (isInternal) {
      throw new ForbiddenException(ERROR_MESSAGES.fa.forbidden);
    }
  }

  private async loadCustomerTicket(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        website: { select: websiteSelect },
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: messageAuthorSelect } },
        },
        attachments: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return ticket;
  }
}
