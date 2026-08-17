"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";

export type TicketMutationResult =
  | { ok: true }
  | { ok: false; message: string };

async function mutateTicket(
  ticketId: string,
  endpoint: string,
  init?: RequestInit,
): Promise<TicketMutationResult> {
  try {
    const response = await serverActionFetch(endpoint, init);
    if (!response.success) {
      return {
        ok: false,
        message: resolveStaffApiErrorMessage(response),
      };
    }

    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);
    return { ok: true };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function markTicketInProgressAction(
  ticketId: string,
): Promise<TicketMutationResult> {
  return mutateTicket(ticketId, `/admin/tickets/${ticketId}/in-progress`, {
    method: "POST",
  });
}

export async function resolveTicketAction(
  ticketId: string,
): Promise<TicketMutationResult> {
  return mutateTicket(ticketId, `/admin/tickets/${ticketId}/resolve`, {
    method: "POST",
  });
}

export async function reopenTicketAction(
  ticketId: string,
): Promise<TicketMutationResult> {
  return mutateTicket(ticketId, `/admin/tickets/${ticketId}/reopen`, {
    method: "POST",
  });
}

export async function addTicketMessageAction(input: {
  ticketId: string;
  body: string;
  isInternal?: boolean;
}): Promise<TicketMutationResult> {
  const body = input.body.trim();
  if (!body) {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.validation };
  }

  return mutateTicket(input.ticketId, `/admin/tickets/${input.ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      body,
      isInternal: input.isInternal ?? false,
    }),
  });
}

export async function uploadTicketAttachmentAction(
  ticketId: string,
  formData: FormData,
): Promise<TicketMutationResult> {
  return mutateTicket(ticketId, `/admin/tickets/${ticketId}/attachments/upload`, {
    method: "POST",
    body: formData,
  });
}
