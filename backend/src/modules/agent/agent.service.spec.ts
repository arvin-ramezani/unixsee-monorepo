import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ServersService } from '#/modules/servers/services/servers.service.js';
import { DiscoveryStatus, VpsNodeStatus } from '#/generated/prisma/enums.js';

import { AgentService } from './agent.service.js';
import type { HeartbeatAgentDto, Phase1IngestDto } from './dto/agent.dto.js';

describe('AgentService', () => {
  let service: AgentService;

  const prisma = {
    vpsNode: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    websiteDiscovery: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    websiteActiveVisitorSample: {
      createMany: vi.fn(),
    },
    websiteTrafficSnapshot: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const serversService = {
    enrollWithToken: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: PrismaService, useValue: prisma },
        { provide: ServersService, useValue: serversService },
      ],
    }).compile();

    service = module.get(AgentService);
  });

  describe('enroll', () => {
    it('delegates enrollment atomically to ServersService', async () => {
      const result = {
        vpsNodeId: 'node-1',
        serverId: 'server-1',
        secretKey: 'secret-hex',
      };
      serversService.enrollWithToken.mockResolvedValue(result);

      await expect(
        service.enroll('plain-token', 'machine-1', '0.1.0'),
      ).resolves.toEqual(result);

      expect(serversService.enrollWithToken).toHaveBeenCalledWith(
        'plain-token',
        'machine-1',
        '0.1.0',
      );
    });
  });

  describe('heartbeat', () => {
    const body: HeartbeatAgentDto = {
      schemaVersion: 'phase1',
      machineId: 'machine-1',
      agentVersion: '0.1.0',
      serverBinding: { hostname: 'vps.example' },
      sentAt: '2026-08-19T12:00:00.000Z',
    };

    it('updates the online snapshot for a valid node', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        credentialsRevokedAt: null,
        secretKey: 'secret',
      });
      prisma.vpsNode.update.mockResolvedValue({
        id: 'node-1',
        machineId: 'machine-1',
        status: VpsNodeStatus.ONLINE,
        agentVersion: '0.1.0',
      });

      await service.heartbeat(body);

      expect(prisma.vpsNode.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { machineId: 'machine-1' },
          data: expect.objectContaining({
            status: VpsNodeStatus.ONLINE,
            agentVersion: '0.1.0',
            hostname: 'vps.example',
          }),
        }),
      );
    });

    it('rejects an unknown node', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue(null);
      await expect(service.heartbeat(body)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects revoked credentials', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        credentialsRevokedAt: new Date(),
        secretKey: 'secret',
      });
      await expect(service.heartbeat(body)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('processPhase1Ingest', () => {
    beforeEach(() => {
      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        serverId: 'server-1',
        credentialsRevokedAt: null,
        secretKey: 'secret',
      });
      prisma.vpsNode.update.mockResolvedValue({});
      prisma.websiteDiscovery.upsert.mockResolvedValue({
        id: 'disc-1',
        domain: 'example.com',
        websiteId: 'site-1',
      });
      prisma.websiteDiscovery.findUnique.mockResolvedValue({
        id: 'disc-1',
        domain: 'example.com',
        websiteId: 'site-1',
      });
      prisma.websiteDiscovery.update.mockResolvedValue({});
      prisma.websiteActiveVisitorSample.createMany.mockResolvedValue({ count: 1 });
      prisma.websiteTrafficSnapshot.upsert.mockResolvedValue({});
    });

    it('accepts a discovery-only ingest', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        machineId: 'machine-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        discoveries: [
          {
            domain: 'example.com',
            aliases: ['www.example.com'],
            documentRoot: '/home/user/domains/example.com/public_html',
            owner: 'user',
            appType: 'wordpress',
            source: 'openlitespeed',
          },
        ],
      };

      await expect(service.processPhase1Ingest(payload)).resolves.toEqual({
        vpsNodeId: 'node-1',
        discoveryCount: 1,
        stackSnapshotsUpdated: 0,
        stackSnapshotsSkipped: 0,
        visitorSamplesInserted: 0,
        activeVisitorSamplesSkipped: 0,
        visitors24hUpdated: 0,
        visitors24hSkipped: 0,
      });

      expect(prisma.websiteDiscovery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            serverId: 'server-1',
            domain: 'example.com',
            status: DiscoveryStatus.NEW,
          }),
        }),
      );
    });

    it('accepts a stack-only ingest and preserves previous values for failed fields', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        machineId: 'machine-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        stackSnapshots: [
          {
            domain: 'example.com',
            wordpressVersion: '6.8.2',
            phpVersion: null,
            imagickVersion: '3.8.0',
            checkedAt: '2026-08-19T12:00:00.000Z',
            fieldStatus: {
              wordpressVersion: { state: 'ok' },
              phpVersion: { state: 'unknown', reason: 'runtime_probe_timeout' },
              imagickVersion: { state: 'ok' },
            },
          },
        ],
      };

      const result = await service.processPhase1Ingest(payload);

      expect(result.stackSnapshotsUpdated).toBe(1);
      expect(prisma.websiteDiscovery.update).toHaveBeenCalledWith({
        where: { id: 'disc-1' },
        data: expect.objectContaining({
          wordpressVersion: '6.8.2',
          imagickVersion: '3.8.0',
          stackCheckedAt: new Date('2026-08-19T12:00:00.000Z'),
        }),
      });

      const updateArg = prisma.websiteDiscovery.update.mock.calls[0]?.[0];
      expect(updateArg.data).not.toHaveProperty('phpVersion');
    });

    it('accepts an active-visitors-only ingest', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        machineId: 'machine-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        activeVisitors3m: [
          {
            domain: 'example.com',
            uniqueIpCount: 7,
            windowSeconds: 180,
            windowStartedAt: '2026-08-19T11:57:00.000Z',
            measuredAt: '2026-08-19T12:00:00.000Z',
            status: { state: 'ok' },
          },
        ],
      };

      const result = await service.processPhase1Ingest(payload);

      expect(result.visitorSamplesInserted).toBe(1);
      expect(prisma.websiteActiveVisitorSample.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skipDuplicates: true,
          data: [
            expect.objectContaining({
              discoveryId: 'disc-1',
              uniqueIpCount: 7,
            }),
          ],
        }),
      );
      expect(prisma.websiteTrafficSnapshot.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { discoveryId: 'disc-1' },
          update: expect.objectContaining({
            activeVisitorCount: 7,
            activeWindowSeconds: 180,
          }),
        }),
      );
    });

    it('accepts a 24h-only ingest and stores the latest aggregate', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        machineId: 'machine-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        visitors24h: [
          {
            domain: 'example.com',
            uniqueVisitors24h: 487,
            windowSeconds: 86400,
            coverageSeconds: 86400,
            measuredAt: '2026-08-19T12:00:00.000Z',
            algorithm: 'hll',
            status: { state: 'ok' },
          },
        ],
      };

      const result = await service.processPhase1Ingest(payload);

      expect(result.visitors24hUpdated).toBe(1);
      expect(prisma.websiteTrafficSnapshot.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { discoveryId: 'disc-1' },
          update: expect.objectContaining({
            visitors24hCount: 487,
            visitors24hCoverageSeconds: 86400,
            visitors24hAlgorithm: 'hll',
          }),
        }),
      );
    });

    it('uses discoveries created in the same ingest without re-querying them', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        machineId: 'machine-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        discoveries: [
          {
            domain: 'example.com',
            documentRoot: '/home/user/domains/example.com/public_html',
            appType: 'wordpress',
            source: 'openlitespeed',
          },
        ],
        visitors24h: [
          {
            domain: 'example.com',
            uniqueVisitors24h: 100,
            windowSeconds: 86400,
            coverageSeconds: 7200,
            measuredAt: '2026-08-19T12:00:00.000Z',
            algorithm: 'hll',
            status: { state: 'unknown', reason: 'warming_up' },
          },
        ],
      };

      await service.processPhase1Ingest(payload);
      expect(prisma.websiteDiscovery.findUnique).not.toHaveBeenCalled();
    });

    it('skips typed samples for domains that are not in this server inventory', async () => {
      prisma.websiteDiscovery.findUnique.mockResolvedValue(null);

      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        machineId: 'machine-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        visitors24h: [
          {
            domain: 'missing.example.com',
            uniqueVisitors24h: 10,
            windowSeconds: 86400,
            coverageSeconds: 86400,
            measuredAt: '2026-08-19T12:00:00.000Z',
            algorithm: 'hll',
            status: { state: 'ok' },
          },
        ],
      };

      const result = await service.processPhase1Ingest(payload);

      expect(result.visitors24hUpdated).toBe(0);
      expect(result.visitors24hSkipped).toBe(1);
      expect(prisma.websiteTrafficSnapshot.upsert).not.toHaveBeenCalled();
    });

    it('rejects an unknown node', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue(null);
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        machineId: 'missing-machine',
        sentAt: '2026-08-19T12:00:00.000Z',
        discoveries: [],
      };

      await expect(service.processPhase1Ingest(payload)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
