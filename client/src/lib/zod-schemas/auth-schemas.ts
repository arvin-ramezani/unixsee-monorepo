import * as z from "zod";

import { toNationalPhone } from "@/lib/phone/international-phone";

import { errorKey } from "../form-errors";
import { internationalPhoneSchema } from "./international-phone-schema";

const fullNameRegex = /^[\p{L}\p{M}]+(?:[ '\-‌][\p{L}\p{M}]+)+$/u;
const otpRegex = /^\d{6}$/;

export const OTP_LENGTH = 6;
export const MOCK_OTP_FAIL_CODE = "000000";
export const MOCK_EXISTING_EMAIL = "exists@unixsee.com";
export const MOCK_EXISTING_PHONE = "9000000000";

export const identifierModeSchema = z.enum(["phone", "email"]);
export type IdentifierMode = z.infer<typeof identifierModeSchema>;

export const phoneNationalSchema = internationalPhoneSchema({
  output: "national",
});

export const emailSchema = z
  .email(errorKey("emailInvalid"))
  .trim()
  .min(1, errorKey("emailRequired"));

export const passwordSchema = z
  .string()
  .min(1, errorKey("passwordRequired"))
  .min(8, errorKey("passwordTooShort"));

export const otpCodeSchema = z
  .string()
  .trim()
  .min(1, errorKey("otpRequired"))
  .regex(otpRegex, errorKey("otpInvalid"));

export const signInSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("phone"),
    phone: phoneNationalSchema,
    email: z.string().optional(),
  }),
  z.object({
    mode: z.literal("email"),
    email: emailSchema,
    phone: z.string().optional(),
  }),
]);

export type SignInSchemaType = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    mode: identifierModeSchema,
    fullName: z
      .string()
      .trim()
      .min(1, errorKey("fullNameRequired"))
      .regex(fullNameRegex, errorKey("fullNameInvalid")),
    phone: z.string().optional(),
    email: z.string().optional(),
    password: passwordSchema,
  })
  .superRefine((data, ctx) => {
    if (data.mode === "phone") {
      const result = phoneNationalSchema.safeParse(data.phone ?? "");
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ ...issue, path: ["phone"] });
        }
      }
      return;
    }

    const result = emailSchema.safeParse(data.email ?? "");
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue, path: ["email"] });
      }
    }
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const otpSchema = z.object({
  code: otpCodeSchema,
});

export type OtpSchemaType = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, errorKey("passwordRequired")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: errorKey("passwordMismatch"),
    path: ["confirmPassword"],
  });

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

export function normalizeNationalPhone(value: string) {
  const national = toNationalPhone(value);
  if (national) return national;
  return value.replace(/[\s()-]/g, "").replace(/^0/, "");
}

export function isMockExistingAccount(
  mode: IdentifierMode,
  identifier: string,
) {
  if (mode === "email") {
    return identifier.trim().toLowerCase() === MOCK_EXISTING_EMAIL;
  }
  return normalizeNationalPhone(identifier) === MOCK_EXISTING_PHONE;
}

export function maskIdentifier(mode: IdentifierMode, identifier: string) {
  if (mode === "email") {
    const [local, domain] = identifier.split("@");
    if (!local || !domain) return identifier;
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${"*".repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
  }

  const digits = normalizeNationalPhone(identifier);
  if (digits.length < 4) return `+98 ${digits}`;
  return `+98 ${digits.slice(0, 3)}***${digits.slice(-2)}`;
}
