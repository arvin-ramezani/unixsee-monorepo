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
}
