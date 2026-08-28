/**
 * Iran-oriented helpers for the current +98 PhoneField UX.
 * Validation/normalization for all forms should use
 * `@/lib/phone/international-phone` (leading `+` optional).
 */

import {
  isValidInternationalPhone,
  parseInternationalPhone,
  toE164Phone,
  toEnglishDigits,
  toNationalPhone,
} from "@/lib/phone/international-phone";

const IRAN_COUNTRY_CODE = "+98";

export { toEnglishDigits };

/**
 * Parse pasted/typed values into national digits for the +98 PhoneField.
 * Caps length for live input UX.
 */
export function parseIranPhoneInput(raw: string): {
  countryCode: string;
  national: string;
} {
  const parsed = parseInternationalPhone(raw, "IR");
  if (parsed?.country === "IR" || parsed?.countryCallingCode === "98") {
    return {
      countryCode: IRAN_COUNTRY_CODE,
      national: parsed.nationalNumber.slice(0, 10),
    };
  }

  let value = toEnglishDigits(raw).replace(/[^\d+]/g, "");
  if (value.startsWith("+")) value = value.slice(1);
  if (value.startsWith("00")) value = value.slice(2);
  if (value.startsWith("98")) value = value.slice(2);
  if (value.startsWith("0")) value = value.slice(1);
  const national = value.replace(/\D/g, "").slice(0, 10);

  return { countryCode: IRAN_COUNTRY_CODE, national };
}

export function extractIranMobileNational(raw: string): string | null {
  const parsed = parseInternationalPhone(raw, "IR");
  if (!parsed) return null;
  if (parsed.countryCallingCode !== "98") return null;
  const national = parsed.nationalNumber;
  return /^9\d{9}$/.test(national) ? national : null;
}

export function isValidIranMobile(raw: string): boolean {
  return extractIranMobileNational(raw) !== null;
}

export function toNationalIranMobile(raw: string): string {
  return toNationalPhone(raw, "IR") ?? "";
}

export function toE164IranMobile(raw: string): string {
  return (
    toE164Phone(raw, "IR") ??
    `${IRAN_COUNTRY_CODE}${toEnglishDigits(raw).replace(/\D/g, "")}`
  );
}

/** True for any valid international phone (not Iran-only). */
export function isCompleteIranNationalMobile(national: string): boolean {
  return isValidInternationalPhone(national, "IR");
}

/** @deprecated Prefer {@link toE164Phone} from `@/lib/phone/international-phone`. */
export function toE164IranFromNational(national: string): string {
  return toE164IranMobile(national);
}
