import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function ActiveServiceCardSkeleton() {
  return (
    <Panel className="flex min-h-72 flex-col p-5 sm:p-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-48 max-w-full" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
        <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="border-border mt-auto flex items-center justify-between border-t pt-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-4" />
      </div>
    </Panel>
  );
}

/**
 * Loading chrome for `/dashboard/complementary-services`.
 *
 * Mirrors the default active-services view: page header, tabs, filters,
 * and the 2-column service card grid.
 */
export function ComplementaryServicesLoadingSkeleton() {
  const t = useTranslations("ComplementaryServices.states");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <header className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />
        </div>
        <Skeleton className="h-11 w-full shrink-0 rounded-lg md:w-48" />
      </header>

      <section className="pb-8">
        <div className="border-border no-scrollbar flex gap-1 overflow-x-auto border-b py-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-28 shrink-0 rounded-md" />
          ))}
        </div>

        <div className="mt-5">
          <div className="hidden items-end gap-3 md:flex">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-11 w-48 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-11 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-11 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg md:hidden" />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <ActiveServiceCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
