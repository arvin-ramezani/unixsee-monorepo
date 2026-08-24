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

/** Daily visitor ranges for guest plan intake. */
export const DAILY_VISITOR_BANDS = [
  "under_100",
  "100_to_500",
  "500_to_2k",
  "over_2k",
] as const;

export const WOOCOMMERCE_OPTIONS = ["yes", "no"] as const;

export const PLAN_REQUEST_UPLOAD = {
  accept: ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx",
  acceptMime: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
  maxFiles: 5,
  maxBytes: 5 * 1024 * 1024,
} as const;

export type PlanRequestAttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

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

export function isAcceptedPlanRequestFile(file: File): boolean {
  if (file.size <= 0 || file.size > PLAN_REQUEST_UPLOAD.maxBytes) {
    return false;
  }
  const lower = file.name.toLowerCase();
  const byExt = PLAN_REQUEST_UPLOAD.accept
    .split(",")
    .some((ext) => lower.endsWith(ext.trim()));
  const byMime = (PLAN_REQUEST_UPLOAD.acceptMime as readonly string[]).includes(
    file.type,
  );
  return byExt || byMime;
}

export const guestPlanRequestSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, errorKey("fullNameRequired"))
      .regex(fullNameRegex, errorKey("fullNameInvalid")),
    preferredContact: z.enum(["phone", "email"]),
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s()-]/g, "")),
    email: z.string().trim(),
    noWebsiteYet: z.boolean(),
    website: z.string().trim(),
    databaseSizeBand: z.string(),
    dailyVisitorsBand: z.string(),
    isWooCommerce: z.string(),
    description: z.string().trim().max(2000).optional(),
    attachments: z
      .array(
        z.object({
          name: z.string().min(1).max(255),
          size: z.number().int().positive().max(PLAN_REQUEST_UPLOAD.maxBytes),
          type: z.string().max(120),
        }),
      )
      .max(PLAN_REQUEST_UPLOAD.maxFiles),
  })
  .superRefine((data, ctx) => {
    const phone = data.phone;
    const email = data.email;

    if (data.preferredContact === "phone") {
      if (!phone) {
        ctx.addIssue({
          code: "custom",
          message: errorKey("phoneRequired"),
          path: ["phone"],
        });
      } else if (!iranNationalMobileRegex.test(phone)) {
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
    } else {
      if (!email) {
        ctx.addIssue({
          code: "custom",
          message: errorKey("emailRequired"),
          path: ["email"],
        });
      } else {
        const emailResult = z.email().safeParse(email);
        if (!emailResult.success) {
          ctx.addIssue({
            code: "custom",
            message: errorKey("emailInvalid"),
            path: ["email"],
          });
        }
      }
      if (phone && !iranNationalMobileRegex.test(phone)) {
        ctx.addIssue({
          code: "custom",
          message: errorKey("phoneInvalid"),
          path: ["phone"],
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
    } else if (!isValidWebsite(data.website)) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("websiteInvalid"),
        path: ["website"],
      });
    }

    if (
      !(DATABASE_SIZE_BANDS as readonly string[]).includes(
        data.databaseSizeBand,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("databaseSizeRequired"),
        path: ["databaseSizeBand"],
      });
    }

    if (
      !(DAILY_VISITOR_BANDS as readonly string[]).includes(
        data.dailyVisitorsBand,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("dailyVisitorsRequired"),
        path: ["dailyVisitorsBand"],
      });
    }

    if (
      !(WOOCOMMERCE_OPTIONS as readonly string[]).includes(data.isWooCommerce)
    ) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("woocommerceRequired"),
        path: ["isWooCommerce"],
      });
    }
  });

export type GuestPlanRequestSchemaType = z.infer<typeof guestPlanRequestSchema>;

