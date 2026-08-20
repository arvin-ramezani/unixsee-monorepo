import { createHmac } from 'node:crypto';

import {
  BadRequestException,
  type INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { GlobalExceptionFilter } from '#/common/http/filters/global-exception.filter.js';
import { VpsNodeStatus } from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';
import { ServersService } from '#/modules/servers/services/servers.service.js';
import { ERROR_MESSAGES } from '#/utils/error-messages.js';

import { AgentController } from '../src/modules/agent/agent.controller.js';
import { AgentService } from '../src/modules/agent/agent.service.js';
import { AgentSignatureGuard } from '../src/modules/agent/guards/agent-signature.guard.js';

const AGENT_INSTANCE_ID = 'e2e-agent-instance-1';
const SERVER_ID = 'server-e2e-1';
const VPS_NODE_ID = 'node-e2e-1';
const ENROLLMENT_TOKEN = 'enrollment-token-plain';
const SECRET_KEY = 'b'.repeat(64);

function signAgentBody(secretKey: string, timestamp: string, body: unknown) {
  return createHmac('sha256', secretKey)
    .update(`${timestamp}.${JSON.stringify(body)}`)
    .digest('hex');
}

function discovery(discoveredAt = new Date().toISOString()) {
  return {
    domain: 'example.com',
    aliases: ['www.example.com'],
    virtualHostName: 'example.com',
    source: 'openlitespeed',
    discoveredAt,
  };
}

describe('AgentModule (e2e)', () => {
  let app: INestApplication;

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      providers: [
        AgentService,
        AgentSignatureGuard,
        { provide: PrismaService, useValue: prisma },
        { provide: ServersService, useValue: serversService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));

    prisma.vpsNode.findUnique.mockResolvedValue({
      id: VPS_NODE_ID,
      serverId: SERVER_ID,
      secretKey: SECRET_KEY,
      credentialsRevokedAt: null,
    });
    prisma.vpsNode.update.mockImplementation(async ({ data }) => ({
      id: VPS_NODE_ID,
      agentInstanceId: AGENT_INSTANCE_ID,
      lastHeartbeatAt: data.lastHeartbeatAt ?? new Date(),
      lastSeenAt: data.lastSeenAt ?? new Date(),
      status: data.status ?? VpsNodeStatus.ONLINE,
      agentVersion: data.agentVersion ?? '0.2.0',
    }));
    prisma.websiteDiscovery.upsert.mockResolvedValue({
      id: 'discovery-1',
      domain: 'example.com',
      websiteId: 'website-1',
    });
    prisma.websiteDiscovery.findUnique.mockResolvedValue({
      id: 'discovery-1',
      domain: 'example.com',
      websiteId: 'website-1',
    });
    prisma.websiteDiscovery.update.mockResolvedValue({});
    prisma.websiteActiveVisitorSample.createMany.mockResolvedValue({ count: 1 });
    prisma.websiteTrafficSnapshot.upsert.mockResolvedValue({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/internal/agent/v1/enroll', () => {
    it('returns 401 when enrollment token header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/internal/agent/v1/enroll')
        .send({ agentInstanceId: AGENT_INSTANCE_ID })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
        error: expect.objectContaining({
          message: ERROR_MESSAGES.fa.unauthenticated,
        }),
      });
    });

    it('returns 400 when agentInstanceId is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/enroll')
        .set('x-enrollment-token', ENROLLMENT_TOKEN)
        .send({})
        .expect(400);
    });

    it('enrolls using agentInstanceId', async () => {
      serversService.enrollWithToken.mockResolvedValue({
        vpsNodeId: VPS_NODE_ID,
        serverId: SERVER_ID,
        secretKey: SECRET_KEY,
      });

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/enroll')
        .set('x-enrollment-token', ENROLLMENT_TOKEN)
        .send({ agentInstanceId: AGENT_INSTANCE_ID, agentVersion: '0.2.0' })
        .expect(201);

      expect(serversService.enrollWithToken).toHaveBeenCalledWith(
        ENROLLMENT_TOKEN,
        AGENT_INSTANCE_ID,
        '0.2.0',
      );
    });

    it('propagates invalid enrollment token failures', async () => {
      serversService.enrollWithToken.mockRejectedValue(
        new BadRequestException(ERROR_MESSAGES.fa.validation),
      );

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/enroll')
        .set('x-enrollment-token', 'bad-token')
        .send({ agentInstanceId: AGENT_INSTANCE_ID })
        .expect(400);
    });
  });

  describe('POST /api/internal/agent/v1/heartbeat', () => {
    it('accepts a valid signed heartbeat', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        agentVersion: '0.2.0',
        serverBinding: { hostname: 'vps.example' },
        sentAt,
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      const response = await request(app.getHttpServer())
        .post('/api/internal/agent/v1/heartbeat')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: VPS_NODE_ID,
          agentInstanceId: AGENT_INSTANCE_ID,
          status: VpsNodeStatus.ONLINE,
        }),
      });
    });
  });

  describe('POST /api/internal/agent/v1/ingest', () => {
    it('accepts an OLS discovery-only payload', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        agentVersion: '0.2.0',
        sentAt,
        discoveries: [discovery(sentAt)],
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/ingest')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(201);

      const upsert = prisma.websiteDiscovery.upsert.mock.calls[0]?.[0];
      expect(upsert.create).toEqual(
        expect.objectContaining({
          domain: 'example.com',
          aliases: ['www.example.com'],
          virtualHostName: 'example.com',
          source: 'openlitespeed',
        }),
      );
      expect(upsert.create).not.toHaveProperty('documentRoot');
      expect(upsert.create).not.toHaveProperty('wordpressVersion');
      expect(upsert.create).not.toHaveProperty('controlPanelUrl');
    });

    it('rejects legacy discovery fields even when their values are valid', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        sentAt,
        discoveries: [
          {
            ...discovery(sentAt),
            documentRoot: '/home/user/domains/example.com/public_html',
            owner: 'user',
            appType: 'wordpress',
            wordpressVersion: '6.8.2',
            phpVersion: '8.3.23',
            imagickVersion: '3.8.0',
            controlPanelUrl: 'https://panel.example.com:2222',
            wordpressAdminUrl: 'https://example.com/wp-admin/',
          },
        ],
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/ingest')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(400);
    });

    it('rejects non-OpenLiteSpeed discovery sources', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        sentAt,
        discoveries: [{ ...discovery(sentAt), source: 'directadmin' }],
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/ingest')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(400);
    });

    it('accepts discovery and stack as separate typed sections', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        sentAt,
        discoveries: [discovery(sentAt)],
        stackSnapshots: [
          {
            domain: 'example.com',
            wordpressVersion: '6.8.2',
            phpVersion: '8.3.23',
            imagickVersion: '3.8.0',
            checkedAt: sentAt,
            fieldStatus: {
              wordpressVersion: { state: 'ok' },
              phpVersion: { state: 'ok' },
              imagickVersion: { state: 'ok' },
            },
          },
        ],
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/ingest')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(201);

      expect(prisma.websiteDiscovery.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.websiteDiscovery.update).toHaveBeenCalledTimes(1);
    });

    it('accepts a stack-only ingest for an existing discovery', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        sentAt,
        stackSnapshots: [
          {
            domain: 'example.com',
            wordpressVersion: '6.8.2',
            phpVersion: '8.3.23',
            imagickVersion: '3.8.0',
            checkedAt: sentAt,
            fieldStatus: {
              wordpressVersion: { state: 'ok' },
              phpVersion: { state: 'ok' },
              imagickVersion: { state: 'ok' },
            },
          },
        ],
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/ingest')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(201);

      expect(prisma.websiteDiscovery.update).toHaveBeenCalled();
      expect(prisma.websiteDiscovery.upsert).not.toHaveBeenCalled();
    });

    it('accepts traffic-only payloads', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        sentAt,
        activeVisitors3m: [
          {
            domain: 'example.com',
            uniqueVisitorCount: 0,
            windowSeconds: 180,
            windowStartedAt: new Date(Date.now() - 180_000).toISOString(),
            measuredAt: sentAt,
            status: { state: 'ok' },
          },
        ],
        visitors24h: [
          {
            domain: 'example.com',
            uniqueVisitors24h: 487,
            windowSeconds: 86400,
            coverageSeconds: 86400,
            measuredAt: sentAt,
            algorithm: 'hll',
            status: { state: 'ok' },
          },
        ],
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/ingest')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(201);

      expect(prisma.websiteActiveVisitorSample.createMany).toHaveBeenCalled();
      expect(prisma.websiteTrafficSnapshot.upsert).toHaveBeenCalled();
    });

    it('rejects an ingest envelope with no typed sections', async () => {
      const sentAt = new Date().toISOString();
      const body = {
        schemaVersion: 'phase1',
        agentInstanceId: AGENT_INSTANCE_ID,
        sentAt,
      };
      const timestamp = new Date().toISOString();
      const signature = signAgentBody(SECRET_KEY, timestamp, body);

      await request(app.getHttpServer())
        .post('/api/internal/agent/v1/ingest')
        .set('x-agent-timestamp', timestamp)
        .set('x-agent-signature', signature)
        .send(body)
        .expect(400);
    });
  });
});
