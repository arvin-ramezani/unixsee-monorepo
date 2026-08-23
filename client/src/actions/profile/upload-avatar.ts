"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  toTicketActionResult,
  unavailableTicketActionResult,
  type TicketActionResult,
} from "@/lib/tickets/action-result";

export type AvatarUploadResult = {
  avatarUrl: string;
};

export async function uploadAvatarAction(
  formData: FormData,
): Promise<TicketActionResult<AvatarUploadResult>> {
  try {
    const response = await serverActionFetch<AvatarUploadResult>(
      "/users/me/avatar",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.success || !response.data) {
      return {
        ok: false,
        error: {
          key: "generic",
          code: null,
          statusCode: response.statusCode,
        },
      };
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/", "layout");

    return { ok: true, data: response.data };
  } catch {
    return unavailableTicketActionResult();
  }
}
