import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TicketDetailsView } from "@/components/tickets/ticket-details-view";
import type { Locale } from "@/i18n/routing";
import { fetchTicketDetail } from "@/lib/tickets/tickets-api";

interface TicketPageProps {
  params: Promise<{ locale: Locale; ticketId: string }>;
}

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  const { locale, ticketId } = await params;
  setRequestLocale(locale);
  const result = await fetchTicketDetail(ticketId);
  if (!result.ok) return {};
  const t = await getTranslations("Metadata.ticketDetails");
  return {
    title: t("title", { number: result.data.number }),
    description: t("description", { number: result.data.number }),
  };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { locale, ticketId } = await params;
  setRequestLocale(locale);
  const result = await fetchTicketDetail(ticketId);
  if (!result.ok) {
    if (result.error.key === "notFound" || result.error.key === "forbidden") {
      notFound();
    }
    notFound();
  }

  const t = await getTranslations("Tickets");

  return (
    <DashboardShell
      activeItem="Tickets"
      breadcrumbs={[
        { label: t("title"), href: "/dashboard/tickets" },
        { label: `#${result.data.number}` },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <TicketDetailsView ticket={result.data} />
    </DashboardShell>
  );
}
