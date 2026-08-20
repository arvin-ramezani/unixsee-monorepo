"use client";

import { useId } from "react";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
};

export function TextField({
  value,
  onChange,
  error,
  disabled,
  label,
  placeholder,
  autoComplete = "name",
  className,
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const invalid = !!error;

  return (
    <Field data-invalid={invalid || undefined} className={cn(className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="text"
        autoComplete={autoComplete}
        enterKeyHint="next"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
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
