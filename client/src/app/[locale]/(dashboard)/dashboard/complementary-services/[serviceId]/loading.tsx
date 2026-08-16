import { useTranslations } from "next-intl";

import { ComplementaryServiceDetailsLoadingSkeleton } from "@/components/complementary-services/complementary-service-details-loading-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function ComplementaryServiceDetailsLoading() {
  const t = useTranslations("ComplementaryServices");

  return (
    <DashboardShell
      activeItem="ComplementaryServices"
      breadcrumbs={[
        {
          label: t("title"),
          href: "/dashboard/complementary-services",
        },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <ComplementaryServiceDetailsLoadingSkeleton />
    </DashboardShell>
  );
}
