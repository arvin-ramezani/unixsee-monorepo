import { CalendarClock, CreditCard, Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function SummaryCardSkeleton() {
  return (
    <div className="border-border rounded-lg border p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-7 w-12" />
    </div>
  );
}

function BillingRowSkeleton() {
  return (
    <div className="border-border flex flex-col gap-4 border-b px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-48 max-w-full" />
        <Skeleton className="h-3 w-36 max-w-full" />
      </div>
      <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

/**
 * Loading chrome for `/dashboard/billing`.
 * Mirrors header, summary strip, kind tabs, and list rows.
 */
export function BillingLoadingSkeleton() {
  const t = useTranslations("Billing.states");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <section className="flex min-h-30 -translate-y-1 flex-col justify-center gap-4 px-1.5">
        <Skeleton className="h-9 w-40 max-w-full" />
        <Skeleton className="h-4 w-[32rem] max-w-full" />
      </section>

      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>

      <Panel className="mt-6 overflow-hidden">
        <div className="border-border flex min-h-14 items-center gap-2 border-b px-5 sm:px-6">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="hidden items-center gap-3 px-6 py-4 lg:flex">
          <CreditCard
            aria-hidden="true"
            className="text-muted-foreground size-4"
          />
          <Layers3
            aria-hidden="true"
            className="text-muted-foreground size-4"
          />
          <CalendarClock
            aria-hidden="true"
            className="text-muted-foreground size-4"
          />
        </div>
        <BillingRowSkeleton />
        <BillingRowSkeleton />
        <BillingRowSkeleton />
      </Panel>

      <Panel className="mt-6 p-5 sm:p-6">
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="mt-3 h-10 w-40 rounded-lg" />
      </Panel>
    </div>
  );
}
