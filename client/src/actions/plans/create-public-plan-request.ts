"use server";

import { publicFetch } from "@/lib/api/public-fetch";
import {
  toPlanRequestActionResult,
  unavailablePlanRequestActionResult,
  type PlanRequestActionResult,
} from "@/lib/plans/action-result";
import type {
  CreatePlanRequestInput,
  NestPlanRequest,
} from "@/lib/plans/types";

export async function createPublicPlanRequestAction(
  input: CreatePlanRequestInput,
): Promise<PlanRequestActionResult<NestPlanRequest>> {
  try {
    const response = await publicFetch<NestPlanRequest>(
      "/public/plan-requests",
      {
        method: "POST",
        body: JSON.stringify({
          planId: input.planId,
          contactName: input.contactName.trim(),
          contactPhone: input.contactPhone.trim(),
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

    if (
      !response.success &&
      response.statusCode === 409 &&
      response.error?.code === "ACCOUNT_EXISTS"
    ) {
      return {
        ok: false,
        error: {
          key: "accountExists",
          code: "ACCOUNT_EXISTS",
          statusCode: 409,
        },
      };
    }

    return toPlanRequestActionResult(response);
  } catch {
    return unavailablePlanRequestActionResult();
  }
}
