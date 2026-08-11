"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  countryCode?: string;
  className?: string;
  autoComplete?: string;
};

export function PhoneField({
  value,
  onChange,
  error,
  disabled,
  countryCode = "+98",
  className,
  autoComplete = "tel",
}: PhoneFieldProps) {
  const t = useTranslations("Auth.common");
  const id = useId();
  const errorId = `${id}-error`;
  const invalid = !!error;

  return (
    <Field
      data-invalid={invalid || undefined}
      className={cn(className)}
    >
      <FieldLabel htmlFor={id}>{t("phoneLabel")}</FieldLabel>
      <div className="mt-1.5 flex gap-2" dir="ltr">
        <Input
          type="text"
          inputMode="tel"
          readOnly
          tabIndex={-1}
          value={countryCode}
          aria-label={t("countryCode")}
          disabled={disabled}
          className="bg-muted/50 text-muted-foreground h-11 w-16 shrink-0 px-2 text-center text-base md:text-base"
        />
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          enterKeyHint="next"
          placeholder={t("phonePlaceholder")}
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 min-h-11 flex-1 text-base md:text-base"
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
