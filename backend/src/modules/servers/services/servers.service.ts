import { createHash, randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createAppLogger } from '#/common/logging/app-logger.js';
import { EnrollmentTokenStatus } from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

@Injectable()
export class ServersService {
  private readonly logger = createAppLogger(ServersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(params?: { skip?: number; take?: number }) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.server.findMany({
        include: {
          _count: { select: { vpsNodes: true, enrollmentTokens: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ?? 0,
        take: params?.take ?? 50,
      }),
      this.prisma.server.count(),
    ]);
    return { items, total };
  }

  async get(id: string) {
    const server = await this.prisma.server.findUnique({
      where: { id },
      include: {
        vpsNodes: true,
        enrollmentTokens: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!server) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    return server;
  }

  async create(input: { name: string; ipAddress: string; notes?: string }) {
    const server = await this.prisma.server.create({ data: input });
    this.logger.log('server.created', { serverId: server.id, name: server.name });
    return server;
  }

  async update(
    id: string,
    data: { name?: string; ipAddress?: string; notes?: string | null },
  ) {
    await this.get(id);
    const server = await this.prisma.server.update({ where: { id }, data });
    this.logger.log('server.updated', { serverId: id });
    return server;
  }

  async createEnrollmentToken(
    serverId: string,
    input?: { expiresAt?: string },
  ) {
    await this.get(serverId);

    const plaintext = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(plaintext).digest('hex');

    const token = await this.prisma.serverEnrollmentToken.create({
      data: {
        serverId,
        tokenHash,
        status: EnrollmentTokenStatus.ACTIVE,
        expiresAt: input?.expiresAt ? new Date(input.expiresAt) : null,
      },
    });

    this.logger.log('server.enrollment_token.created', {
      serverId,
      tokenId: token.id,
    });

    return {
      ...token,
      token: plaintext,
    };
  }

  async revokeEnrollmentToken(serverId: string, tokenId: string) {
    const token = await this.prisma.serverEnrollmentToken.findFirst({
      where: { id: tokenId, serverId },
    });
    if (!token) {
      throw new NotFoundException(ERROR_MESSAGES.fa.notFound);
    }
    if (token.status !== EnrollmentTokenStatus.ACTIVE) {
      throw new ConflictException(ERROR_MESSAGES.fa.conflict);
    }

    const updated = await this.prisma.serverEnrollmentToken.update({
      where: { id: tokenId },
      data: {
        status: EnrollmentTokenStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    this.logger.log('server.enrollment_token.revoked', {
      serverId,
      tokenId,
    });
    return updated;
  }

  async enrollWithToken(plaintextToken: string, machineId: string) {
    if (!plaintextToken?.trim() || !machineId?.trim()) {
      throw new BadRequestException(ERROR_MESSAGES.fa.validation);
    }

    const tokenHash = createHash('sha256').update(plaintextToken).digest('hex');
    const token = await this.prisma.serverEnrollmentToken.findUnique({
      where: { tokenHash },
      include: { server: true },
    });

    if (!token || token.status !== EnrollmentTokenStatus.ACTIVE) {
      throw new BadRequestException(ERROR_MESSAGES.fa.validation);
    }
    if (token.expiresAt && token.expiresAt.getTime() < Date.now()) {
      await this.prisma.serverEnrollmentToken.update({
        where: { id: token.id },
        data: { status: EnrollmentTokenStatus.EXPIRED },
      });
      throw new BadRequestException(ERROR_MESSAGES.fa.validation);
    }

    const secretKey = randomBytes(32).toString('hex');

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.vpsNode.findUnique({ where: { machineId } });

      const vpsNode = existing
        ? await tx.vpsNode.update({
            where: { machineId },
            data: {
              serverId: token.serverId,
              secretKey,
              lastSeenAt: new Date(),
              lastHeartbeatAt: new Date(),
            },
          })
        : await tx.vpsNode.create({
            data: {
              machineId,
              serverId: token.serverId,
              name: `Node ${machineId.substring(0, 8)}`,
              secretKey,
              lastSeenAt: new Date(),
              lastHeartbeatAt: new Date(),
            },
          });

      await tx.serverEnrollmentToken.update({
        where: { id: token.id },
        data: {
          status: EnrollmentTokenStatus.USED,
          usedAt: new Date(),
        },
      });

      return vpsNode;
    });

    this.logger.log('server.enrollment.completed', {
      serverId: token.serverId,
      vpsNodeId: result.id,
      machineId,
      tokenId: token.id,
    });

    return {
      vpsNodeId: result.id,
      serverId: token.serverId,
      secretKey,
    };
  }
}
