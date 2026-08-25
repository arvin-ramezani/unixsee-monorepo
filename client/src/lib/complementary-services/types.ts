import type {
  ComplementaryServiceType,
  ConsultationEngagementPreference,
} from "@/lib/data/complementary-services/complementary-services-data";

export type WebsiteManagementCoverage =
  "UNIXSEE_MANAGED" | "EXTERNAL_INFRASTRUCTURE" | "UNCLASSIFIED";

export type ComplementaryCatalogItem = {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string | null;
  descriptionEn: string | null;
};

export type ComplementaryWebsiteOption = {
  id: string;
  name: string;
  domain: string;
  managementCoverage: WebsiteManagementCoverage;
};

export type ComplementaryRequestSummary = {
  id: string;
  catalogItemId: string;
  status: string;
  websiteId: string | null;
  websiteDomain: string | null;
};

export type ComplementaryRequestFormData = {
  catalog: ComplementaryCatalogItem[];
  websites: ComplementaryWebsiteOption[];
  requests: ComplementaryRequestSummary[];
};

export type CreateComplementaryRequestInput = {
  catalogItemId: string;
  websiteId?: string;
  websiteDomain?: string;
  engagementPreference: ConsultationEngagementPreference;
  title: string;
  description: string;
  scope?: Record<string, unknown>;
  idempotencyKey: string;
};

export type CreatedComplementaryRequest = ComplementaryRequestSummary & {
  title: string | null;
  websiteTargetType: "EXISTING_WEBSITE" | "TYPED_DOMAIN";
  websiteCoverageSnapshot: WebsiteManagementCoverage;
  websiteResolutionState:
    "PENDING_ACCEPTANCE" | "LINKED" | "DEFERRED_NO_TENANT";
};

const CATALOG_CODE_TO_SERVICE: Record<string, ComplementaryServiceType> = {
  SEO: "seo",
  GRAPHIC_DESIGN: "graphic-design",
  PRODUCT_DATA_ENTRY: "product-data-entry",
  SOCIAL_MEDIA_SUPPORT: "social-media-support",
};

export function catalogCodeToServiceType(
  code: string,
): ComplementaryServiceType | null {
  const normalized = code.trim().toUpperCase().replace(/-/g, "_");
  return CATALOG_CODE_TO_SERVICE[normalized] ?? null;
}
