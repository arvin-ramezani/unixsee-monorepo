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

export type EmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
};

export function EmailField({
  value,
  onChange,
  error,
  disabled,
  className,
  autoComplete = "email",
}: EmailFieldProps) {
  const t = useTranslations("Auth.common");
  const id = useId();
  const errorId = `${id}-error`;
  const invalid = !!error;

  return (
    <Field data-invalid={invalid || undefined} className={cn(className)}>
      <FieldLabel htmlFor={id}>{t("emailLabel")}</FieldLabel>
      <Input
        id={id}
        type="email"
        inputMode="email"
        autoComplete={autoComplete}
        enterKeyHint="next"
        placeholder={t("emailPlaceholder")}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        dir="ltr"
        className="mt-1.5 h-11 min-h-11 text-base md:text-base"
      />
      {invalid && (
        <FieldError id={errorId} className="mt-1.5">
          {error}
        </FieldError>
      )}
    </Field>
  );
}
