"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type { ContactMessageStatusType } from "@/lib/data/contact-messages-data";
import {
  mapAdminContactMessageToUi,
  type AdminContactMessageDto,
} from "@/lib/contact-messages/map-admin-contact-message";
import type { ContactMessageType } from "@/lib/data/contact-messages-data";

export type ContactMessageMutationResult =
  { ok: true; message: ContactMessageType } | { ok: false; message: string };

function revalidateContactMessages(id?: string) {
  revalidatePath("/contact-messages");
  if (id) {
    revalidatePath(`/contact-messages/${id}`);
  }
}

export async function updateContactMessageStatusAction(
  id: string,
  status: ContactMessageStatusType,
): Promise<ContactMessageMutationResult> {
  try {
    const response = await serverActionFetch<AdminContactMessageDto>(
      `/admin/contact-messages/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );

    if (!response.success || !response.data) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }

    revalidateContactMessages(id);
    return {
      ok: true,
      message: mapAdminContactMessageToUi(response.data),
    };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
