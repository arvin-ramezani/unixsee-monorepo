"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import { RequiredInputIcon } from "@/components/common/required-input-icon";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseIranPhoneInput } from "@/lib/auth/iran-phone";
import { cn } from "@/lib/utils";

export type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  countryCode?: string;
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
  countryCode = "+98",
  className,
  autoComplete = "tel",
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

  function handleChange(raw: string) {
    const parsed = parseIranPhoneInput(raw);
    onChange(parsed.national);
  }

  return (
    <Field
      data-invalid={invalid || undefined}
      className={cn(className)}
    >
      {resolvedLabel ? (
        <FieldLabel htmlFor={id} className={required ? "gap-1" : undefined}>
          {resolvedLabel}
          {required ? <RequiredInputIcon /> : null}
        </FieldLabel>
      ) : null}
      <div className={cn("flex gap-2", resolvedLabel ? "mt-1.5" : undefined)} dir="ltr">
        <Input
          type="text"
          inputMode="tel"
          readOnly
          tabIndex={-1}
          value={countryCode}
          aria-label={t("countryCode")}
          disabled={disabled}
          className="bg-muted/50 text-muted-foreground h-12 w-16 shrink-0 px-2 text-center text-base md:text-base"
        />
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          enterKeyHint="next"
          placeholder={resolvedPlaceholder}
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          aria-required={required || undefined}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={onBlur}
          className="h-12 min-h-12 flex-1 text-base md:text-base"
        />
      </div>
      {invalid && (
        <FieldError id={errorId} className="mt-1.5">
          {error}
        </FieldError>
      )}
    </Field>
  );
}
