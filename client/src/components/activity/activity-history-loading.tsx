import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function FilterFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="border-border grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 gap-y-3 border-t px-4 py-5 first:border-t-0 sm:gap-x-4 sm:px-6 lg:grid-cols-[40px_minmax(0,1fr)_184px] lg:gap-x-5">
      <Skeleton className="size-10 rounded-full" />
      <div className="max-w-2xl space-y-2">
        <Skeleton className="h-4 w-4/5 max-w-md" />
        <Skeleton className="h-3 w-2/5 max-w-xs" />
      </div>
      <div className="col-span-2 ms-13 grid grid-cols-[auto_auto] items-center justify-start gap-x-2 gap-y-1.5 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:ms-0 lg:w-46 lg:self-center">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="col-span-2 h-4 w-24" />
      </div>
    </div>
  );
}

function DateGroupSkeleton({ rows }: { rows: number }) {
  return (
    <section className="border-border border-t first:border-t-0">
      <div className="bg-muted/35 px-4 py-2.5 sm:px-6">
        <Skeleton className="h-4 w-24" />
      </div>
      <div>
        {Array.from({ length: rows }, (_, index) => (
          <ActivityRowSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

/**
 * Loading chrome for `/dashboard/activities`.
 *
 * Mirrors the live activity history: page intro, filter bar (desktop grid /
 * mobile summary), date-grouped timeline rows, and load-more footer.
 */
export function ActivityHistoryLoading() {
  const t = useTranslations("ActivityHistory");

  return (
    <div className="w-full max-w-6xl" aria-busy="true" aria-label={t("loading")}>
      <header className="pt-6 pb-7 sm:pt-7">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
      </header>

      <Panel className="overflow-hidden">
        <div className="border-border flex min-h-17 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        <div className="border-border bg-muted/20 border-b px-4 py-4 sm:px-6">
          <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
            <FilterFieldSkeleton />
            <FilterFieldSkeleton />
            <FilterFieldSkeleton />
          </div>
          <Skeleton className="h-11 w-full rounded-lg md:hidden" />
        </div>

        <div>
          <DateGroupSkeleton rows={2} />
          <DateGroupSkeleton rows={2} />
          <DateGroupSkeleton rows={1} />
        </div>

        <footer className="border-border border-t px-4 py-5 sm:px-6">
          <Skeleton className="mx-auto h-11 w-48 rounded-lg" />
        </footer>
      </Panel>
    </div>
  );
}
