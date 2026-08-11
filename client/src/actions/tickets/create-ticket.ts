"use server";

import { revalidatePath } from "next/cache";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  toTicketActionResult,
  unavailableTicketActionResult,
  type TicketActionResult,
} from "@/lib/tickets/action-result";
import type {
  CreateTicketInput,
  TicketDetail,
} from "@/lib/tickets/types";

export async function createTicketAction(
  input: CreateTicketInput,
): Promise<TicketActionResult<TicketDetail>> {
  try {
    const response = await serverActionFetch<TicketDetail>("/tickets", {
      method: "POST",
      body: JSON.stringify({
        service: input.service,
        subject: input.subject.trim(),
        description: input.description.trim(),
        ...(input.websiteId ? { websiteId: input.websiteId } : {}),
      }),
    });

    const result = toTicketActionResult(response);
    if (result.ok) {
      revalidatePath("/dashboard/tickets", "layout");
    }
    return result;
  } catch {
    return unavailableTicketActionResult();
  }
}
