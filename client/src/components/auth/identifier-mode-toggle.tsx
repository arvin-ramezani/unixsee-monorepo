"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { IdentifierMode } from "@/lib/zod-schemas/auth-schemas";
import { cn } from "@/lib/utils";

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
    <div
      role="group"
      aria-label={t("identifierMode")}
      className={cn(
        "bg-muted/70 border-border grid grid-cols-2 gap-1 rounded-lg border p-1",
        className,
      )}
    >
      <Button
        type="button"
        variant="plain"
        size="plain"
        disabled={disabled}
        aria-pressed={value === "phone"}
        onClick={() => onChange("phone")}
        className={cn(
          "h-10 min-h-11 rounded-md text-sm font-medium transition-colors",
          value === "phone"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("modePhone")}
      </Button>
      <Button
        type="button"
        variant="plain"
        size="plain"
        disabled={disabled}
        aria-pressed={value === "email"}
        onClick={() => onChange("email")}
        className={cn(
          "h-10 min-h-11 rounded-md text-sm font-medium transition-colors",
          value === "email"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("modeEmail")}
      </Button>
    </div>
  );
}
