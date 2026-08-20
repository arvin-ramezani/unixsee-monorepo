import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-11 w-full rounded-lg" />
    </div>
  );
}

function SecurityCardSkeleton() {
  return (
    <section className="border-border rounded-xl border p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="size-11 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg sm:w-32" />
      </div>
    </section>
  );
}

/**
 * Loading chrome for `/dashboard/profile`.
 *
 * Mirrors the live profile page: intro, authorization link card, personal
 * information panel (avatar + fields), and security cards.
 */
export function ProfileLoadingSkeleton() {
  const t = useTranslations("Profile");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <header className="py-8">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </header>

      <Panel className="mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
      </Panel>

      <Panel className="mt-4 p-5 sm:p-6">
        <div className="border-border border-b pb-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
          <Skeleton className="mt-2 h-3 w-56 max-w-full" />
        </div>

        <div className="mt-6 flex flex-wrap items-stretch gap-7 xl:gap-8">
          <div className="border-border bg-muted/30 flex w-full shrink-0 items-center justify-center rounded-xl border p-4 lg:w-80">
            <div className="flex flex-col items-center gap-3 py-2">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>

          <div className="min-w-[min(100%,42rem)] flex-[1_1_42rem] 2xl:max-w-240">
            <div className="flex flex-wrap gap-x-5 gap-y-5">
              <FieldSkeleton className="min-w-0 basis-full sm:min-w-64 sm:flex-[1_1_calc(50%-0.625rem)]" />
              <FieldSkeleton className="min-w-0 basis-full sm:min-w-64 sm:flex-[1_1_calc(50%-0.625rem)]" />
              <FieldSkeleton className="min-w-0 basis-full sm:min-w-64 sm:flex-[1_1_30rem]" />
              <div className="w-full shrink-0 sm:w-72">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-2 h-11 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-border mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
        </div>
      </Panel>

      <section className="mt-8">
        <div className="mb-4 space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          <SecurityCardSkeleton />
          <SecurityCardSkeleton />
        </div>
      </section>
    </div>
  );
}
