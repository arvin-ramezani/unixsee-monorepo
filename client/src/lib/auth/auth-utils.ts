export function getServerCoreApiBaseUrl(): string {
  const value = process.env.UNIXSEE_CORE_API_BASE_URL?.trim();
  if (!value) {
    throw new Error(
      "UNIXSEE_CORE_API_BASE_URL is not defined. Check your .env.local",
    );
  }
  return value.replace(/\/$/, "");
}

export function getPublicCoreApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_UNIXSEE_CORE_API_BASE_URL?.trim();
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_UNIXSEE_CORE_API_BASE_URL is not defined. Check your .env.local",
    );
  }
  return value.replace(/\/$/, "");
}

export function createServerClockOffsetInSeconds(
  serverTimeInSeconds: number | null | undefined,
): number {
  if (
    typeof serverTimeInSeconds !== "number" ||
    !Number.isFinite(serverTimeInSeconds)
  ) {
    return 0;
  }
  const localNowInSeconds = Math.floor(Date.now() / 1000);
  return serverTimeInSeconds - localNowInSeconds;
}

export function toE164IranPhone(nationalPhone: string): string {
  const digits = nationalPhone.replace(/[\s()-]/g, "").replace(/^0/, "");
  if (digits.startsWith("+")) {
    return digits;
  }
  if (digits.startsWith("98")) {
    return `+${digits}`;
  }
  return `+98${digits}`;
}

export function isSafeReturnToPath(value: string | null | undefined): boolean {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.includes("://")) return false;

  const withoutLocale = value.replace(/^\/(en|fa)(?=\/|$)/, "") || "/";
  return (
    withoutLocale === "/dashboard" || withoutLocale.startsWith("/dashboard/")
  );
}
