import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TicketDetailsView } from "@/components/tickets/ticket-details-view";
import type { Locale } from "@/i18n/routing";
import { getTicket } from "@/lib/data/tickets/ticket-records";

interface TicketPageProps {
  params: Promise<{ locale: Locale; ticketId: string }>;
}

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  const { locale, ticketId } = await params;
  setRequestLocale(locale);
  const ticket = getTicket(ticketId);
  if (!ticket) return {};
  const t = await getTranslations("Metadata.ticketDetails");
  return {
    title: t("title", { number: ticket.number }),
    description: t("description", { number: ticket.number }),
  };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { locale, ticketId } = await params;
  setRequestLocale(locale);
  const ticket = getTicket(ticketId);
  if (!ticket) notFound();
  const t = await getTranslations("Tickets");

  return (
    <DashboardShell
      activeItem="Tickets"
      breadcrumbs={[
        { label: t("title"), href: "/dashboard/tickets" },
        { label: `#${ticket.number}` },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <TicketDetailsView ticket={ticket} />
    </DashboardShell>
  );
}
