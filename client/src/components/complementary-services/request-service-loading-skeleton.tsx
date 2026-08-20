import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function QuickActionsSkeleton({ className }: { className?: string }) {
  return (
    <Panel className={cn("p-5", className)}>
      <Skeleton className="h-6 w-36" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    </Panel>
  );
}

function RadioOptionSkeleton() {
  return (
    <div className="border-border flex min-h-12 items-center gap-3 rounded-lg border px-3">
      <Skeleton className="size-4 shrink-0 rounded-full" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

/**
 * Loading chrome for `/dashboard/complementary-services/request`.
 *
 * Mirrors the live request page: back link + intro, form panel fields,
 * submit actions, and the sticky aside (quick actions + help).
 */
export function RequestServiceLoadingSkeleton() {
  const t = useTranslations("ComplementaryServices.form");

  return (
    <div className="mx-auto w-full" aria-busy="true" aria-label={t("loading")}>
      <header className="py-7">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="mt-3 h-9 w-72 max-w-full" />
        <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
      </header>

      <div className="grid items-start gap-6 pb-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-8">
        <QuickActionsSkeleton className="block xl:hidden" />

        <div className="min-w-0">
          <Panel className="p-5 sm:p-6">
            <div className="grid gap-6">
              <div>
                <Skeleton className="h-4 w-20" />
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, index) => (
                    <RadioOptionSkeleton key={index} />
                  ))}
                </div>
              </div>

              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-11 w-full rounded-lg" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-32" />
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <RadioOptionSkeleton key={index} />
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-1 h-11 w-full rounded-lg" />
              </div>

              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-36 w-full rounded-xl" />
                <div className="mt-1.5 flex justify-between gap-4">
                  <Skeleton className="h-3 w-48 max-w-[70%]" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-1 h-3 w-64 max-w-full" />
                <Skeleton className="mt-3 h-16 w-44 rounded-[12px]" />
              </div>
            </div>
          </Panel>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-start">
            <Skeleton className="h-11 w-full rounded-lg sm:w-56" />
            <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
          </div>
        </div>

        <aside className="grid gap-5 xl:sticky xl:top-24">
          <QuickActionsSkeleton className="hidden xl:block" />
          <Panel className="flex flex-col p-5">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="mt-4 h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
            <Skeleton className="mt-5 h-11 w-full rounded-lg sm:ms-auto sm:w-40 xl:w-full" />
          </Panel>
        </aside>
      </div>
    </div>
  );
}
