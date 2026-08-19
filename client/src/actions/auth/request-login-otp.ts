"use server";

import { normalizeNationalPhone } from "@/lib/zod-schemas/auth-schemas";
import { publicFetch } from "@/lib/api/public-fetch";
import { toE164IranPhone } from "@/lib/auth/auth-utils";
import {
  clearPendingLoginPhoneCookie,
  setPendingLoginPhoneCookie,
} from "@/lib/auth/session-cookies";

// TODO: later opt should be send to users phone/email and remove from here
export type RequestLoginOtpResult =
  | { ok: true; otp?: string }
  | { ok: false; errorKey: "generic" | "unavailable" | "rateLimited" };

export async function requestLoginOtp(input: {
  phone: string;
}): Promise<RequestLoginOtpResult> {
  const national = normalizeNationalPhone(input.phone);
  const phoneNumber = toE164IranPhone(national);

  try {
    const response = await publicFetch<{
      delivered: boolean;
      otp?: string;
    }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber,
        context: "LOGIN",
      }),
    });

    if (!response.success) {
      if (response.statusCode === 429) {
        return { ok: false, errorKey: "rateLimited" };
      }
      if (response.statusCode === 503) {
        return { ok: false, errorKey: "unavailable" };
      }
      return { ok: false, errorKey: "generic" };
    }

    await setPendingLoginPhoneCookie(phoneNumber);
    return { ok: true, otp: response.data?.otp };
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
    const response = await publicFetch<{ delivered: boolean; otp?: string }>(
      "/auth/otp/request",
      {
        method: "POST",
        body: JSON.stringify({
          phoneNumber,
          context: "LOGIN",
        }),
      },
    );

    if (!response.success) {
      if (response.statusCode === 429) {
        return { ok: false, errorKey: "rateLimited" };
      }
      if (response.statusCode === 503) {
        return { ok: false, errorKey: "unavailable" };
      }
      return { ok: false, errorKey: "generic" };
    }

    return { ok: true, otp: response.data?.otp };
  } catch {
    return { ok: false, errorKey: "unavailable" };
  }
}

export async function clearPendingLoginPhone() {
  await clearPendingLoginPhoneCookie();
}
