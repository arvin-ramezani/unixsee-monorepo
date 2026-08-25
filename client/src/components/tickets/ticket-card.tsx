import { useLocale, useTranslations } from "next-intl";

import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatTicketRelativeActivity } from "@/lib/tickets/relative-activity";
import type { TicketListItem } from "@/lib/tickets/types";

/**
 * Grid presentation of a single ticket. Mirrors the mobile card in
 * TicketsManager — same fields, same badge, same link — but extracted as a
 * reusable component for the grid view.
 */
export function TicketCard({ ticket }: { ticket: TicketListItem }) {
  const t = useTranslations("Tickets");
  const locale = useLocale() as Locale;

  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-5 transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {ticket.unread && (
              <span
                className="size-2 shrink-0 rounded-full bg-warning"
                aria-label={t("unread")}
              />
            )}
            <h3 className="truncate font-semibold text-foreground">
              <Link
                href={`/dashboard/tickets/${ticket.id}`}
                className="hover:text-link focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ticket.subject}
              </Link>
            </h3>
          </div>
          <p
            dir="ltr"
            className="text-muted-foreground mt-1 w-fit text-start text-xs"
          >
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
          {formatTicketRelativeActivity(ticket.lastActivityAt, locale)}
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
