import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createAppLogger } from '#/common/logging/app-logger.js';
import { TenantAccessService } from '#/common/tenancy/tenant-access.service.js';
import {
  TicketPriority,
  TicketStatus,
} from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

@Injectable()
export class TicketsService {
  private readonly logger = createAppLogger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async listForUser(userId: string, params?: { skip?: number; take?: number }) {
    const tenantIds = await this.tenantAccess.getAccessibleTenantIds(userId);
    const where = { tenantId: { in: tenantIds } };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: {
          messages: {
            where: { isInternal: false },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return { items, total };
  }

  async getForUser(userId: string, id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, fullName: true } } },
        },
        attachments: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    await this.tenantAccess.requireMembership(userId, ticket.tenantId);
    return ticket;
  }

  async create(
    userId: string,
    input: {
      subject: string;
      body: string;
      websiteId?: string;
      priority?: TicketPriority;
      tenantId?: string;
    },
  ) {
    const tenantId =
      input.tenantId ?? (await this.tenantAccess.resolvePrimaryTenantId(userId));
    await this.tenantAccess.requireMembership(userId, tenantId);

    if (input.websiteId) {
      await this.tenantAccess.assertWebsiteAccess(userId, input.websiteId);
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId,
        websiteId: input.websiteId,
        createdById: userId,
        subject: input.subject,
        priority: input.priority ?? TicketPriority.NORMAL,
        status: TicketStatus.OPEN,
        messages: {
          create: {
            authorId: userId,
            body: input.body,
            isInternal: false,
          },
        },
      },
      include: {
        messages: { where: { isInternal: false } },
      },
    });

    this.logger.log('ticket.created', {
      ticketId: ticket.id,
      tenantId,
      userId,
    });
    return ticket;
  }

  async addCustomerMessage(userId: string, ticketId: string, body: string) {
    const ticket = await this.getForUser(userId, ticketId);
    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: userId,
        body,
        isInternal: false,
      },
    });
    this.logger.log('ticket.message.created', {
      ticketId,
      messageId: message.id,
      isInternal: false,
    });
    return message;
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
    await this.getForUser(userId, ticketId);
    return this.prisma.ticketAttachment.create({
      data: {
        ticketId,
        ...input,
      },
    });
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
          assignee: { select: { id: true, fullName: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return { items, total };
  }

  async assign(ticketId: string, assigneeId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
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
          ticket.status === TicketStatus.OPEN
            ? TicketStatus.IN_PROGRESS
            : ticket.status,
      },
    });

    this.logger.log('ticket.assigned', { ticketId, assigneeId });
    return updated;
  }

  async addAdminMessage(
    authorId: string,
    ticketId: string,
    input: { body: string; isInternal?: boolean },
  ) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
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
}
