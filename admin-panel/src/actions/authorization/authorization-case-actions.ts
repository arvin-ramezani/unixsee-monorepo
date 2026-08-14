"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type { AuthorizationCaseType } from "@/lib/data/authorization-data";
import {
  mapAdminAuthorizationCaseToUi,
  type AdminAuthorizationCaseDto,
} from "@/lib/authorization/map-admin-authorization-case";
import type { ApiResponse } from "@/types/auth.types";

export type AuthorizationMutationResult =
  | { ok: true; case: AuthorizationCaseType }
  | { ok: false; message: string };

function staffErrorMessage(response: ApiResponse<unknown>): string {
  return resolveStaffApiErrorMessage(response);
}

async function mutateAuthorizationCase(
  caseId: string,
  endpoint: string,
  init?: RequestInit,
): Promise<AuthorizationMutationResult> {
  try {
    const response = await serverActionFetch<AdminAuthorizationCaseDto>(
      endpoint,
      init,
    );

    if (!response.success || !response.data) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    revalidatePath("/users");
    revalidatePath("/users/authorization");
    revalidatePath(`/users/authorization/${caseId}`);
    revalidatePath(`/users/${response.data.userId}`);
    return { ok: true, case: mapAdminAuthorizationCaseToUi(response.data) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function approveAuthorizationCaseAction(
  caseId: string,
): Promise<AuthorizationMutationResult> {
  return mutateAuthorizationCase(
    caseId,
    `/admin/authorization-cases/${caseId}/approve`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function needsInfoAuthorizationCaseAction(input: {
  caseId: string;
  reason: string;
  fieldsToFix: string[];
}): Promise<AuthorizationMutationResult> {
  return mutateAuthorizationCase(
    input.caseId,
    `/admin/authorization-cases/${input.caseId}/needs-info`,
    {
      method: "POST",
      body: JSON.stringify({
        reason: input.reason,
        fieldsToFix: input.fieldsToFix,
      }),
    },
  );
}

export async function rejectAuthorizationCaseAction(input: {
  caseId: string;
  reason: string;
}): Promise<AuthorizationMutationResult> {
  return mutateAuthorizationCase(
    input.caseId,
    `/admin/authorization-cases/${input.caseId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason: input.reason }),
    },
  );
}
