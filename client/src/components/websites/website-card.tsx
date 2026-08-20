import { ExternalLink } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
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
    <article className="border-border bg-background hover:bg-muted/30 flex flex-col rounded-xl border p-5 transition-colors">
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
          <h3 className="text-foreground truncate font-semibold">
            {website.name}
          </h3>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {common(`descriptions.${website.description}`)}
          </p>
        </div>
        <StatusBadge status={website.status} />
      </div>

      <Link
        href={`https://${website.domain}`}
        dir="ltr"
        className="text-muted-foreground hover:text-link mt-4 inline-flex w-fit items-center gap-2 truncate text-sm"
      >
        {website.domain}
        <ExternalLink
          aria-hidden="true"
          className="text-muted-foreground size-3.5 shrink-0"
        />
      </Link>

      <dl className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">{t("table.plan")}</dt>
          <dd className="mt-1 font-medium">
            {common(`plans.${website.plan}`)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">
            {t("table.lastUpdated")}
          </dt>
          <dd className="mt-1 tabular-nums">
            <time dateTime={website.updatedAt}>
              {format.dateTime(new Date(website.updatedAt), "shortDate")}
            </time>
          </dd>
        </div>
      </dl>

      <div className="border-border mt-4 flex items-center justify-end border-t pt-4">
        <Link
          href={`/dashboard/websites/${website.id}`}
          className="border-border hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center rounded-lg border px-4 text-xs font-medium focus-visible:ring-2"
        >
          {t("table.manage")}
        </Link>
      </div>
    </article>
  );
}
