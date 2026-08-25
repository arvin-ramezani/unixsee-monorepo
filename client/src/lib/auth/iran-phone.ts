/** Convert Persian digits to ASCII digits. */
export function toEnglishDigits(input: string): string {
  // eslint-disable-next-line no-restricted-syntax -- Persian-digit lookup table for numeral->ASCII conversion, not UI copy.
  return input.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

const IRAN_COUNTRY_CODE = "+98";

/**
 * Parse pasted/typed Iranian phone values into national digits for a +98 field.
 * Handles: +98…, 0098…, 98…, 09…, 9…, Persian digits, spaces/dashes.
 */
export function parseIranPhoneInput(raw: string): {
  countryCode: string;
  national: string;
} {
  let value = toEnglishDigits(raw).replace(/[^\d+]/g, "");

  if (value.startsWith("+")) {
    value = value.slice(1);
  }

  if (value.startsWith("00")) {
    value = value.slice(2);
  }

  if (value.startsWith("98")) {
    value = value.slice(2);
  }

  if (value.startsWith("0")) {
    value = value.slice(1);
  }

  // Keep only digits; cap to Iranian mobile national length (10 after stripping 0)
  const national = value.replace(/\D/g, "").slice(0, 10);

  return {
    countryCode: IRAN_COUNTRY_CODE,
    national,
  };
}

/** Build E.164 from a national Iran mobile value (with or without leading 0). */
export function toE164IranFromNational(national: string): string {
  const digits = toEnglishDigits(national).replace(/[\s()-]/g, "");
  const withoutZero = digits.replace(/^0/, "");
  if (withoutZero.startsWith("98")) {
    return `+${withoutZero}`;
  }
  return `${IRAN_COUNTRY_CODE}${withoutZero}`;
}

export function isCompleteIranNationalMobile(national: string): boolean {
  const digits = toEnglishDigits(national).replace(/\D/g, "").replace(/^0/, "");
  return /^9\d{9}$/.test(digits);
}
