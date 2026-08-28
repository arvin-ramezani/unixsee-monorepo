"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import { toE164Phone } from "@/lib/phone/international-phone";
import type { MeProfileResponse } from "@/lib/profile/map-me-to-profile";
import type { ApiResponse } from "@/types/auth.types";

export type ProfileContactActionResult<T = MeProfileResponse> =
  { ok: true; data: T } | { ok: false; error: MappedApiError };

function toResult<T>(response: ApiResponse<T>): ProfileContactActionResult<T> {
  if (!response.success || response.data == null) {
    return {
      ok: false,
      error: mapApiError(response) ?? {
        key: "generic",
        code: null,
        statusCode: response.statusCode,
      },
    };
  }
  return { ok: true, data: response.data };
}

function unavailable(): ProfileContactActionResult {
  return {
    ok: false,
    error: { key: "unavailable", code: null, statusCode: null },
  };
}

function normalizePhone(phone: string): string {
  return toE164Phone(phone) ?? phone;
}

export async function requestPhoneVerifyOtpAction(input: {
  phoneNumber: string;
}): Promise<ProfileContactActionResult<{ delivered: boolean }>> {
  try {
    const phoneNumber = normalizePhone(input.phoneNumber);
    const response = await serverActionFetch<{ delivered: boolean }>(
      "/users/me/contacts/phone/otp/request",
      {
        method: "POST",
        body: JSON.stringify({ phoneNumber }),
      },
    );
    return toResult(response);
  } catch {
    return unavailable() as ProfileContactActionResult<{ delivered: boolean }>;
  }
}

export async function verifyPhoneOtpAction(input: {
  phoneNumber: string;
  otp: string;
}): Promise<ProfileContactActionResult> {
  try {
    const phoneNumber = normalizePhone(input.phoneNumber);
    const response = await serverActionFetch<MeProfileResponse>(
      "/users/me/contacts/phone/otp/verify",
      {
        method: "POST",
        body: JSON.stringify({ phoneNumber, otp: input.otp }),
      },
    );
    const result = toResult(response);
    if (result.ok) {
      revalidatePath("/dashboard/profile");
    }
    return result;
  } catch {
    return unavailable();
  }
}

export async function requestEmailVerifyOtpAction(input: {
  email: string;
}): Promise<ProfileContactActionResult<{ delivered: boolean }>> {
  try {
    const email = input.email.trim().toLowerCase();
    const response = await serverActionFetch<{ delivered: boolean }>(
      "/users/me/contacts/email/otp/request",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
    return toResult(response);
  } catch {
    return unavailable() as ProfileContactActionResult<{ delivered: boolean }>;
  }
}

export async function verifyEmailOtpAction(input: {
  email: string;
  otp: string;
}): Promise<ProfileContactActionResult> {
  try {
    const email = input.email.trim().toLowerCase();
    const response = await serverActionFetch<MeProfileResponse>(
      "/users/me/contacts/email/otp/verify",
      {
        method: "POST",
        body: JSON.stringify({ email, otp: input.otp }),
      },
    );
    const result = toResult(response);
    if (result.ok) {
      revalidatePath("/dashboard/profile");
    }
    return result;
  } catch {
    return unavailable();
  }
}
