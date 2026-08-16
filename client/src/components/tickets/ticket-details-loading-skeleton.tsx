import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function MessageSkeleton({ support = false }: { support?: boolean }) {
  return (
    <article
      className={`px-5 py-5 sm:px-6 ${support ? "bg-muted/30" : ""}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-28" />
      </header>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </article>
  );
}

/**
 * Loading chrome for `/dashboard/tickets/[ticketId]`.
 *
 * Mirrors the live details view: back link, header meta + actions,
 * conversation thread + sticky summary rail, reply composer.
 */
export function TicketDetailsLoadingSkeleton() {
  const t = useTranslations("Tickets.detail");

  return (
    <div className="py-7" aria-busy="true" aria-label={t("loading")}>
      <Skeleton className="h-5 w-36" />

      <header className="border-border mt-3 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-4 w-20" />
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel className="overflow-hidden">
          <div className="border-border border-b px-5 py-4 sm:px-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
          </div>
          <div className="divide-border divide-y">
            <MessageSkeleton />
            <MessageSkeleton support />
            <MessageSkeleton />
          </div>
        </Panel>

        <aside className="self-start xl:sticky xl:top-28">
          <Panel className="p-5">
            <Skeleton className="h-6 w-36" />
            <dl className="mt-4 space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </dl>
          </Panel>
        </aside>
      </div>

      <Panel className="mt-6 p-5 sm:p-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        <Skeleton className="mt-5 min-h-24 w-full rounded-lg" />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Skeleton className="h-4 w-52 max-w-full" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
        </div>
      </Panel>
    </div>
  );
}
