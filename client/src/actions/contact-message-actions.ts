"use server";

import { z } from "zod";

import { routing } from "@/i18n/routing";
import { publicFetch } from "@/lib/api/public-fetch";
import {
  isValidInternationalPhone,
  preparePhoneInput,
  toE164Phone,
} from "@/lib/phone/international-phone";
import { SERVICE_VALUES } from "@/lib/zod-schemas/contact-us-schema";
import type { ServerActionState } from "@/types/server-action-state";

const contactMessageSchema = z.object({
  subject: z.enum(SERVICE_VALUES),
  fullName: z.string().trim().min(1).max(200),
  email: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.email().max(254),
  ),
  phone: z
    .string()
    .trim()
    .transform((value) => preparePhoneInput(value))
    .pipe(
      z
        .string()
        .min(1)
        .max(32)
        .refine(isValidInternationalPhone)
        .transform((value) => toE164Phone(value) ?? value),
    ),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  activityBasin: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  message: z.string().trim().min(20).max(4000),
  attachmentKeys: z.array(z.string().trim().min(1).max(512)).max(5).optional(),
  locale: z.enum(routing.locales),
  source: z.string().trim().max(80).optional(),
});

export type ContactMessageActionInput = z.input<typeof contactMessageSchema>;

type NestContactMessage = {
  id: string;
  status: "NEW" | "READ" | "ARCHIVED";
  createdAt: string;
};

export type ContactMessageActionMessageKey =
  "validationFailed" | "submissionFailed" | "submissionSucceeded";

/**
 * Public contact-us intake.
 * Nest persists the message after optional public uploads.
 */
export async function submitContactMessageAction(
  input: ContactMessageActionInput,
): Promise<ServerActionState> {
  const parsed = contactMessageSchema.safeParse(input);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);

    return {
      ok: false,
      message: "validationFailed",
      fieldErrors,
      submittedAt: Date.now(),
    };
  }

  const {
    subject,
    fullName,
    email,
    phone,
    website,
    activityBasin,
    message,
    attachmentKeys,
    locale,
    source,
  } = parsed.data;

  try {
    const response = await publicFetch<NestContactMessage>(
      "/public/contact-messages",
      {
        method: "POST",
        body: JSON.stringify({
          subject,
          fullName,
          email,
          phone,
          ...(website ? { website } : {}),
          ...(activityBasin ? { activityBasin } : {}),
          message,
          ...(attachmentKeys && attachmentKeys.length > 0
            ? { attachmentKeys }
            : {}),
          locale,
          source: source ?? "contact-us",
        }),
      },
    );

    if (!response.success || !response.data) {
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
  } catch {
    return {
      ok: false,
      message: "submissionFailed",
      submittedAt: Date.now(),
    };
  }
}
