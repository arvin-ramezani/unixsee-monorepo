"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import type { MeProfileResponse } from "@/lib/profile/map-me-to-profile";
import type { ApiResponse } from "@/types/auth.types";

export type UpdateProfileActionResult =
  | { ok: true; data: MeProfileResponse }
  | { ok: false; error: MappedApiError };

function toResult<T>(
  response: ApiResponse<T>,
): { ok: true; data: T } | { ok: false; error: MappedApiError } {
  if (!response.success || response.data == null) {
    return {
      ok: false,
      error: mapApiError(response) ?? {
        key: "generic",
        code: null,
        statusCode: response.statusCode,
      },
    };
  }
  return { ok: true, data: response.data };
}

/**
 * Persist editable profile fields (not contacts — those use OTP verify;
 * not avatar — S3 deferred).
 */
export async function updateProfileAction(input: {
  fullName: string;
  locale: "fa" | "en";
}): Promise<UpdateProfileActionResult> {
  const fullName = input.fullName.trim();
  if (!fullName) {
    return {
      ok: false,
      error: { key: "validation", code: "VALIDATION_ERROR", statusCode: 400 },
    };
  }

  try {
    const response = await serverActionFetch<MeProfileResponse>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        fullName,
        locale: input.locale,
      }),
    });

    const result = toResult(response);
    if (result.ok) {
      revalidatePath("/dashboard/profile");
      revalidatePath("/dashboard", "layout");
    }
    return result;
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
