export type WebsiteStatus =
  "online" | "needsAttention" | "maintenance" | "setupPending";
export type WebsiteBackup = "successful" | "needsReview" | "scheduled";
export type WebsitePlan =
  "starter" | "business" | "pro" | "premium" | "dedicatedPlan";
export type WebsiteDescription =
  "ecommerce" | "portfolio" | "saas" | "agency" | "blog";

export interface WebsiteRecord {
  id: string;
  name: string;
  description: WebsiteDescription;
  domain: string;
  monogram: string;
  tone: "green" | "violet" | "blue" | "red" | "orange";
  plan: WebsitePlan;
  status: WebsiteStatus;
  backup: WebsiteBackup;
  updatedAt: string;
  managementCoverage:
    "UNIXSEE_MANAGED" | "EXTERNAL_INFRASTRUCTURE" | "UNCLASSIFIED";
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
    backup: "successful",
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
    backup: "needsReview",
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
    backup: "successful",
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
    backup: "scheduled",
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
    backup: "scheduled",
    updatedAt: "2026-05-19T17:10:00Z",
    managementCoverage: "UNIXSEE_MANAGED",
  },
];
