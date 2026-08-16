import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PlansLoadingSkeleton } from "@/components/plans/plans-loading-skeleton";

export default function PlansLoading() {
  const t = useTranslations("Plans");
  const navigation = useTranslations("Navigation");

  return (
    <DashboardShell
      activeItem="Websites"
      breadcrumbs={[
        { label: navigation("websites"), href: "/dashboard/websites" },
        { label: t("title") },
      ]}
    >
      <PlansLoadingSkeleton />
    </DashboardShell>
  );
}
