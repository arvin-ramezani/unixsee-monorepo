"use server";

import { publicFetch } from "@/lib/api/public-fetch";
import { createServerClockOffsetInSeconds } from "@/lib/auth/auth-utils";
import {
  isCompleteIranNationalMobile,
  toE164IranFromNational,
} from "@/lib/auth/iran-phone";
import { setAuthSessionCookies } from "@/lib/auth/session-cookies";
import type { AuthSessionPayload, SafeAuthUser } from "@/types/auth.types";

// TODO: later opt should be send to users phone/email and remove from here
export type GuestPlanOtpResult =
  | { ok: true; otp?: string }
  | {
      ok: false;
      errorKey: "generic" | "unavailable" | "rateLimited" | "validation";
    };

export type GuestPlanVerifyOtpResult =
  | {
      ok: true;
      accessToken: string;
      serverClockOffsetInSeconds: number;
      user: SafeAuthUser;
      channel: "phone" | "email";
    }
  | {
      ok: false;
      errorKey: "generic" | "unavailable" | "wrongCode" | "validation";
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function requestGuestPlanOtpAction(input: {
  phone?: string;
  email?: string;
}): Promise<GuestPlanOtpResult> {
  const phone = input.phone?.trim() ?? "";
  const email = input.email?.trim() ?? "";

  if (phone && isCompleteIranNationalMobile(phone)) {
    const phoneNumber = toE164IranFromNational(phone);
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

  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    try {
      const response = await publicFetch<{ delivered: boolean; otp?: string }>(
        "/auth/otp/request",
        {
          method: "POST",
          body: JSON.stringify({
            email: normalizeEmail(email),
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

  return { ok: false, errorKey: "validation" };
}

export async function verifyGuestPlanOtpAction(input: {
  code: string;
  phone?: string;
  email?: string;
}): Promise<GuestPlanVerifyOtpResult> {
  const phone = input.phone?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const otp = input.code.trim();

  if (!otp) {
    return { ok: false, errorKey: "validation" };
  }

  const body =
    phone && isCompleteIranNationalMobile(phone)
      ? {
          phoneNumber: toE164IranFromNational(phone),
          otp,
          context: "LOGIN" as const,
        }
      : email
        ? {
            email: normalizeEmail(email),
            otp,
            context: "LOGIN" as const,
          }
        : null;

  if (!body) {
    return { ok: false, errorKey: "validation" };
  }

  try {
    const response = await publicFetch<AuthSessionPayload>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (
      !response.success ||
      !response.data?.accessToken ||
      !response.data.refreshToken
    ) {
      return { ok: false, errorKey: "wrongCode" };
    }

    await setAuthSessionCookies({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      serverTimeInSeconds: response.data.serverTimeInSeconds,
    });

    return {
      ok: true,
      accessToken: response.data.accessToken,
      serverClockOffsetInSeconds: createServerClockOffsetInSeconds(
        response.data.serverTimeInSeconds,
      ),
      user: toSafeUser(response.data),
      channel: "phoneNumber" in body ? "phone" : "email",
    };
  } catch {
    return { ok: false, errorKey: "unavailable" };
  }
}
