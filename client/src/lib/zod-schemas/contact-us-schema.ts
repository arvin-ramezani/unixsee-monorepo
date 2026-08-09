import * as z from "zod";
import { errorKey } from "../form-errors";
import { FileSchema } from "./common-schema";

const fullNameRegex = /^[\p{L}\p{M}]+(?:[ '\-‌][\p{L}\p{M}]+)+$/u;
const globalAndPersianPhoneRegex =
  /^(\+?[1-9]\d{1,14}|(?:\+|۰)?[۱-۹][۰-۹]{1,14})$/;
// const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;

export const SERVICE_VALUES = [
  "managedServer",
  "migrationOptimization",
  "woocommerceSupport",
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
  "",
] as const;

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
  phone: z
    .string(errorKey("phoneInvalid")) // Forces strict string type checking upfront
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, "")) // Safely cleans layout formatting
    .pipe(
      z
        .string()
        .min(1, errorKey("phoneRequired"))
        .regex(globalAndPersianPhoneRegex, errorKey("phoneInvalid")),
    ),
  website: z.url(errorKey("websiteInvalid")).optional(),
  activityBasin: z.string().optional(),
  files: z.array(FileSchema).optional(),
  message: z
    .string()
    .trim()
    .min(1, errorKey("messageRequired"))
    .min(20, errorKey("messageTooShort")),
});

export type ContactUsSchemaType = z.infer<typeof contactUsSchema>;
