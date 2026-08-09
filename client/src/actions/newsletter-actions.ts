"use server";

import { z } from "zod";

import { routing } from "@/i18n/routing";
import { sendNewsletterEmail } from "@/lib/email/services/newsletter-email-service";
import { prisma } from "@/lib/prisma";
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

function isUniqueConstraintError(error: unknown): error is { code: "P2002" } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function createAlreadySubscribedState(): ServerActionState {
  return {
    ok: true,
    message: "alreadySubscribed",
    submittedAt: Date.now(),
  };
}

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
    const existingSubscription = await prisma.newsletterSubscription.findUnique(
      {
        where: {
          email,
        },
        select: {
          id: true,
        },
      },
    );

    if (existingSubscription) {
      return createAlreadySubscribedState();
    }

    try {
      await prisma.newsletterSubscription.create({
        data: {
          email,
          locale,
          source: source ?? "footer",
        },
      });
    } catch (error) {
      // Handles two simultaneous requests for the same email.
      if (isUniqueConstraintError(error)) {
        return createAlreadySubscribedState();
      }

      throw error;
    }

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
