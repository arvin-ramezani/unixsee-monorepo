import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ServersService } from '#/modules/servers/services/servers.service.js';
import { DiscoveryStatus, VpsNodeStatus } from '#/generated/prisma/enums.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

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
    },
    websiteActiveVisitorSample: {
      createMany: vi.fn(),
    },
  };

  const serversService = {
    enrollWithToken: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

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
    it('delegates to ServersService and returns enrollment result', async () => {
      const result = {
        vpsNodeId: 'node-1',
        serverId: 'server-1',
        secretKey: 'secret-hex',
      };
      serversService.enrollWithToken.mockResolvedValue(result);

      await expect(
        service.enroll('plain-token', 'machine-1'),
      ).resolves.toEqual(result);

      expect(serversService.enrollWithToken).toHaveBeenCalledWith(
        'plain-token',
        'machine-1',
      );
      expect(prisma.vpsNode.update).not.toHaveBeenCalled();
    });

    it('persists agentVersion and clears revoke fields when provided', async () => {
      serversService.enrollWithToken.mockResolvedValue({
        vpsNodeId: 'node-1',
        serverId: 'server-1',
        secretKey: 'secret-hex',
      });
      prisma.vpsNode.update.mockResolvedValue({});

      await service.enroll('plain-token', 'machine-1', '0.1.0');

      expect(prisma.vpsNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: {
          agentVersion: '0.1.0',
          credentialsRevokedAt: null,
          credentialsRevokedReason: null,
        },
      });
    });
  });

  describe('heartbeat', () => {
    const body: HeartbeatAgentDto = {
      schemaVersion: 'phase1',
      machineId: 'machine-1',
      agentVersion: '0.1.0',
      serverBinding: { hostname: 'vps.example' },
      sentAt: '2026-08-09T12:00:00.000Z',
    };

    it('updates online snapshot for a valid node', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        credentialsRevokedAt: null,
        secretKey: 'secret',
      });
      const updated = {
        id: 'node-1',
        machineId: 'machine-1',
        lastHeartbeatAt: new Date('2026-08-09T12:00:01.000Z'),
        lastSeenAt: new Date('2026-08-09T12:00:01.000Z'),
        status: VpsNodeStatus.ONLINE,
        agentVersion: '0.1.0',
      };
      prisma.vpsNode.update.mockResolvedValue(updated);

      await expect(service.heartbeat(body)).resolves.toEqual(updated);

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

    it('throws NotFound when machine is unknown', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue(null);

      await expect(service.heartbeat(body)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(service.heartbeat(body)).rejects.toMatchObject({
        message: ERROR_MESSAGES.fa.notFound,
      });
    });

    it('throws Unauthorized when credentials are revoked', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        credentialsRevokedAt: new Date(),
        secretKey: 'secret',
      });

      await expect(service.heartbeat(body)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized when secretKey is empty', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        credentialsRevokedAt: null,
        secretKey: '',
      });

      await expect(service.heartbeat(body)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('processPhase1Ingest', () => {
    const payload: Phase1IngestDto = {
      schemaVersion: 'phase1',
      machineId: 'machine-1',
      agentVersion: '0.1.0',
      sentAt: '2026-08-09T12:00:00.000Z',
      discoveries: [
        {
          domain: 'example.com',
          documentRoot: '/home/user/domains/example.com/public_html',
          owner: 'user',
          appType: 'wordpress',
          source: 'openlitespeed',
          aliases: ['www.example.com'],
        },
      ],
      activeVisitors3m: [
        {
          domain: 'example.com',
          uniqueIpCount: 3,
          windowSeconds: 180,
          windowStartedAt: '2026-08-09T11:57:00.000Z',
          measuredAt: '2026-08-09T12:00:00.000Z',
        },
      ],
    };

    it('upserts discoveries and inserts visitor samples', async () => {
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
      });
      prisma.websiteDiscovery.findUnique.mockResolvedValue({
        websiteId: 'site-1',
      });
      prisma.websiteActiveVisitorSample.createMany.mockResolvedValue({
        count: 1,
      });

      await expect(service.processPhase1Ingest(payload)).resolves.toEqual({
        vpsNodeId: 'node-1',
        discoveryCount: 1,
        visitorSamplesInserted: 1,
      });

      expect(prisma.websiteDiscovery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            serverId_domain: {
              serverId: 'server-1',
              domain: 'example.com',
            },
          },
          create: expect.objectContaining({
            serverId: 'server-1',
            domain: 'example.com',
            status: DiscoveryStatus.NEW,
            homeDirectory: '/home/user',
            documentRoot: '/home/user/domains/example.com/public_html',
            aliases: ['www.example.com'],
          }),
        }),
      );
      expect(prisma.websiteActiveVisitorSample.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skipDuplicates: true,
          data: [
            expect.objectContaining({
              discoveryId: 'disc-1',
              websiteId: 'site-1',
              domain: 'example.com',
              uniqueIpCount: 3,
              windowSeconds: 180,
            }),
          ],
        }),
      );
    });

    it('looks up existing discovery for visitor samples not in this batch', async () => {
      const payloadWithExtraVisitor: Phase1IngestDto = {
        ...payload,
        discoveries: [],
        activeVisitors3m: [
          {
            domain: 'other.com',
            uniqueIpCount: 1,
            windowSeconds: 180,
            windowStartedAt: '2026-08-09T11:57:00.000Z',
            measuredAt: '2026-08-09T12:00:00.000Z',
          },
        ],
      };

      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        serverId: 'server-1',
        credentialsRevokedAt: null,
        secretKey: 'secret',
      });
      prisma.vpsNode.update.mockResolvedValue({});
      prisma.websiteDiscovery.findUnique.mockResolvedValue({
        id: 'disc-other',
        websiteId: null,
      });
      prisma.websiteActiveVisitorSample.createMany.mockResolvedValue({
        count: 1,
      });

      await expect(
        service.processPhase1Ingest(payloadWithExtraVisitor),
      ).resolves.toEqual({
        vpsNodeId: 'node-1',
        discoveryCount: 0,
        visitorSamplesInserted: 1,
      });

      expect(prisma.websiteDiscovery.findUnique).toHaveBeenCalledWith({
        where: {
          serverId_domain: {
            serverId: 'server-1',
            domain: 'other.com',
          },
        },
        select: { id: true, websiteId: true },
      });
    });

    it('skips visitor samples when discovery is unknown', async () => {
      const payloadUnknownVisitor: Phase1IngestDto = {
        ...payload,
        discoveries: [],
        activeVisitors3m: [
          {
            domain: 'missing.com',
            uniqueIpCount: 1,
            windowSeconds: 180,
            windowStartedAt: '2026-08-09T11:57:00.000Z',
            measuredAt: '2026-08-09T12:00:00.000Z',
          },
        ],
      };

      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        serverId: 'server-1',
        credentialsRevokedAt: null,
        secretKey: 'secret',
      });
      prisma.vpsNode.update.mockResolvedValue({});
      prisma.websiteDiscovery.findUnique.mockResolvedValue(null);

      await expect(
        service.processPhase1Ingest(payloadUnknownVisitor),
      ).resolves.toEqual({
        vpsNodeId: 'node-1',
        discoveryCount: 0,
        visitorSamplesInserted: 0,
      });

      expect(
        prisma.websiteActiveVisitorSample.createMany,
      ).not.toHaveBeenCalled();
    });

    it('throws NotFound when machine is unknown', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue(null);

      await expect(service.processPhase1Ingest(payload)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws Unauthorized when credentials are revoked', async () => {
      prisma.vpsNode.findUnique.mockResolvedValue({
        id: 'node-1',
        serverId: 'server-1',
        credentialsRevokedAt: new Date(),
        secretKey: 'secret',
      });

      await expect(service.processPhase1Ingest(payload)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
