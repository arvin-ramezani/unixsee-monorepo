export type WebsiteStatus =
  "online" | "needsAttention" | "maintenance" | "setupPending";
export type WebsitePlan =
  "starter" | "business" | "pro" | "premium" | "dedicatedPlan";
export type WebsiteDescription =
  "ecommerce" | "portfolio" | "saas" | "agency" | "blog";
export type WebsiteManagementCoverage =
  "UNIXSEE_MANAGED" | "EXTERNAL_INFRASTRUCTURE" | "UNCLASSIFIED";

export type WebsiteVisitors24h = {
  uniqueVisitors: number | null;
  windowSeconds: number | null;
  coverageSeconds: number | null;
  measuredAt: string | null;
  status: "READY" | "COLLECTING" | "UNAVAILABLE";
};

export type CustomerWebsiteDto = {
  id: string;
  domain: string;
  displayName: string | null;
  managementCoverage: WebsiteManagementCoverage;
  lastIsUp: boolean | null;
  updatedAt: string;
  plan?: { code: string; nameEn: string } | null;
  visitors24h: WebsiteVisitors24h | null;
};

export interface WebsiteRecord {
  id: string;
  name: string;
  description: WebsiteDescription;
  domain: string;
  monogram: string;
  tone: "green" | "violet" | "blue" | "red" | "orange";
  plan: WebsitePlan;
  status: WebsiteStatus;
  visitors24h: WebsiteVisitors24h | null;
  updatedAt: string;
  managementCoverage: WebsiteManagementCoverage;
}

function mapPlan(code: string | undefined): WebsitePlan {
  const normalized = code?.toUpperCase() ?? "";
  if (normalized.includes("PEAK")) return "premium";
  if (normalized.includes("PRO")) return "pro";
  if (normalized.includes("BUSINESS")) return "business";
  if (normalized.includes("DEDICATED")) return "dedicatedPlan";
  return "starter";
}

export function mapCustomerWebsite(website: CustomerWebsiteDto): WebsiteRecord {
  const name = website.displayName?.trim() || website.domain;

  return {
    id: website.id,
    name,
    description:
      website.managementCoverage === "UNIXSEE_MANAGED" ? "ecommerce" : "agency",
    domain: website.domain,
    monogram: name.slice(0, 1).toUpperCase(),
    tone: "blue",
    plan: mapPlan(website.plan?.code),
    status:
      website.lastIsUp === true
        ? "online"
        : website.lastIsUp === false
          ? "needsAttention"
          : "setupPending",
    visitors24h: website.visitors24h,
    updatedAt: website.updatedAt,
    managementCoverage: website.managementCoverage,
  };
}

export const websiteRecords: WebsiteRecord[] = [
  {
    id: "greenario-store",
    name: "Greenario Store",
    description: "ecommerce",
    domain: "greenario.com",
    monogram: "G",
    tone: "green",
    plan: "starter",
    status: "online",
    visitors24h: {
      uniqueVisitors: 487,
      windowSeconds: 86_400,
      coverageSeconds: 86_400,
      measuredAt: "2026-05-24T10:24:00Z",
      status: "READY",
    },
    updatedAt: "2026-05-24T10:24:00Z",
    managementCoverage: "UNIXSEE_MANAGED",
  },
  {
    id: "luna-studio",
    name: "Luna Studio",
    description: "portfolio",
    domain: "lunastudio.co",
    monogram: "L",
    tone: "violet",
    plan: "business",
    status: "needsAttention",
    visitors24h: {
      uniqueVisitors: 214,
      windowSeconds: 86_400,
      coverageSeconds: 86_400,
      measuredAt: "2026-05-22T15:15:00Z",
      status: "READY",
    },
    updatedAt: "2026-05-22T15:15:00Z",
    managementCoverage: "UNIXSEE_MANAGED",
  },
  {
    id: "orbit-labs",
    name: "Orbit Labs",
    description: "saas",
    domain: "orbitlabs.io",
    monogram: "O",
    tone: "blue",
    plan: "pro",
    status: "online",
    visitors24h: {
      uniqueVisitors: 91,
      windowSeconds: 86_400,
      coverageSeconds: 86_400,
      measuredAt: "2026-05-21T09:42:00Z",
      status: "READY",
    },
    updatedAt: "2026-05-21T09:42:00Z",
    managementCoverage: "UNIXSEE_MANAGED",
  },
  {
    id: "nova-agency",
    name: "Nova Agency",
    description: "agency",
    domain: "novaagency.com",
    monogram: "N",
    tone: "red",
    plan: "premium",
    status: "maintenance",
    visitors24h: null,
    updatedAt: "2026-05-20T11:30:00Z",
    managementCoverage: "UNIXSEE_MANAGED",
  },
  {
    id: "pixel-nest",
    name: "Pixel Nest",
    description: "blog",
    domain: "pixelnest.dev",
    monogram: "P",
    tone: "orange",
    plan: "dedicatedPlan",
    status: "setupPending",
    visitors24h: {
      uniqueVisitors: null,
      windowSeconds: 86_400,
      coverageSeconds: 3_600,
      measuredAt: "2026-05-19T17:10:00Z",
      status: "COLLECTING",
    },
    updatedAt: "2026-05-19T17:10:00Z",
    managementCoverage: "UNIXSEE_MANAGED",
  },
];
