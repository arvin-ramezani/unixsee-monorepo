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
    it('delegates enrollment using agentInstanceId', async () => {
      const result = {
        vpsNodeId: 'node-1',
        serverId: 'server-1',
        secretKey: 'secret-hex',
      };
      serversService.enrollWithToken.mockResolvedValue(result);

      await expect(
        service.enroll('plain-token', 'agent-instance-1', '0.2.0'),
      ).resolves.toEqual(result);

      expect(serversService.enrollWithToken).toHaveBeenCalledWith(
        'plain-token',
        'agent-instance-1',
        '0.2.0',
      );
    });
  });

  describe('heartbeat', () => {
    const body: HeartbeatAgentDto = {
      schemaVersion: 'phase1',
      agentInstanceId: 'agent-instance-1',
      agentVersion: '0.2.0',
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
        agentInstanceId: 'agent-instance-1',
        status: VpsNodeStatus.ONLINE,
        agentVersion: '0.2.0',
      });

      await service.heartbeat(body);

      expect(prisma.vpsNode.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { agentInstanceId: 'agent-instance-1' },
          data: expect.objectContaining({
            status: VpsNodeStatus.ONLINE,
            agentVersion: '0.2.0',
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

    it('stores discovery as OLS inventory only', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'agent-instance-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        discoveries: [
          {
            domain: 'example.com',
            aliases: ['www.example.com'],
            virtualHostName: 'example.com',
            source: 'openlitespeed',
            discoveredAt: '2026-08-19T11:59:30.000Z',
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

      const upsert = prisma.websiteDiscovery.upsert.mock.calls[0]?.[0];
      expect(upsert).toEqual(
        expect.objectContaining({
          create: expect.objectContaining({
            serverId: 'server-1',
            domain: 'example.com',
            displayName: 'example.com',
            status: DiscoveryStatus.NEW,
            aliases: ['www.example.com'],
            virtualHostName: 'example.com',
            source: 'openlitespeed',
            discoveredAt: new Date('2026-08-19T11:59:30.000Z'),
          }),
          update: expect.objectContaining({
            aliases: ['www.example.com'],
            virtualHostName: 'example.com',
            source: 'openlitespeed',
          }),
        }),
      );

      for (const data of [upsert.create, upsert.update]) {
        expect(data).not.toHaveProperty('documentRoot');
        expect(data).not.toHaveProperty('homeDirectory');
        expect(data).not.toHaveProperty('directAdminUser');
        expect(data).not.toHaveProperty('appType');
        expect(data).not.toHaveProperty('backendAddress');
        expect(data).not.toHaveProperty('controlPanelUrl');
        expect(data).not.toHaveProperty('wordpressAdminUrl');
        expect(data).not.toHaveProperty('wordpressVersion');
        expect(data).not.toHaveProperty('phpVersion');
        expect(data).not.toHaveProperty('phpVersionScope');
        expect(data).not.toHaveProperty('imagickVersion');
        expect(data).not.toHaveProperty('wordpressUpdateStatus');
        expect(data).not.toHaveProperty('wordpressUpdateCheckedAt');
        expect(data).not.toHaveProperty('fieldStatus');
      }
    });

    it('does not overwrite displayName when an existing discovery is updated', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'agent-instance-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        discoveries: [
          {
            domain: 'example.com',
            aliases: [],
            virtualHostName: 'site-vhost',
            source: 'openlitespeed',
            discoveredAt: '2026-08-19T12:00:00.000Z',
          },
        ],
      };

      await service.processPhase1Ingest(payload);
      const update = prisma.websiteDiscovery.upsert.mock.calls[0]?.[0].update;
      expect(update).not.toHaveProperty('displayName');
    });

    it('stores stack only through stackSnapshots and preserves failed fields', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'agent-instance-1',
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
      expect(prisma.websiteDiscovery.upsert).not.toHaveBeenCalled();
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

    it('uses a discovery created in the same ingest for its separate stack snapshot', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'agent-instance-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        discoveries: [
          {
            domain: 'example.com',
            aliases: ['www.example.com'],
            virtualHostName: 'site-vhost',
            source: 'openlitespeed',
            discoveredAt: '2026-08-19T12:00:00.000Z',
          },
        ],
        stackSnapshots: [
          {
            domain: 'example.com',
            wordpressVersion: '6.8.2',
            phpVersion: '8.3.23',
            imagickVersion: '3.8.0',
            checkedAt: '2026-08-19T12:00:01.000Z',
            fieldStatus: {
              wordpressVersion: { state: 'ok' },
              phpVersion: { state: 'ok' },
              imagickVersion: { state: 'ok' },
            },
          },
        ],
      };

      const result = await service.processPhase1Ingest(payload);
      expect(result.discoveryCount).toBe(1);
      expect(result.stackSnapshotsUpdated).toBe(1);
      expect(prisma.websiteDiscovery.findUnique).not.toHaveBeenCalled();
    });

    it('accepts an active-visitors-only ingest', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'agent-instance-1',
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
          data: [expect.objectContaining({ discoveryId: 'disc-1', uniqueIpCount: 7 })],
        }),
      );
    });

    it('accepts a 24h-only ingest', async () => {
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'agent-instance-1',
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
          }),
        }),
      );
    });

    it('skips stack/traffic records for a domain outside this server inventory', async () => {
      prisma.websiteDiscovery.findUnique.mockResolvedValue(null);

      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'agent-instance-1',
        sentAt: '2026-08-19T12:00:00.000Z',
        stackSnapshots: [
          {
            domain: 'missing.example.com',
            wordpressVersion: null,
            phpVersion: null,
            imagickVersion: null,
            checkedAt: '2026-08-19T12:00:00.000Z',
            fieldStatus: {
              wordpressVersion: { state: 'unknown', reason: 'missing' },
              phpVersion: { state: 'unknown', reason: 'missing' },
              imagickVersion: { state: 'unknown', reason: 'missing' },
            },
          },
        ],
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
      expect(result.stackSnapshotsSkipped).toBe(1);
      expect(result.visitors24hSkipped).toBe(1);
      expect(prisma.websiteDiscovery.update).not.toHaveBeenCalled();
      expect(prisma.websiteTrafficSnapshot.upsert).not.toHaveBeenCalled();
    });

    it('rejects an unknown node', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue(null);
      const payload: Phase1IngestDto = {
        schemaVersion: 'phase1',
        agentInstanceId: 'missing-agent-instance',
        sentAt: '2026-08-19T12:00:00.000Z',
        discoveries: [],
      };

      await expect(service.processPhase1Ingest(payload)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
