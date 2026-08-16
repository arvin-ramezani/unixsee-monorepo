import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function ScopeItemSkeleton() {
  return (
    <li className="flex items-start gap-3">
      <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </li>
  );
}

function ActivityItemSkeleton() {
  return (
    <li className="relative ps-8 pb-6 last:pb-0">
      <Skeleton className="absolute inset-s-0 top-1.5 size-3.5 rounded-full" />
      <Skeleton className="h-4 w-48 max-w-full" />
      <Skeleton className="mt-2 h-3 w-36" />
    </li>
  );
}

/**
 * Loading chrome for `/dashboard/complementary-services/[serviceId]`.
 *
 * Mirrors the live details view: back link, header + actions, usage/progress
 * + scope grid, and activity timeline.
 */
export function ComplementaryServiceDetailsLoadingSkeleton() {
  const t = useTranslations("ComplementaryServices.detail");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <header className="py-7">
        <Skeleton className="h-5 w-52" />
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-9 w-72 max-w-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-44 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:justify-end">
            <Skeleton className="h-11 w-full rounded-lg md:w-48" />
            <Skeleton className="h-11 w-full rounded-lg md:w-44" />
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
        <Panel className="p-5 sm:p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />
          <div className="mt-7 space-y-3">
            <div className="flex items-end justify-between gap-2">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-56 max-w-full" />
          <ul className="mt-5 grid gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <ScopeItemSkeleton key={index} />
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
        <Panel className="p-5 sm:p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />
          <ol className="before:bg-border relative mt-6 space-y-0 before:absolute before:inset-y-2 before:inset-s-[7px] before:w-px">
            {Array.from({ length: 5 }, (_, index) => (
              <ActivityItemSkeleton key={index} />
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
