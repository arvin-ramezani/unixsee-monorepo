import * as z from "zod";

import { errorKey } from "../form-errors";
import { FileSchema } from "./common-schema";
import { internationalPhoneSchema } from "./international-phone-schema";

const fullNameRegex = /^[\p{L}\p{M}]+(?:[ '\-‌][\p{L}\p{M}]+)+$/u;

/** Align with Nest `POST /api/v1/uploads/public` allowlist and 5MB limit. */
export const CONTACT_US_PUBLIC_UPLOAD_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const SERVICE_VALUES = [
  "managedServer",
  "migrationOptimization",
  "woocommerceSupport",
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
] as const;

export type ContactUsServiceValue = (typeof SERVICE_VALUES)[number];

export const CONTACT_US_UPLOAD = {
  maxFiles: 5,
  maxFileBytes: 5 * 1024 * 1024,
  acceptMime: [...CONTACT_US_PUBLIC_UPLOAD_MIME],
  accept: CONTACT_US_PUBLIC_UPLOAD_MIME.join(","),
} as const;

export function isAcceptedContactUsFile(file: File) {
  if (file.size <= 0) return false;
  if (
    !CONTACT_US_UPLOAD.acceptMime.includes(
      file.type as (typeof CONTACT_US_PUBLIC_UPLOAD_MIME)[number],
    )
  ) {
    return false;
  }
  return file.size <= CONTACT_US_UPLOAD.maxFileBytes;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const contactUsSchema = z.object({
  subject: z.enum(SERVICE_VALUES, {
    error: errorKey("servicesRequired"),
  }),
  fullName: z
    .string()
    .trim()
    .min(1, errorKey("fullNameRequired"))
    .regex(fullNameRegex, errorKey("fullNameInvalid")),
  email: z
    .email(errorKey("emailInvalid"))
    .trim()
    .min(1, errorKey("emailRequired")),
  phone: internationalPhoneSchema({ output: "e164" }),
  website: z
    .string()
    .trim()
    .transform(normalizeWebsite)
    .refine(
      (value) => value === "" || z.url().safeParse(value).success,
      errorKey("websiteInvalid"),
    )
    .optional(),
  activityBasin: z.string().trim().optional(),
  files: z.array(FileSchema).optional(),
  message: z
    .string()
    .trim()
    .min(1, errorKey("messageRequired"))
    .min(20, errorKey("messageTooShort"))
    .max(4000, errorKey("messageTooLong")),
});

export type ContactUsSchemaType = z.infer<typeof contactUsSchema>;
