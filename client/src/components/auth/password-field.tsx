"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { AnimatedEyeIcon } from "@/components/common/animated-icons/animated-eye-icon";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  autoComplete?: "new-password" | "current-password";
  className?: string;
};

export function PasswordField({
  value,
  onChange,
  error,
  disabled,
  label,
  autoComplete = "new-password",
  className,
}: PasswordFieldProps) {
  const t = useTranslations("Auth.common");
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const invalid = !!error;

  return (
    <Field data-invalid={invalid || undefined} className={cn(className)}>
      <FieldLabel htmlFor={id}>{label ?? t("passwordLabel")}</FieldLabel>
      <div className="relative mt-1.5">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 min-h-11 pe-12 text-base md:text-base"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="text-muted-foreground hover:text-foreground absolute end-1 top-1/2 size-9 min-h-11 min-w-11 -translate-y-1/2"
        >
          <AnimatedEyeIcon aria-hidden="true" off={visible} />
        </Button>
      </div>
      {invalid && (
        <FieldError id={errorId} className="mt-1.5">
          {error}
        </FieldError>
      )}
    </Field>
  );
}
