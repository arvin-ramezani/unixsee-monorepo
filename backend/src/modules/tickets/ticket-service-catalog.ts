import { TicketServiceCategory } from '#/generated/prisma/enums.js';

export type TicketServiceCatalogItem = {
  code: TicketServiceCategory;
  websiteRequired: boolean;
};

export const TICKET_SERVICE_CATALOG: readonly TicketServiceCatalogItem[] = [
  { code: TicketServiceCategory.MANAGED_SERVER, websiteRequired: true },
  {
    code: TicketServiceCategory.MIGRATION_OPTIMIZATION,
    websiteRequired: true,
  },
  { code: TicketServiceCategory.WOOCOMMERCE_SUPPORT, websiteRequired: true },
  { code: TicketServiceCategory.SEO, websiteRequired: true },
  { code: TicketServiceCategory.GRAPHIC_DESIGN, websiteRequired: false },
  { code: TicketServiceCategory.PRODUCT_DATA_ENTRY, websiteRequired: true },
  {
    code: TicketServiceCategory.SOCIAL_MEDIA_SUPPORT,
    websiteRequired: false,
  },
] as const;

export function isWebsiteRequiredForService(
  service: TicketServiceCategory,
): boolean {
  const item = TICKET_SERVICE_CATALOG.find((entry) => entry.code === service);
  return item?.websiteRequired ?? false;
}
