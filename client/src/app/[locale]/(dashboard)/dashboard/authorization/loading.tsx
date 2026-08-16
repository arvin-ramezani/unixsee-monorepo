import { useTranslations } from "next-intl";

import { AuthorizationLoadingSkeleton } from "@/components/authorization/authorization-loading-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function AuthorizationLoading() {
  const t = useTranslations("Authorization");

  return (
    <DashboardShell
      activeItem="Profile"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <AuthorizationLoadingSkeleton />
    </DashboardShell>
  );
}
