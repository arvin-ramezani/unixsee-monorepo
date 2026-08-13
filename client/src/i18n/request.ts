import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import en from "@/messages/en.json";
import fa from "@/messages/fa.json";

import { routing } from "./routing";
import { applicationTimeZone, getFormats } from "./formats";

const messagesByLocale = {
  en,
  fa,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    formats: getFormats(locale),
    messages: messagesByLocale[locale],
    timeZone: applicationTimeZone,
  };
});
