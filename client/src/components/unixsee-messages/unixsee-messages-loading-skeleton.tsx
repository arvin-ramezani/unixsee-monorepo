import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function MessageRowSkeleton() {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-3.5 w-full max-w-md" />
          <Skeleton className="h-3.5 w-4/5 max-w-sm" />
          <Skeleton className="mt-1 h-3 w-36" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

function QuickActionsAsideSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <Panel className="p-5">
        <Skeleton className="h-6 w-36" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </Panel>
    </div>
  );
}

/**
 * Loading chrome for `/dashboard/unixsee-messages`.
 *
 * Mirrors the live inbox: title + subtitle, max-width message list column,
 * and sticky quick-actions rail (tickets / websites).
 */
export function UnixseeMessagesLoadingSkeleton() {
  const t = useTranslations("UnixseeMessages");

  return (
    <div className="mt-4 space-y-4" aria-busy="true" aria-label={t("loading")}>
      <div className="max-w-2xl space-y-2">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <QuickActionsAsideSkeleton className="xl:hidden" />

        <div className="max-w-2xl min-w-0 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <MessageRowSkeleton key={index} />
          ))}
        </div>

        <QuickActionsAsideSkeleton className="hidden self-start xl:sticky xl:top-24 xl:block" />
      </div>
    </div>
  );
}
