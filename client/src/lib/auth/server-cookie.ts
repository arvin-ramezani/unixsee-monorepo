import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookie-names";

export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value ?? null;
}

export async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null;
}

export async function getPendingLoginPhoneFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.pendingLoginPhone)?.value ?? null;
}

export async function getOtpCooldownRemainingSeconds(): Promise<number> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAMES.otpCooldownEndsAt)?.value;
  const endsAt = Number(raw);

  if (!Number.isFinite(endsAt) || endsAt <= 0) {
    return 0;
  }

  return Math.max(0, endsAt - Math.floor(Date.now() / 1000));
}

export async function getServerClockOffsetInSeconds(): Promise<number> {
  const cookieStore = await cookies();
  const value = cookieStore.get(AUTH_COOKIE_NAMES.serverClockOffset)?.value;
  const offset = Number(value);

  if (!Number.isFinite(offset)) {
    return 0;
  }

  return offset;
}
