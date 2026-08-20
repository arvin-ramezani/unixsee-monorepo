import { useTranslations } from "next-intl";

import { ComplementaryServicesLoadingSkeleton } from "@/components/complementary-services/complementary-services-loading-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function ComplementaryServicesLoading() {
  const t = useTranslations("ComplementaryServices");

  return (
    <DashboardShell
      activeItem="ComplementaryServices"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <ComplementaryServicesLoadingSkeleton />
    </DashboardShell>
  );
}
