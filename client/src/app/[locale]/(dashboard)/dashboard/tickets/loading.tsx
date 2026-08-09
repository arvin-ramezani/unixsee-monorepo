import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TicketsLoadingSkeleton } from "@/components/tickets/tickets-loading-skeleton";

export default function TicketsLoading() {
  const t = useTranslations("Tickets");
  return (
    <DashboardShell activeItem="Tickets" searchPlaceholder={t("searchHeader")}>
      <TicketsLoadingSkeleton />
    </DashboardShell>
  );
}
