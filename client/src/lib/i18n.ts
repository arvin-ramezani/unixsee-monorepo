// src/lib/i18n.ts
export const locales = ["en", "fa"] as const;
export type AppLocale = (typeof locales)[number];

export function getDirection(locale: AppLocale) {
  return locale === "fa" ? "rtl" : "ltr";
}
