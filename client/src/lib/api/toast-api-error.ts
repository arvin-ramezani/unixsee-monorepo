"use client";

import { toast } from "sonner";

import type { MappedApiError, MappedApiErrorKey } from "@/lib/api/map-api-error";
import { resolveApiErrorMessage } from "@/lib/api/resolve-api-error-message";

export function toastApiErrorMessage(message: string) {
  toast.error(message);
}

export function toastMappedApiError(
  error: MappedApiError,
  t: (key: MappedApiErrorKey) => string,
) {
  toast.error(resolveApiErrorMessage(error, t));
}
