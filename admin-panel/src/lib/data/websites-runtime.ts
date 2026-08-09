import { WEBSITES, type WebsiteType } from "@/lib/data/websites-data";

/**
 * Prototype-only in-memory website clone so plan enablement can set the
 * active plan during a session. Persistence belongs to NestJS later.
 */
let runtimeWebsites: WebsiteType[] = WEBSITES.map((website) => ({
  ...website,
  technical: { ...website.technical },
  service: { ...website.service },
  monitoring: { ...website.monitoring },
}));

export function listRuntimeWebsites() {
  return runtimeWebsites;
}

export function getRuntimeWebsite(id: string) {
  return runtimeWebsites.find((website) => website.id === id);
}

export function listRuntimeWebsitesByTenant(tenantId: string) {
  return runtimeWebsites.filter((website) => website.tenantId === tenantId);
}

export function setWebsiteActivePlan(websiteId: string, planName: string) {
  const index = runtimeWebsites.findIndex(
    (website) => website.id === websiteId,
  );
  if (index < 0) {
    return null;
  }

  const current = runtimeWebsites[index];
  const updated: WebsiteType = {
    ...current,
    technical: { ...current.technical },
    service: { ...current.service, plan: planName },
    monitoring: { ...current.monitoring },
  };

  runtimeWebsites = [
    ...runtimeWebsites.slice(0, index),
    updated,
    ...runtimeWebsites.slice(index + 1),
  ];

  return updated;
}
