"use server";

import { normalizeNationalPhone } from "@/lib/zod-schemas/auth-schemas";
import { publicFetch } from "@/lib/api/public-fetch";
import { toE164IranPhone } from "@/lib/auth/auth-utils";
import { readRetryAfterSeconds } from "@/lib/auth/otp-retry-after";
import {
  clearPendingLoginPhoneCookie,
  setOtpCooldownEndsAtCookie,
  setPendingLoginPhoneCookie,
} from "@/lib/auth/session-cookies";

// TODO: later opt should be send to users phone/email and remove from here
export type RequestLoginOtpResult =
  | { ok: true; otp?: string; retryAfterSeconds: number }
  | {
      ok: false;
      errorKey: "generic" | "unavailable" | "rateLimited";
      retryAfterSeconds?: number;
    };

type OtpRequestData = {
  delivered: boolean;
  otp?: string;
  retryAfterSeconds?: number;
};

async function persistCooldown(retryAfterSeconds: number | undefined) {
  if (retryAfterSeconds == null) return;
  await setOtpCooldownEndsAtCookie(retryAfterSeconds);
}

export async function requestLoginOtp(input: {
  phone: string;
}): Promise<RequestLoginOtpResult> {
  const national = normalizeNationalPhone(input.phone);
  const phoneNumber = toE164IranPhone(national);

  try {
    const response = await publicFetch<OtpRequestData>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber,
        context: "LOGIN",
      }),
    });

    if (!response.success) {
      if (response.statusCode === 429) {
        const retryAfterSeconds = readRetryAfterSeconds(
          response.error?.details,
        );
        await persistCooldown(retryAfterSeconds);
        return { ok: false, errorKey: "rateLimited", retryAfterSeconds };
      }
      if (response.statusCode === 503) {
        return { ok: false, errorKey: "unavailable" };
      }
      return { ok: false, errorKey: "generic" };
    }

    const retryAfterSeconds =
      readRetryAfterSeconds(response.data?.retryAfterSeconds) ?? 0;
    await setPendingLoginPhoneCookie(phoneNumber);
    await persistCooldown(retryAfterSeconds);
    return {
      ok: true,
      otp: response.data?.otp,
      retryAfterSeconds,
    };
  } catch {
    return { ok: false, errorKey: "unavailable" };
  }
}

export async function resendLoginOtp(): Promise<RequestLoginOtpResult> {
  const { getPendingLoginPhoneFromCookies } =
    await import("@/lib/auth/server-cookie");
  const phoneNumber = await getPendingLoginPhoneFromCookies();

  if (!phoneNumber) {
    return { ok: false, errorKey: "generic" };
  }

  try {
    const response = await publicFetch<OtpRequestData>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber,
        context: "LOGIN",
      }),
    });

    if (!response.success) {
      if (response.statusCode === 429) {
        const retryAfterSeconds = readRetryAfterSeconds(
          response.error?.details,
        );
        await persistCooldown(retryAfterSeconds);
        return { ok: false, errorKey: "rateLimited", retryAfterSeconds };
      }
      if (response.statusCode === 503) {
        return { ok: false, errorKey: "unavailable" };
      }
      return { ok: false, errorKey: "generic" };
    }

    const retryAfterSeconds =
      readRetryAfterSeconds(response.data?.retryAfterSeconds) ?? 0;
    await persistCooldown(retryAfterSeconds);
    return {
      ok: true,
      otp: response.data?.otp,
      retryAfterSeconds,
    };
  } catch {
    return { ok: false, errorKey: "unavailable" };
  }
}

export async function clearPendingLoginPhone() {
  await clearPendingLoginPhoneCookie();
}
