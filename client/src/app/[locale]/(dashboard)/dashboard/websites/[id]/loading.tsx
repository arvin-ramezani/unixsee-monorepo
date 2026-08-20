import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WebsiteDetailsLoadingSkeleton } from "@/components/websites/website-details-loading-skeleton";

export default function WebsiteDetailsLoading() {
  const t = useTranslations("WebsiteServiceDetails");

  return (
    <DashboardShell activeItem="Websites" searchPlaceholder={t("searchHeader")}>
      <WebsiteDetailsLoadingSkeleton />
    </DashboardShell>
  );
}
