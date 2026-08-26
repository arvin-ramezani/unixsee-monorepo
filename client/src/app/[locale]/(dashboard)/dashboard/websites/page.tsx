import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WebsitesManager } from "@/components/websites/websites-manager";
import type { Locale } from "@/i18n/routing";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapCustomerWebsite,
  type CustomerWebsiteDto,
  type WebsiteRecord,
} from "@/lib/websites-data";
import { DashboardButtonLink } from "../_components/common";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.websites");
  return { title: t("title"), description: t("description") };
}

export default async function WebsitesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Websites");

  let websites: WebsiteRecord[] = [];
  try {
    const response = await serverFetch<CustomerWebsiteDto[]>("/websites", {
      method: "GET",
    });
    if (response.success && response.data) {
      websites = response.data.map(mapCustomerWebsite);
    }
  } catch {
    // The inventory stays empty rather than presenting fixture Websites as real.
  }

  return (
    <DashboardShell
      activeItem="Websites"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <section className="flex min-h-30 -translate-y-1 flex-col justify-center gap-4 px-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[2rem] font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {t("description")}
          </p>
        </div>
        <DashboardButtonLink
          href="/dashboard/plans"
          aria-label={t("moreAddOptions")}
          size="xl"
        >
          <Plus aria-hidden="true" className="size-5" /> {t("addSite")}
        </DashboardButtonLink>
      </section>

      <WebsitesManager className="mt-8" websites={websites} />
    </DashboardShell>
  );
}
