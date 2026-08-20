"use server";

import { z } from "zod";

import { routing } from "@/i18n/routing";
import { sendNewsletterEmail } from "@/lib/email/services/newsletter-email-service";
import type { ServerActionState } from "@/types/server-action-state";

const newsletterSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.email().max(254),
  ),
  source: z.string().trim().max(80).optional(),
  locale: z.enum(routing.locales),
});

type NewsletterInput = z.infer<typeof newsletterSchema>;

export type NewsletterActionMessageKey =
  | "validationFailed"
  | "submissionFailed"
  | "submissionSucceeded"
  | "alreadySubscribed";

/**
 * Public newsletter intake.
 * Persistence belongs in NestJS; this client action only validates and notifies.
 */
export async function subscribeNewsletterAction(
  _previousState: ServerActionState,
  input: NewsletterInput,
): Promise<ServerActionState> {
  const parsed = newsletterSchema.safeParse(input);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);

    return {
      ok: false,
      message: "validationFailed",
      fieldErrors,
      submittedAt: Date.now(),
    };
  }

  const { email, locale } = parsed.data;

  try {
    await sendNewsletterEmail({
      email,
      locale,
    });

    return {
      ok: true,
      message: "submissionSucceeded",
      submittedAt: Date.now(),
    };
  } catch (error) {
    console.error("Newsletter subscription failed.", {
      error:
        error instanceof Error ? error.message : "Unknown submission error",
    });

    return {
      ok: false,
      message: "submissionFailed",
      submittedAt: Date.now(),
    };
  }
}
