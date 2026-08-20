"use server";

import { revalidatePath } from "next/cache";

import { mapApiError } from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";

export type MarkUnixseeMessageReadResult =
  | { ok: true }
  | { ok: false; messageKey: "generic" | "unavailable" | "unauthorized" };

export async function markUnixseeMessageReadAction(
  messageId: string,
): Promise<MarkUnixseeMessageReadResult> {
  try {
    const response = await serverActionFetch(
      `/unixsee-messages/${messageId}/read`,
      { method: "POST", body: JSON.stringify({}) },
    );
    if (!response.success) {
      const mapped = mapApiError(response);
      return {
        ok: false,
        messageKey:
          mapped?.key === "unauthorized" ? "unauthorized" : "generic",
      };
    }
    revalidatePath("/dashboard/unixsee-messages", "layout");
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch {
    return { ok: false, messageKey: "unavailable" };
  }
}
