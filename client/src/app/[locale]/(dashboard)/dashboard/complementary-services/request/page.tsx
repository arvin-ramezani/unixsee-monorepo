import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RequestServiceAside } from "@/components/complementary-services/request-service-aside";
import { RequestServiceForm } from "@/components/complementary-services/request-service-form";
import ServicesQuickActions from "@/components/complementary-services/services-quick-actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { fetchComplementaryRequestFormData } from "@/lib/complementary-services/complementary-services-api";
import {
  catalogCodeToServiceType,
  type ComplementaryRequestFormData,
} from "@/lib/complementary-services/types";
import {
  serviceTypes,
  type ComplementaryServiceType,
} from "@/lib/data/complementary-services/complementary-services-data";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    service?: string | string[];
    website?: string | string[];
    state?: string | string[];
  }>;
}

const EMPTY_FORM_DATA: ComplementaryRequestFormData = {
  catalog: [],
  websites: [],
  requests: [],
};

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.requestComplementaryService");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RequestServicePage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ComplementaryServices");
  const query = await searchParams;
  const formResult = await fetchComplementaryRequestFormData();
  const formData = formResult.ok ? formResult.data : EMPTY_FORM_DATA;

  const serviceValue = Array.isArray(query.service)
    ? query.service[0]
    : query.service;
  const websiteValue = Array.isArray(query.website)
    ? query.website[0]
    : query.website;
  const stateValue = Array.isArray(query.state) ? query.state[0] : query.state;

  const initialService: ComplementaryServiceType | "" = serviceTypes.includes(
    serviceValue as ComplementaryServiceType,
  )
    ? (serviceValue as ComplementaryServiceType)
    : "";

  const initialWebsite = formData.websites.some(
    (item) => item.id === websiteValue,
  )
    ? websiteValue!
    : "";

  return (
    <DashboardShell
      activeItem="ComplementaryServices"
      breadcrumbs={[
        {
          label: t("title"),
          href: "/dashboard/complementary-services",
        },
        { label: t("form.pageTitle") },
      ]}
      searchPlaceholder={t("searchHeader")}
    >
      <div className="mx-auto w-full">
        <header className="py-7">
          <Link
            href="/dashboard/complementary-services"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("form.back")}
          </Link>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {t("form.pageTitle")}
          </h1>

          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
            {t("form.pageDescription")}
          </p>
        </header>

        <div className="grid items-start gap-6 pb-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-8">
          <ServicesQuickActions className="block xl:hidden" />

          <div className="min-w-0">
            <RequestServiceForm
              catalog={formData.catalog.filter((item) =>
                Boolean(catalogCodeToServiceType(item.code)),
              )}
              websites={formData.websites}
              requests={formData.requests}
              initialService={initialService}
              initialWebsite={initialWebsite}
              previewState={stateValue}
              loadError={!formResult.ok}
            />
          </div>

          <RequestServiceAside />
        </div>
      </div>
    </DashboardShell>
  );
}
