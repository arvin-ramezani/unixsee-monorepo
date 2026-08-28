"use client";

import { useTranslations } from "next-intl";

import { SlidingPillToggle } from "@/components/common/sliding-pill-toggle";
import type { IdentifierMode } from "@/lib/zod-schemas/auth-schemas";

export type IdentifierModeToggleProps = {
  value: IdentifierMode;
  onChange: (mode: IdentifierMode) => void;
  disabled?: boolean;
  className?: string;
};

export function IdentifierModeToggle({
  value,
  onChange,
  disabled,
  className,
}: IdentifierModeToggleProps) {
  const t = useTranslations("Auth.common");

  return (
    <SlidingPillToggle
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      ariaLabel={t("identifierMode")}
      options={[
        { value: "phone", label: t("modePhone") },
        { value: "email", label: t("modeEmail") },
      ]}
    />
  );
}
