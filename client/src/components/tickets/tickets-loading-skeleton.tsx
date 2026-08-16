import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function TicketTableRowSkeleton() {
  return (
    <div className="border-border flex h-19.5 items-center gap-4 border-b px-6">
      <div className="flex min-w-[30%] flex-1 items-center gap-3">
        <Skeleton className="size-2 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-[16%] max-w-28" />
      <Skeleton className="h-4 w-[14%] max-w-24" />
      <Skeleton className="h-8 w-[15%] max-w-28 rounded-full" />
      <div className="w-[15%] max-w-28 space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-9 w-[10%] max-w-24 rounded-lg" />
    </div>
  );
}

function TicketMobileCardSkeleton() {
  return (
    <article className="border-border rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
      </div>
      <div className="border-border mt-4 grid grid-cols-2 gap-4 border-y py-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-24 shrink-0 rounded-lg" />
      </div>
    </article>
  );
}

/**
 * Loading chrome for `/dashboard/tickets`.
 *
 * Mirrors the live page:
 * - page header (title + new-ticket CTA)
 * - manager panel (title, status tabs, search + filters)
 * - desktop table rows (`lg+`)
 * - mobile/tablet list cards (`< lg`)
 * - footer summary + pagination
 */
export function TicketsLoadingSkeleton() {
  const t = useTranslations("Tickets.states");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <section className="flex min-h-30 -translate-y-1 flex-col justify-center gap-4 px-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-9 w-36 max-w-full" />
          <Skeleton className="mt-3 h-4 w-[28rem] max-w-full" />
        </div>
        <Skeleton className="min-h-12 w-36 max-w-full shrink-0 self-start rounded-lg sm:self-auto" />
      </section>

      <Panel className="mt-8 overflow-hidden">
        <div className="flex min-h-16 items-center px-5 sm:px-6">
          <Skeleton className="h-7 w-36" />
        </div>

        <div className="border-border no-scrollbar flex gap-2 overflow-x-auto border-b px-4 py-2 sm:px-5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-md" />
          ))}
        </div>

        <div className="border-border border-b p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(130px,170px))]">
            <Skeleton className="h-11 w-full rounded-lg" />
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                className="hidden h-11 w-full rounded-lg lg:block"
              />
            ))}
          </div>
          <Skeleton className="mt-3 h-10 w-full rounded-lg lg:hidden" />
        </div>

        <div className="hidden lg:block">
          <div className="border-border flex h-12 items-center gap-4 border-b px-6">
            <Skeleton className="h-3 w-[30%] max-w-20" />
            <Skeleton className="h-3 w-[16%] max-w-16" />
            <Skeleton className="h-3 w-[14%] max-w-16" />
            <Skeleton className="h-3 w-[15%] max-w-14" />
            <Skeleton className="h-3 w-[15%] max-w-16" />
            <Skeleton className="h-3 w-[10%] max-w-12" />
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <TicketTableRowSkeleton key={index} />
          ))}
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <TicketMobileCardSkeleton key={index} />
          ))}
        </div>

        <footer className="border-border flex min-h-15 items-center justify-between gap-4 border-t px-5 sm:px-6">
          <Skeleton className="h-4 w-40 max-w-[55%]" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </footer>
      </Panel>
    </div>
  );
}
