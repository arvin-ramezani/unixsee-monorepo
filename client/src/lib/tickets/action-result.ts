import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import type { ApiResponse } from "@/types/auth.types";

export type TicketActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MappedApiError };

export function toTicketActionResult<T>(
  response: ApiResponse<T>,
): TicketActionResult<T> {
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

export function unavailableTicketActionResult<T>(): TicketActionResult<T> {
  return {
    ok: false,
    error: { key: "unavailable", code: null, statusCode: null },
  };
}
