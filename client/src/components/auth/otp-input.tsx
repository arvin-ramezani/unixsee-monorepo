"use client";

import {
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OTP_LENGTH } from "@/lib/zod-schemas/auth-schemas";
import { cn } from "@/lib/utils";

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  length?: number;
  className?: string;
  autoFocus?: boolean;
};

function toDigits(value: string, length: number) {
  const cleaned = value.replace(/\D/g, "").slice(0, length);
  return Array.from({ length }, (_, index) => cleaned[index] ?? "");
}

export function OtpInput({
  value,
  onChange,
  error,
  disabled,
  length = OTP_LENGTH,
  className,
  autoFocus,
}: OtpInputProps) {
  const t = useTranslations("Auth.common");
  const groupId = useId();
  const errorId = `${groupId}-error`;
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = toDigits(value, length);
  const invalid = !!error;

  useEffect(() => {
    if (!autoFocus) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus]);

  function commit(nextDigits: string[]) {
    onChange(nextDigits.join("").slice(0, length));
  }

  function handleChange(index: number, nextValue: string) {
    const onlyDigits = nextValue.replace(/\D/g, "");
    if (!onlyDigits) {
      const next = [...digits];
      next[index] = "";
      commit(next);
      return;
    }

    if (onlyDigits.length > 1) {
      const next = [...digits];
      onlyDigits.split("").forEach((digit, offset) => {
        if (index + offset < length) {
          next[index + offset] = digit;
        }
      });
      commit(next);
      const focusIndex = Math.min(index + onlyDigits.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = onlyDigits;
    commit(next);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      commit(next);
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const next = toDigits(pasted, length);
    commit(next);
    const focusIndex = Math.min(pasted.length, length) - 1;
    inputsRef.current[Math.max(focusIndex, 0)]?.focus();
  }

  return (
    <Field data-invalid={invalid || undefined} className={cn(className)}>
      <FieldLabel id={`${groupId}-label`}>{t("otpLabel")}</FieldLabel>
      <p className="text-muted-foreground mt-1 text-xs">{t("otpHint")}</p>
      <div
        role="group"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={invalid ? errorId : undefined}
        dir="ltr"
        className="mt-3 flex justify-between gap-2"
      >
        {digits.map((digit, index) => (
          <Input
            key={`${groupId}-${index}`}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={length}
            value={digit}
            disabled={disabled}
            aria-label={`${t("otpLabel")} ${index + 1}`}
            aria-invalid={invalid || undefined}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className="h-12 min-h-11 w-11 px-0 text-center text-lg font-semibold md:text-lg"
          />
        ))}
      </div>
      {invalid && (
        <FieldError id={errorId} className="mt-1.5">
          {error}
        </FieldError>
      )}
    </Field>
  );
}
