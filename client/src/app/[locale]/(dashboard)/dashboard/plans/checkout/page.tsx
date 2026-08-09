import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "@/components/dashboard/panel";
import { CheckoutForm } from "@/components/plans/checkout-form";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { planRecords } from "@/lib/data/plans/plan-records";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.checkout");
  return { title: t("title"), description: t("description") };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { plan: planId } = await searchParams;

  const plan =
    planRecords.find((record) => record.id === planId) ?? planRecords[0];
  if (!plan) notFound();

  const t = await getTranslations("Checkout");
  const plans = await getTranslations("Plans");
  const navigation = await getTranslations("Navigation");
  const common = await getTranslations("Common");
  const planName = common(`plans.${plan.nameKey}`);

  return (
    <DashboardShell
      activeItem="Websites"
      breadcrumbs={[
        { label: navigation("websites"), href: "/dashboard/websites" },
        { label: plans("title"), href: "/dashboard/plans" },
        { label: t("title") },
      ]}
    >
      <section className="flex min-h-27 -translate-y-1 flex-col justify-center gap-2 px-1.5">
        <Link
          href="/dashboard/plans"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          {t("back")}
        </Link>
        <h1 className="text-[2rem] font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </section>

      <div className="grid max-w-4xl items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel className="order-2 p-5 sm:p-6 lg:order-1">
          <h2 className="text-lg font-semibold">{t("contactTitle")}</h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            {t("contactDescription")}
          </p>
          <CheckoutForm plan={plan} />
        </Panel>

        <Panel className="order-1 self-start p-5 sm:p-6 lg:order-2">
          <h2 className="text-lg font-semibold">{t("summaryTitle")}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{t("planLabel")}</dt>
              <dd className="font-medium">{planName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{t("billingLabel")}</dt>
              <dd className="font-medium">{t("billingValue")}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-end justify-between gap-4 border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">{t("totalLabel")}</span>
            <span className="text-2xl font-bold">
              ${plan.priceUsd}
              <span className="text-sm font-normal text-muted-foreground">
                {t("perMonth")}
              </span>
            </span>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
