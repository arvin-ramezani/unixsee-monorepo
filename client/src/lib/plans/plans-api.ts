import { mapApiError } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import type { DashboardPlan, NestPlan } from "@/lib/plans/types";
import type { Locale } from "@/i18n/routing";

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
