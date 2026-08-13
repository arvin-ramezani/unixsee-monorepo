import * as z from "zod";

import { toE164IranFromNational } from "@/lib/auth/iran-phone";
import { errorKey } from "../form-errors";

const fullNameRegex = /^[\p{L}\p{M}]+(?:[ '\-‌][\p{L}\p{M}]+)+$/u;
const iranNationalMobileRegex = /^(0?9\d{9}|۰?۹[۰-۹]{9})$/;

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isValidWebsite(value: string): boolean {
  try {
    const url = new URL(normalizeWebsite(value));
    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

export const guestPlanRequestSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, errorKey("fullNameRequired"))
      .regex(fullNameRegex, errorKey("fullNameInvalid")),
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s()-]/g, ""))
      .pipe(
        z
          .string()
          .min(1, errorKey("phoneRequired"))
          .regex(iranNationalMobileRegex, errorKey("phoneInvalid")),
      ),
    email: z
      .email(errorKey("emailInvalid"))
      .trim()
      .min(1, errorKey("emailRequired")),
    noWebsiteYet: z.boolean(),
    website: z.string().trim(),
    description: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.noWebsiteYet) {
      return;
    }

    if (!data.website) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("websiteRequired"),
        path: ["website"],
      });
      return;
    }

    if (!isValidWebsite(data.website)) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("websiteInvalid"),
        path: ["website"],
      });
    }
  });

export type GuestPlanRequestSchemaType = z.infer<typeof guestPlanRequestSchema>;

export function guestPlanRequestToApiPayload(
  data: GuestPlanRequestSchemaType,
) {
  const notes = data.description?.trim();
  const noWebsiteNote =
    data.noWebsiteYet && !notes
      ? "Customer indicated no website yet."
      : undefined;

  return {
    contactName: data.fullName.trim(),
    contactPhone: toE164IranFromNational(data.phone),
    contactEmail: data.email.trim(),
    ...(data.noWebsiteYet
      ? {}
      : { websiteDomain: normalizeWebsite(data.website) }),
    ...(notes || noWebsiteNote
      ? { notes: notes || noWebsiteNote }
      : {}),
  };
}

export { normalizeWebsite, isValidWebsite };
