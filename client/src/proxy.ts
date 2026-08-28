import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import {
  createServerClockOffsetInSeconds,
  getServerCoreApiBaseUrl,
  isSafeReturnToPath,
} from "@/lib/auth/auth-utils";
import {
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth/cookie-names";
import { shouldRefreshToken } from "@/lib/auth/jwt";
import { routing } from "./i18n/routing";
import { isAccessSessionAlive } from "@/lib/auth/session-alive";
import type { ApiResponse, AuthTokens } from "@/types/auth.types";

const handleI18nRouting = createMiddleware(routing);

const protectedRoutePrefixes = ["/dashboard"];

const guestOnlyAuthRoutes = [
  "/auth",
  "/sign-in",
  "/sign-up",
  "/otp",
  "/register",
];

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

function isGuestOnlyAuthRoute(pathnameWithoutLocale: string) {
  return guestOnlyAuthRoutes.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(`${route}/`),
  );
}

function stripLocalePrefix(path: string) {
  return path.replace(/^\/(en|fa)(?=\/|$)/, "") || "/";
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(AUTH_COOKIE_NAMES.accessToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.refreshToken);
  response.cookies.delete(AUTH_COOKIE_NAMES.serverClockOffset);
}

function redirectToSignIn(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = extractLocaleFromPathname(pathname) ?? routing.defaultLocale;
  const signInUrl = new URL(`/${locale}/auth`, request.url);
  signInUrl.searchParams.set("returnTo", request.nextUrl.pathname);

  const response = NextResponse.redirect(signInUrl);
  clearAuthCookies(response);
  return response;
}

function redirectAuthenticatedAwayFromAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = extractLocaleFromPathname(pathname) ?? routing.defaultLocale;
  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const destination = isSafeReturnToPath(returnTo)
    ? stripLocalePrefix(returnTo!)
    : "/dashboard";

  return NextResponse.redirect(
    new URL(`/${locale}${destination}`, request.url),
  );
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
  const refreshToken = request.cookies.get(
    AUTH_COOKIE_NAMES.refreshToken,
  )?.value;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const clockOffsetRaw = request.cookies.get(
    AUTH_COOKIE_NAMES.serverClockOffset,
  )?.value;
  const serverClockOffsetInSeconds = Number.isFinite(Number(clockOffsetRaw))
    ? Number(clockOffsetRaw)
    : 0;

  if (isGuestOnlyAuthRoute(pathnameWithoutLocale)) {
    if (!refreshToken) {
      return handleI18nRouting(request);
    }

    if (
      accessToken &&
      !shouldRefreshToken(accessToken, serverClockOffsetInSeconds) &&
      (await isAccessSessionAlive(accessToken))
    ) {
      return redirectAuthenticatedAwayFromAuth(request);
    }

    const refreshedTokens = await refreshTokens(refreshToken);
    if (refreshedTokens?.accessToken && refreshedTokens.refreshToken) {
      const response = redirectAuthenticatedAwayFromAuth(request);
      setAuthTokenCookies(response, refreshedTokens);
      return response;
    }

    const response = handleI18nRouting(request);
    clearAuthCookies(response);
    return response;
  }

  if (!isProtectedRoute(pathnameWithoutLocale)) {
    return handleI18nRouting(request);
  }

  if (!refreshToken) {
    return redirectToSignIn(request);
  }

  if (
    accessToken &&
    !shouldRefreshToken(accessToken, serverClockOffsetInSeconds) &&
    (await isAccessSessionAlive(accessToken))
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
