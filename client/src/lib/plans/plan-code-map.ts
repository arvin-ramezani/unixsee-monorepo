export const MARKETING_PLAN_KEYS = [
  "core",
  "scale",
  "peak",
  "enterprise",
] as const;

export type MarketingPlanKey = (typeof MARKETING_PLAN_KEYS)[number];

const MARKETING_TO_NEST_CODE: Record<MarketingPlanKey, string> = {
  core: "unix-core",
  scale: "unix-scale",
  peak: "unix-peak",
  enterprise: "unix-enterprise",
};

export function marketingPlanKeyToNestCode(key: string): string | null {
  if (!(key in MARKETING_TO_NEST_CODE)) {
    return null;
  }
  return MARKETING_TO_NEST_CODE[key as MarketingPlanKey];
}

export function isMarketingPlanKey(key: string): key is MarketingPlanKey {
  return MARKETING_PLAN_KEYS.includes(key as MarketingPlanKey);
}
