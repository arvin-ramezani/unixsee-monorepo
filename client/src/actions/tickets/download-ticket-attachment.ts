"use server";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  toTicketActionResult,
  unavailableTicketActionResult,
  type TicketActionResult,
} from "@/lib/tickets/action-result";

export type TicketAttachmentDownload = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  downloadUrl: string;
  expiresInSeconds: number;
};

export async function downloadTicketAttachmentAction(
  ticketId: string,
  attachmentId: string,
): Promise<TicketActionResult<TicketAttachmentDownload>> {
  try {
    const response = await serverActionFetch<TicketAttachmentDownload>(
      `/tickets/${ticketId}/attachments/${attachmentId}/download`,
      { method: "GET" },
    );
    return toTicketActionResult(response);
  } catch {
    return unavailableTicketActionResult();
  }
}
