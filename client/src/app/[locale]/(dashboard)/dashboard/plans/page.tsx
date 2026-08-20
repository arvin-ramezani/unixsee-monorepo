import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardPlanCard } from "@/components/plans/dashboard-plan-card";
import type { Locale } from "@/i18n/routing";
import { fetchPublishedPlans } from "@/lib/plans/plans-api";

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
  const plansResult = await fetchPublishedPlans(locale);

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

      {!plansResult.ok ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {t("loadError")}
        </p>
      ) : plansResult.plans.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plansResult.plans.map((plan, index) => (
            <DashboardPlanCard
              key={plan.id}
              plan={plan}
              recommended={index === 1}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
