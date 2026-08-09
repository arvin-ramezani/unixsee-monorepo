import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseLocalizedStringToNumber(value: string): number {
  const persianDigits = [
    /۰/g,
    /۱/g,
    /۲/g,
    /۳/g,
    /۴/g,
    /۵/g,
    /۶/g,
    /۷/g,
    /۸/g,
    /۹/g,
  ];

  let normalized = value.trim();

  for (let i = 0; i < 10; i++) {
    normalized = normalized.replace(persianDigits[i], i.toString());
  }

  normalized = normalized.replace(/٫/g, ".");

  const parsed = Number.parseFloat(normalized);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatNumberByLocale(
  value: number,
  locale: "fa" | "en" = "fa",
): string {
  const languageTag = locale === "fa" ? "fa-IR" : "en-US";

  const formatter = new Intl.NumberFormat(languageTag, {
    useGrouping: false,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });

  return formatter.format(value);
}
