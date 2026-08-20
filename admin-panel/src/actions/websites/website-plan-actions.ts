"use server";

import { revalidatePath } from "next/cache";

import type { WebsiteType } from "@/lib/data/websites-data";
import {
  changeWebsitePlan,
  renewWebsitePlan,
} from "@/lib/data/websites-runtime";

export type WebsitePlanMutationResult =
  | { ok: true; website: WebsiteType }
  | { ok: false; message: string };

/**
 * Fixture prototype — commercial renew (advance renewalAt by billing period).
 * Persistence belongs to NestJS later.
 */
export async function renewWebsitePlanAction(
  websiteId: string,
): Promise<WebsitePlanMutationResult> {
  const website = renewWebsitePlan(websiteId);
  if (!website) {
    return {
      ok: false,
      message: "تمدید پلن ممکن نیست. ابتدا یک پلن فعال تنظیم کنید.",
    };
  }

  revalidatePath("/websites");
  revalidatePath(`/websites/${websiteId}`);
  return { ok: true, website };
}

/**
 * Fixture prototype — explicit replace of the website’s active plan.
 * Persistence belongs to NestJS later.
 */
export async function changeWebsitePlanAction(
  websiteId: string,
  planName: string,
): Promise<WebsitePlanMutationResult> {
  const trimmed = planName.trim();
  if (!trimmed) {
    return { ok: false, message: "یک پلن را انتخاب کنید." };
  }

  const website = changeWebsitePlan(websiteId, trimmed);
  if (!website) {
    return { ok: false, message: "تغییر پلن ناموفق بود." };
  }

  revalidatePath("/websites");
  revalidatePath(`/websites/${websiteId}`);
  return { ok: true, website };
}
