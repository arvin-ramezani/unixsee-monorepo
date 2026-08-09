import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fa"],
  defaultLocale: "fa",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
    sameSite: "lax",
  },
  // hreflang alternate links → good for SEO (tells Google both versions exist)
  alternateLinks: true,
});

export type Locale = (typeof routing.locales)[number];
