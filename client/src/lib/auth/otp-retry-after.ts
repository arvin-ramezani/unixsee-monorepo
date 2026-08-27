/** Reads Nest `retryAfterSeconds` from OTP success or 429 error details. */
export function readRetryAfterSeconds(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.ceil(value);
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  const nested = (value as { retryAfterSeconds?: unknown }).retryAfterSeconds;
  if (typeof nested === "number" && Number.isFinite(nested) && nested > 0) {
    return Math.ceil(nested);
  }

  return undefined;
}

export function remainingCooldownSeconds(endsAtUnixSeconds: number): number {
  return Math.max(0, endsAtUnixSeconds - Math.floor(Date.now() / 1000));
}
