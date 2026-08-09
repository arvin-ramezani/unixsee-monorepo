import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  ComplementaryServicesHeader,
  ComplementaryServicesManager,
  type ComplementaryServicesState,
  type ComplementaryServicesTab,
} from "@/components/complementary-services/complementary-services-manager";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Locale } from "@/i18n/routing";
import {
  complementaryServices,
  consultationRequests,
  serviceWebsites,
} from "@/lib/data/complementary-services/complementary-services-data";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    tab?: string | string[];
    state?: string | string[];
    theme?: string | string[];
  }>;
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.complementaryServices");
  return { title: t("title"), description: t("description") };
}

export default async function ComplementaryServicesPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ComplementaryServices");

  const query = await searchParams;

  const tabValue = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const stateValue = Array.isArray(query.state) ? query.state[0] : query.state;
  const themeValue = Array.isArray(query.theme) ? query.theme[0] : query.theme;

  const initialTab: ComplementaryServicesTab =
    tabValue === "requests" || tabValue === "history" ? tabValue : "active";
  const initialState: ComplementaryServicesState =
    stateValue === "loading" || stateValue === "error" || stateValue === "empty"
      ? stateValue
      : "ready";

  return (
    <DashboardShell
      activeItem="ComplementaryServices"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
      previewTheme={themeValue === "dark" ? "dark" : "light"}
    >
      <ComplementaryServicesHeader />
      <ComplementaryServicesManager
        services={complementaryServices}
        requests={consultationRequests}
        websites={serviceWebsites}
        initialTab={initialTab}
        initialState={initialState}
      />
    </DashboardShell>
  );
}
