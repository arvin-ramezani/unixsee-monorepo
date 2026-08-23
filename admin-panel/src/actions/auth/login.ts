"use server";

import { publicFetch } from "@/lib/api/public-fetch";
import {
  createServerClockOffsetInSeconds,
  getServerCoreApiBaseUrl,
} from "@/lib/auth/auth-utils";
import {
  clearAuthSessionCookies,
  setAuthSessionCookies,
} from "@/lib/auth/session-cookies";
import {
  isStaffRole,
  type AuthTokens,
  type SafeAuthUser,
} from "@/types/auth.types";

export type StaffLoginResult =
  | {
      ok: true;
      accessToken: string;
      serverClockOffsetInSeconds: number;
      user: SafeAuthUser;
    }
  | {
      ok: false;
      errorKey: "invalidCredentials" | "unavailable";
    };

type MeResponse = SafeAuthUser & {
  sub?: string;
  iat?: number;
  exp?: number;
};

function toSafeUser(user: MeResponse): SafeAuthUser {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber ?? null,
    email: user.email ?? null,
    username: user.username ?? null,
    fullName: user.fullName ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
  };
}

export async function staffLoginAction(input: {
  username: string;
  password: string;
}): Promise<StaffLoginResult> {
  const username = input.username.trim();
  const password = input.password;

  if (!username || !password) {
    return { ok: false, errorKey: "invalidCredentials" };
  }

  try {
    const apiBase = getServerCoreApiBaseUrl();
    console.info("[staff-login] POST", `${apiBase}/auth/login`, {
      username,
    });

    const loginResponse = await publicFetch<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (
      !loginResponse.success ||
      !loginResponse.data?.accessToken ||
      !loginResponse.data.refreshToken
    ) {
      console.warn("[staff-login] Nest login rejected", {
        statusCode: loginResponse.statusCode,
        message: loginResponse.message,
        error: loginResponse.error,
      });
      return { ok: false, errorKey: "invalidCredentials" };
    }

    const meResponse = await fetch(`${apiBase}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${loginResponse.data.accessToken}`,
      },
      cache: "no-store",
    });

    const meJson = (await meResponse.json().catch(() => null)) as {
      success?: boolean;
      data?: MeResponse | null;
    } | null;

    if (
      !meJson?.success ||
      !meJson.data?.id ||
      !isStaffRole(meJson.data.role)
    ) {
      console.warn("[staff-login] /users/me staff gate failed", {
        httpStatus: meResponse.status,
        role: meJson?.data?.role ?? null,
      });
      await clearAuthSessionCookies();
      return { ok: false, errorKey: "invalidCredentials" };
    }

    await setAuthSessionCookies({
      accessToken: loginResponse.data.accessToken,
      refreshToken: loginResponse.data.refreshToken,
      serverTimeInSeconds: loginResponse.data.serverTimeInSeconds,
    });

    return {
      ok: true,
      accessToken: loginResponse.data.accessToken,
      serverClockOffsetInSeconds: createServerClockOffsetInSeconds(
        loginResponse.data.serverTimeInSeconds,
      ),
      user: toSafeUser(meJson.data),
    };
  } catch (error) {
    console.error("[staff-login] failed before/during Nest call", error);
    return { ok: false, errorKey: "unavailable" };
  }
}
