import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NewTicketForm } from "@/components/tickets/new-ticket-form";
import type { Locale } from "@/i18n/routing";
import {
  ticketServices,
  ticketWebsites,
} from "@/lib/data/tickets/ticket-records";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.newTicket");
  return { title: t("title"), description: t("description") };
}

export default async function NewTicketPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Tickets");

  return (
    <DashboardShell
      activeItem="Tickets"
      breadcrumbs={[
        { label: t("title"), href: "/dashboard/tickets" },
        { label: t("new.title") },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <section className="py-7">
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {t("new.title")}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
          {t("new.pageDescription")}
        </p>
      </section>

      <NewTicketForm services={ticketServices} websites={ticketWebsites} />
    </DashboardShell>
  );
}
