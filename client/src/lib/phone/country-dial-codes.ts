import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import faLocale from "i18n-iso-countries/langs/fa.json";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

countries.registerLocale(enLocale);
countries.registerLocale(faLocale);

export type PhoneCountryOption = {
  code: CountryCode;
  /** Calling code digits without `+` (e.g. `"98"`). */
  dialCode: string;
  name: string;
};

export type PhoneCountryLocale = "en" | "fa";

function countryFlagEmoji(code: CountryCode): string {
  return [...code.toUpperCase()]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function getPhoneCountryOptions(
  locale: PhoneCountryLocale = "en",
): PhoneCountryOption[] {
  const lang = locale === "fa" ? "fa" : "en";
  const options: PhoneCountryOption[] = [];

  for (const code of getCountries()) {
    try {
      const dialCode = getCountryCallingCode(code);
      const name =
        countries.getName(code, lang) ?? countries.getName(code, "en");
      if (!name) continue;
      options.push({ code, dialCode, name });
    } catch {
      // Skip regions libphonenumber cannot map to a calling code.
    }
  }

  options.sort((a, b) =>
    a.name.localeCompare(b.name, lang, { sensitivity: "base" }),
  );

  return options;
}

export function formatDialCode(dialCode: string): string {
  return `+${dialCode}`;
}

export function getCountryFlag(code: CountryCode): string {
  return countryFlagEmoji(code);
}

export function findPhoneCountryOption(
  options: PhoneCountryOption[],
  code: CountryCode,
): PhoneCountryOption | undefined {
  return options.find((option) => option.code === code);
}
