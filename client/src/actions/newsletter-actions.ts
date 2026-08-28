"use server";

import { z } from "zod";

import { routing } from "@/i18n/routing";
import { publicFetch } from "@/lib/api/public-fetch";
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

type NestNewsletterSubscription = {
  id: string;
  email: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
  locale: string | null;
  source: string | null;
  consentedAt: string;
  created: boolean;
};

export type NewsletterActionMessageKey =
  | "validationFailed"
  | "submissionFailed"
  | "submissionSucceeded"
  | "alreadySubscribed";

/**
 * Public newsletter intake.
 * Nest persists the subscriber; confirmation email is best-effort after success.
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

  const { email, locale, source } = parsed.data;

  try {
    const response = await publicFetch<NestNewsletterSubscription>(
      "/public/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          locale,
          source: source ?? "footer",
        }),
      },
    );

    if (
      !response.success &&
      response.statusCode === 409 &&
      response.error?.code === "ALREADY_SUBSCRIBED"
    ) {
      return {
        ok: false,
        message: "alreadySubscribed",
        submittedAt: Date.now(),
      };
    }

    if (!response.success || !response.data) {
      return {
        ok: false,
        message: "submissionFailed",
        submittedAt: Date.now(),
      };
    }

    try {
      await sendNewsletterEmail({ email, locale });
    } catch (error) {
      console.error("Newsletter confirmation email failed after persist.", {
        subscriptionId: response.data.id,
        error:
          error instanceof Error
            ? error.message
            : "Unknown email delivery error",
      });
    }

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
