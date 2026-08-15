"use server";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  toPlanRequestActionResult,
  unavailablePlanRequestActionResult,
  type PlanRequestActionResult,
} from "@/lib/plans/action-result";
import type {
  CreatePlanRequestInput,
  NestPlanRequest,
} from "@/lib/plans/types";

export async function createPlanRequestAction(
  input: CreatePlanRequestInput,
): Promise<PlanRequestActionResult<NestPlanRequest>> {
  try {
    const response = await serverActionFetch<NestPlanRequest>(
      "/plan-requests",
      {
        method: "POST",
        body: JSON.stringify({
          planId: input.planId,
          contactName: input.contactName.trim(),
          ...(input.contactPhone?.trim()
            ? { contactPhone: input.contactPhone.trim() }
            : {}),
          ...(input.contactEmail?.trim()
            ? { contactEmail: input.contactEmail.trim() }
            : {}),
          ...(input.websiteDomain?.trim()
            ? { websiteDomain: input.websiteDomain.trim() }
            : {}),
          ...(input.notes?.trim() ? { notes: input.notes.trim() } : {}),
        }),
      },
    );

    return toPlanRequestActionResult(response);
  } catch {
    return unavailablePlanRequestActionResult();
  }
}
