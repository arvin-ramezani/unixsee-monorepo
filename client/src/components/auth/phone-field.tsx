"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import type { CountryCode } from "libphonenumber-js";

import { PhoneInput } from "@/components/common/phone-input";
import { RequiredInputIcon } from "@/components/common/required-input-icon";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { DEFAULT_PHONE_COUNTRY } from "@/lib/phone/international-phone";
import { cn } from "@/lib/utils";

export type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  /** @deprecated Dial code comes from the country picker; kept for call-site compat. */
  countryCode?: string;
  defaultCountry?: CountryCode;
  className?: string;
  autoComplete?: string;
  /** Override default Auth.common.phoneLabel; pass empty string to hide. */
  label?: string;
  /** Override default Auth.common.phonePlaceholder */
  placeholder?: string;
  id?: string;
  required?: boolean;
  onBlur?: () => void;
};

export function PhoneField({
  value,
  onChange,
  error,
  disabled,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  className,
  autoComplete = "tel-national",
  label,
  id: idProp,
  placeholder: placeholderProp,
  required,
  onBlur,
}: PhoneFieldProps) {
  const t = useTranslations("Auth.common");
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = `${id}-error`;
  const invalid = !!error;
  const resolvedLabel = label === undefined ? t("phoneLabel") : label;
  const resolvedPlaceholder = placeholderProp ?? t("phonePlaceholder");

  return (
    <Field data-invalid={invalid || undefined} className={cn(className)}>
      {!!resolvedLabel && (
        <FieldLabel htmlFor={id} className={required ? "gap-1" : undefined}>
          {resolvedLabel}
          {required && <RequiredInputIcon />}
        </FieldLabel>
      )}
      <PhoneInput
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        defaultCountry={defaultCountry}
        output="international"
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={resolvedPlaceholder}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        aria-required={required || undefined}
        inputClassName="text-base md:text-base"
      />
      {invalid && (
        <FieldError id={errorId} className="mt-1.5">
          {error}
        </FieldError>
      )}
    </Field>
  );
}
