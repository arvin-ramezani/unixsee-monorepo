export const BILLING_ITEM_KINDS = [
  "MANAGED_PLAN",
  "COMPLEMENTARY_SERVICE",
] as const;

export type BillingItemKind = (typeof BILLING_ITEM_KINDS)[number];

export const BILLING_ITEM_STATUSES = [
  "ACTIVE",
  "SCHEDULED",
  "PAUSED",
  "EXPIRED",
] as const;

export type BillingItemStatus = (typeof BILLING_ITEM_STATUSES)[number];

export const BILLING_INTERVALS = [
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "NONE",
] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export type CustomerBillingWebsiteRef = {
  id: string;
  domain: string;
  displayName: string | null;
};

export type CustomerBillingHubItem = {
  id: string;
  kind: BillingItemKind | string;
  labelSnapshot: string;
  amount: string | number;
  currency: string;
  interval: BillingInterval | string;
  status: BillingItemStatus | string;
  periodStartsAt: string;
  periodEndsAt: string | null;
  renewsAt: string | null;
  website: CustomerBillingWebsiteRef;
  plan?: {
    id: string;
    code: string;
    nameFa: string;
    nameEn: string;
  } | null;
  serviceAssignmentId?: string | null;
};

export type CustomerBillingHubResponse = {
  items: CustomerBillingHubItem[];
};

export type BillingHubKindFilter = "all" | BillingItemKind;

export type BillingHubState = "ready" | "empty" | "error";
