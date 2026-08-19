import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TenantAccessService } from '#/common/tenancy/tenant-access.service.js';
import { PrismaService } from '#/modules/prisma/services/prisma.service.js';

import { WebsitesService } from './websites.service.js';

describe('WebsitesService manual WordPress admin metadata', () => {
  let service: WebsitesService;

  const prisma = {
    website: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsitesService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: TenantAccessService,
          useValue: {
            getAccessibleTenantIds: vi.fn(),
            assertWebsiteAccess: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(WebsitesService);
  });

  it('persists wordpressAdminUrl when an admin creates a website', async () => {
    prisma.website.create.mockImplementation(async ({ data }) => ({
      id: 'website-1',
      ...data,
    }));

    await service.createAdmin({
      tenantId: 'tenant-1',
      vpsNodeId: 'node-1',
      domain: 'example.com',
      wordpressAdminUrl: 'https://example.com/wp-admin/',
    });

    expect(prisma.website.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        wordpressAdminUrl: 'https://example.com/wp-admin/',
      }),
    });
  });

  it('updates only admin-owned metadata and supports clearing the URL', async () => {
    prisma.website.findUnique.mockResolvedValue({ id: 'website-1' });
    prisma.website.update.mockResolvedValue({
      id: 'website-1',
      displayName: 'Example',
      wordpressAdminUrl: null,
    });

    await service.updateAdmin('website-1', {
      displayName: 'Example',
      wordpressAdminUrl: null,
    });

    expect(prisma.website.update).toHaveBeenCalledWith({
      where: { id: 'website-1' },
      data: {
        displayName: 'Example',
        wordpressAdminUrl: null,
      },
    });
  });
});
