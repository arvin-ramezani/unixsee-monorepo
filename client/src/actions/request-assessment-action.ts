"use server";

import { z } from "zod";

import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { sendRequestAssessmentEmails } from "@/lib/email/services/request-assessment-email-service";
import { requestAssessmentSchema } from "@/lib/zod-schemas/request-assessment-schema";
import type { ServerActionState } from "@/types/server-action-state";

const requestAssessmentActionSchema = requestAssessmentSchema.extend({
  locale: z.enum(routing.locales),
});

type RequestAssessmentInput = unknown;

export type RequestAssessmentActionMessageKey =
  | "validationFailed"
  | "submissionFailed"
  | "submissionSucceeded";

export async function createRequestAssessmentAction(
  _previousState: ServerActionState,
  input: RequestAssessmentInput,
): Promise<ServerActionState> {
  const parsed = requestAssessmentActionSchema.safeParse(input);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);

    return {
      ok: false,
      message: "validationFailed",
      fieldErrors,
      submittedAt: Date.now(),
    };
  }

  try {
    const request = await prisma.requestAssessment.create({
      data: {
        fullName: parsed.data.fullName,
        workEmail: parsed.data.businessEmail,
        description: parsed.data.aboutProject ?? "",
        serviceType: parsed.data.services,
        locale: parsed.data.locale,
      },
    });

    await sendRequestAssessmentEmails({
      requestId: request.id,
      fullName: request.fullName,
      workEmail: request.workEmail,
      description: request.description,
      serviceType: parsed.data.services,
      locale: parsed.data.locale,
    });
  } catch (error) {
    console.error("Request assessment submission failed.", {
      error:
        error instanceof Error ? error.message : "Unknown submission error",
    });

    return {
      ok: false,
      message: "submissionFailed",
      submittedAt: Date.now(),
    };
  }

  return {
    ok: true,
    message: "submissionSucceeded",
    submittedAt: Date.now(),
  };
}
