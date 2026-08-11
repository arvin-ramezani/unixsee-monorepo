import { describe, expect, it } from 'vitest';

import { TicketServiceCategory } from '#/generated/prisma/enums.js';

import {
  isWebsiteRequiredForService,
  TICKET_SERVICE_CATALOG,
} from './ticket-service-catalog.js';

describe('ticket-service-catalog', () => {
  it('marks MANAGED_SERVER, MIGRATION_OPTIMIZATION, WOOCOMMERCE_SUPPORT, SEO, PRODUCT_DATA_ENTRY as website-required', () => {
    const required = [
      TicketServiceCategory.MANAGED_SERVER,
      TicketServiceCategory.MIGRATION_OPTIMIZATION,
      TicketServiceCategory.WOOCOMMERCE_SUPPORT,
      TicketServiceCategory.SEO,
      TicketServiceCategory.PRODUCT_DATA_ENTRY,
    ];

    for (const code of required) {
      expect(isWebsiteRequiredForService(code)).toBe(true);
      expect(
        TICKET_SERVICE_CATALOG.find((item) => item.code === code)
          ?.websiteRequired,
      ).toBe(true);
    }
  });

  it('marks GRAPHIC_DESIGN and SOCIAL_MEDIA_SUPPORT as website-optional', () => {
    expect(
      isWebsiteRequiredForService(TicketServiceCategory.GRAPHIC_DESIGN),
    ).toBe(false);
    expect(
      isWebsiteRequiredForService(TicketServiceCategory.SOCIAL_MEDIA_SUPPORT),
    ).toBe(false);
  });
});
