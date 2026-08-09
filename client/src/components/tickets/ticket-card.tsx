import { useLocale, useTranslations } from "next-intl";

import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { formatRelativeValue } from "@/i18n/formats";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { TicketRecord } from "@/lib/data/tickets/ticket-records";

const fixtureNow = new Date("2026-07-19T15:40:00Z");

function relativeActivity(ticket: TicketRecord, locale: Locale) {
  const diffMinutes = Math.round(
    (new Date(ticket.lastActivityAt).getTime() - fixtureNow.getTime()) / 60000,
  );
  if (Math.abs(diffMinutes) < 60)
    return formatRelativeValue(locale, diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24)
    return formatRelativeValue(locale, diffHours, "hour");
  return formatRelativeValue(locale, Math.round(diffHours / 24), "day");
}

/**
 * Grid presentation of a single ticket. Mirrors the mobile card in
 * TicketsManager — same fields, same badge, same link — but extracted as a
 * reusable component for the grid view.
 */
export function TicketCard({ ticket }: { ticket: TicketRecord }) {
  const t = useTranslations("Tickets");
  const locale = useLocale() as Locale;

  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-5 transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {ticket.unread ? (
              <span
                className="size-2 shrink-0 rounded-full bg-warning"
                aria-label={t("unread")}
              />
            ) : null}
            <h3 className="truncate font-semibold text-foreground">
              <Link
                href={`/dashboard/tickets/${ticket.id}`}
                className="hover:text-link focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t(`fixtures.subjects.${ticket.subjectKey}`)}
              </Link>
            </h3>
          </div>
          <p dir="ltr" className="mt-1 text-start text-xs text-muted-foreground">
            #{ticket.number}
          </p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{t("table.service")}</dt>
          <dd className="mt-1 font-medium">{t(`services.${ticket.service}`)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("table.website")}</dt>
          <dd className="mt-1 font-medium">
            {ticket.website?.name ?? t("notApplicable")}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs leading-5 text-muted-foreground">
          {relativeActivity(ticket, locale)}
          <br />
          {t(`activity.${ticket.lastActor}`)}
        </p>
        <Link
          href={`/dashboard/tickets/${ticket.id}`}
          className="inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("viewTicket")}
        </Link>
      </div>
    </article>
  );
}
