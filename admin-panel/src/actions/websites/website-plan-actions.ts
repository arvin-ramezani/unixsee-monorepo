"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type { WebsiteType } from "@/lib/data/websites-data";
import {
  changeWebsitePlan,
  renewWebsitePlan,
} from "@/lib/data/websites-runtime";

export type WebsitePlanMutationResult =
  { ok: true; website: WebsiteType } | { ok: false; message: string };

export type NestBillingMutationResult =
  { ok: true; data: BillingItemDto } | { ok: false; message: string };

export type BillingItemDto = {
  id: string;
  kind: string;
  status: string;
  amount: string | number;
  currency: string;
  interval: string;
  periodStartsAt: string;
  periodEndsAt: string | null;
  renewsAt: string | null;
  labelSnapshot: string;
  planId: string | null;
  commercialModel: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNestWebsiteId(websiteId: string) {
  return UUID_RE.test(websiteId);
}

function revalidateWebsite(websiteId: string) {
  revalidatePath("/websites");
  revalidatePath(`/websites/${websiteId}`);
}

/**
 * Staff commercial renew. Nest UUID websites use billing API; fixture IDs stay
 * on the in-memory prototype.
 */
export async function renewWebsitePlanAction(
  websiteId: string,
  billingItemId?: string,
): Promise<WebsitePlanMutationResult | NestBillingMutationResult> {
  if (isNestWebsiteId(websiteId)) {
    try {
      let itemId = billingItemId;
      if (!itemId) {
        const list = await serverActionFetch<{ items: BillingItemDto[] }>(
          `/admin/websites/${websiteId}/billing-items`,
          { method: "GET" },
        );
        if (!list.success || !list.data) {
          return { ok: false, message: resolveStaffApiErrorMessage(list) };
        }
        const activePlan = list.data.items.find(
          (item) => item.kind === "MANAGED_PLAN" && item.status === "ACTIVE",
        );
        if (!activePlan) {
          return {
            ok: false,
            message:
              "رکورد تجاری فعالی برای پلن وجود ندارد. ابتدا شرایط تجاری را ثبت کنید.",
          };
        }
        itemId = activePlan.id;
      }

      const response = await serverActionFetch<BillingItemDto>(
        `/admin/billing-items/${itemId}/renew`,
        {
          method: "POST",
          headers: {
            "Idempotency-Key": `billing-renew-${itemId}-${Date.now()}`,
          },
          body: JSON.stringify({}),
        },
      );
      if (!response.success || !response.data) {
        return { ok: false, message: resolveStaffApiErrorMessage(response) };
      }
      revalidateWebsite(websiteId);
      return { ok: true, data: response.data };
    } catch {
      return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
    }
  }

  const website = renewWebsitePlan(websiteId);
  if (!website) {
    return {
      ok: false,
      message: "تمدید پلن ممکن نیست. ابتدا یک پلن فعال تنظیم کنید.",
    };
  }

  revalidateWebsite(websiteId);
  return { ok: true, website };
}

export async function changeWebsitePlanAction(
  websiteId: string,
  planNameOrId: string,
  commercial?: {
    amount: number;
    interval: "MONTHLY" | "QUARTERLY" | "YEARLY" | "NONE";
    currency?: string;
  },
): Promise<WebsitePlanMutationResult | NestBillingMutationResult> {
  const trimmed = planNameOrId.trim();
  if (!trimmed) {
    return { ok: false, message: "یک پلن را انتخاب کنید." };
  }

  if (isNestWebsiteId(websiteId)) {
    if (!commercial || commercial.amount < 0 || !commercial.interval) {
      return {
        ok: false,
        message: "مبلغ و دوره صورتحساب برای جایگزینی پلن الزامی است.",
      };
    }
    try {
      const response = await serverActionFetch<BillingItemDto>(
        `/admin/websites/${websiteId}/billing-items/replace-plan`,
        {
          method: "POST",
          headers: {
            "Idempotency-Key": `billing-replace-${websiteId}-${trimmed}`,
          },
          body: JSON.stringify({
            planId: trimmed,
            amount: commercial.amount,
            interval: commercial.interval,
            currency: commercial.currency ?? "IRR",
          }),
        },
      );
      if (!response.success || !response.data) {
        return { ok: false, message: resolveStaffApiErrorMessage(response) };
      }
      revalidateWebsite(websiteId);
      return { ok: true, data: response.data };
    } catch {
      return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
    }
  }

  const website = changeWebsitePlan(websiteId, trimmed);
  if (!website) {
    return { ok: false, message: "تغییر پلن ناموفق بود." };
  }

  revalidateWebsite(websiteId);
  return { ok: true, website };
}

export async function recordPlanBillingTermsAction(input: {
  websiteId: string;
  amount: number;
  interval: "MONTHLY" | "QUARTERLY" | "YEARLY" | "NONE";
  currency?: string;
  planId?: string;
}): Promise<NestBillingMutationResult> {
  if (!isNestWebsiteId(input.websiteId)) {
    return {
      ok: false,
      message: "ثبت شرایط تجاری فقط برای وب‌سایت‌های Nest پشتیبانی می‌شود.",
    };
  }

  try {
    const response = await serverActionFetch<BillingItemDto>(
      `/admin/websites/${input.websiteId}/billing-items/record-plan-terms`,
      {
        method: "POST",
        body: JSON.stringify({
          amount: input.amount,
          interval: input.interval,
          currency: input.currency ?? "IRR",
          ...(input.planId ? { planId: input.planId } : {}),
        }),
      },
    );
    if (!response.success || !response.data) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }
    revalidateWebsite(input.websiteId);
    return { ok: true, data: response.data };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function listWebsiteBillingItemsAction(
  websiteId: string,
): Promise<
  { ok: true; items: BillingItemDto[] } | { ok: false; message: string }
> {
  if (!isNestWebsiteId(websiteId)) {
    return { ok: true, items: [] };
  }
  try {
    const response = await serverActionFetch<{ items: BillingItemDto[] }>(
      `/admin/websites/${websiteId}/billing-items`,
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }
    return { ok: true, items: response.data.items };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
