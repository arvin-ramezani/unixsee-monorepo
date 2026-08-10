import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EnrollmentTokenStatus, VpsNodeStatus } from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

import { ServersService } from './servers.service.js';

describe('ServersService.enrollWithToken', () => {
  let service: ServersService;

  const prisma = {
    serverEnrollmentToken: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ServersService);
  });

  it('rejects when conditional token consume finds zero rows', async () => {
    prisma.serverEnrollmentToken.findUnique.mockResolvedValue({
      id: 'token-1',
      serverId: 'server-1',
      status: EnrollmentTokenStatus.ACTIVE,
      expiresAt: null,
    });

    prisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        serverEnrollmentToken: {
          updateMany: vi
            .fn()
            .mockResolvedValueOnce({ count: 0 })
            .mockResolvedValueOnce({ count: 0 }),
        },
        vpsNode: {
          findUnique: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
          create: vi.fn(),
        },
      };
      return callback(tx);
    });

    await expect(
      service.enrollWithToken('plain-token', 'machine-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects cross-server machineId with generic validation error before consume', async () => {
    prisma.serverEnrollmentToken.findUnique.mockResolvedValue({
      id: 'token-1',
      serverId: 'server-a',
      status: EnrollmentTokenStatus.ACTIVE,
      expiresAt: null,
    });

    const updateMany = vi.fn();

    prisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        serverEnrollmentToken: {
          updateMany,
        },
        vpsNode: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'node-1',
            serverId: 'server-b',
          }),
          update: vi.fn(),
          create: vi.fn(),
        },
      };
      return callback(tx);
    });

    await expect(
      service.enrollWithToken('plain-token', 'machine-1'),
    ).rejects.toMatchObject({
      message: ERROR_MESSAGES.fa.validation,
    });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('rotates secret for same-server re-provision', async () => {
    prisma.serverEnrollmentToken.findUnique.mockResolvedValue({
      id: 'token-1',
      serverId: 'server-1',
      status: EnrollmentTokenStatus.ACTIVE,
      expiresAt: null,
    });

    const update = vi.fn().mockResolvedValue({
      id: 'node-1',
      serverId: 'server-1',
    });

    prisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        serverEnrollmentToken: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        vpsNode: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'node-1',
            serverId: 'server-1',
          }),
          update,
          create: vi.fn(),
        },
      };
      return callback(tx);
    });

    const result = await service.enrollWithToken('plain-token', 'machine-1');

    expect(result).toMatchObject({
      vpsNodeId: 'node-1',
      serverId: 'server-1',
    });
    expect(result.secretKey).toHaveLength(64);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { machineId: 'machine-1' },
        data: expect.objectContaining({
          status: VpsNodeStatus.ONLINE,
          credentialsRevokedAt: null,
          secretKey: result.secretKey,
        }),
      }),
    );
    expect(update.mock.calls[0][0].data.serverId).toBeUndefined();
  });
});
