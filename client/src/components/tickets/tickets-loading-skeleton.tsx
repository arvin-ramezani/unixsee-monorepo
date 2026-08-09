import { useTranslations } from "next-intl";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export function TicketsLoadingSkeleton() {
  const t = useTranslations("Tickets.states");

  return (
    <div aria-busy="true" aria-label={t("loading")}>
      <div className="flex min-h-[120px] flex-col justify-center px-1.5">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-4 w-[30rem] max-w-full" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="p-6">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="flex gap-3 border-b border-border px-5 pb-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24" />
          ))}
        </div>
        <div className="grid gap-3 border-b border-border p-5 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="grid h-[78px] grid-cols-5 items-center gap-5 border-b border-border px-6"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
