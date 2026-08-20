import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '#/generated/prisma/client.js';
import {
  AgentCommandStatus,
  AgentCommandType,
} from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';
import type {
  AgentCommandResultDto,
  StackSnapshotDto,
} from '#/modules/agent/dto/agent.dto.js';

const COMMAND_TTL_MS = 10 * 60 * 1000;
const COMMAND_LEASE_MS = 90 * 1000;
const MAX_COMMANDS_PER_HEARTBEAT = 10;

type CommandTx = Prisma.TransactionClient;

@Injectable()
export class AgentCommandsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRefreshSiteStack(
    discoveryId: string,
    requestedById: string,
  ) {
    const discovery = await this.prisma.websiteDiscovery.findUnique({
      where: { id: discoveryId },
      select: {
        id: true,
        domain: true,
        serverId: true,
        vpsNodeId: true,
      },
    });

    if (!discovery) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    if (!discovery.vpsNodeId) {
      throw new BadRequestException(
        'Discovery is not bound to an active Phase 1 agent.',
      );
    }

    const now = new Date();
    await this.prisma.agentCommand.updateMany({
      where: {
        vpsNodeId: discovery.vpsNodeId,
        domain: discovery.domain,
        type: AgentCommandType.REFRESH_SITE_STACK,
        status: {
          in: [AgentCommandStatus.QUEUED, AgentCommandStatus.RUNNING],
        },
        expiresAt: { lte: now },
      },
      data: {
        status: AgentCommandStatus.EXPIRED,
        finishedAt: now,
        leaseExpiresAt: null,
      },
    });

    const active = await this.prisma.agentCommand.findFirst({
      where: {
        vpsNodeId: discovery.vpsNodeId,
        domain: discovery.domain,
        type: AgentCommandType.REFRESH_SITE_STACK,
        status: {
          in: [AgentCommandStatus.QUEUED, AgentCommandStatus.RUNNING],
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
    if (active) return active;

    const expiresAt = new Date(now.getTime() + COMMAND_TTL_MS);

    try {
      return await this.prisma.agentCommand.create({
        data: {
          vpsNodeId: discovery.vpsNodeId,
          serverId: discovery.serverId,
          discoveryId: discovery.id,
          requestedById,
          domain: discovery.domain,
          type: AgentCommandType.REFRESH_SITE_STACK,
          status: AgentCommandStatus.QUEUED,
          requestedAt: now,
          expiresAt,
        },
      });
    } catch (error) {
      // The partial unique index is the race-safe duplicate guard. If another
      // request won the race, return that in-flight command instead of creating
      // a second refresh.
      const raced = await this.prisma.agentCommand.findFirst({
        where: {
          vpsNodeId: discovery.vpsNodeId,
          domain: discovery.domain,
          type: AgentCommandType.REFRESH_SITE_STACK,
          status: {
            in: [AgentCommandStatus.QUEUED, AgentCommandStatus.RUNNING],
          },
        },
        orderBy: { requestedAt: 'asc' },
      });
      if (raced) return raced;
      throw error;
    }
  }

  async getAdmin(id: string) {
    const command = await this.prisma.agentCommand.findUnique({
      where: { id },
      include: {
        discovery: true,
        vpsNode: {
          select: {
            id: true,
            agentInstanceId: true,
            status: true,
            lastHeartbeatAt: true,
          },
        },
        requestedBy: {
          select: { id: true, fullName: true, email: true, username: true },
        },
      },
    });
    if (!command) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return command;
  }

  async leaseForHeartbeat(vpsNodeId: string, now = new Date()) {
    return this.prisma.$transaction(async (tx) => {
      await tx.agentCommand.updateMany({
        where: {
          vpsNodeId,
          status: {
            in: [AgentCommandStatus.QUEUED, AgentCommandStatus.RUNNING],
          },
          expiresAt: { lte: now },
        },
        data: {
          status: AgentCommandStatus.EXPIRED,
          finishedAt: now,
          leaseExpiresAt: null,
        },
      });

      const candidates = await tx.agentCommand.findMany({
        where: {
          vpsNodeId,
          expiresAt: { gt: now },
          OR: [
            { status: AgentCommandStatus.QUEUED },
            {
              status: AgentCommandStatus.RUNNING,
              leaseExpiresAt: { lte: now },
            },
          ],
        },
        orderBy: { requestedAt: 'asc' },
        take: MAX_COMMANDS_PER_HEARTBEAT,
        select: {
          id: true,
          type: true,
          domain: true,
          expiresAt: true,
        },
      });

      const leased: Array<{
        id: string;
        type: 'REFRESH_SITE_STACK';
        domain: string;
        expiresAt: string;
      }> = [];

      for (const candidate of candidates) {
        const leaseExpiresAt = new Date(now.getTime() + COMMAND_LEASE_MS);
        const claim = await tx.agentCommand.updateMany({
          where: {
            id: candidate.id,
            expiresAt: { gt: now },
            OR: [
              { status: AgentCommandStatus.QUEUED },
              {
                status: AgentCommandStatus.RUNNING,
                leaseExpiresAt: { lte: now },
              },
            ],
          },
          data: {
            status: AgentCommandStatus.RUNNING,
            leasedAt: now,
            leaseExpiresAt,
            attemptCount: { increment: 1 },
          },
        });

        if (claim.count !== 1) continue;
        if (candidate.type !== AgentCommandType.REFRESH_SITE_STACK) continue;

        leased.push({
          id: candidate.id,
          type: 'REFRESH_SITE_STACK',
          domain: candidate.domain,
          expiresAt: candidate.expiresAt.toISOString(),
        });
      }

      return leased;
    });
  }

  async completeFromAgent(payload: AgentCommandResultDto) {
    return this.prisma.$transaction(async (tx) => {
      const vpsNode = await tx.vpsNode.findUnique({
        where: { agentInstanceId: payload.agentInstanceId },
        select: { id: true, serverId: true },
      });
      if (!vpsNode) {
        throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
      }

      const command = await tx.agentCommand.findUnique({
        where: { id: payload.commandId },
      });
      if (!command || command.vpsNodeId !== vpsNode.id) {
        throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
      }

      if (
        command.type !== AgentCommandType.REFRESH_SITE_STACK ||
        payload.type !== 'REFRESH_SITE_STACK' ||
        command.domain !== payload.domain
      ) {
        throw new BadRequestException('Command result does not match command.');
      }

      if (
        command.status === AgentCommandStatus.SUCCEEDED ||
        command.status === AgentCommandStatus.FAILED ||
        command.status === AgentCommandStatus.EXPIRED
      ) {
        return command;
      }

      const completedAt = new Date(payload.completedAt);
      if (completedAt > command.expiresAt) {
        return tx.agentCommand.update({
          where: { id: command.id },
          data: {
            status: AgentCommandStatus.EXPIRED,
            finishedAt: completedAt,
            leaseExpiresAt: null,
            errorCode: 'command_expired',
          },
        });
      }

      if (payload.stackSnapshot) {
        const discovery = await tx.websiteDiscovery.findUnique({
          where: {
            serverId_domain: {
              serverId: vpsNode.serverId,
              domain: payload.domain,
            },
          },
          select: { id: true },
        });
        if (discovery) {
          await this.updateStackSnapshot(
            tx,
            discovery.id,
            payload.stackSnapshot,
            completedAt,
          );
        }
      }

      const succeeded = payload.status === 'SUCCEEDED';
      return tx.agentCommand.update({
        where: { id: command.id },
        data: {
          status: succeeded
            ? AgentCommandStatus.SUCCEEDED
            : AgentCommandStatus.FAILED,
          finishedAt: completedAt,
          leaseExpiresAt: null,
          errorCode: succeeded ? null : payload.errorCode ?? 'stack_refresh_failed',
          resultMetadata: {
            ...(payload.stackSnapshot
              ? { stackCheckedAt: payload.stackSnapshot.checkedAt }
              : {}),
            status: payload.status,
          } as Prisma.InputJsonValue,
        },
      });
    });
  }

  private async updateStackSnapshot(
    tx: CommandTx,
    discoveryId: string,
    snapshot: StackSnapshotDto,
    ingestedAt: Date,
  ): Promise<void> {
    const data: Prisma.WebsiteDiscoveryUpdateInput = {
      stackCheckedAt: new Date(snapshot.checkedAt),
      fieldStatus: snapshot.fieldStatus as unknown as Prisma.InputJsonValue,
      lastIngestedAt: ingestedAt,
    };

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
}
