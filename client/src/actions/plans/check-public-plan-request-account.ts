"use server";

import { publicFetch } from "@/lib/api/public-fetch";

export type PublicAccountMatchBy = "phone" | "email" | "website";

export type CheckPublicAccountResult =
  | {
      ok: true;
      exists: boolean;
      matchedBy: PublicAccountMatchBy | null;
    }
  | { ok: false; error: "unavailable" | "generic" };

export async function checkPublicPlanRequestAccountAction(input: {
  contactPhone?: string;
  contactEmail?: string;
  websiteDomain?: string;
}): Promise<CheckPublicAccountResult> {
  const body: Record<string, string> = {};
  if (input.contactPhone?.trim()) {
    body.contactPhone = input.contactPhone.trim();
  }
  if (input.contactEmail?.trim()) {
    body.contactEmail = input.contactEmail.trim();
  }
  if (input.websiteDomain?.trim()) {
    body.websiteDomain = input.websiteDomain.trim();
  }

  if (Object.keys(body).length === 0) {
    return { ok: true, exists: false, matchedBy: null };
  }

  try {
    const response = await publicFetch<{
      exists: boolean;
      matchedBy: PublicAccountMatchBy | null;
    }>("/public/plan-requests/account-check", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.success || response.data == null) {
      return { ok: false, error: "generic" };
    }

    return {
      ok: true,
      exists: Boolean(response.data.exists),
      matchedBy: response.data.matchedBy ?? null,
    };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
