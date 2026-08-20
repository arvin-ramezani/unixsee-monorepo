import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '#/generated/prisma/client.js';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { createAppLogger } from '#/common/logging/app-logger.js';
import { ServersService } from '#/modules/servers/services/servers.service.js';
import { AgentCommandsService } from '#/modules/agent-commands/services/agent-commands.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';
import { DiscoveryStatus, VpsNodeStatus } from '#/generated/prisma/enums.js';
import {
  ActiveVisitors3mDto,
  AgentCommandResultDto,
  HeartbeatAgentDto,
  Phase1DiscoveryDto,
  Phase1IngestDto,
  StackSnapshotDto,
  Visitors24hDto,
} from './dto/agent.dto.js';

type ResolvedDiscovery = {
  id: string;
  domain: string;
  websiteId: string | null;
};

@Injectable()
export class AgentService {
  private readonly logger = createAppLogger(AgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly serversService: ServersService,
    private readonly agentCommandsService: AgentCommandsService,
  ) {}

  async enroll(
    plaintextToken: string,
    agentInstanceId: string,
    agentVersion?: string,
  ) {
    return this.serversService.enrollWithToken(
      plaintextToken,
      agentInstanceId,
      agentVersion,
    );
  }

  async heartbeat(body: HeartbeatAgentDto) {
    const now = new Date();
    const existing = await this.prisma.vpsNode.findUnique({
      where: { agentInstanceId: body.agentInstanceId },
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
      where: { agentInstanceId: body.agentInstanceId },
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
        agentInstanceId: true,
        lastHeartbeatAt: true,
        lastSeenAt: true,
        status: true,
        agentVersion: true,
      },
    });

    const commands = await this.agentCommandsService.leaseForHeartbeat(
      updated.id,
      now,
    );

    this.logger.debug('agent.heartbeat.received', {
      agentInstanceId: body.agentInstanceId,
      vpsNodeId: updated.id,
      leasedCommandCount: commands.length,
    });

