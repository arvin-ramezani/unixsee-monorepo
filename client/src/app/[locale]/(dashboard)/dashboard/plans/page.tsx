import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import PlansList from "@/components/plans/plans-list";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.plans");
  return { title: t("title"), description: t("description") };
}

export default async function PlansPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Plans");
  const navigation = await getTranslations("Navigation");

  return (
    <DashboardShell
      activeItem="Websites"
      breadcrumbs={[
        { label: navigation("websites"), href: "/dashboard/websites" },
        { label: t("title") },
      ]}
    >
      <section className="flex min-h-27 -translate-y-1 flex-col justify-center gap-1.5 px-1.5">
        <h1 className="text-[2rem] font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </section>

      <PlansList className="[&_article]:border" />
    </DashboardShell>
  );
}
