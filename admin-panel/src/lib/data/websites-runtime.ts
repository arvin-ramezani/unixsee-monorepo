import {
  advanceIsoDateByMonths,
  billingPeriodMonths,
  WEBSITES,
  type WebsiteType,
} from "@/lib/data/websites-data";

/**
 * Prototype-only in-memory website clone so plan enablement / renew / change
 * can update commercial fields during a session. Persistence belongs to NestJS later.
 */
let runtimeWebsites: WebsiteType[] = WEBSITES.map((website) => ({
  ...website,
  technical: { ...website.technical },
  service: { ...website.service },
  monitoring: { ...website.monitoring },
}));

function replaceWebsite(updated: WebsiteType) {
  const index = runtimeWebsites.findIndex(
    (website) => website.id === updated.id,
  );
  if (index < 0) {
    return null;
  }

  runtimeWebsites = [
    ...runtimeWebsites.slice(0, index),
    updated,
    ...runtimeWebsites.slice(index + 1),
  ];

  return updated;
}

function cloneWebsite(current: WebsiteType): WebsiteType {
  return {
    ...current,
    technical: { ...current.technical },
    service: { ...current.service },
    monitoring: { ...current.monitoring },
  };
}

export function listRuntimeWebsites() {
  return runtimeWebsites;
}

export function getRuntimeWebsite(id: string) {
  return runtimeWebsites.find((website) => website.id === id);
}

export function listRuntimeWebsitesByTenant(tenantId: string) {
  return runtimeWebsites.filter((website) => website.tenantId === tenantId);
}

/** Replace the website’s active catalog plan (explicit one-plan replace). */
export function changeWebsitePlan(websiteId: string, planName: string) {
  const current = getRuntimeWebsite(websiteId);
  if (!current) {
    return null;
  }

  const updated = cloneWebsite(current);
  updated.service.plan = planName;
  return replaceWebsite(updated);
}

/** @deprecated Prefer changeWebsitePlan — kept for plan-request enablement. */
export function setWebsiteActivePlan(websiteId: string, planName: string) {
  return changeWebsitePlan(websiteId, planName);
}

/**
 * Staff commercial renew: advance renewalAt by one billing period.
 * No payment — fixture prototype only.
 */
export function renewWebsitePlan(websiteId: string) {
  const current = getRuntimeWebsite(websiteId);
  if (!current) {
    return null;
  }

  if (!current.service.plan.trim()) {
    return null;
  }

  const months = billingPeriodMonths(current.service.billingPeriod);
  const nextRenewalAt = advanceIsoDateByMonths(
    current.service.renewalAt,
    months,
  );

  const updated = cloneWebsite(current);
  updated.service.renewalAt = nextRenewalAt;
  return replaceWebsite(updated);
}

export function previewRenewalAt(website: WebsiteType): string {
  const months = billingPeriodMonths(website.service.billingPeriod);
  return advanceIsoDateByMonths(website.service.renewalAt, months);
}