export function buildGuestPlanIntakeNotes(
  data: GuestPlanRequestSchemaType,
): string {
  const lines = [
    "[Plan intake]",
    `Preferred contact: ${data.preferredContact}`,
  ];

  if (data.noWebsiteYet) {
    lines.push("Website: none yet");
    lines.push("Store sizing: skipped (no website yet)");
  } else {
    lines.push(`Website: ${normalizeWebsite(data.website)}`);
    lines.push(`Database size: ${data.databaseSizeBand}`);
    lines.push(`Daily visitors: ${data.dailyVisitorsBand}`);
    lines.push(`WooCommerce today: ${data.isWooCommerce}`);
  }

  if (data.attachments.length > 0) {
    lines.push(
      `Attachments (names only; binary upload deferred): ${data.attachments
        .map((file) => file.name)
        .join(", ")}`,
    );
  }

  const freeText = data.description?.trim();
  if (freeText) {
    lines.push("", freeText);
  }

  return lines.join("\n");
}

export function guestPlanRequestToApiPayload(data: GuestPlanRequestSchemaType) {
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

/** @deprecated Use DAILY_VISITOR_BANDS */
export const MONTHLY_VISITOR_BANDS = DAILY_VISITOR_BANDS;

/** Site content size ranges for authenticated plan intake. */
export const CONTENT_SIZE_BANDS = [
  "under_100mb",
  "100mb_to_1gb",
  "1gb_to_10gb",
  "over_10gb",
] as const;

/** Zod schema for authenticated plan request intake fields. */

export const authPlanRequestSchema = z
  .object({
    contactName: z
      .string()
      .trim()
      .min(1, errorKey("fullNameRequired"))
      .regex(fullNameRegex, errorKey("fullNameInvalid")),
    website: z.string().trim(),
    databaseSizeBand: z.string(),
    dailyVisitorsBand: z.string(),
    contentSizeBand: z.string(),
    isWooCommerce: z.string(),
    description: z.string().trim().max(2000).optional(),
    attachments: z
      .array(
        z.object({
          name: z.string().min(1).max(255),
          size: z.number().int().positive().max(PLAN_REQUEST_UPLOAD.maxBytes),
          type: z.string().max(120),
        }),
      )
      .max(PLAN_REQUEST_UPLOAD.maxFiles),
  })
  .superRefine((data, ctx) => {
    if (!data.website) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("websiteRequired"),
        path: ["website"],
      });
    } else if (!isValidWebsite(data.website)) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("websiteInvalid"),
        path: ["website"],
      });
    }

    if (
      !(DATABASE_SIZE_BANDS as readonly string[]).includes(
        data.databaseSizeBand,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("databaseSizeRequired"),
        path: ["databaseSizeBand"],
      });
    }

    if (
      !(DAILY_VISITOR_BANDS as readonly string[]).includes(
        data.dailyVisitorsBand,
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("dailyVisitorsRequired"),
        path: ["dailyVisitorsBand"],
      });
    }

    if (
      !(CONTENT_SIZE_BANDS as readonly string[]).includes(data.contentSizeBand)
    ) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("contentSizeRequired"),
        path: ["contentSizeBand"],
      });
    }

    if (
      !(WOOCOMMERCE_OPTIONS as readonly string[]).includes(data.isWooCommerce)
    ) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("woocommerceRequired"),
        path: ["isWooCommerce"],
      });
    }
  });

export type AuthPlanRequestSchemaType = z.infer<typeof authPlanRequestSchema>;

export function buildAuthPlanIntakeNotes(
  data: AuthPlanRequestSchemaType,
): string {
  const lines = [
    "[Plan intake — authenticated user]",
    `Website: ${normalizeWebsite(data.website)}`,
    `Database size: ${data.databaseSizeBand}`,
    `Daily visitors: ${data.dailyVisitorsBand}`,
    `Content size: ${data.contentSizeBand}`,
    `WooCommerce today: ${data.isWooCommerce}`,
  ];

  if (data.attachments.length > 0) {
    lines.push(
      `Attachments (names only; binary upload deferred): ${data.attachments
        .map((file) => file.name)
        .join(", ")}`,
    );
  }

  const freeText = data.description?.trim();
  if (freeText) {
    lines.push("", freeText);
  }

  return lines.join("\n");
}