    return {
      agent: updated,
      commands,
    };
  }

  async completeCommand(payload: AgentCommandResultDto) {
    return this.agentCommandsService.completeFromAgent(payload);
  }

  async processPhase1Ingest(payload: Phase1IngestDto) {
    const startedAt = Date.now();

    const result = await this.prisma.$transaction(async (tx) => {
      const vpsNode = await tx.vpsNode.findUnique({
        where: { agentInstanceId: payload.agentInstanceId },
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

      const ingestedAt = new Date();
      await tx.vpsNode.update({
        where: { id: vpsNode.id },
        data: {
          lastSeenAt: ingestedAt,
          ...(payload.agentVersion ? { agentVersion: payload.agentVersion } : {}),
        },
      });

      const discoveriesByDomain = new Map<string, ResolvedDiscovery>();

      for (const discovery of payload.discoveries ?? []) {
        const saved = await this.upsertDiscovery(
          tx,
          vpsNode.serverId,
          vpsNode.id,
          discovery,
          ingestedAt,
        );
        discoveriesByDomain.set(saved.domain, saved);
      }

      let stackSnapshotsUpdated = 0;
      let stackSnapshotsSkipped = 0;
      for (const snapshot of payload.stackSnapshots ?? []) {
        const discovery = await this.resolveDiscovery(
          tx,
          vpsNode.serverId,
          snapshot.domain,
          discoveriesByDomain,
        );
        if (!discovery) {
          stackSnapshotsSkipped += 1;
          continue;
        }

        await this.updateStackSnapshot(tx, discovery.id, snapshot, ingestedAt);
        stackSnapshotsUpdated += 1;
      }

      let visitorSamplesInserted = 0;
      let activeVisitorSamplesSkipped = 0;
      for (const sample of payload.activeVisitors3m ?? []) {
        const discovery = await this.resolveDiscovery(
          tx,
          vpsNode.serverId,
          sample.domain,
          discoveriesByDomain,
        );
        if (!discovery) {
          activeVisitorSamplesSkipped += 1;
          continue;
        }

        visitorSamplesInserted += await this.insertVisitorSample(
          tx,
          discovery,
          sample,
        );
        await this.updateLatestActiveVisitors(tx, discovery, sample);
      }

      let visitors24hUpdated = 0;
      let visitors24hSkipped = 0;
      for (const sample of payload.visitors24h ?? []) {
        const discovery = await this.resolveDiscovery(
          tx,
          vpsNode.serverId,
          sample.domain,
          discoveriesByDomain,
        );
        if (!discovery) {
          visitors24hSkipped += 1;
          continue;
        }

        await this.updateLatestVisitors24h(tx, discovery, sample);
        visitors24hUpdated += 1;
      }

      return {
        vpsNodeId: vpsNode.id,
        discoveryCount: payload.discoveries?.length ?? 0,
        stackSnapshotsUpdated,
        stackSnapshotsSkipped,
        visitorSamplesInserted,
        activeVisitorSamplesSkipped,
        visitors24hUpdated,
        visitors24hSkipped,
      };
    });

    this.logger.log('agent.ingest.phase1.stored', {
      agentInstanceId: payload.agentInstanceId,
      vpsNodeId: result.vpsNodeId,
      discoveryCount: result.discoveryCount,
      stackSnapshotsUpdated: result.stackSnapshotsUpdated,
      stackSnapshotsSkipped: result.stackSnapshotsSkipped,
      visitorSamplesInserted: result.visitorSamplesInserted,
      activeVisitorSamplesSkipped: result.activeVisitorSamplesSkipped,
      visitors24hUpdated: result.visitors24hUpdated,
      visitors24hSkipped: result.visitors24hSkipped,
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
  ): Promise<ResolvedDiscovery> {
    const inventoryData = {
      vpsNodeId,
      aliases: discovery.aliases,
      virtualHostName: discovery.virtualHostName,
      source: discovery.source,
      discoveredAt: new Date(discovery.discoveredAt),
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
        displayName: discovery.domain,
        status: DiscoveryStatus.NEW,
        ...inventoryData,
      },
      update: inventoryData,
      select: { id: true, domain: true, websiteId: true },
    });
  }

  private async resolveDiscovery(
    tx: Prisma.TransactionClient,
    serverId: string,
    domain: string,
    discoveriesByDomain: Map<string, ResolvedDiscovery>,
  ): Promise<ResolvedDiscovery | null> {
    const current = discoveriesByDomain.get(domain);
    if (current) return current;

    const existing = await tx.websiteDiscovery.findUnique({
      where: {
        serverId_domain: {
          serverId,
          domain,
        },
      },
      select: { id: true, domain: true, websiteId: true },
    });

    if (!existing) return null;

    discoveriesByDomain.set(domain, existing);
    return existing;
  }

  private async updateStackSnapshot(
    tx: Prisma.TransactionClient,
    discoveryId: string,
    snapshot: StackSnapshotDto,
    ingestedAt: Date,
  ): Promise<void> {
    const data: Prisma.WebsiteDiscoveryUpdateInput = {
      stackCheckedAt: new Date(snapshot.checkedAt),
      fieldStatus: snapshot.fieldStatus as unknown as Prisma.InputJsonValue,
      lastIngestedAt: ingestedAt,
    };

    // Failed/unsupported refreshes never erase the last successful value.
    if (snapshot.fieldStatus.wordpressVersion.state === 'ok') {
      data.wordpressVersion = snapshot.wordpressVersion;
    }
    if (snapshot.fieldStatus.phpVersion.state === 'ok') {
      data.phpVersion = snapshot.phpVersion;
    }
    if (snapshot.fieldStatus.imagickVersion.state === 'ok') {
      data.imagickVersion = snapshot.imagickVersion;
    }

    await tx.websiteDiscovery.update({
      where: { id: discoveryId },
      data,
    });
  }

  private async insertVisitorSample(
    tx: Prisma.TransactionClient,
    discovery: ResolvedDiscovery,
    sample: ActiveVisitors3mDto,
  ): Promise<number> {
    const measuredAt = new Date(sample.measuredAt);
    const result = await tx.websiteActiveVisitorSample.createMany({
      data: [
        {
          recordedAt: measuredAt,
          discoveryId: discovery.id,
          websiteId: discovery.websiteId,
          domain: sample.domain,
          uniqueVisitorCount: sample.uniqueVisitorCount,
          windowSeconds: sample.windowSeconds,
          windowStartedAt: new Date(sample.windowStartedAt),
          measuredAt,
        },
      ],
      skipDuplicates: true,
    });
    return result.count;
  }

  private async updateLatestActiveVisitors(
    tx: Prisma.TransactionClient,
    discovery: ResolvedDiscovery,
    sample: ActiveVisitors3mDto,
  ): Promise<void> {
    const activeData = {
      domain: sample.domain,
      activeVisitorCount: sample.uniqueVisitorCount,
      activeWindowSeconds: sample.windowSeconds,
      activeWindowStartedAt: new Date(sample.windowStartedAt),
      activeMeasuredAt: new Date(sample.measuredAt),
      activeStatus: sample.status
        ? (sample.status as unknown as Prisma.InputJsonValue)
        : ({ state: 'ok' } as Prisma.InputJsonValue),
    };

    await tx.websiteTrafficSnapshot.upsert({
      where: { discoveryId: discovery.id },
      create: {
        discoveryId: discovery.id,
        ...activeData,
      },
      update: activeData,
    });
  }

  private async updateLatestVisitors24h(
    tx: Prisma.TransactionClient,
    discovery: ResolvedDiscovery,
    sample: Visitors24hDto,
  ): Promise<void> {
    const visitors24hData = {
      domain: sample.domain,
      visitors24hCount: sample.uniqueVisitors24h,
      visitors24hWindowSeconds: sample.windowSeconds,
      visitors24hCoverageSeconds: sample.coverageSeconds,
      visitors24hMeasuredAt: new Date(sample.measuredAt),
      visitors24hAlgorithm: sample.algorithm,
      visitors24hStatus: sample.status as unknown as Prisma.InputJsonValue,
    };

    await tx.websiteTrafficSnapshot.upsert({
      where: { discoveryId: discovery.id },
      create: {
        discoveryId: discovery.id,
        ...visitors24hData,
      },
      update: visitors24hData,
    });
  }
}
