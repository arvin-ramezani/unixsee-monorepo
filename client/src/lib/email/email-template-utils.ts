import type { Locale } from "@/i18n/routing";

export type EmailDirection = "ltr" | "rtl";
export type EmailTextAlign = "left" | "right";

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

export function renderMultilineText(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

export function getEmailDirection(locale: Locale): EmailDirection {
  return locale === "fa" ? "rtl" : "ltr";
}

export function getEmailTextAlign(locale: Locale): EmailTextAlign {
  return locale === "fa" ? "right" : "left";
}
