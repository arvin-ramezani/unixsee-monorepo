import { z } from "zod";

import { errorKey } from "@/lib/form-errors";
import {
  isValidInternationalPhone,
  preparePhoneInput,
  toE164Phone,
  toNationalPhone,
  type CountryCode,
  DEFAULT_PHONE_COUNTRY,
} from "@/lib/phone/international-phone";

export type InternationalPhoneSchemaOutput = "raw" | "national" | "e164";

export type InternationalPhoneSchemaOptions = {
  requiredMessage?: string;
  invalidMessage?: string;
  /** Shape after a successful parse. Default keeps the trimmed raw intake string. */
  output?: InternationalPhoneSchemaOutput;
  /**
   * Default region when the user omits `+` / country calling code.
   * Country-code UI will override this later.
   */
  defaultCountry?: CountryCode;
};

/**
 * Shared international phone Zod field.
 * Accepts Persian / Arabic-Indic digits (normalized to ASCII before validate).
 * Leading `+` is not required; national numbers use `defaultCountry` (IR today).
 */
export function internationalPhoneSchema(
  options: InternationalPhoneSchemaOptions = {},
) {
  const requiredMessage = options.requiredMessage ?? errorKey("phoneRequired");
  const invalidMessage = options.invalidMessage ?? errorKey("phoneInvalid");
  const output = options.output ?? "raw";
  const defaultCountry = options.defaultCountry ?? DEFAULT_PHONE_COUNTRY;

  return (
    z
      .string(invalidMessage)
      .trim()
      // Persian/Arabic digits → ASCII, strip separators, `00` → `+`.
      .transform((value) => preparePhoneInput(value))
      .pipe(
        z
          .string()
          .min(1, requiredMessage)
          .refine(
            (value) => isValidInternationalPhone(value, defaultCountry),
            invalidMessage,
          )
          .transform((value) => {
            if (output === "e164") {
              return toE164Phone(value, defaultCountry) ?? value;
            }
            if (output === "national") {
              return toNationalPhone(value, defaultCountry) ?? value;
            }
            return value;
          }),
      )
  );
}

/** @deprecated Prefer {@link internationalPhoneSchema}. */
export const iranMobileSchema = internationalPhoneSchema;
