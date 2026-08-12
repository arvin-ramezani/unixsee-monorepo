import type { Metadata } from "next";
import { Check, CheckCircle2, PhoneCall } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { fetchPublishedPlanById } from "@/lib/plans/plans-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.plansSuccess");
  return { title: t("title"), description: t("description") };
}

export default async function PlansSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ plan?: string; request?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { plan: planId } = await searchParams;

  const plan = planId ? await fetchPublishedPlanById(planId, locale) : null;
  const t = await getTranslations("PlansSuccess");
  const plans = await getTranslations("Plans");
  const navigation = await getTranslations("Navigation");
  const steps = [t("step1"), t("step2"), t("step3")];

  return (
    <DashboardShell
      activeItem="Websites"
      breadcrumbs={[
        { label: navigation("websites"), href: "/dashboard/websites" },
        { label: plans("title"), href: "/dashboard/plans" },
        { label: t("title") },
      ]}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center sm:py-16">
        <span className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 aria-hidden="true" className="size-9" />
        </span>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {t("description")}
        </p>

        {plan && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm">
            <span className="text-muted-foreground">{t("planLabel")}:</span>
            <span className="font-medium">{plan.name}</span>
          </p>
        )}

        <Panel className="mt-8 w-full p-5 text-start sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <PhoneCall aria-hidden="true" className="size-4 text-primary" />
            {t("nextTitle")}
          </h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-center gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <Check aria-hidden="true" className="size-3.5" />
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard/websites">{t("backToWebsites")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/plans">{t("viewPlans")}</Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
