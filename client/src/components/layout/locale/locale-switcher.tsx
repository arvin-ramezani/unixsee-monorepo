"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

import { getPathname, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Locale = "en" | "fa";

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "fa", label: "فا" },
];

export type LocaleSwitcherProps = {
  className?: string;
  textClassName?: string;
  activeTextClassName?: string;
  activeClassName?: string;
  onLocaleChange?: (locale: Locale) => void;
};

export default function LocaleSwitcher({
  className,
  textClassName,
  activeTextClassName,
  activeClassName,
  onLocaleChange,
}: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [isPending, setIsPending] = useState(false);

  const handleSwitch = (next: Locale) => {
    if (next === locale || isPending) return;
    setSelectedLocale(next);
    setIsPending(true);
    onLocaleChange?.(next);

    const search = window.location.search;
    const hash = window.location.hash;
    const localizedPathname = getPathname({
      href: pathname,
      locale: next,
    });

    // Full navigation avoids soft remount of ThemeProvider, which would
    // re-render next-themes' inline <script> on the client (React 19 warning).
    window.location.assign(`${localizedPathname}${search}${hash}`);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Language switcher"
      className={cn(
        "border-border bg-muted relative flex h-10 items-center rounded-md border p-0.5 py-1.5 text-xs font-medium",
        isPending && "pointer-events-none opacity-60",
        className,
      )}
    >
      {LOCALES.map(({ value, label }) => {
        const isActive = value === selectedLocale;

        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            onClick={() => handleSwitch(value)}
            className={cn(
              "focus-visible:ring-ring relative z-10 flex size-9.5 flex-1 items-center justify-center rounded-sm leading-px font-medium transition-colors duration-150 select-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",

              {
                "text-foreground bg-background": isActive,
                activeClassName: activeClassName && isActive,
                "text-muted-foreground hover:text-foreground": !isActive,
              },
              textClassName,
              isActive && activeTextClassName,
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
