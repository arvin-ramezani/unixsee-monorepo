import {
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber,
} from "libphonenumber-js";

/** Convert Persian / Arabic-Indic digits to ASCII digits. */
export function toEnglishDigits(input: string): string {
  return (
    input
      // eslint-disable-next-line no-restricted-syntax -- digit lookup tables, not UI copy.
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      // eslint-disable-next-line no-restricted-syntax -- digit lookup tables, not UI copy.
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
  );
}

/**
 * Default region for national numbers typed without a country-calling-code
 * prefix. A country-code picker will override this later.
 */
export const DEFAULT_PHONE_COUNTRY: CountryCode = "IR";

/**
 * Prepare user input for parsing:
 * - Persian (`۰-۹`) / Arabic-Indic (`٠-٩`) digits → ASCII
 * - strip spaces / dashes / parentheses
 * - `00…` international prefix → `+…`
 *
 * Leading `+` is optional. National numbers rely on `defaultCountry`.
 */
export function preparePhoneInput(raw: string): string {
  let value = toEnglishDigits(raw).trim();
  if (!value) return "";

  value = value.replace(/[\s()-]/g, "");

  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  }

  return value;
}

/**
 * Parse a phone number. Accepts national (no `+`) with `defaultCountry`,
 * international with `+` / `00`, and international digits without `+`.
 */
export function parseInternationalPhone(
  raw: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): PhoneNumber | null {
  const prepared = preparePhoneInput(raw);
  if (!prepared) return null;

  const withDefault = parsePhoneNumberFromString(prepared, defaultCountry);
  if (withDefault?.isValid()) {
    return withDefault;
  }

  if (!prepared.startsWith("+") && /^\d{8,15}$/.test(prepared)) {
    const asInternational = parsePhoneNumberFromString(`+${prepared}`);
    if (asInternational?.isValid()) {
      return asInternational;
    }
  }

  return null;
}

export function isValidInternationalPhone(
  raw: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): boolean {
  return parseInternationalPhone(raw, defaultCountry) !== null;
}

/** Normalize to E.164 (`+…`). Returns `null` when invalid. */
export function toE164Phone(
  raw: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): string | null {
  return parseInternationalPhone(raw, defaultCountry)?.format("E.164") ?? null;
}

/** National significant number digits (no country calling code). */
export function toNationalPhone(
  raw: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
): string | null {
  return parseInternationalPhone(raw, defaultCountry)?.nationalNumber ?? null;
}

export type { CountryCode };
