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

export { toE164Phone as toE164IranPhone } from "@/lib/phone/international-phone";

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
