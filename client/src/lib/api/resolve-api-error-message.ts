import type { MappedApiError, MappedApiErrorKey } from "@/lib/api/map-api-error";

export function resolveApiErrorMessage(
  error: MappedApiError,
  t: (key: MappedApiErrorKey) => string,
): string {
  return t(error.key);
}
