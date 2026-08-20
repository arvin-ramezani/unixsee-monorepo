import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '#/modules/prisma/services/prisma.service.js';

import { ServersService } from './servers.service.js';

describe('ServersService manual control-panel metadata', () => {
  let service: ServersService;

  const prisma = {
    server: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServersService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: vi.fn(() => 'https://core.unixsee.com'),
          },
        },
      ],
    }).compile();

    service = module.get(ServersService);
  });

  it('persists controlPanelUrl on server create', async () => {
    prisma.server.create.mockImplementation(async ({ data }) => ({
      id: 'server-1',
      ...data,
    }));

    await service.create({
      name: 'VPS DE 01',
      ipAddress: '203.0.113.10',
      controlPanelUrl: 'https://panel.example.com:2222',
    });

    expect(prisma.server.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        controlPanelUrl: 'https://panel.example.com:2222',
      }),
    });
  });

  it('allows staff to clear controlPanelUrl on update', async () => {
    prisma.server.findUnique.mockResolvedValue({ id: 'server-1' });
    prisma.server.update.mockResolvedValue({
      id: 'server-1',
      controlPanelUrl: null,
    });

    await service.update('server-1', { controlPanelUrl: null });

    expect(prisma.server.update).toHaveBeenCalledWith({
      where: { id: 'server-1' },
      data: { controlPanelUrl: null },
    });
  });
});
