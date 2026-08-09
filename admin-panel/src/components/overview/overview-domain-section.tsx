import Link from "next/link";
import { RefreshCw, SearchX } from "lucide-react";

import { OverviewItemMeta } from "@/components/overview/overview-item-meta";
import { OverviewSeverityBadge } from "@/components/overview/overview-severity-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OVERVIEW_SECTION_LOAD_STATE,
  type OverviewSectionType,
} from "@/lib/data/overview-data";

type OverviewDomainSectionProps = {
  section: OverviewSectionType;
  isRetrying?: boolean;
  onRetry?: () => void;
};

export function OverviewDomainSection({
  section,
  isRetrying = false,
  onRetry,
}: OverviewDomainSectionProps) {
  return (
    <section
      className="space-y-3"
      aria-labelledby={`overview-section-${section.id}`}
      aria-busy={isRetrying || undefined}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id={`overview-section-${section.id}`}
          className="text-base font-semibold tracking-tight"
        >
          {section.title}
        </h2>
        {section.loadState !== OVERVIEW_SECTION_LOAD_STATE.FAILED ? (
          <Link
            href={section.viewAllHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            مشاهده همه
          </Link>
        ) : null}
      </div>

      {isRetrying ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ) : null}

      {!isRetrying &&
      section.loadState === OVERVIEW_SECTION_LOAD_STATE.FAILED ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="text-sm text-destructive">
            {section.errorMessage ?? "بارگذاری این بخش ناموفق بود."}
          </p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              تلاش مجدد
            </Button>
          ) : null}
        </div>
      ) : null}

      {!isRetrying &&
      section.loadState === OVERVIEW_SECTION_LOAD_STATE.EMPTY ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          <SearchX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>مورد نیازمند توجهی در این بخش نیست.</p>
        </div>
      ) : null}

      {!isRetrying &&
      section.loadState === OVERVIEW_SECTION_LOAD_STATE.READY ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {section.items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <OverviewSeverityBadge severity={item.severity} />
                    <p className="font-medium text-foreground">{item.title}</p>
                  </div>
                  <OverviewItemMeta item={item} />
                </div>
                <span className="shrink-0 text-sm font-medium text-primary">
                  {item.nextHint}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
