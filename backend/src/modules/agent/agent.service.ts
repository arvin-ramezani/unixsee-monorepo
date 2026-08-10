import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '#/generated/prisma/client.js';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { createAppLogger } from '#/common/logging/app-logger.js';
import { ServersService } from '#/modules/servers/services/servers.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';
import { DiscoveryStatus, VpsNodeStatus } from '#/generated/prisma/enums.js';
import {
  HeartbeatAgentDto,
  Phase1DiscoveryDto,
  Phase1IngestDto,
} from './dto/agent.dto.js';

@Injectable()
export class AgentService {
  private readonly logger = createAppLogger(AgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly serversService: ServersService,
  ) {}

  async enroll(plaintextToken: string, machineId: string, agentVersion?: string) {
    const result = await this.serversService.enrollWithToken(
      plaintextToken,
      machineId,
    );

    if (agentVersion) {
      await this.prisma.vpsNode.update({
        where: { id: result.vpsNodeId },
        data: {
          agentVersion,
          credentialsRevokedAt: null,
          credentialsRevokedReason: null,
        },
      });
    }

    return result;
  }

  async heartbeat(body: HeartbeatAgentDto) {
    const now = new Date();
    const existing = await this.prisma.vpsNode.findUnique({
      where: { machineId: body.machineId },
      select: {
        id: true,
        credentialsRevokedAt: true,
        secretKey: true,
      },
    });
    if (!existing) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    if (existing.credentialsRevokedAt || !existing.secretKey) {
      throw new UnauthorizedException(ERROR_MESSAGES.fa.unauthenticated);
    }

    const updated = await this.prisma.vpsNode.update({
      where: { machineId: body.machineId },
      data: {
        lastHeartbeatAt: now,
        lastSeenAt: now,
        status: VpsNodeStatus.ONLINE,
        ...(body.agentVersion ? { agentVersion: body.agentVersion } : {}),
        ...(body.serverBinding?.hostname
          ? { hostname: body.serverBinding.hostname }
          : {}),
      },
      select: {
        id: true,
        machineId: true,
        lastHeartbeatAt: true,
        lastSeenAt: true,
        status: true,
        agentVersion: true,
      },
    });

    this.logger.debug('agent.heartbeat.received', {
      machineId: body.machineId,
      vpsNodeId: updated.id,
    });
    return updated;
  }

  async processPhase1Ingest(payload: Phase1IngestDto) {
    const startedAt = Date.now();
    const vpsNode = await this.prisma.vpsNode.findUnique({
      where: { machineId: payload.machineId },
      select: {
        id: true,
        serverId: true,
        credentialsRevokedAt: true,
        secretKey: true,
      },
    });

    if (!vpsNode) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    if (vpsNode.credentialsRevokedAt || !vpsNode.secretKey) {
      throw new UnauthorizedException(ERROR_MESSAGES.fa.unauthenticated);
    }

    const now = new Date();
    await this.prisma.vpsNode.update({
      where: { id: vpsNode.id },
      data: {
        lastSeenAt: now,
        ...(payload.agentVersion ? { agentVersion: payload.agentVersion } : {}),
      },
    });

    const discoveryIdsByDomain = new Map<string, string>();

    for (const discovery of payload.discoveries) {
      const saved = await this.upsertDiscovery(
        vpsNode.serverId,
        vpsNode.id,
        discovery,
        now,
      );
      discoveryIdsByDomain.set(saved.domain, saved.id);
    }

    let visitorSamplesInserted = 0;
    for (const sample of payload.activeVisitors3m ?? []) {
      const discoveryId = discoveryIdsByDomain.get(sample.domain);
      if (!discoveryId) {
        const existing = await this.prisma.websiteDiscovery.findUnique({
          where: {
            serverId_domain: {
              serverId: vpsNode.serverId,
              domain: sample.domain,
            },
          },
          select: { id: true, websiteId: true },
        });
        if (!existing) continue;
        visitorSamplesInserted += await this.insertVisitorSample(
          existing.id,
          existing.websiteId,
          sample,
        );
        continue;
      }

      const discovery = await this.prisma.websiteDiscovery.findUnique({
        where: { id: discoveryId },
        select: { websiteId: true },
      });
      visitorSamplesInserted += await this.insertVisitorSample(
        discoveryId,
        discovery?.websiteId ?? null,
        sample,
      );
    }

    this.logger.log('agent.ingest.phase1.stored', {
      machineId: payload.machineId,
      vpsNodeId: vpsNode.id,
      discoveryCount: payload.discoveries.length,
      visitorSamplesInserted,
      durationMs: Date.now() - startedAt,
    });

    return {
      vpsNodeId: vpsNode.id,
      discoveryCount: payload.discoveries.length,
      visitorSamplesInserted,
    };
  }

  private async upsertDiscovery(
    serverId: string,
    vpsNodeId: string,
    discovery: Phase1DiscoveryDto,
    ingestedAt: Date,
  ) {
    const homeDirectory = this.getHomeDirectory(discovery.documentRoot);
    const data = {
      vpsNodeId,
      displayName: discovery.domain,
      directAdminUser: discovery.owner ?? null,
      homeDirectory,
      documentRoot: discovery.documentRoot,
      aliases: discovery.aliases ?? [],
      appType: discovery.appType,
      source: discovery.source,
      backendAddress: discovery.backendAddress ?? null,
      controlPanelUrl: discovery.controlPanelUrl ?? null,
      wordpressAdminUrl: discovery.wordpressAdminUrl ?? null,
      wordpressVersion: discovery.wordpressVersion ?? null,
      phpVersion: discovery.phpVersion ?? null,
      phpVersionScope: discovery.phpVersionScope ?? null,
      imagickVersion: discovery.imagickVersion ?? null,
      wordpressUpdateStatus: discovery.wordpressUpdateStatus ?? null,
      wordpressUpdateCheckedAt: discovery.wordpressUpdateCheckedAt
        ? new Date(discovery.wordpressUpdateCheckedAt)
        : null,
      fieldStatus: (discovery.fieldStatus
        ? (discovery.fieldStatus as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull),
      rawPayload: discovery as unknown as Prisma.InputJsonValue,
      lastIngestedAt: ingestedAt,
    };

    return this.prisma.websiteDiscovery.upsert({
      where: {
        serverId_domain: { serverId, domain: discovery.domain },
      },
      create: {
        serverId,
        domain: discovery.domain,
        status: DiscoveryStatus.NEW,
        ...data,
      },
      update: data,
      select: { id: true, domain: true },
    });
  }

  private async insertVisitorSample(
    discoveryId: string,
    websiteId: string | null,
    sample: {
      domain: string;
      uniqueIpCount: number;
      windowSeconds: number;
      windowStartedAt: string;
      measuredAt: string;
    },
  ): Promise<number> {
    const measuredAt = new Date(sample.measuredAt);
    const result = await this.prisma.websiteActiveVisitorSample.createMany({
      data: [
        {
          recordedAt: measuredAt,
          discoveryId,
          websiteId,
          domain: sample.domain,
          uniqueIpCount: sample.uniqueIpCount,
          windowSeconds: sample.windowSeconds,
          windowStartedAt: new Date(sample.windowStartedAt),
          measuredAt,
        },
      ],
      skipDuplicates: true,
    });
    return result.count;
  }

  private getHomeDirectory(documentRoot: string): string | null {
    const match = documentRoot.match(/^(\/home\/[^/]+)/);
    return match?.[1] ?? null;
  }
}
