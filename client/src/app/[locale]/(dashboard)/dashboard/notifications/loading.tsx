import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  const t = useTranslations("Notifications");

  return (
    <DashboardShell
      activeItem="Dashboard"
      breadcrumbs={[{ label: t("title") }]}
      showViewToggle={false}
    >
      <div
        className="mx-auto w-full max-w-360 pb-10 pt-6"
        aria-busy="true"
        aria-label={t("loading")}
      >
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-7 h-10 w-full max-w-2xl" />
        <Skeleton className="mt-4 h-6 w-full max-w-xl" />
        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="mt-9 h-8 w-56" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
          </div>
          <Skeleton className="hidden h-80 rounded-2xl xl:block" />
        </div>
      </div>
    </DashboardShell>
  );
}
