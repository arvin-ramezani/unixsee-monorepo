import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NewTicketForm } from "@/components/tickets/new-ticket-form";
import type { Locale } from "@/i18n/routing";
import {
  fetchTicketServices,
  fetchTicketWebsites,
} from "@/lib/tickets/tickets-api";

interface NewTicketPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ website?: string | string[] }>;
}

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
  searchParams,
}: NewTicketPageProps) {
  const { locale } = await params;
  const websiteParam = (await searchParams).website;
  setRequestLocale(locale);
  const t = await getTranslations("Tickets");

  const [servicesResult, websitesResult] = await Promise.all([
    fetchTicketServices(),
    fetchTicketWebsites(),
  ]);

  const initialWebsiteId = Array.isArray(websiteParam)
    ? websiteParam[0]
    : websiteParam;
  const websites = websitesResult.ok ? websitesResult.data : [];
  const resolvedWebsiteId =
    initialWebsiteId && websites.some((website) => website.id === initialWebsiteId)
      ? initialWebsiteId
      : undefined;

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

      <NewTicketForm
        services={servicesResult.ok ? servicesResult.data : []}
        websites={websites}
        initialWebsiteId={resolvedWebsiteId}
        loadError={!servicesResult.ok ? "unavailable" : undefined}
      />
    </DashboardShell>
  );
}
