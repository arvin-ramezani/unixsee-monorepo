import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function WebsiteTableRowSkeleton() {
  return (
    <div className="border-border flex h-18 items-center gap-4 border-b px-5.5 xl:gap-5">
      <div className="flex min-w-[22%] flex-1 items-center gap-5">
        <Skeleton className="size-9.5 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-3 w-28 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-[15%] max-w-36" />
      <Skeleton className="h-4 w-[10%] max-w-20" />
      <Skeleton className="h-8 w-[14%] max-w-28 rounded-full" />
      <Skeleton className="h-8 w-[14%] max-w-28 rounded-full" />
      <div className="w-[13%] max-w-28 space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-9 w-[12%] max-w-24 rounded-lg" />
    </div>
  );
}

function WebsiteMobileCardSkeleton() {
  return (
    <article className="border-border rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 max-w-full" />
          <Skeleton className="h-3 w-32 max-w-full" />
        </div>
        <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
      </div>
      <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </article>
  );
}

/**
 * Loading chrome for `/dashboard/websites`.
 *
 * Matches the default table view:
 * - page header (title, description, add CTA)
 * - manager panel (title, status tabs, search + filters)
 * - desktop table rows (`lg+`)
 * - mobile/tablet list cards (`< lg`)
 * - footer summary + pagination
 */
export function WebsitesLoadingSkeleton() {
  const t = useTranslations("Websites.states");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <section className="flex min-h-30 -translate-y-1 flex-col justify-center gap-4 px-1.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-9 w-40 max-w-full" />
          <Skeleton className="mt-3 h-4 w-md max-w-full" />
        </div>
        <Skeleton className="h-11.5 w-39.5 max-w-full shrink-0 rounded-lg md:ms-auto" />
      </section>

      <Panel className="mt-8 overflow-hidden">
        <div className="flex h-16 items-center px-6">
          <Skeleton className="h-7 w-40" />
        </div>

        <div className="border-border no-scrollbar flex gap-3 overflow-x-auto border-b px-5 pb-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-md" />
          ))}
        </div>

        <div className="border-border grid gap-4.5 border-b px-5.5 py-4.25 md:grid-cols-2 lg:grid-cols-[minmax(16rem,265px)_minmax(6rem,7rem)_minmax(6rem,7rem)]">
          <Skeleton className="h-11 w-full rounded-lg md:col-span-2 lg:col-span-1" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="hidden lg:block">
          <div className="border-border flex h-11.25 items-center gap-4 border-b px-7 xl:gap-5">
            <Skeleton className="h-3 w-[22%] max-w-20" />
            <Skeleton className="h-3 w-[15%] max-w-24" />
            <Skeleton className="h-3 w-[10%] max-w-12" />
            <Skeleton className="h-3 w-[14%] max-w-14" />
            <Skeleton className="h-3 w-[14%] max-w-16" />
            <Skeleton className="h-3 w-[13%] max-w-20" />
            <Skeleton className="h-3 w-[12%] max-w-14" />
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <WebsiteTableRowSkeleton key={index} />
          ))}
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <WebsiteMobileCardSkeleton key={index} />
          ))}
        </div>

        <div className="flex h-15 items-center justify-between px-6">
          <Skeleton className="h-4 w-44 max-w-[55%]" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </Panel>
    </div>
  );
}
