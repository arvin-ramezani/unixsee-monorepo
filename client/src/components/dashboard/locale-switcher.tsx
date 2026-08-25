"use client";

import { useLocale, useTranslations } from "next-intl";

import { getPathname, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Header");
  const nextLocale = locale === "fa" ? "en" : "fa";
  const destination = nextLocale === "fa" ? t("persian") : t("english");

  function switchLocale() {
    const search = window.location.search;
    const hash = window.location.hash;
    const localizedPathname = getPathname({
      href: pathname,
      locale: nextLocale,
    });
    const href = `${localizedPathname}${search}${hash}`;

    window.location.assign(href);
  }

  return (
    <Button
      type="button"
      variant="plain"
      size="plain"
      onClick={switchLocale}
      aria-label={t("changeLanguage", { language: destination })}
      dir="ltr"
      className="border-border bg-background hover:bg-muted dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-link/12 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9.75 w-22 min-w-22.5 shrink-0 items-center justify-center gap-1 rounded-lg border p-1 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <span
        lang="fa"
        dir="rtl"
        aria-current={locale === "fa" ? "true" : undefined}
        className={cn(
          "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5",
          locale === "fa"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground",
        )}
      >
        {/* eslint-disable-next-line no-restricted-syntax -- Persian language endonym; must render in native script regardless of active locale. */}
        {"فا"}
      </span>
      <span aria-hidden="true" className="text-muted-foreground/60">
        /
      </span>
      <span
        lang="en"
        dir="ltr"
        aria-current={locale === "en" ? "true" : undefined}
        className={cn(
          "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 font-normal",
          locale === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground",
        )}
      >
        EN
      </span>
    </Button>
  );
}
