import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import type { ApiResponse } from "@/types/auth.types";

export type PlanRequestActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MappedApiError };

export function toPlanRequestActionResult<T>(
  response: ApiResponse<T>,
): PlanRequestActionResult<T> {
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

export function unavailablePlanRequestActionResult<T>(): PlanRequestActionResult<T> {
  return {
    ok: false,
    error: { key: "unavailable", code: null, statusCode: null },
  };
}
