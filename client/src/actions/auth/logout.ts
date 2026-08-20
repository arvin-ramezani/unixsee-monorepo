"use server";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import { clearAuthSessionCookies } from "@/lib/auth/session-cookies";

export async function logoutAction() {
  try {
    await serverActionFetch("/auth/logout", {
      method: "POST",
    });
  } catch {
    // Always clear local session cookies even if Nest logout fails.
  }

  await clearAuthSessionCookies();
  return { ok: true as const };
}
