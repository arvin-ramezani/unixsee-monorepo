import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TicketsManager } from "@/components/tickets/tickets-manager";
import { TicketsPageHeader } from "@/components/tickets/tickets-page-header";
import type { Locale } from "@/i18n/routing";
import { ticketRecords } from "@/lib/data/tickets/ticket-records";

interface TicketsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ state?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: Pick<TicketsPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.tickets");
  return { title: t("title"), description: t("description") };
}

export default async function TicketsPage({
  params,
  searchParams,
}: TicketsPageProps) {
  const { locale } = await params;
  const requestedState = (await searchParams).state;
  setRequestLocale(locale);
  const t = await getTranslations("Tickets");
  const stateValue = Array.isArray(requestedState)
    ? requestedState[0]
    : requestedState;
  const initialState =
    stateValue === "empty" || stateValue === "error" ? stateValue : "ready";

  return (
    <DashboardShell
      activeItem="Tickets"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <TicketsPageHeader />
      <TicketsManager
        tickets={initialState === "empty" ? [] : ticketRecords}
        initialState={initialState}
      />
    </DashboardShell>
  );
}
