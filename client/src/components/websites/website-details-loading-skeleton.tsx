import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";

function DetailRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="border-border mt-5 divide-y border-y">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 py-3 sm:grid sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
        >
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-28 sm:ms-auto sm:w-36" />
        </div>
      ))}
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="size-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-40 max-w-full" />
        <Skeleton className="h-3.5 w-64 max-w-full" />
      </div>
    </div>
  );
}

/**
 * Loading chrome for `/dashboard/websites/[id]`.
 *
 * Mirrors the live details view:
 * - identity header
 * - status summary band
 * - optional alerts slot
 * - quick-action cards (1 → 3 cols)
 * - software / traffic / support + service / billing two-column stack
 */
export function WebsiteDetailsLoadingSkeleton() {
  const t = useTranslations("WebsiteServiceDetails");

  return (
    <div
      className="mx-auto w-full pb-4"
      aria-busy="true"
      aria-label={t("loading")}
    >
      <header className="flex flex-col gap-5 py-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Skeleton className="size-14 shrink-0 rounded-xl sm:size-16" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-8 w-48 max-w-full sm:h-9 sm:w-64" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-36 max-w-full" />
              <Skeleton className="hidden h-3 w-2 sm:block" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
            <Skeleton className="mt-3 h-4 w-56 max-w-full" />
          </div>
        </div>
      </header>

      <div className="space-y-5 sm:space-y-6">
        <Panel className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-44 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
              <Skeleton className="h-3.5 w-48 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 shrink-0 self-start rounded-full sm:self-center" />
        </Panel>

        <section>
          <div className="mb-4 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="border-border rounded-lg border px-4 py-4 sm:px-5"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="size-5 shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-48 max-w-full" />
                    <Skeleton className="h-4 w-full max-w-lg" />
                    <Skeleton className="h-3.5 w-40" />
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                      <Skeleton className="h-10 w-full rounded-lg sm:w-32" />
                      <Skeleton className="h-10 w-full rounded-lg sm:w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Panel className="p-5 sm:p-6">
          <SectionHeadingSkeleton />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton
                key={index}
                className="min-h-20 w-full rounded-lg"
              />
            ))}
          </div>
        </Panel>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)] lg:gap-6">
          <div className="space-y-5 sm:space-y-6">
            <Panel className="p-5 sm:p-6">
              <SectionHeadingSkeleton />
              <DetailRowsSkeleton rows={3} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="border-border bg-muted/35 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                </div>
                <div className="border-border bg-muted/35 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel className="p-5 sm:p-6">
              <SectionHeadingSkeleton />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={index}
                    className="border-border bg-muted/35 rounded-lg border p-4"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-3 h-9 w-16" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-40 max-w-full" />
                  <Skeleton className="h-4 w-72 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-11 w-full rounded-lg md:w-40" />
            </Panel>
          </div>

          <aside className="space-y-5 sm:space-y-6">
            <Panel className="p-5 sm:p-6">
              <SectionHeadingSkeleton />
              <DetailRowsSkeleton rows={4} />
            </Panel>

            <Panel className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-36 max-w-full" />
                  <Skeleton className="h-3.5 w-48 max-w-full" />
                </div>
              </div>
              <DetailRowsSkeleton rows={4} />
              <Skeleton className="mt-5 h-11 w-full rounded-lg" />
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  );
}
