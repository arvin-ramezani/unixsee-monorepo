import * as z from "zod";

import { toE164IranFromNational } from "@/lib/auth/iran-phone";
import { errorKey } from "../form-errors";

const fullNameRegex = /^[\p{L}\p{M}]+(?:[ '\-‌][\p{L}\p{M}]+)+$/u;
const iranNationalMobileRegex = /^(0?9\d{9}|۰?۹[۰-۹]{9})$/;

export const DATABASE_SIZE_BANDS = [
  "under_1gb",
  "1_to_5gb",
  "5_to_20gb",
  "over_20gb",
] as const;

export const MONTHLY_VISITOR_BANDS = [
  "under_1k",
  "1k_to_10k",
  "10k_to_50k",
  "over_50k",
] as const;

export const WOOCOMMERCE_OPTIONS = ["yes", "no", "not_sure"] as const;

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
      .transform((value) => value.replace(/[\s()-]/g, "")),
    email: z.string().trim(),
    noWebsiteYet: z.boolean(),
    website: z.string().trim(),
    databaseSizeBand: z
      .string()
      .min(1, errorKey("databaseSizeRequired"))
      .refine(
        (value) => (DATABASE_SIZE_BANDS as readonly string[]).includes(value),
        errorKey("databaseSizeRequired"),
      ),
    monthlyVisitorsBand: z
      .string()
      .min(1, errorKey("monthlyVisitorsRequired"))
      .refine(
        (value) =>
          (MONTHLY_VISITOR_BANDS as readonly string[]).includes(value),
        errorKey("monthlyVisitorsRequired"),
      ),
    isWooCommerce: z
      .string()
      .min(1, errorKey("woocommerceRequired"))
      .refine(
        (value) => (WOOCOMMERCE_OPTIONS as readonly string[]).includes(value),
        errorKey("woocommerceRequired"),
      ),
    description: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    const phone = data.phone;
    const email = data.email;

    if (!phone && !email) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("contactRequired"),
        path: ["phone"],
      });
      ctx.addIssue({
        code: "custom",
        message: errorKey("contactRequired"),
        path: ["email"],
      });
    }

    if (phone && !iranNationalMobileRegex.test(phone)) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("phoneInvalid"),
        path: ["phone"],
      });
    }

    if (email) {
      const emailResult = z.email().safeParse(email);
      if (!emailResult.success) {
        ctx.addIssue({
          code: "custom",
          message: errorKey("emailInvalid"),
          path: ["email"],
        });
      }
    }

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

export function buildGuestPlanIntakeNotes(
  data: GuestPlanRequestSchemaType,
): string {
  const lines = [
    "[Plan intake — example fields]",
    `Database size: ${data.databaseSizeBand}`,
    `Monthly visitors: ${data.monthlyVisitorsBand}`,
    `WooCommerce today: ${data.isWooCommerce}`,
  ];

  if (data.noWebsiteYet) {
    lines.push("Website: none yet");
  }

  const freeText = data.description?.trim();
  if (freeText) {
    lines.push("", freeText);
  }

  return lines.join("\n");
}

export function guestPlanRequestToApiPayload(
  data: GuestPlanRequestSchemaType,
) {
  const phone = data.phone.trim();
  const email = data.email.trim();

  return {
    contactName: data.fullName.trim(),
    ...(phone ? { contactPhone: toE164IranFromNational(phone) } : {}),
    ...(email ? { contactEmail: email } : {}),
    ...(data.noWebsiteYet
      ? {}
      : { websiteDomain: normalizeWebsite(data.website) }),
    notes: buildGuestPlanIntakeNotes(data),
  };
}

export { normalizeWebsite, isValidWebsite };
