import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TicketDetailsLoadingSkeleton } from "@/components/tickets/ticket-details-loading-skeleton";

export default function TicketDetailsLoading() {
  const t = useTranslations("Tickets");

  return (
    <DashboardShell
      activeItem="Tickets"
      breadcrumbs={[{ label: t("title"), href: "/dashboard/tickets" }]}
      searchPlaceholder={t("searchHeader")}
    >
      <TicketDetailsLoadingSkeleton />
    </DashboardShell>
  );
}
