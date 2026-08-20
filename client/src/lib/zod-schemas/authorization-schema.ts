import * as z from "zod";

import { AUTHORIZATION_UPLOAD } from "@/lib/data/authorization/authorization-data";
import { errorKey } from "../form-errors";

const iranNationalIdRegex = /^(\d{10}|[۰-۹]{10})$/;
const iranPostalCodeRegex = /^(\d{10}|[۰-۹]{10})$/;
const iranNationalMobileRegex = /^(0?9\d{9}|\+989\d{9}|۰?۹[۰-۹]{9})$/;

function toAsciiDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
  );
}

/** Lightweight checksum for Iranian national ID (prototype). */
export function isValidIranianNationalId(raw: string): boolean {
  const value = toAsciiDigits(raw).replace(/\D/g, "");
  if (!/^\d{10}$/.test(value)) return false;
  if (/^(\d)\1{9}$/.test(value)) return false;

  const check = Number(value[9]);
  const sum = value
    .slice(0, 9)
    .split("")
    .reduce((acc, digit, index) => acc + Number(digit) * (10 - index), 0);
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

export const authorizationIdentitySchema = z.object({
  nationalId: z
    .string()
    .trim()
    .transform(toAsciiDigits)
    .pipe(
      z
        .string()
        .min(1, errorKey("nationalIdRequired"))
        .regex(iranNationalIdRegex, errorKey("nationalIdInvalid"))
        .refine(isValidIranianNationalId, errorKey("nationalIdInvalid")),
    ),
  birthDate: z.string().trim().min(1, errorKey("birthDateRequired")),
  mobile: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .pipe(
      z
        .string()
        .min(1, errorKey("mobileRequired"))
        .regex(iranNationalMobileRegex, errorKey("mobileInvalid")),
    ),
  mobileBelongsToNationalId: z.boolean(),
});

export const authorizationContactsSchema = z.object({
  email: z
    .email(errorKey("emailInvalid"))
    .trim()
    .min(1, errorKey("emailRequired")),
});

export const authorizationAddressSchema = z.object({
  province: z.string().trim().min(1, errorKey("provinceRequired")),
  city: z.string().trim().min(1, errorKey("cityRequired")),
  address: z
    .string()
    .trim()
    .min(1, errorKey("addressRequired"))
    .max(500, errorKey("addressTooLong")),
  postalCode: z
    .string()
    .trim()
    .transform(toAsciiDigits)
    .pipe(
      z
        .string()
        .min(1, errorKey("postalCodeRequired"))
        .regex(iranPostalCodeRegex, errorKey("postalCodeInvalid")),
    ),
});

export const authorizationReviewSchema = z.object({
  attestedTruthful: z
    .boolean()
    .refine((value) => value === true, {
      message: errorKey("attestationRequired"),
    }),
});

export function isAcceptedNationalIdFile(file: File) {
  return (
    (AUTHORIZATION_UPLOAD.mimeTypes as readonly string[]).includes(file.type) &&
    file.size > 0 &&
    file.size <= AUTHORIZATION_UPLOAD.maxBytes
  );
}

export type AuthorizationIdentitySchema = z.infer<
  typeof authorizationIdentitySchema
>;
export type AuthorizationContactsSchema = z.infer<
  typeof authorizationContactsSchema
>;
export type AuthorizationAddressSchema = z.infer<
  typeof authorizationAddressSchema
>;
