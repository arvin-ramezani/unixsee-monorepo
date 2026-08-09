import { useTranslations } from "next-intl";

import { ActivityHistoryLoading } from "@/components/activity/activity-history-loading";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function LoadingActivities() {
  const t = useTranslations("ActivityHistory");
  return (
    <DashboardShell
      activeItem="Activities"
      breadcrumbs={[{ label: t("title") }]}
    >
      <ActivityHistoryLoading />
    </DashboardShell>
  );
}
