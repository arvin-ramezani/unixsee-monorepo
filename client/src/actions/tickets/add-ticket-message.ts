"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  toTicketActionResult,
  unavailableTicketActionResult,
  type TicketActionResult,
} from "@/lib/tickets/action-result";
import type { TicketMessage } from "@/lib/tickets/types";

export async function addTicketMessageAction(input: {
  ticketId: string;
  body: string;
  idempotencyKey?: string;
}): Promise<TicketActionResult<TicketMessage>> {
  try {
    const response = await serverActionFetch<TicketMessage>(
      `/tickets/${input.ticketId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          body: input.body.trim(),
          ...(input.idempotencyKey
            ? { idempotencyKey: input.idempotencyKey }
            : {}),
        }),
      },
    );

    const result = toTicketActionResult(response);
    if (result.ok) {
      revalidatePath(`/dashboard/tickets/${input.ticketId}`, "page");
      revalidatePath("/dashboard/tickets", "layout");
    }
    return result;
  } catch {
    return unavailableTicketActionResult();
  }
}
