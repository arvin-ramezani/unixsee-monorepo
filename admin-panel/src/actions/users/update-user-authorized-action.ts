"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type { AdminUserDto } from "@/lib/users/map-admin-user";
import type { ApiResponse } from "@/types/auth.types";

export type UpdateUserAuthorizedResult =
  | { ok: true; authorized: boolean; message: string }
  | { ok: false; message: string };

export async function updateUserAuthorizedAction(input: {
  userId: string;
  authorized: boolean;
}): Promise<UpdateUserAuthorizedResult> {
  try {
    const response = await serverActionFetch<ApiResponse<AdminUserDto>>(
      `/admin/users/${input.userId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ authorized: input.authorized }),
      },
    );

    if (!response.success || !response.data) {
      return {
        ok: false,
        message:
          resolveStaffApiErrorMessage(response) ||
          STAFF_API_ERROR_MESSAGES.generic,
      };
    }

    revalidatePath(`/users/${input.userId}`);
    revalidatePath("/users");

    return {
      ok: true,
      authorized: Boolean(response.data.authorized),
      message: input.authorized
        ? "وضعیت تجاری کاربر به «مجاز» تغییر کرد."
        : "وضعیت تجاری کاربر به «غیرمجاز» تغییر کرد.",
    };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
