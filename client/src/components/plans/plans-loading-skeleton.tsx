import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function PlanCardSkeleton({ recommended = false }: { recommended?: boolean }) {
  return (
    <article
      className={cn(
        "relative flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm",
        recommended && "border-primary ring-1 ring-primary",
      )}
    >
      {recommended ? (
        <Skeleton className="absolute -top-3 inset-s-1/2 h-5 w-24 -translate-x-1/2 rounded-full" />
      ) : null}
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </article>
  );
}

/**
 * Loading chrome for `/dashboard/plans`.
 *
 * Mirrors the live plans catalog: page intro and a responsive grid of plan
 * cards (recommended accent on the second slot).
 */
export function PlansLoadingSkeleton() {
  const t = useTranslations("Plans");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <section className="flex min-h-27 -translate-y-1 flex-col justify-center gap-1.5 px-1.5">
        <Skeleton className="h-9 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlanCardSkeleton />
        <PlanCardSkeleton recommended />
        <PlanCardSkeleton />
        <PlanCardSkeleton />
      </div>
    </div>
  );
}
