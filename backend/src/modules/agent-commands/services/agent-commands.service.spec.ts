import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AgentCommandStatus,
  AgentCommandType,
} from '#/generated/prisma/enums.js';
import { AgentCommandsService } from './agent-commands.service.js';

describe('AgentCommandsService', () => {
  const tx = {
    agentCommand: {
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
  };

  const prisma = {
    websiteDiscovery: { findUnique: vi.fn() },
    agentCommand: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };

  const service = new AgentCommandsService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the existing in-flight refresh instead of creating a duplicate', async () => {
    prisma.websiteDiscovery.findUnique.mockResolvedValue({
      id: 'disc-1',
      domain: 'example.com',
      serverId: 'server-1',
      vpsNodeId: 'node-1',
    });
    prisma.agentCommand.findFirst.mockResolvedValue({
      id: 'cmd-1',
      type: AgentCommandType.REFRESH_SITE_STACK,
      status: AgentCommandStatus.RUNNING,
      domain: 'example.com',
    });

    const result = await service.createRefreshSiteStack('disc-1', 'user-1');

    expect(result).toMatchObject({ id: 'cmd-1' });
    expect(prisma.agentCommand.create).not.toHaveBeenCalled();
  });

  it('leases a queued refresh and increments its attempt count', async () => {
    const now = new Date('2026-08-19T12:00:00.000Z');
    tx.agentCommand.updateMany
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });
    tx.agentCommand.findMany.mockResolvedValue([
      {
        id: 'cmd-1',
        type: AgentCommandType.REFRESH_SITE_STACK,
        domain: 'example.com',
        expiresAt: new Date('2026-08-19T12:10:00.000Z'),
      },
    ]);

    const leased = await service.leaseForHeartbeat('node-1', now);

    expect(leased).toEqual([
      {
        id: 'cmd-1',
        type: 'REFRESH_SITE_STACK',
        domain: 'example.com',
        expiresAt: '2026-08-19T12:10:00.000Z',
      },
    ]);
    expect(tx.agentCommand.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AgentCommandStatus.RUNNING,
          attemptCount: { increment: 1 },
        }),
      }),
    );
  });
});
