"use server";

import { cookies } from "next/headers";

import {
  createServerClockOffsetInSeconds,
  getServerCoreApiBaseUrl,
} from "@/lib/auth/auth-utils";
import {
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth/cookie-names";
import { shouldRefreshToken } from "@/lib/auth/jwt";
import { getServerClockOffsetInSeconds } from "@/lib/auth/server-cookie";
import type { ApiResponse, AuthTokens } from "@/types/auth.types";

export async function getServerActionAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const serverClockOffsetInSeconds = await getServerClockOffsetInSeconds();

  if (
    accessToken &&
    !shouldRefreshToken(accessToken, serverClockOffsetInSeconds)
  ) {
    return accessToken;
  }

  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${getServerCoreApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
    cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
    cookieStore.delete(AUTH_COOKIE_NAMES.serverClockOffset);
    return null;
  }

  const data = (await response.json()) as ApiResponse<AuthTokens>;

  if (!data.success || !data.data?.accessToken || !data.data.refreshToken) {
    cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
    cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
    cookieStore.delete(AUTH_COOKIE_NAMES.serverClockOffset);
    return null;
  }

  const offset = createServerClockOffsetInSeconds(
    data.data.serverTimeInSeconds,
  );

  cookieStore.set({
    name: AUTH_COOKIE_NAMES.accessToken,
    value: data.data.accessToken,
    ...AUTH_COOKIE_OPTIONS,
  });
  cookieStore.set({
    name: AUTH_COOKIE_NAMES.refreshToken,
    value: data.data.refreshToken,
    ...AUTH_COOKIE_OPTIONS,
  });
  cookieStore.set({
    name: AUTH_COOKIE_NAMES.serverClockOffset,
    value: offset.toString(),
    ...AUTH_COOKIE_OPTIONS,
  });

  return data.data.accessToken;
}
