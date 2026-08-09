import { ExternalLink } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  BackupBadge,
  StatusBadge,
  monogramStyles,
} from "@/components/websites/website-badges";
import { Link } from "@/i18n/navigation";
import type { WebsiteRecord } from "@/lib/websites-data";
import { cn } from "@/lib/utils";

/**
 * Grid presentation of a single website. Shares badges, monogram tones, and
 * copy with the table row so both views stay visually consistent. Pure
 * presentation — no data fetching or local state.
 */
export function WebsiteCard({ website }: { website: WebsiteRecord }) {
  const t = useTranslations("Websites");
  const common = useTranslations("Common");
  const format = useFormatter();

  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-5 transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full text-lg font-semibold",
            monogramStyles[website.tone],
          )}
        >
          {website.monogram}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">
            {website.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {common(`descriptions.${website.description}`)}
          </p>
        </div>
        <StatusBadge status={website.status} />
      </div>

      <Link
        href={`https://${website.domain}`}
        dir="ltr"
        className="mt-4 inline-flex items-center gap-2 truncate text-sm text-muted-foreground hover:text-link"
      >
        {website.domain}
        <ExternalLink
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
      </Link>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{t("table.plan")}</dt>
          <dd className="mt-1 font-medium">
            {common(`plans.${website.plan}`)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t("table.lastUpdated")}
          </dt>
          <dd className="mt-1 tabular-nums">
            <time dateTime={website.updatedAt}>
              {format.dateTime(new Date(website.updatedAt), "shortDate")}
            </time>
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <BackupBadge backup={website.backup} />
        <Link
          href={`/dashboard/websites/${website.id}`}
          className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-xs font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("table.manage")}
        </Link>
      </div>
    </article>
  );
}
