"use client";

import { useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type AuthDividerProps = {
  className?: string;
};

export function AuthDivider({ className }: AuthDividerProps) {
  const t = useTranslations("Auth.common");

  return (
    <div
      className={cn("text-muted-foreground flex items-center gap-3", className)}
      role="separator"
      aria-label={t("or")}
    >
      <Separator className="flex-1" />
      <span className="text-xs font-medium tracking-wide uppercase">
        {t("or")}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
