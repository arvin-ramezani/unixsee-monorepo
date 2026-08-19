import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import Title from "@/app/[locale]/(website)/services/_components/common/title";
import { GuestPlanRequestForm } from "@/components/plans/guest-plan-request-form";
import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { fetchPublishedPlanByMarketingKey } from "@/lib/plans/plans-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.guestPlanRequest");
  return { title: t("title"), description: t("description") };
}

export default async function GuestPlanRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { plan: planKey } = await searchParams;

  const t = await getTranslations("GuestPlanRequestPage");
  const backHref = "/services/managed-woocommerce-server#plans";

  if (!planKey?.trim()) {
    return (
      <main className="container-lg py-16">
        <PlanRequestError
          title={t("errors.planNotFoundTitle")}
          description={t("errors.planNotFoundDescription")}
          backHref={backHref}
          backLabel={t("backToPlans")}
        />
      </main>
    );
  }

  const planResult = await fetchPublishedPlanByMarketingKey(
    planKey.trim(),
    locale,
  );

  if (!planResult.ok) {
    const isUnavailable = planResult.reason === "unavailable";

    return (
      <main className="container-lg min-h-[70dvh] py-16 lg:pt-24">
        <PlanRequestError
          title={
            isUnavailable
              ? t("errors.serviceUnavailableTitle")
              : t("errors.planNotFoundTitle")
          }
          description={
            isUnavailable
              ? t("errors.serviceUnavailableDescription")
              : t("errors.planNotFoundDescription")
          }
          backHref={backHref}
          backLabel={t("backToPlans")}
        />
      </main>
    );
  }

  const plan = planResult.plan;
  const user = await getCurrentUser();
  if (user) {
    redirect({
      href: `/dashboard/plans/checkout?plan=${plan.id}`,
      locale,
    });
  }

  return (
    <main className="container-lg py-10 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          {t("backToPlans")}
        </Link>

        <Title as="h1" className="mt-4 text-3xl font-semibold lg:text-4xl">
          {t("title")}
        </Title>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6 lg:text-base">
          {t("description")}
        </p>

        <div className="bg-muted/40 mt-6 rounded-3xl border p-5 lg:p-6">
          <p className="text-muted-foreground text-sm">
            {t("summary.planLabel")}
          </p>
          <p className="mt-1 text-lg font-semibold">{plan.name}</p>
          {!!plan.description && (
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {plan.description}
            </p>
          )}
        </div>

        <div className="mt-6">
          <GuestPlanRequestForm plan={plan} />
        </div>
      </div>
    </main>
  );
}

function PlanRequestError({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="dark:bg-card mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        {description}
      </p>
      <Link
        href={backHref}
        className="text-primary mt-6 inline-flex text-sm font-medium hover:underline"
      >
        {backLabel}
      </Link>
    </div>
  );
}
