import { mapApiError } from "@/lib/api/map-api-error";
import { publicFetch } from "@/lib/api/public-fetch";
import { serverFetch } from "@/lib/api/server-fetch";
import type { DashboardPlan, NestPlan } from "@/lib/plans/types";
import type { Locale } from "@/i18n/routing";
import {
  isMarketingPlanKey,
  marketingPlanKeyToNestCode,
} from "@/lib/plans/plan-code-map";

function mapPlan(plan: NestPlan, locale: Locale): DashboardPlan {
  const isFa = locale === "fa";
  return {
    id: plan.id,
    code: plan.code,
    name: isFa ? plan.nameFa : plan.nameEn,
    description: isFa
      ? (plan.descriptionFa ?? plan.descriptionEn)
      : (plan.descriptionEn ?? plan.descriptionFa),
    sortOrder: plan.sortOrder,
  };
}

export async function fetchPublishedPlansPublic(
  locale: Locale,
): Promise<
  | { ok: true; plans: DashboardPlan[] }
  | { ok: false; error: "unavailable" | "generic" }
> {
  try {
    const response = await publicFetch<NestPlan[]>("/public/plans", {
      method: "GET",
    });
    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      return {
        ok: false,
        error: mapped?.key === "unavailable" ? "unavailable" : "generic",
      };
    }
    return {
      ok: true,
      plans: response.data.map((plan) => mapPlan(plan, locale)),
    };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

export async function fetchPublishedPlanByMarketingKey(
  marketingKey: string,
  locale: Locale,
): Promise<
  | { ok: true; plan: DashboardPlan }
  | { ok: false; reason: "invalid_key" | "not_found" | "unavailable" }
> {
  if (!isMarketingPlanKey(marketingKey)) {
    return { ok: false, reason: "invalid_key" };
  }

  const nestCode = marketingPlanKeyToNestCode(marketingKey);
  if (!nestCode) {
    return { ok: false, reason: "invalid_key" };
  }

  const result = await fetchPublishedPlansPublic(locale);
  if (!result.ok) {
    return { ok: false, reason: "unavailable" };
  }

  const plan = result.plans.find((item) => item.code === nestCode) ?? null;
  if (!plan) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, plan };
}

export async function fetchPublishedPlans(
  locale: Locale,
): Promise<
  | { ok: true; plans: DashboardPlan[] }
  | { ok: false; error: "unavailable" | "generic" }
> {
  try {
    const response = await serverFetch<NestPlan[]>("/plans", { method: "GET" });
    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      return {
        ok: false,
        error: mapped?.key === "unavailable" ? "unavailable" : "generic",
      };
    }
    return {
      ok: true,
      plans: response.data.map((plan) => mapPlan(plan, locale)),
    };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

export async function fetchPublishedPlanById(
  planId: string,
  locale: Locale,
): Promise<DashboardPlan | null> {
  const result = await fetchPublishedPlans(locale);
  if (!result.ok) return null;
  return result.plans.find((plan) => plan.id === planId) ?? null;
}

export async function fetchPublishedPlanByIdPublic(
  planId: string,
  locale: Locale,
): Promise<DashboardPlan | null> {
  const result = await fetchPublishedPlansPublic(locale);
  if (!result.ok) return null;
  return result.plans.find((plan) => plan.id === planId) ?? null;
}
