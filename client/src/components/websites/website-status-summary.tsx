import { BellRing, CircleCheck, Clock3, Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import {
  AvailabilityIcon,
  availabilityStyles,
} from "@/components/websites/website-details-shared";
import { formatRelativeValue } from "@/i18n/formats";
import type { Locale } from "@/i18n/routing";
import type { WebsiteServiceDetails } from "@/lib/data/websites/website-service-details";
import { cn } from "@/lib/utils";

/**
 * Compact status band. Communicates the three spec questions through hierarchy
 * rather than literal labels: availability answers "is it working?", the issue
 * chip answers "is anything wrong?". It deliberately renders NO action button —
 * the next action lives once, in context (alert cards or Quick Actions).
 */
export function WebsiteStatusSummary({
  website,
}: {
  website: WebsiteServiceDetails;
}) {
  const t = useTranslations("WebsiteServiceDetails");
  const locale = useLocale() as Locale;
  const isExternal = website.managementCoverage !== "UNIXSEE_MANAGED";

  if (isExternal) {
    return (
      <Panel
        aria-labelledby="status-summary-heading"
        className="flex flex-col items-center justify-center gap-3 p-5 text-center sm:flex-row sm:items-center sm:justify-start sm:text-start sm:p-6"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 [&>svg]:size-5">
          <Info aria-hidden="true" className="text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <h2 id="status-summary-heading" className="text-lg font-semibold">
            {t("common.externalHosting")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t("availability.externalHosted.summary")}
          </p>
        </div>
      </Panel>
    );
  }

  const issueCount = (website.alerts ?? []).length;
  const hasIssues = issueCount > 0;

  const relativeCheck = website.lastChecked
    ? formatRelativeValue(locale, website.lastChecked.value, website.lastChecked.unit)
    : null;

  const statusSummary =
    website.availability === "unavailable"
      ? t("availability.unavailable.summary", {
          code: website.latestCheckCode ?? "HTTP 503",
        })
      : t(`availability.${website.availability ?? "unknown"}.summary`);

  return (
    <Panel
      aria-labelledby="status-summary-heading"
      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl border [&>svg]:size-5",
            availabilityStyles[website.availability ?? "unknown"],
          )}
        >
          <AvailabilityIcon status={website.availability ?? "unknown"} />
        </span>
        <div className="min-w-0">
          <h2 id="status-summary-heading" className="text-lg font-semibold">
            {t(`availability.${website.availability ?? "unknown"}.title`)}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {statusSummary}
          </p>
          <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
            <Clock3 aria-hidden="true" className="size-3.5" />
            {relativeCheck ? t("header.lastChecked", { relative: relativeCheck }) : t("common.noData")}
            {website.latestCheckCode && (
              <span dir="ltr" className="text-foreground font-mono">
                {website.latestCheckCode}
              </span>
            )}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-2 text-sm font-medium sm:self-center",
          hasIssues
            ? "border-warning/40 bg-warning/10 text-warning-foreground dark:text-warning"
            : "border-success/30 bg-success/10 text-success-foreground dark:text-success",
        )}
      >
        {hasIssues ? (
          <BellRing aria-hidden="true" className="size-4" />
        ) : (
          <CircleCheck aria-hidden="true" className="size-4" />
        )}
        {hasIssues
          ? t("health.issueCount", { count: issueCount })
          : t("health.noIssues")}
      </div>
    </Panel>
  );
}
