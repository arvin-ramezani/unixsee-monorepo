import { createHmac } from 'node:crypto';

import {
  BadRequestException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';

import { AgentSignatureGuard } from './agent-signature.guard.js';

function signBody(secretKey: string, timestamp: string, body: unknown): string {
  return createHmac('sha256', secretKey)
    .update(`${timestamp}.${JSON.stringify(body)}`)
    .digest('hex');
}

function createContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('AgentSignatureGuard', () => {
  let guard: AgentSignatureGuard;

  const prisma = {
    vpsNode: {
      findUnique: vi.fn(),
    },
  };

  const secretKey = 'a'.repeat(64);
  const body = {
    schemaVersion: 'phase1',
    machineId: 'machine-1',
    sentAt: '2026-08-09T12:00:00.000Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useRealTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentSignatureGuard,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get(AgentSignatureGuard);
  });

  it('accepts a valid HMAC signature and stamps vpsMachineId', async () => {
    const now = new Date('2026-08-09T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const timestamp = now.toISOString();
    const signature = signBody(secretKey, timestamp, body);
    const request = {
      body,
      headers: {
        'x-agent-timestamp': timestamp,
        'x-agent-signature': signature,
      },
      ip: '127.0.0.1',
      originalUrl: '/api/internal/agent/v1/heartbeat',
    };

    prisma.vpsNode.findUnique.mockResolvedValue({
      secretKey,
      credentialsRevokedAt: null,
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request).toMatchObject({ vpsMachineId: 'machine-1' });
  });

  it('rejects missing machineId', async () => {
    const request = {
      body: {},
      headers: {},
      ip: '127.0.0.1',
      originalUrl: '/api/internal/agent/v1/heartbeat',
    };

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing auth headers', async () => {
    const request = {
      body,
      headers: {},
      ip: '127.0.0.1',
      originalUrl: '/api/internal/agent/v1/heartbeat',
    };

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects timestamp drift beyond five minutes', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-09T12:00:00.000Z'));

    const timestamp = new Date('2026-08-09T11:50:00.000Z').toISOString();
    const signature = signBody(secretKey, timestamp, body);
    const request = {
      body,
      headers: {
        'x-agent-timestamp': timestamp,
        'x-agent-signature': signature,
      },
      ip: '127.0.0.1',
      originalUrl: '/api/internal/agent/v1/heartbeat',
    };

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.vpsNode.findUnique).not.toHaveBeenCalled();
  });

  it('rejects unknown or revoked credentials', async () => {
    const now = new Date('2026-08-09T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const timestamp = now.toISOString();
    const signature = signBody(secretKey, timestamp, body);
    const request = {
      body,
      headers: {
        'x-agent-timestamp': timestamp,
        'x-agent-signature': signature,
      },
      ip: '127.0.0.1',
      originalUrl: '/api/internal/agent/v1/heartbeat',
    };

    prisma.vpsNode.findUnique.mockResolvedValue({
      secretKey: '',
      credentialsRevokedAt: new Date(),
    });

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid signatures', async () => {
    const now = new Date('2026-08-09T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const timestamp = now.toISOString();
    const request = {
      body,
      headers: {
        'x-agent-timestamp': timestamp,
        'x-agent-signature': 'b'.repeat(64),
      },
      ip: '127.0.0.1',
      originalUrl: '/api/internal/agent/v1/heartbeat',
    };

    prisma.vpsNode.findUnique.mockResolvedValue({
      secretKey,
      credentialsRevokedAt: null,
    });

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('normalizes array header values', async () => {
    const now = new Date('2026-08-09T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const timestamp = now.toISOString();
    const signature = signBody(secretKey, timestamp, body);
    const request = {
      body,
      headers: {
        'x-agent-timestamp': [timestamp, 'ignored'],
        'x-agent-signature': [signature, 'ignored'],
      },
      ip: '127.0.0.1',
      originalUrl: '/api/internal/agent/v1/heartbeat',
    };

    prisma.vpsNode.findUnique.mockResolvedValue({
      secretKey,
      credentialsRevokedAt: null,
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
  });
});
