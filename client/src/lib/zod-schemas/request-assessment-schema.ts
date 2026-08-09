import * as z from "zod";
import { errorKey } from "../form-errors";

const fullNameRegex = /^[\p{L}\p{M}]+(?:[ '\-‌][\p{L}\p{M}]+)+$/u;

export const BUDGET_VALUES = [
  "under_5k",
  "5k_10k",
  "10k_25k",
  "25k_plus",
  "not_sure",
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

export const requestAssessmentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, errorKey("fullNameRequired"))
    .regex(fullNameRegex, errorKey("fullNameInvalid")),

  businessEmail: z
    .string()
    .trim()
    .min(1, errorKey("businessEmailRequired"))
    .email(errorKey("businessEmailInvalid")),

  aboutProject: z
    .string()
    .trim()
    .max(1000, errorKey("aboutProjectTooLong"))
    .optional()
    .or(z.literal("")),

  services: z.enum(SERVICE_VALUES, {
    error: errorKey("servicesRequired"),
  }),

  // services: z
  //   .array(z.enum(SERVICE_VALUES))
  //   .min(1, errorKey("servicesRequired")),
});

export type RequestAssessmentSchemaType = z.infer<
  typeof requestAssessmentSchema
>;
