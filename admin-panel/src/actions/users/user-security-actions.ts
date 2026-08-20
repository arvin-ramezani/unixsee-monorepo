"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  SECURITY_ACTION,
  type CustomerUserType,
  type SecurityActionType,
} from "@/lib/data/users-data";
import {
  mapAdminUserDetail,
  type AdminUserDto,
} from "@/lib/users/map-admin-user";
import type { ApiResponse } from "@/types/auth.types";

export type UserSecurityActionResult =
  | { ok: true; user: CustomerUserType; message: string }
  | { ok: false; message: string };

const SECURITY_ACTION_RESULT_MESSAGES: Record<SecurityActionType, string> = {
  [SECURITY_ACTION.SUSPEND]: "حساب تعلیق شد و دلیل در سابقه ثبت گردید.",
  [SECURITY_ACTION.RESTORE]: "حساب بازگردانی شد و دلیل در سابقه ثبت گردید.",
  [SECURITY_ACTION.REVOKE_SESSIONS]:
    "نشست‌های فعال پایان یافت. هیچ اطلاعات ورود نمایش داده نمی‌شود.",
  [SECURITY_ACTION.START_RECOVERY]:
    "فرایند بازیابی امن آغاز شد. مشتری مراحل را از کانال تأییدشده دنبال می‌کند.",
};

const SECURITY_ACTION_PATH: Record<SecurityActionType, string> = {
  [SECURITY_ACTION.SUSPEND]: "suspend",
  [SECURITY_ACTION.RESTORE]: "restore",
  [SECURITY_ACTION.REVOKE_SESSIONS]: "revoke-sessions",
  [SECURITY_ACTION.START_RECOVERY]: "start-recovery",
};

function staffErrorMessage(response: ApiResponse<unknown>): string {
  return resolveStaffApiErrorMessage(response);
}

function mapUserFromResponse(data: AdminUserDto | { user: AdminUserDto }) {
  const dto = "user" in data ? data.user : data;
  return mapAdminUserDetail(dto).user;
}

export async function applyNestUserSecurityAction(input: {
  userId: string;
  action: SecurityActionType;
  reason: string;
}): Promise<UserSecurityActionResult> {
  const reason = input.reason.trim();
  if (reason.length < 3) {
    return {
      ok: false,
      message: "دلیل اقدام باید حداقل ۳ نویسه باشد.",
    };
  }

  try {
    const path = SECURITY_ACTION_PATH[input.action];
    const response = await serverActionFetch<
      AdminUserDto | { channel: string; delivered: boolean; user: AdminUserDto }
    >(`/admin/users/${input.userId}/${path}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });

    if (!response.success || !response.data) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    revalidatePath("/users");
    revalidatePath(`/users/${input.userId}`);

    return {
      ok: true,
      user: mapUserFromResponse(response.data),
      message: SECURITY_ACTION_RESULT_MESSAGES[input.action],
    };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
