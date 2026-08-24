"use server";

import { serverActionFetch } from "@/lib/api/server-action-fetch";

export async function updateProfileAction(data: {
  fullName?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await serverActionFetch<{ id: string; fullName: string | null }>(
      "/users/me",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    if (response.success) {
      return { ok: true };
    }
    return { ok: false, error: response.message ?? "Failed to update profile" };
  } catch {
    return { ok: false, error: "Failed to update profile" };
  }
}
