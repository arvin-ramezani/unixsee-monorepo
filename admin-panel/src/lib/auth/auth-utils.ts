const DEV_CORE_API_FALLBACK = "http://localhost:4000/api/v1";

export function getServerCoreApiBaseUrl(): string {
  const value = process.env.UNIXSEE_CORE_API_BASE_URL?.trim();
  if (value) {
    return value.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[auth] UNIXSEE_CORE_API_BASE_URL missing; using",
      DEV_CORE_API_FALLBACK,
    );
    return DEV_CORE_API_FALLBACK;
  }

  throw new Error(
    "UNIXSEE_CORE_API_BASE_URL is not defined. Check your .env.local",
  );
}

export function getPublicCoreApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_UNIXSEE_CORE_API_BASE_URL?.trim();
  if (value) {
    return value.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[auth] NEXT_PUBLIC_UNIXSEE_CORE_API_BASE_URL missing; using",
      DEV_CORE_API_FALLBACK,
    );
    return DEV_CORE_API_FALLBACK;
  }

  throw new Error(
    "NEXT_PUBLIC_UNIXSEE_CORE_API_BASE_URL is not defined. Check your .env.local",
  );
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

export function isSafeReturnToPath(value: string | null | undefined): boolean {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.includes("://")) return false;
  if (value === "/login" || value.startsWith("/login/")) return false;
  if (value.startsWith("/api/")) return false;
  return true;
}
