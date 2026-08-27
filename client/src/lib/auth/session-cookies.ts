import { cookies } from "next/headers";

import { createServerClockOffsetInSeconds } from "@/lib/auth/auth-utils";
import {
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth/cookie-names";
import type { AuthTokens } from "@/types/auth.types";

export async function setAuthSessionCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();
  const offset = createServerClockOffsetInSeconds(tokens.serverTimeInSeconds);

  cookieStore.set({
    name: AUTH_COOKIE_NAMES.accessToken,
    value: tokens.accessToken,
    ...AUTH_COOKIE_OPTIONS,
  });
  cookieStore.set({
    name: AUTH_COOKIE_NAMES.refreshToken,
    value: tokens.refreshToken,
    ...AUTH_COOKIE_OPTIONS,
  });
  cookieStore.set({
    name: AUTH_COOKIE_NAMES.serverClockOffset,
    value: offset.toString(),
    ...AUTH_COOKIE_OPTIONS,
  });
}

export async function clearAuthSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.serverClockOffset);
  cookieStore.delete(AUTH_COOKIE_NAMES.pendingLoginPhone);
  cookieStore.delete(AUTH_COOKIE_NAMES.otpCooldownEndsAt);
}

export async function setPendingLoginPhoneCookie(phoneNumber: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAMES.pendingLoginPhone,
    value: phoneNumber,
    ...AUTH_COOKIE_OPTIONS,
  });
}

export async function clearPendingLoginPhoneCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAMES.pendingLoginPhone);
  cookieStore.delete(AUTH_COOKIE_NAMES.otpCooldownEndsAt);
}

/** Persists Nest OTP cooldown as an absolute end time so refresh keeps remaining wait. */
export async function setOtpCooldownEndsAtCookie(retryAfterSeconds: number) {
  if (!Number.isFinite(retryAfterSeconds) || retryAfterSeconds <= 0) {
    return;
  }

  const seconds = Math.ceil(retryAfterSeconds);
  const endsAt = Math.floor(Date.now() / 1000) + seconds;
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAMES.otpCooldownEndsAt,
    value: String(endsAt),
    ...AUTH_COOKIE_OPTIONS,
    maxAge: seconds,
  });
}

export async function clearOtpCooldownEndsAtCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAMES.otpCooldownEndsAt);
}
