import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createServerClockOffsetInSeconds,
  getServerCoreApiBaseUrl,
} from "@/lib/auth/auth-utils";
import {
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth/cookie-names";
import type { ApiResponse, AuthTokens } from "@/types/auth.types";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = (await response.json()) as ApiResponse<AuthTokens>;

  if (!data.data?.accessToken || !data.data.refreshToken) {
    cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
    cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
    cookieStore.delete(AUTH_COOKIE_NAMES.serverClockOffset);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const serverClockOffsetInSeconds = createServerClockOffsetInSeconds(
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
    value: serverClockOffsetInSeconds.toString(),
    ...AUTH_COOKIE_OPTIONS,
  });

  return NextResponse.json({
    accessToken: data.data.accessToken,
    serverTimeInSeconds: data.data.serverTimeInSeconds,
  });
}
