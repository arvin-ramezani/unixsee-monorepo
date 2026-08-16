import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WebsitesLoadingSkeleton } from "@/components/websites/websites-loading-skeleton";

export default function WebsitesLoading() {
  const t = useTranslations("Websites");

  return (
    <DashboardShell
      activeItem="Websites"
      searchPlaceholder={t("searchHeader")}
    >
      <WebsitesLoadingSkeleton />
    </DashboardShell>
  );
}
