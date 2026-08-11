import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TicketStatus } from '#/generated/prisma/enums.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';

import { TicketAutoCloseService } from './ticket-auto-close.service.js';

describe('TicketAutoCloseService.runAutoClose', () => {
  let service: TicketAutoCloseService;

  const prisma = {
    ticket: {
      updateMany: vi.fn(),
    },
  };

  const config = {
    get: vi.fn(),
  };

  const schedulerRegistry = {
    getCronJob: vi.fn(),
    addCronJob: vi.fn(),
    deleteCronJob: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    config.get.mockReturnValue({
      tickets: {
        autoCloseEnabled: true,
        autoCloseGraceDays: 7,
        autoCloseCronExpression: '0 * * * *',
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketAutoCloseService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
        { provide: SchedulerRegistry, useValue: schedulerRegistry },
      ],
    }).compile();

    service = module.get(TicketAutoCloseService);
  });

  it('updates due RESOLVED tickets to CLOSED and clears autoCloseAt', async () => {
    prisma.ticket.updateMany.mockResolvedValue({ count: 2 });

    await expect(service.runAutoClose('manual')).resolves.toBe(2);

    expect(prisma.ticket.updateMany).toHaveBeenCalledWith({
      where: {
        status: TicketStatus.RESOLVED,
        autoCloseAt: { lte: expect.any(Date) },
      },
      data: {
        status: TicketStatus.CLOSED,
        autoCloseAt: null,
      },
    });
  });

  it('returns 0 when auto-close disabled', async () => {
    config.get.mockReturnValue({
      tickets: {
        autoCloseEnabled: false,
        autoCloseGraceDays: 7,
        autoCloseCronExpression: '0 * * * *',
      },
    });

    await expect(service.runAutoClose('manual')).resolves.toBe(0);
    expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('returns 0 when a run is already in progress', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    prisma.ticket.updateMany.mockImplementation(async () => {
      await gate;
      return { count: 1 };
    });

    const first = service.runAutoClose('manual');
    await Promise.resolve();
    await expect(service.runAutoClose('manual')).resolves.toBe(0);

    release();
    await expect(first).resolves.toBe(1);
  });

  it('does not close RESOLVED tickets whose autoCloseAt is still in the future', async () => {
    prisma.ticket.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.runAutoClose('manual')).resolves.toBe(0);

    const where = prisma.ticket.updateMany.mock.calls[0]?.[0]?.where;
    expect(where).toEqual({
      status: TicketStatus.RESOLVED,
      autoCloseAt: { lte: expect.any(Date) },
    });
  });

  it('registers cron name ticket-auto-close-cycle when enabled', () => {
    schedulerRegistry.getCronJob.mockImplementation(() => {
      throw new Error('missing');
    });

    service.onApplicationBootstrap();

    expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
      'ticket-auto-close-cycle',
      expect.objectContaining({
        start: expect.any(Function),
      }),
    );
  });
});
