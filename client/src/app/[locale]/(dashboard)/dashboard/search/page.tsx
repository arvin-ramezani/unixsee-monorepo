import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GlobalSearchResults } from "@/components/dashboard/global-search";
import type { Locale } from "@/i18n/routing";

interface SearchPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: Pick<SearchPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.search");
  return { title: t("title"), description: t("description") };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const requestedQuery = (await searchParams).q;
  setRequestLocale(locale);
  const t = await getTranslations("Header.globalSearch");
  const query = Array.isArray(requestedQuery)
    ? (requestedQuery[0] ?? "")
    : (requestedQuery ?? "");

  return (
    <DashboardShell
      activeItem="Dashboard"
      breadcrumbs={[{ label: t("allResults.title") }]}
      showViewToggle={false}
    >
      <GlobalSearchResults query={query} />
    </DashboardShell>
  );
}
