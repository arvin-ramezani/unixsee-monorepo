import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TenantAccessService } from '#/common/tenancy/tenant-access.service.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';

import { WebsitesService } from './websites.service.js';

const WEBSITE_ID = 'website-1';
const TENANT_ID = 'tenant-1';
const PLAN_ID = 'plan-core';

function website(planActivatedAt: Date | null = null) {
  return {
    id: WEBSITE_ID,
    tenantId: TENANT_ID,
    domain: 'example.com',
    planId: PLAN_ID,
    planActivatedAt,
  };
}

describe('WebsitesService plan assignment', () => {
  let service: WebsitesService;

  const prisma = {
    website: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  const tenantAccess = {};

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsitesService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantAccessService, useValue: tenantAccess },
      ],
    }).compile();

    service = module.get(WebsitesService);
  });

  it('links a selected plan without activating it by default', async () => {
    prisma.website.create.mockResolvedValue(website());

    await service.createAdmin({
      tenantId: TENANT_ID,
      domain: 'example.com',
      planId: PLAN_ID,
    });

    expect(prisma.website.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        planId: PLAN_ID,
        planActivatedAt: null,
      }),
    });
  });

  it('activates a selected plan only when explicitly requested', async () => {
    prisma.website.create.mockResolvedValue(website(new Date()));

    await service.createAdmin({
      tenantId: TENANT_ID,
      domain: 'example.com',
      planId: PLAN_ID,
      activatePlan: true,
    });

    expect(prisma.website.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        planId: PLAN_ID,
        planActivatedAt: expect.any(Date),
      }),
    });
  });

  it('rejects activation when no plan is selected', async () => {
    await expect(
      service.createAdmin({
        tenantId: TENANT_ID,
        domain: 'example.com',
        activatePlan: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.website.create).not.toHaveBeenCalled();
  });

  it('keeps an assigned plan inactive', async () => {
    prisma.website.findUnique.mockResolvedValue(website(new Date()));
    prisma.website.update.mockResolvedValue(website());

    await service.assign(WEBSITE_ID, {
      tenantId: TENANT_ID,
      planId: PLAN_ID,
    });

    expect(prisma.website.update).toHaveBeenCalledWith({
      where: { id: WEBSITE_ID },
      data: expect.objectContaining({
        tenantId: TENANT_ID,
        planId: PLAN_ID,
        planActivatedAt: null,
      }),
    });
  });
});
