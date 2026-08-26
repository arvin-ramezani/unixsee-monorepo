import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createAppLogger } from '#/common/logging/app-logger.js';
import { TenantAccessService } from '#/common/tenancy/tenant-access.service.js';
import {
  WebsiteLifecycleStatus,
  WebsiteManagementCoverage,
} from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

type Visitors24hSnapshot = {
  uniqueVisitors24h: number | null;
  visitors24hWindowSeconds: number | null;
  visitors24hCoverageSeconds: number | null;
  visitors24hMeasuredAt: Date | null;
  visitors24hStatus: unknown;
};

@Injectable()
export class WebsitesService {
  private readonly logger = createAppLogger(WebsitesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async getUserWebsites(userId: string) {
    const tenantIds = await this.tenantAccess.getAccessibleTenantIds(userId);
    const websites = await this.prisma.website.findMany({
      where: { tenantId: { in: tenantIds } },
      include: {
        plan: { select: { id: true, code: true, nameEn: true } },
        trafficSnapshots: {
          where: { visitors24hMeasuredAt: { not: null } },
          orderBy: { visitors24hMeasuredAt: 'desc' },
          take: 1,
          select: {
            uniqueVisitors24h: true,
            visitors24hWindowSeconds: true,
            visitors24hCoverageSeconds: true,
            visitors24hMeasuredAt: true,
            visitors24hStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.debug('websites.user_list.loaded', {
      userId,
      count: websites.length,
    });

    return websites.map(({ trafficSnapshots, ...website }) => ({
      ...website,
      visitors24h: this.toCustomerVisitors24h(
        website.managementCoverage,
        trafficSnapshots[0],
      ),
    }));
  }

  async getWebsiteForUser(userId: string, websiteId: string) {
    await this.tenantAccess.assertWebsiteAccess(userId, websiteId);
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        ssl: true,
        plan: true,
      },
    });
    if (!website) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return website;
  }

  async listAdmin(params?: {
    skip?: number;
    take?: number;
    tenantId?: string;
    userId?: string;
    search?: string;
    managementCoverage?: WebsiteManagementCoverage;
  }) {
    let tenantFilter:
      | { tenantId: string }
      | { tenantId: { in: string[] } }
      | undefined;

    if (params?.userId) {
      const tenantIds = await this.tenantAccess.getAccessibleTenantIds(
        params.userId,
      );
      if (tenantIds.length === 0) {
        return { items: [], total: 0 };
      }
      tenantFilter = { tenantId: { in: tenantIds } };
    } else if (params?.tenantId) {
      tenantFilter = { tenantId: params.tenantId };
    }

    const where = {
      ...tenantFilter,
      ...(params?.managementCoverage
        ? { managementCoverage: params.managementCoverage }
        : {}),
      ...(params?.search
        ? {
            OR: [
              {
                domain: {
                  contains: params.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                displayName: {
                  contains: params.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.website.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true } },
          plan: { select: { id: true, code: true, nameEn: true } },
          vpsNode: {
            select: {
              id: true,
              status: true,
              agentVersion: true,
              lastHeartbeatAt: true,
              server: {
                select: { id: true, name: true, controlPanelUrl: true },
              },
            },
          },
          discoveries: {
            orderBy: { lastIngestedAt: 'desc' },
            take: 1,
            include: { trafficSnapshot: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.website.count({ where }),
    ]);

    return { items, total };
  }

  async getAdmin(websiteId: string) {
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        tenant: { select: { id: true, name: true } },
        plan: { select: { id: true, code: true, nameEn: true } },
        vpsNode: {
          select: {
            id: true,
            status: true,
            agentVersion: true,
            lastHeartbeatAt: true,
            server: {
              select: { id: true, name: true, controlPanelUrl: true },
            },
          },
        },
        discoveries: {
          orderBy: { lastIngestedAt: 'desc' },
          take: 1,
          include: { trafficSnapshot: true },
        },
      },
    });
    if (!website) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return website;
  }

  async updateAdmin(
    websiteId: string,
    input: { wordpressAdminUrl?: string | null },
  ) {
    const exists = await this.prisma.website.findUnique({
      where: { id: websiteId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return this.prisma.website.update({
      where: { id: websiteId },
      data: {
        ...(input.wordpressAdminUrl !== undefined
          ? { wordpressAdminUrl: input.wordpressAdminUrl || null }
          : {}),
      },
    });
  }
  async createAdmin(input: {
    tenantId: string;
    vpsNodeId?: string;
    domain: string;
    displayName?: string;
    planId?: string;
    activatePlan?: boolean;
    userId?: string;
  }) {
    if (input.activatePlan && !input.planId) {
      throw new BadRequestException(ERROR_MESSAGES.fa.validation);
    }

    const website = await this.prisma.website.create({
      data: {
        tenantId: input.tenantId,
        vpsNodeId: input.vpsNodeId,
        managementCoverage: WebsiteManagementCoverage.UNIXSEE_MANAGED,
        domain: input.domain,
        displayName: input.displayName,
        planId: input.planId,
        planActivatedAt: input.planId && input.activatePlan ? new Date() : null,
        userId: input.userId,
        isActive: true,
        status: WebsiteLifecycleStatus.ACTIVE,
      },
    });

    this.logger.log('website.created', {
      websiteId: website.id,
      tenantId: website.tenantId,
      domain: website.domain,
    });

    return website;
  }

  async assign(
    websiteId: string,
    input: { tenantId: string; planId?: string },
  ) {
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
    });
    if (!website) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }

    const updated = await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        tenantId: input.tenantId,
        ...(input.planId ? { planId: input.planId } : {}),
        ...(input.planId ? { planActivatedAt: null } : {}),
        status: WebsiteLifecycleStatus.ACTIVE,
        isActive: true,
      },
    });

    this.logger.log('website.assigned', {
      websiteId,
      tenantId: input.tenantId,
      planId: input.planId ?? null,
    });

    return updated;
  }

  async transfer(
    websiteId: string,
    input: { tenantId: string; reason?: string },
  ) {
    if (!input.tenantId) {
      throw new BadRequestException(ERROR_MESSAGES.fa.validation);
    }

    const updated = await this.prisma.website.update({
      where: { id: websiteId },
      data: { tenantId: input.tenantId },
    });

    this.logger.log('website.transferred', {
      websiteId,
      tenantId: input.tenantId,
      reason: input.reason ?? null,
    });

    return updated;
  }

  async retire(websiteId: string) {
    const updated = await this.prisma.website.update({
      where: { id: websiteId },
      data: {
        status: WebsiteLifecycleStatus.RETIRED,
        isActive: false,
      },
    });

    this.logger.log('website.retired', { websiteId });
    return updated;
  }

  private toCustomerVisitors24h(
    managementCoverage: WebsiteManagementCoverage,
    snapshot?: Visitors24hSnapshot,
  ) {
    if (
      managementCoverage !== WebsiteManagementCoverage.UNIXSEE_MANAGED ||
      !snapshot
    ) {
      return null;
    }

    const status = this.readAgentFieldStatus(snapshot.visitors24hStatus);
    const windowSeconds = snapshot.visitors24hWindowSeconds;
    const coverageSeconds = snapshot.visitors24hCoverageSeconds;
    const hasCompleteWindow =
      windowSeconds === 86_400 &&
      coverageSeconds !== null &&
      coverageSeconds >= windowSeconds;
    const isReady =
      status.state === 'ok' &&
      snapshot.uniqueVisitors24h !== null &&
      hasCompleteWindow;
    const isCollecting =
      status.reason === 'warming_up' ||
      (windowSeconds !== null &&
        coverageSeconds !== null &&
        coverageSeconds < windowSeconds);

    return {
      uniqueVisitors: isReady ? snapshot.uniqueVisitors24h : null,
      windowSeconds,
      coverageSeconds,
      measuredAt: snapshot.visitors24hMeasuredAt,
      status: isReady ? 'READY' : isCollecting ? 'COLLECTING' : 'UNAVAILABLE',
    } as const;
  }

  private readAgentFieldStatus(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { state: null, reason: null };
    }

    const state =
      'state' in value && typeof value.state === 'string' ? value.state : null;
    const reason =
      'reason' in value && typeof value.reason === 'string'
        ? value.reason
        : null;

    return { state, reason };
  }
}
