"use server";

import { publicFetch } from "@/lib/api/public-fetch";
import { createServerClockOffsetInSeconds } from "@/lib/auth/auth-utils";
import { getPendingLoginPhoneFromCookies } from "@/lib/auth/server-cookie";
import {
  clearPendingLoginPhoneCookie,
  setAuthSessionCookies,
} from "@/lib/auth/session-cookies";
import type { AuthSessionPayload, SafeAuthUser } from "@/types/auth.types";

export type VerifyLoginOtpResult =
  | {
      ok: true;
      accessToken: string;
      serverClockOffsetInSeconds: number;
      user: SafeAuthUser;
    }
  | {
      ok: false;
      errorKey: "generic" | "unavailable" | "wrongCode" | "expiredSession";
    };

function toSafeUser(payload: AuthSessionPayload): SafeAuthUser {
  return {
    id: payload.id,
    phoneNumber: payload.phoneNumber ?? null,
    email: payload.email ?? null,
    username: payload.username ?? null,
    fullName: payload.fullName ?? null,
    role: payload.role,
  };
}

export async function verifyLoginOtp(input: {
  code: string;
}): Promise<VerifyLoginOtpResult> {
  const phoneNumber = await getPendingLoginPhoneFromCookies();

  if (!phoneNumber) {
    return { ok: false, errorKey: "expiredSession" };
  }

  try {
    const response = await publicFetch<AuthSessionPayload>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber,
        otp: input.code,
        context: "LOGIN",
      }),
    });

    if (!response.success || !response.data?.accessToken || !response.data.refreshToken) {
      return { ok: false, errorKey: "wrongCode" };
    }

    await setAuthSessionCookies({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      serverTimeInSeconds: response.data.serverTimeInSeconds,
    });
    await clearPendingLoginPhoneCookie();

    return {
      ok: true,
      accessToken: response.data.accessToken,
      serverClockOffsetInSeconds: createServerClockOffsetInSeconds(
        response.data.serverTimeInSeconds,
      ),
      user: toSafeUser(response.data),
    };
  } catch {
    return { ok: false, errorKey: "unavailable" };
  }
}
