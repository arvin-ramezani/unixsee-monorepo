"use server";

import { revalidatePath } from "next/cache";

import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type {
  CreatedComplementaryRequest,
  CreateComplementaryRequestInput,
} from "@/lib/complementary-services/types";

export type CreateComplementaryRequestResult =
  | { ok: true; data: CreatedComplementaryRequest }
  | { ok: false; error: MappedApiError };

const ENGAGEMENT_TO_API = {
  "one-time": "ONE_TIME",
  recurring: "RECURRING",
  "not-sure": "NOT_SURE",
} as const;

export async function createComplementaryRequestAction(
  input: CreateComplementaryRequestInput,
): Promise<CreateComplementaryRequestResult> {
  try {
    const response = await serverActionFetch<CreatedComplementaryRequest>(
      "/complementary-service-requests",
      {
        method: "POST",
        headers: { "Idempotency-Key": input.idempotencyKey },
        body: JSON.stringify({
          catalogItemId: input.catalogItemId,
          ...(input.websiteId
            ? { websiteId: input.websiteId }
            : { websiteDomain: input.websiteDomain }),
          engagementPreference: ENGAGEMENT_TO_API[input.engagementPreference],
          title: input.title.trim(),
          description: input.description.trim(),
          ...(input.scope ? { scope: input.scope } : {}),
        }),
      },
    );

    if (!response.success || !response.data) {
      return {
        ok: false,
        error: mapApiError(response) ?? {
          key: "generic",
          code: null,
          statusCode: response.statusCode,
        },
      };
    }

    revalidatePath("/dashboard/complementary-services", "layout");
    return { ok: true, data: response.data };
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
export type WithdrawComplementaryRequestResult =
  { ok: true } | { ok: false; error: MappedApiError };

export async function withdrawComplementaryRequestAction(
  requestId: string,
): Promise<WithdrawComplementaryRequestResult> {
  try {
    const response = await serverActionFetch(
      `/complementary-service-requests/${requestId}/withdraw`,
      { method: "POST" },
    );
    if (!response.success) {
      return {
        ok: false,
        error: mapApiError(response) ?? {
          key: "generic",
          code: null,
          statusCode: response.statusCode,
        },
      };
    }

    revalidatePath("/dashboard/complementary-services", "layout");
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
