"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import type { AuthorizationPackage } from "@/lib/data/authorization/authorization-data";
import type { ApiResponse } from "@/types/auth.types";

export type NestAuthorizationCaseDto = {
  id: string;
  status: string;
  package: {
    nationalId: string;
    birthDate: string;
    mobile: string;
    mobileChallenge: string;
    mobileBelongsToNationalId: boolean;
    email: string;
    emailChallenge: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
    nationalIdCardFileName: string | null;
    attestedTruthful: boolean;
  };
  staffReason: string | null;
  staffFieldsToFix: string[];
  submittedAt: string | null;
  decidedAt: string | null;
  tenantId: string | null;
  updatedAt: string;
};

export type AuthorizationCaseActionResult =
  | { ok: true; data: NestAuthorizationCaseDto }
  | { ok: false; error: MappedApiError };

function toResult(
  response: ApiResponse<NestAuthorizationCaseDto>,
): AuthorizationCaseActionResult {
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

function packageBody(pkg: AuthorizationPackage) {
  return {
    nationalId: pkg.nationalId,
    birthDate: pkg.birthDate,
    mobile: pkg.mobile,
    mobileChallenge: pkg.mobileChallenge,
    mobileBelongsToNationalId: pkg.mobileBelongsToNationalId,
    email: pkg.email,
    emailChallenge: pkg.emailChallenge,
    province: pkg.province,
    city: pkg.city,
    address: pkg.address,
    postalCode: pkg.postalCode,
    nationalIdCardFileName: pkg.nationalIdCardFileName,
    attestedTruthful: pkg.attestedTruthful,
  };
}

export async function getMyAuthorizationCaseAction(): Promise<
  | { ok: true; data: NestAuthorizationCaseDto | null }
  | { ok: false; error: MappedApiError }
> {
  try {
    const response = await serverActionFetch<NestAuthorizationCaseDto | null>(
      "/authorization-cases/me",
      { method: "GET" },
    );
    if (!response.success) {
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
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}

export async function saveAuthorizationDraftAction(
  pkg: AuthorizationPackage,
): Promise<AuthorizationCaseActionResult> {
  try {
    const response = await serverActionFetch<NestAuthorizationCaseDto>(
      "/authorization-cases/me/draft",
      {
        method: "PUT",
        body: JSON.stringify(packageBody(pkg)),
      },
    );
    const result = toResult(response);
    if (result.ok) {
      revalidatePath("/dashboard/authorization");
      revalidatePath("/dashboard");
    }
    return result;
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}

export async function submitAuthorizationAction(
  pkg: AuthorizationPackage,
): Promise<AuthorizationCaseActionResult> {
  try {
    const response = await serverActionFetch<NestAuthorizationCaseDto>(
      "/authorization-cases/me/submit",
      {
        method: "POST",
        body: JSON.stringify(packageBody(pkg)),
      },
    );
    const result = toResult(response);
    if (result.ok) {
      revalidatePath("/dashboard/authorization");
      revalidatePath("/dashboard");
    }
    return result;
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
