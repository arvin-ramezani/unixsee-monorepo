"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  toTicketActionResult,
  unavailableTicketActionResult,
  type TicketActionResult,
} from "@/lib/tickets/action-result";
import type { TicketDetail } from "@/lib/tickets/types";

export async function reopenTicketAction(
  ticketId: string,
): Promise<TicketActionResult<TicketDetail>> {
  try {
    const response = await serverActionFetch<TicketDetail>(
      `/tickets/${ticketId}/reopen`,
      { method: "POST", body: JSON.stringify({}) },
    );

    const result = toTicketActionResult(response);
    if (result.ok) {
      revalidatePath(`/dashboard/tickets/${ticketId}`, "page");
      revalidatePath("/dashboard/tickets", "layout");
    }
    return result;
  } catch {
    return unavailableTicketActionResult();
  }
}
