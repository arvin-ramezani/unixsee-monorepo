import { useTranslations } from "next-intl";

import { RequestServiceLoadingSkeleton } from "@/components/complementary-services/request-service-loading-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function RequestServiceLoading() {
  const t = useTranslations("ComplementaryServices");

  return (
    <DashboardShell
      activeItem="ComplementaryServices"
      breadcrumbs={[
        {
          label: t("title"),
          href: "/dashboard/complementary-services",
        },
        { label: t("form.pageTitle") },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <RequestServiceLoadingSkeleton />
    </DashboardShell>
  );
}
