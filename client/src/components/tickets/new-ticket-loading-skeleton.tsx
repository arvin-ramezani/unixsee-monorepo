import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function FieldSkeleton({
  controlClassName = "h-11 w-full rounded-xl",
}: {
  controlClassName?: string;
}) {
  return (
    <div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-1 h-3 w-48 max-w-full" />
      <Skeleton className={`mt-2 ${controlClassName}`} />
    </div>
  );
}

function PanelHeaderSkeleton() {
  return (
    <div className="border-border bg-muted/20 flex items-start gap-3 border-b px-5 py-5 sm:px-6">
      <Skeleton className="size-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-6 w-40 max-w-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
    </div>
  );
}

/**
 * Loading chrome for `/dashboard/tickets/new`.
 *
 * Mirrors the live create form: page intro, two panels (context + details),
 * and the submit/cancel footer.
 */
export function NewTicketLoadingSkeleton() {
  const t = useTranslations("Tickets.new");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <section className="py-7">
        <Skeleton className="mt-3 h-9 w-72 max-w-full" />
        <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
      </section>

      <div className="grid w-full items-start gap-5 pb-8 xl:grid-cols-2">
        <Panel className="min-w-0 self-start overflow-hidden">
          <PanelHeaderSkeleton />
          <div className="p-5 sm:p-6">
            <div className="3xl:grid-cols-2 mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <FieldSkeleton controlClassName="h-40 w-full rounded-xl" />
          </div>
        </Panel>

        <Panel className="min-w-0 overflow-hidden">
          <PanelHeaderSkeleton />
          <div className="space-y-6 p-5 sm:p-6">
            <FieldSkeleton controlClassName="h-40 w-full rounded-xl" />
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1 h-3 w-56 max-w-full" />
              <Skeleton className="mt-2 h-16 w-40 rounded-[12px]" />
            </div>
          </div>
          <div className="border-border bg-muted/10 flex flex-col gap-3 border-t px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
            <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
