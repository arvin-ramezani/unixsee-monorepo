import createMiddleware from "next-intl/middleware";
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
import { routing } from "./i18n/routing";
import type { ApiResponse, AuthTokens } from "@/types/auth.types";

const handleI18nRouting = createMiddleware(routing);

const protectedRoutePrefixes = ["/dashboard"];

function extractLocaleFromPathname(pathname: string) {
  const locale = pathname.split("/")[1];
  if (!locale) return null;
  if (routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return locale;
  }
  return null;
}

function removeLocaleFromPathname(pathname: string) {
  const locale = extractLocaleFromPathname(pathname);
  if (!locale) return pathname;
  return pathname.replace(`/${locale}`, "") || "/";
}

function isProtectedRoute(pathnameWithoutLocale: string) {
  return protectedRoutePrefixes.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(`${route}/`),
  );
}

function redirectToSignIn(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = extractLocaleFromPathname(pathname) ?? routing.defaultLocale;
  const signInUrl = new URL(`/${locale}/sign-in`, request.url);
  signInUrl.searchParams.set("returnTo", request.nextUrl.pathname);

  const response = NextResponse.redirect(signInUrl);
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
  if (request.headers.has("x-next-intl-locale")) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = removeLocaleFromPathname(pathname);

  if (!isProtectedRoute(pathnameWithoutLocale)) {
    return handleI18nRouting(request);
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = request.cookies.get(
    AUTH_COOKIE_NAMES.refreshToken,
  )?.value;

  if (!refreshToken) {
    return redirectToSignIn(request);
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
    return handleI18nRouting(request);
  }

  const refreshedTokens = await refreshTokens(refreshToken);

  if (!refreshedTokens?.accessToken || !refreshedTokens.refreshToken) {
    return redirectToSignIn(request);
  }

  const response = handleI18nRouting(request);
  setAuthTokenCookies(response, refreshedTokens);
  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
