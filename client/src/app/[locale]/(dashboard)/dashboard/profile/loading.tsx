import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileLoadingSkeleton } from "@/components/profile/profile-loading-skeleton";

export default function ProfileLoading() {
  const t = useTranslations("Profile");

  return (
    <DashboardShell
      activeItem="Profile"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <ProfileLoadingSkeleton />
    </DashboardShell>
  );
}
