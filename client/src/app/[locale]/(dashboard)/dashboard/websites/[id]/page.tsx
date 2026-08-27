import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WebsiteDetailsView } from "@/components/websites/website-details-view";
import type { Locale } from "@/i18n/routing";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapBackendWebsiteToServiceDetails,
  mapCustomerBillingToPanel,
  type CustomerWebsiteBillingResponse,
  websiteServiceDetailsIds,
} from "@/lib/data/websites/website-service-details";

interface WebsiteDetailsPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export function generateStaticParams() {
  return websiteServiceDetailsIds.map((id) => ({ id }));
}

/** Shape returned by the backend GET /websites/:id endpoint. */
type BackendWebsiteDetail = {
  id: string;
  domain: string;
  displayName?: string | null;
  managementCoverage?: string;
  lastIsUp?: boolean | null;
  plan?: { code?: string; nameEn?: string } | null;
  wordpressAdminUrl?: string | null;
  wordpressAdminUsername?: string | null;
  wordpressAdminPassword?: string | null;
  directAdminUrl?: string | null;
  directAdminUsername?: string | null;
  directAdminPassword?: string | null;
  vpsNode?: { server?: { controlPanelUrl?: string | null } | null } | null;
  ssl?: unknown;
};

async function resolveWebsite(id: string) {
  try {
    const [websiteResponse, billingResponse] = await Promise.all([
      serverFetch<BackendWebsiteDetail>(`/websites/${id}`, { method: "GET" }),
      serverFetch<CustomerWebsiteBillingResponse>(`/websites/${id}/billing`, {
        method: "GET",
      }),
    ]);

    if (!websiteResponse.success || !websiteResponse.data) {
      return null;
    }

    const mapped = mapBackendWebsiteToServiceDetails(websiteResponse.data);
    const billing = billingResponse.success
      ? mapCustomerBillingToPanel(billingResponse.data)
      : null;

    return {
      ...mapped,
      billing,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: WebsiteDetailsPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const website = await resolveWebsite(id);
  if (!website) notFound();

  const t = await getTranslations("Metadata.websiteDetails");
  return {
    title: t("title", { name: website.name }),
    description: t("description", { name: website.name }),
  };
}

export default async function WebsiteDetailsPage({
  params,
}: WebsiteDetailsPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const website = await resolveWebsite(id);
  if (!website) notFound();

  const t = await getTranslations("WebsiteServiceDetails");
  const websites = await getTranslations("Websites");

  return (
    <DashboardShell
      activeItem="Websites"
      breadcrumbs={[
        { label: websites("title"), href: "/dashboard/websites" },
        { label: website.name },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <WebsiteDetailsView website={website} />
    </DashboardShell>
  );
}
