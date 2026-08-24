export const PLAN_ID = {
  UNIX_CORE: "unix-core",
  UNIX_SCALE: "unix-scale",
  UNIX_PEAK: "unix-peak",
  UNIX_ENTERPRISE: "unix-enterprise",
} as const;

export type PlanIdType = (typeof PLAN_ID)[keyof typeof PLAN_ID];

export type PlanType = {
  id: PlanIdType;
  name: string;
};

export const PLANS: PlanType[] = [
  { id: PLAN_ID.UNIX_CORE, name: "UNIX CORE" },
  { id: PLAN_ID.UNIX_SCALE, name: "UNIX SCALE" },
  { id: PLAN_ID.UNIX_PEAK, name: "UNIX PEAK" },
  { id: PLAN_ID.UNIX_ENTERPRISE, name: "UNIX ENTERPRISE" },
];

export const PLAN_NAME_BY_ID: Record<PlanIdType, string> = {
  [PLAN_ID.UNIX_CORE]: "UNIX CORE",
  [PLAN_ID.UNIX_SCALE]: "UNIX SCALE",
  [PLAN_ID.UNIX_PEAK]: "UNIX PEAK",
  [PLAN_ID.UNIX_ENTERPRISE]: "UNIX ENTERPRISE",
};

export const PLAN_OPTIONS = PLANS.map((plan) => plan.name);

export function getPlanById(id: PlanIdType): PlanType {
  const plan = PLANS.find((item) => item.id === id);
  if (!plan) {
    throw new Error(`Unknown plan id: ${id}`);
  }
  return plan;
}

export function getPlanByName(name: string): PlanType | undefined {
  return PLANS.find((plan) => plan.name === name);
}

/** A linked plan is active only after its activation timestamp is recorded. */
export function websiteHasActivePlan(
  plan: string | null | undefined,
  planActivatedAt?: string | null,
): boolean {
  const hasLinkedPlan = Boolean(plan && plan.trim().length > 0 && plan !== "—");
  return hasLinkedPlan && planActivatedAt !== null;
}
