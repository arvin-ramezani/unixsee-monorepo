import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BillingHub } from "@/components/billing/billing-hub";
import { BillingPageHeader } from "@/components/billing/billing-page-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Locale } from "@/i18n/routing";
import { fetchCustomerBillingHub } from "@/lib/billing/billing-api";
import type {
  BillingHubKindFilter,
  BillingItemKind,
} from "@/lib/billing/types";

interface BillingPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    kind?: string | string[];
    websiteId?: string | string[];
    state?: string | string[];
  }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseKindFilter(value: string | undefined): BillingHubKindFilter {
  if (value === "MANAGED_PLAN" || value === "COMPLEMENTARY_SERVICE") {
    return value;
  }
  return "all";
}

export async function generateMetadata({
  params,
}: Pick<BillingPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.billing");
  return { title: t("title"), description: t("description") };
}

export default async function BillingPage({
  params,
  searchParams,
}: BillingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Billing");
  const query = await searchParams;

  const stateValue = firstParam(query.state);
  const kindFilter = parseKindFilter(firstParam(query.kind));
  const websiteId = firstParam(query.websiteId);
  const apiKind: BillingItemKind | undefined =
    kindFilter === "all" ? undefined : kindFilter;

  if (stateValue === "empty") {
    return (
      <DashboardShell
        activeItem="Billing"
        breadcrumbs={[{ label: t("title") }]}
        searchPlaceholder={t("searchHeader")}
      >
        <BillingPageHeader />
        <BillingHub
          items={[]}
          initialState="empty"
          kindFilter={kindFilter}
          websiteId={websiteId}
        />
      </DashboardShell>
    );
  }

  if (stateValue === "error") {
    return (
      <DashboardShell
        activeItem="Billing"
        breadcrumbs={[{ label: t("title") }]}
        searchPlaceholder={t("searchHeader")}
      >
        <BillingPageHeader />
        <BillingHub
          items={[]}
          initialState="error"
          kindFilter={kindFilter}
          websiteId={websiteId}
        />
      </DashboardShell>
    );
  }

  const result = await fetchCustomerBillingHub({
    kind: apiKind,
    websiteId,
  });

  return (
    <DashboardShell
      activeItem="Billing"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <BillingPageHeader />
      <BillingHub
        items={result.ok ? result.data.items : []}
        initialState={result.ok ? "ready" : "error"}
        kindFilter={kindFilter}
        websiteId={websiteId}
      />
    </DashboardShell>
  );
}
