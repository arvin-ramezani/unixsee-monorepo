import { useTranslations } from "next-intl";

import { BillingLoadingSkeleton } from "@/components/billing/billing-loading-skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function BillingLoading() {
  const t = useTranslations("Billing");
  return (
    <DashboardShell activeItem="Billing" searchPlaceholder={t("searchHeader")}>
      <BillingLoadingSkeleton />
    </DashboardShell>
  );
}
