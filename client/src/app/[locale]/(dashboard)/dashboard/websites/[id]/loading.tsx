import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function WebsiteDetailsLoading() {
  const t = useTranslations("WebsiteServiceDetails");

  return (
    <DashboardShell activeItem="Websites" searchPlaceholder={t("searchHeader")}>
      <div
        className="mx-auto w-full py-6 sm:py-8"
        aria-busy="true"
        aria-label={t("loading")}
      >
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 shrink-0 rounded-xl sm:size-16" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            <Skeleton className="mt-2 h-4 w-52 max-w-full" />
          </div>
        </div>

        <div className="mt-8 space-y-5 sm:space-y-6">
          <Skeleton className="h-64 w-full rounded-xl lg:h-48" />
          <Skeleton className="h-52 w-full rounded-xl" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)] lg:gap-6">
            <div className="space-y-5">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-5">
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
