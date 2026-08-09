import type { Formats } from "next-intl";

import type { Locale } from "@/i18n/routing";

export const applicationTimeZone = "UTC";

export function formatRelativeValue(
  locale: Locale,
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  style: Intl.RelativeTimeFormatStyle = "long",
) {
  return new Intl.RelativeTimeFormat(
    `${locale}-u-nu-${locale === "fa" ? "arabext" : "latn"}`,
    { numeric: "always", style },
  ).format(value, unit);
}

export function getFormats(locale: Locale): Formats {
  const isPersian = locale === "fa";

  return {
    number: {
      integer: {
        maximumFractionDigits: 0,
        numberingSystem: isPersian ? "arabext" : "latn",
      },
      decimal: {
        maximumFractionDigits: 1,
        numberingSystem: isPersian ? "arabext" : "latn",
      },
      precise: {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        numberingSystem: isPersian ? "arabext" : "latn",
      },
      compact: {
        notation: "compact",
        maximumFractionDigits: 0,
        numberingSystem: isPersian ? "arabext" : "latn",
      },
      percent: {
        style: "percent",
        maximumFractionDigits: 1,
        numberingSystem: isPersian ? "arabext" : "latn",
      },
      uptimePercent: {
        style: "percent",
        maximumFractionDigits: 3,
        numberingSystem: isPersian ? "arabext" : "latn",
      },
      currency: {
        style: "currency",
        currency: "USD",
        numberingSystem: isPersian ? "arabext" : "latn",
      },
    },
    dateTime: {
      shortDate: {
        year: "numeric",
        month: "short",
        day: "numeric",
        calendar: isPersian ? "persian" : "gregory",
        numberingSystem: isPersian ? "arabext" : "latn",
        timeZone: applicationTimeZone,
      },
      shortTime: {
        hour: "2-digit",
        minute: "2-digit",
        calendar: isPersian ? "persian" : "gregory",
        numberingSystem: isPersian ? "arabext" : "latn",
        timeZone: applicationTimeZone,
      },
      dateTime: {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        calendar: isPersian ? "persian" : "gregory",
        numberingSystem: isPersian ? "arabext" : "latn",
        timeZone: applicationTimeZone,
      },
      chartTime: {
        hour: "numeric",
        calendar: isPersian ? "persian" : "gregory",
        numberingSystem: isPersian ? "arabext" : "latn",
        timeZone: applicationTimeZone,
      },
      chartWeekday: {
        weekday: "short",
        calendar: isPersian ? "persian" : "gregory",
        numberingSystem: isPersian ? "arabext" : "latn",
        timeZone: applicationTimeZone,
      },
      chartDate: {
        month: "short",
        day: "numeric",
        calendar: isPersian ? "persian" : "gregory",
        numberingSystem: isPersian ? "arabext" : "latn",
        timeZone: applicationTimeZone,
      },
    },
  };
}
