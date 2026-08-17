import { useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
 * Loading chrome for `/dashboard/unixsee-messages/[messageId]`.
 *
 * Mirrors the live detail view: message panel (status, title, body, links,
 * attachments) plus sticky quick-actions rail.
 */
export function UnixseeMessageDetailLoadingSkeleton() {
  const t = useTranslations("UnixseeMessages");

  return (
    <div className="space-y-5" aria-busy="true" aria-label={t("loadingDetail")}>
      <div className="grid w-full max-w-5xl gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <QuickActionsAsideSkeleton className="xl:hidden" />

        <Panel className="min-w-0 max-w-2xl space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>

          <Skeleton className="h-4 w-40" />
        </Panel>

        <QuickActionsAsideSkeleton className="hidden self-start xl:sticky xl:top-24 xl:block" />
      </div>
    </div>
  );
}
