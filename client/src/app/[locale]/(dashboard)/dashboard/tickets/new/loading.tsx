import { useTranslations } from "next-intl";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NewTicketLoadingSkeleton } from "@/components/tickets/new-ticket-loading-skeleton";

export default function NewTicketLoading() {
  const t = useTranslations("Tickets");

  return (
    <DashboardShell
      activeItem="Tickets"
      breadcrumbs={[
        { label: t("title"), href: "/dashboard/tickets" },
        { label: t("new.title") },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <NewTicketLoadingSkeleton />
    </DashboardShell>
  );
}
