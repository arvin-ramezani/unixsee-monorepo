"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  toTicketActionResult,
  unavailableTicketActionResult,
  type TicketActionResult,
} from "@/lib/tickets/action-result";
import type { TicketAttachment } from "@/lib/tickets/types";

export async function uploadTicketAttachmentAction(
  ticketId: string,
  formData: FormData,
): Promise<TicketActionResult<TicketAttachment>> {
  try {
    const response = await serverActionFetch<TicketAttachment>(
      `/tickets/${ticketId}/attachments/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = toTicketActionResult(response);
    if (result.ok) {
      revalidatePath(`/dashboard/tickets/${ticketId}`);
      revalidatePath("/dashboard/tickets", "layout");
    }
    return result;
  } catch {
    return unavailableTicketActionResult();
  }
}
