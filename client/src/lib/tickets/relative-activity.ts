import { formatRelativeValue } from "@/i18n/formats";
import type { Locale } from "@/i18n/routing";

export function formatTicketRelativeActivity(
  lastActivityAt: string,
  locale: Locale,
  now: Date = new Date(),
): string {
  const diffMinutes = Math.round(
    (new Date(lastActivityAt).getTime() - now.getTime()) / 60_000,
  );
  if (Math.abs(diffMinutes) < 60) {
    return formatRelativeValue(locale, diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatRelativeValue(locale, diffHours, "hour");
  }
  return formatRelativeValue(locale, Math.round(diffHours / 24), "day");
}
