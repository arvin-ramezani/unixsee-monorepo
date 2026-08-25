import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WebsitesManager } from "@/components/websites/websites-manager";
import type { Locale } from "@/i18n/routing";
import { serverFetch } from "@/lib/api/server-fetch";
import type { WebsitePlan, WebsiteRecord } from "@/lib/websites-data";
import { DashboardButtonLink } from "../_components/common";

type NestWebsite = {
  id: string;
  domain: string;
  displayName: string | null;
  managementCoverage:
    "UNIXSEE_MANAGED" | "EXTERNAL_INFRASTRUCTURE" | "UNCLASSIFIED";
  lastIsUp: boolean | null;
  updatedAt: string;
  plan?: { code: string; nameEn: string } | null;
};

function mapPlan(code: string | undefined): WebsitePlan {
  const normalized = code?.toUpperCase() ?? "";
  if (normalized.includes("PEAK")) return "premium";
  if (normalized.includes("PRO")) return "pro";
  if (normalized.includes("BUSINESS")) return "business";
  if (normalized.includes("DEDICATED")) return "dedicatedPlan";
  return "starter";
}

function mapWebsite(website: NestWebsite): WebsiteRecord {
  const name = website.displayName?.trim() || website.domain;
  return {
    id: website.id,
    name,
    description:
      website.managementCoverage === "UNIXSEE_MANAGED" ? "ecommerce" : "agency",
    domain: website.domain,
    monogram: name.slice(0, 1).toUpperCase(),
    tone: "blue",
    plan: mapPlan(website.plan?.code),
    status:
      website.lastIsUp === true
        ? "online"
        : website.lastIsUp === false
          ? "needsAttention"
          : "setupPending",
    backup: "scheduled",
    updatedAt: website.updatedAt,
    managementCoverage: website.managementCoverage,
  };
}

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
    const response = await serverFetch<NestWebsite[]>("/websites", {
      method: "GET",
    });
    if (response.success && response.data) {
      websites = response.data.map(mapWebsite);
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
