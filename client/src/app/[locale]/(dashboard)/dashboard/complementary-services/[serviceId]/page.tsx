import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ServiceDetailsView } from "@/components/complementary-services/service-details";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Locale } from "@/i18n/routing";
import { getComplementaryService } from "@/lib/data/complementary-services/complementary-services-data";

interface PageProps {
  params: Promise<{ locale: Locale; serviceId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, serviceId } = await params;
  setRequestLocale(locale);
  const service = getComplementaryService(serviceId);
  if (!service) return {};
  const t = await getTranslations("Metadata.complementaryServiceDetails");
  return { title: t("title"), description: t("description") };
}

export default async function ComplementaryServiceDetailsPage({
  params,
}: PageProps) {
  const { locale, serviceId } = await params;
  setRequestLocale(locale);
  const service = getComplementaryService(serviceId);
  if (!service) notFound();
  const t = await getTranslations("ComplementaryServices");

  return (
    <DashboardShell
      activeItem="ComplementaryServices"
      breadcrumbs={[
        {
          label: t("title"),
          href: "/dashboard/complementary-services",
        },
        { label: t(`fixtures.titles.${service.titleKey}`) },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <ServiceDetailsView service={service} />
    </DashboardShell>
  );
}
