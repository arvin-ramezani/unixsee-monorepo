import { NextResponse, type NextRequest } from "next/server";

import {
  createServerClockOffsetInSeconds,
  getServerCoreApiBaseUrl,
} from "@/lib/auth/auth-utils";
import {
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth/cookie-names";
import { shouldRefreshToken } from "@/lib/auth/jwt";
import type { ApiResponse, AuthTokens } from "@/types/auth.types";

const publicExactPaths = new Set(["/login"]);
const publicPrefixes = ["/api/auth/"];

function isPublicPath(pathname: string) {
  if (publicExactPaths.has(pathname)) {
    return true;
  }
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const returnTo = request.nextUrl.pathname + request.nextUrl.search;
  if (returnTo && returnTo !== "/login") {
    loginUrl.searchParams.set("returnTo", returnTo);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIE_NAMES.accessToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.refreshToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.serverClockOffset);
  return response;
}

function setAuthTokenCookies(response: NextResponse, tokens: AuthTokens) {
  const offset = createServerClockOffsetInSeconds(tokens.serverTimeInSeconds);
  response.cookies.set({
    name: AUTH_COOKIE_NAMES.accessToken,
    value: tokens.accessToken,
    ...AUTH_COOKIE_OPTIONS,
  });
  response.cookies.set({
    name: AUTH_COOKIE_NAMES.refreshToken,
    value: tokens.refreshToken,
    ...AUTH_COOKIE_OPTIONS,
  });
  response.cookies.set({
    name: AUTH_COOKIE_NAMES.serverClockOffset,
    value: offset.toString(),
    ...AUTH_COOKIE_OPTIONS,
  });
}

async function refreshTokens(refreshToken: string) {
  try {
    const response = await fetch(`${getServerCoreApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ApiResponse<AuthTokens>;
    return data.data;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = request.cookies.get(
    AUTH_COOKIE_NAMES.refreshToken,
  )?.value;

  if (!refreshToken) {
    return redirectToLogin(request);
  }

  const clockOffsetRaw = request.cookies.get(
    AUTH_COOKIE_NAMES.serverClockOffset,
  )?.value;
  const serverClockOffsetInSeconds = Number.isFinite(Number(clockOffsetRaw))
    ? Number(clockOffsetRaw)
    : 0;

  if (
    accessToken &&
    !shouldRefreshToken(accessToken, serverClockOffsetInSeconds)
  ) {
    return NextResponse.next();
  }

  const refreshedTokens = await refreshTokens(refreshToken);

  if (!refreshedTokens?.accessToken || !refreshedTokens.refreshToken) {
    return redirectToLogin(request);
  }

  const response = NextResponse.next();
  setAuthTokenCookies(response, refreshedTokens);
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
};
