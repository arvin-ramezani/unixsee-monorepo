import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function StatusPanelSkeleton({ className }: { className?: string }) {
  return (
    <Panel className={className}>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <div className="mt-3 space-y-0.5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex h-10 items-center gap-3">
            <Skeleton className="size-[1.1rem] rounded-sm" />
            <Skeleton className="h-3.5 max-w-40 flex-1" />
            <Skeleton className="h-3.5 w-6" />
            <Skeleton className="ms-2 size-2 rounded-full" />
          </div>
        ))}
      </div>
      <div className="border-border mt-2 flex h-11 items-end justify-between border-t pt-4">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="size-3.5" />
      </div>
    </Panel>
  );
}

function WebsiteRowSkeleton() {
  return (
    <div className="border-border flex h-18.25 items-center gap-4 border-b px-4.75 last:border-b-0">
      <div className="flex min-w-[23%] flex-1 items-center gap-4">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32 max-w-full" />
          <Skeleton className="h-3 w-24 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-[19%] max-w-32" />
      <Skeleton className="h-7 w-[11%] max-w-20 rounded-md" />
      <Skeleton className="h-7 w-[13%] max-w-24 rounded-md" />
      <Skeleton className="h-7 w-[15%] max-w-24 rounded-md" />
      <div className="w-[13%] max-w-28 space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-9 w-16 shrink-0 rounded-lg" />
    </div>
  );
}

function WebsiteMobileCardSkeleton() {
  return (
    <article className="border-border rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-3 w-28 max-w-full" />
        </div>
        <Skeleton className="h-7 w-16 shrink-0 rounded-md" />
      </div>
      <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3.5 w-20" />
      </div>
    </article>
  );
}

function FeedItemSkeleton() {
  return (
    <div className="flex min-h-12 items-start gap-3 py-1 lg:items-center">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48 max-w-full" />
        <Skeleton className="h-3 w-40 max-w-full" />
      </div>
      <Skeleton className="h-3 w-10 shrink-0" />
    </div>
  );
}

function FeedCardSkeleton({
  itemCount,
  className,
}: {
  itemCount: number;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <Skeleton className="h-6 w-40" />
      <div className="mt-1 flex-1 space-y-1">
        {Array.from({ length: itemCount }, (_, index) => (
          <FeedItemSkeleton key={index} />
        ))}
      </div>
      <div className="border-border mt-2 flex h-9 items-end gap-3 border-t pt-3">
        <Skeleton className="h-3.5 w-40" />
      </div>
    </Panel>
  );
}

/**
 * Loading chrome for `/dashboard`.
 *
 * Mirrors the live overview:
 * - hero + optional authorization banner slot
 * - mobile website-status panel (`< lg`)
 * - websites table (`lg+`) / list cards (`< lg`)
 * - notifications + activities feeds
 * - right rail status (`lg+`) + help card
 */
export function DashboardLoadingSkeleton() {
  const t = useTranslations("Dashboard.states");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <section className="flex min-h-27 -translate-y-1 flex-col justify-center gap-4 md:flex-row md:items-center md:justify-between">
        <div className="ps-2">
          <Skeleton className="mt-8 h-8 w-64 max-w-full" />
          <Skeleton className="mt-3 h-4 w-[28rem] max-w-full" />
        </div>
        <Skeleton className="mt-8 h-11.5 w-36 max-w-full shrink-0 rounded-lg md:w-fit" />
      </section>

      <div className="mt-4">
        <div className="border-warning/40 bg-warning/10 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="mt-0.5 size-5 shrink-0 rounded-sm" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-3/4 max-w-sm" />
            </div>
          </div>
          <Skeleton className="h-11 w-40 shrink-0 rounded-lg" />
        </div>
      </div>

      <div className="mt-8 grid items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_288px]">
        <div className="min-w-0 space-y-4.5">
          <StatusPanelSkeleton className="h-74.25 p-4.75 lg:hidden" />

          <Panel className="overflow-hidden">
            <div className="flex h-15.5 items-center justify-between px-4.75">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>

            <div className="hidden lg:block">
              <div className="border-border flex h-10 items-center gap-4 border-b px-4.75">
                <Skeleton className="h-3 w-[23%] max-w-20" />
                <Skeleton className="h-3 w-[19%] max-w-28" />
                <Skeleton className="h-3 w-[11%] max-w-12" />
                <Skeleton className="h-3 w-[13%] max-w-14" />
                <Skeleton className="h-3 w-[15%] max-w-20" />
                <Skeleton className="h-3 w-[13%] max-w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              {Array.from({ length: 4 }, (_, index) => (
                <WebsiteRowSkeleton key={index} />
              ))}
            </div>

            <div className="space-y-2 px-3 pb-3 lg:hidden">
              {Array.from({ length: 4 }, (_, index) => (
                <WebsiteMobileCardSkeleton key={index} />
              ))}
            </div>

            <div className="border-border flex h-13 items-center justify-between border-t px-5">
              <Skeleton className="h-3.5 w-44 max-w-[55%]" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2 2xl:grid-cols-[414px_minmax(0,1fr)]">
            <FeedCardSkeleton
              itemCount={4}
              className="flex flex-col px-4.75 pt-4 pb-5"
            />
            <FeedCardSkeleton
              itemCount={4}
              className="flex h-77.5 flex-col px-4.75 pt-4 pb-5"
            />
          </div>
        </div>

        <aside className="sticky top-28 space-y-4.5 lg:grid lg:grid-cols-2 lg:gap-4.5 xl:grid-cols-1 xl:space-y-4.5">
          <StatusPanelSkeleton className="hidden h-74.25 p-4.75 lg:block" />
          <Panel className="relative overflow-hidden p-4.75 lg:h-57.25">
            <div className="-translate-y-1 space-y-3 md:grid md:grid-cols-2 md:items-center md:space-y-0 lg:grid-cols-1 lg:space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3.5 w-40 max-w-full" />
                <Skeleton className="h-3.5 w-28 max-w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-11 w-full max-w-48 rounded-lg" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
