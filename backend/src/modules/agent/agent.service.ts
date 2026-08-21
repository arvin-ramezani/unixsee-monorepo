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

  async enroll(
    plaintextToken: string,
    machineId: string,
    agentVersion?: string,
  ) {
    // Token consume + secret + optional agentVersion must be one transaction
    // (owned by ServersService) so a failed follow-up never leaves a used token
    // without a secret returned to the agent.
    return this.serversService.enrollWithToken(
      plaintextToken,
      machineId,
      agentVersion,
    );
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

    const result = await this.prisma.$transaction(async (tx) => {
      const vpsNode = await tx.vpsNode.findUnique({
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
      await tx.vpsNode.update({
        where: { id: vpsNode.id },
        data: {
          lastSeenAt: now,
          ...(payload.agentVersion
            ? { agentVersion: payload.agentVersion }
            : {}),
        },
      });

      const discoveryIdsByDomain = new Map<string, string>();

      for (const discovery of payload.discoveries) {
        const saved = await this.upsertDiscovery(
          tx,
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
          const existing = await tx.websiteDiscovery.findUnique({
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
            tx,
            existing.id,
            existing.websiteId,
            sample,
          );
          continue;
        }

        const discovery = await tx.websiteDiscovery.findUnique({
          where: { id: discoveryId },
          select: { websiteId: true },
        });
        visitorSamplesInserted += await this.insertVisitorSample(
          tx,
          discoveryId,
          discovery?.websiteId ?? null,
          sample,
        );
      }

      return {
        vpsNodeId: vpsNode.id,
        discoveryCount: payload.discoveries.length,
        visitorSamplesInserted,
      };
    });

    this.logger.log('agent.ingest.phase1.stored', {
      machineId: payload.machineId,
      vpsNodeId: result.vpsNodeId,
      discoveryCount: result.discoveryCount,
      visitorSamplesInserted: result.visitorSamplesInserted,
      durationMs: Date.now() - startedAt,
    });

    return result;
  }

  private async upsertDiscovery(
    tx: Prisma.TransactionClient,
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
      fieldStatus: discovery.fieldStatus
        ? (discovery.fieldStatus as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      rawPayload: discovery as unknown as Prisma.InputJsonValue,
      lastIngestedAt: ingestedAt,
    };

    return tx.websiteDiscovery.upsert({
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
    tx: Prisma.TransactionClient,
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
    const result = await tx.websiteActiveVisitorSample.createMany({
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
