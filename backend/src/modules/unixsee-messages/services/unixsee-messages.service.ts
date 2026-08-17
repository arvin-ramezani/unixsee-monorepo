import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createAppLogger } from '#/common/logging/app-logger.js';
import { TenantAccessService } from '#/common/tenancy/tenant-access.service.js';
import type { Prisma } from '#/generated/prisma/client.js';
import {
  MembershipRole,
  UnixseeMessageStatus,
} from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

import type {
  CreateUnixseeMessageDto,
  UpdateUnixseeMessageDto,
  UnixseeMessageAttachmentItemDto,
  UnixseeMessageLinkDto,
} from '../dto/unixsee-messages.dto.js';

const messageInclude = {
  attachments: true,
  website: { select: { id: true, domain: true, displayName: true } },
  tenant: { select: { id: true, name: true, displayName: true } },
} satisfies Prisma.UnixseeMessageInclude;

type MessageWithRelations = Prisma.UnixseeMessageGetPayload<{
  include: typeof messageInclude;
}>;

@Injectable()
export class UnixseeMessagesService {
  private readonly logger = createAppLogger(UnixseeMessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async resolveRecipientPreferredLocale(tenantId: string): Promise<{
    recipientPreferredLocale: 'fa' | 'en';
    recipientPreferredLocaleLabel: string;
  }> {
    const owner = await this.prisma.membership.findFirst({
      where: { tenantId, role: MembershipRole.OWNER },
      include: { user: { select: { locale: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const raw = owner?.user.locale?.toLowerCase() || 'fa';
    const recipientPreferredLocale: 'fa' | 'en' = raw.startsWith('en')
      ? 'en'
      : 'fa';

    return {
      recipientPreferredLocale,
      recipientPreferredLocaleLabel:
        recipientPreferredLocale === 'en' ? 'English' : 'فارسی',
    };
  }

  async listForUser(
    userId: string,
    params?: { skip?: number; take?: number },
  ) {
    const tenantIds = await this.tenantAccess.getAccessibleTenantIds(userId);
    if (tenantIds.length === 0) {
      return { items: [], total: 0, hasUnread: false };
    }

    const where: Prisma.UnixseeMessageWhereInput = {
      status: UnixseeMessageStatus.PUBLISHED,
      tenantId: { in: tenantIds },
    };

    const [items, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.unixseeMessage.findMany({
        where,
        include: {
          ...messageInclude,
          reads: { where: { userId }, select: { readAt: true } },
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.unixseeMessage.count({ where }),
      this.prisma.unixseeMessage.count({
        where: {
          ...where,
          reads: { none: { userId } },
        },
      }),
    ]);

    return {
      items: items.map((item) => this.toCustomerItem(item)),
      total,
      hasUnread: unreadCount > 0,
    };
  }

  async getForUser(userId: string, messageId: string) {
    const message = await this.prisma.unixseeMessage.findFirst({
      where: {
        id: messageId,
        status: UnixseeMessageStatus.PUBLISHED,
      },
      include: {
        ...messageInclude,
        reads: { where: { userId }, select: { readAt: true } },
      },
    });
    if (!message) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    await this.tenantAccess.requireMembership(userId, message.tenantId);
    return this.toCustomerItem(message);
  }

  async markRead(userId: string, messageId: string) {
    const message = await this.prisma.unixseeMessage.findFirst({
      where: {
        id: messageId,
        status: UnixseeMessageStatus.PUBLISHED,
      },
    });
    if (!message) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    await this.tenantAccess.requireMembership(userId, message.tenantId);

    const read = await this.prisma.unixseeMessageRead.upsert({
      where: {
        messageId_userId: { messageId, userId },
      },
      create: { messageId, userId },
      update: { readAt: new Date() },
    });

    this.logger.log('unixsee_message.read', { messageId, userId });
    return read;
  }

  async listAdmin(params?: {
    skip?: number;
    take?: number;
    status?: UnixseeMessageStatus;
    tenantId?: string;
  }) {
    const where: Prisma.UnixseeMessageWhereInput = {
      ...(params?.status && { status: params.status }),
      ...(params?.tenantId && { tenantId: params.tenantId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.unixseeMessage.findMany({
        where,
        include: messageInclude,
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.unixseeMessage.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toAdminItem(item)),
      total,
    };
  }

  async getAdmin(id: string) {
    const message = await this.requireMessage(id);
    const preferred = await this.resolveRecipientPreferredLocale(
      message.tenantId,
    );
    return {
      ...this.toAdminItem(message),
      ...preferred,
    };
  }

  async getTenantComposeContext(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        displayName: true,
        websites: {
          where: { isActive: true },
          select: { id: true, domain: true, displayName: true },
          orderBy: { domain: 'asc' },
          take: 100,
        },
      },
    });
    if (!tenant) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    const preferred = await this.resolveRecipientPreferredLocale(tenantId);
    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        displayName: tenant.displayName,
      },
      websites: tenant.websites,
      ...preferred,
    };
  }

  async create(authorId: string, input: CreateUnixseeMessageDto) {
    await this.assertTenantExists(input.tenantId);
    await this.assertWebsiteBelongsToTenant(input.websiteId, input.tenantId);

    const message = await this.prisma.unixseeMessage.create({
      data: {
        authorId,
        tenantId: input.tenantId,
        title: input.title.trim(),
        body: input.body.trim(),
        contentLocale: input.contentLocale,
        websiteId: input.websiteId,
        links: input.links?.length ? this.toLinksJson(input.links) : undefined,
        status: UnixseeMessageStatus.DRAFT,
        attachments: input.attachments?.length
          ? {
              create: input.attachments.map((attachment) =>
                this.mapAttachmentCreate(attachment),
              ),
            }
          : undefined,
      },
      include: messageInclude,
    });

    this.logger.log('unixsee_message.created', {
      messageId: message.id,
      tenantId: message.tenantId,
    });
    return this.toAdminItem(message);
  }

  async update(id: string, input: UpdateUnixseeMessageDto) {
    const existing = await this.requireMessage(id);
    if (existing.status === UnixseeMessageStatus.WITHDRAWN) {
      throw new BadRequestException('Withdrawn messages cannot be edited');
    }

    const websiteId =
      input.websiteId === undefined ? existing.websiteId : input.websiteId;
    await this.assertWebsiteBelongsToTenant(websiteId ?? undefined, existing.tenantId);

    const message = await this.prisma.$transaction(async (tx) => {
      if (input.attachments) {
        await tx.unixseeMessageAttachment.deleteMany({
          where: { messageId: id },
        });
      }

      return tx.unixseeMessage.update({
        where: { id },
        data: {
          ...(input.title !== undefined && { title: input.title.trim() }),
          ...(input.body !== undefined && { body: input.body.trim() }),
          ...(input.contentLocale !== undefined && {
            contentLocale: input.contentLocale,
          }),
          ...(input.websiteId !== undefined && { websiteId: input.websiteId }),
          ...(input.links !== undefined && {
            links: this.toLinksJson(input.links),
          }),
          ...(input.attachments
            ? {
                attachments: {
                  create: input.attachments.map((attachment) =>
                    this.mapAttachmentCreate(attachment),
                  ),
                },
              }
            : {}),
        },
        include: messageInclude,
      });
    });

    this.logger.log('unixsee_message.updated', { messageId: id });
    return this.toAdminItem(message);
  }

  async publish(id: string) {
    const existing = await this.requireMessage(id);
    if (existing.status === UnixseeMessageStatus.WITHDRAWN) {
      throw new BadRequestException('Withdrawn messages cannot be published');
    }
    if (!existing.title.trim() || !existing.body.trim()) {
      throw new BadRequestException('Title and body are required to publish');
    }
    if (existing.contentLocale !== 'fa' && existing.contentLocale !== 'en') {
      throw new BadRequestException('contentLocale must be fa or en');
    }

    const message = await this.prisma.unixseeMessage.update({
      where: { id },
      data: {
        status: UnixseeMessageStatus.PUBLISHED,
        publishedAt: existing.publishedAt ?? new Date(),
        withdrawnAt: null,
      },
      include: messageInclude,
    });

    this.logger.log('unixsee_message.published', {
      messageId: id,
      tenantId: message.tenantId,
    });
    return this.toAdminItem(message);
  }

  async withdraw(id: string) {
    const existing = await this.requireMessage(id);
    if (existing.status !== UnixseeMessageStatus.PUBLISHED) {
      throw new BadRequestException('Only published messages can be withdrawn');
    }

    const message = await this.prisma.unixseeMessage.update({
      where: { id },
      data: {
        status: UnixseeMessageStatus.WITHDRAWN,
        withdrawnAt: new Date(),
      },
      include: messageInclude,
    });

    this.logger.log('unixsee_message.withdrawn', {
      messageId: id,
      tenantId: message.tenantId,
    });
    return this.toAdminItem(message);
  }

  private async requireMessage(id: string): Promise<MessageWithRelations> {
    const message = await this.prisma.unixseeMessage.findUnique({
      where: { id },
      include: messageInclude,
    });
    if (!message) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return message;
  }

  private async assertTenantExists(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }
  }

  private async assertWebsiteBelongsToTenant(
    websiteId: string | undefined | null,
    tenantId: string,
  ) {
    if (!websiteId) {
      return;
    }
    const website = await this.prisma.website.findFirst({
      where: { id: websiteId, tenantId },
      select: { id: true },
    });
    if (!website) {
      throw new BadRequestException(
        'Website must belong to the selected tenant',
      );
    }
  }

  private mapAttachmentCreate(attachment: UnixseeMessageAttachmentItemDto) {
    return {
      fileName: attachment.fileName,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
      storageKey: attachment.storageKey,
    };
  }

  private toLinksJson(
    links: UnixseeMessageLinkDto[] | undefined,
  ): Prisma.InputJsonValue {
    return (links ?? []).map((link) => ({
      label: link.label ?? null,
      url: link.url,
      kind: link.kind,
    }));
  }

  private parseLinks(value: Prisma.JsonValue | null): UnixseeMessageLinkDto[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.flatMap((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return [];
      }
      const record = entry as Record<string, unknown>;
      const url = typeof record.url === 'string' ? record.url : null;
      const kind =
        record.kind === 'external' || record.kind === 'dashboard'
          ? record.kind
          : null;
      if (!url || !kind) {
        return [];
      }
      return [
        {
          url,
          kind,
          ...(typeof record.label === 'string' ? { label: record.label } : {}),
        },
      ];
    });
  }

  private toAdminItem(message: MessageWithRelations) {
    return {
      id: message.id,
      tenantId: message.tenantId,
      authorId: message.authorId,
      websiteId: message.websiteId,
      status: message.status,
      title: message.title,
      body: message.body,
      contentLocale: message.contentLocale,
      links: this.parseLinks(message.links),
      publishedAt: message.publishedAt,
      withdrawnAt: message.withdrawnAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      tenant: message.tenant,
      website: message.website,
      attachments: message.attachments.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        sizeBytes: attachment.sizeBytes,
        storageKey: attachment.storageKey,
      })),
    };
  }

  private toCustomerItem(
    message: MessageWithRelations & {
      reads?: Array<{ readAt: Date }>;
    },
  ) {
    const readAt = message.reads?.[0]?.readAt ?? null;
    return {
      id: message.id,
      tenantId: message.tenantId,
      websiteId: message.websiteId,
      title: message.title,
      body: message.body,
      contentLocale: message.contentLocale,
      links: this.parseLinks(message.links),
      publishedAt: message.publishedAt,
      createdAt: message.createdAt,
      website: message.website,
      attachments: message.attachments.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        sizeBytes: attachment.sizeBytes,
        storageKey: attachment.storageKey,
      })),
      isRead: Boolean(readAt),
      readAt,
    };
  }
}
