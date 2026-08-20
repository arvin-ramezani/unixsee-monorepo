import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GuestPlanRequestSuccessView } from "./guest-plan-request-success-view";
import type { Locale } from "@/i18n/routing";
import { fetchPublishedPlanByIdPublic } from "@/lib/plans/plans-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.guestPlanRequestSuccess");
  return { title: t("title"), description: t("description") };
}

export default async function GuestPlanRequestSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { plan: planId } = await searchParams;

  const plan = planId ? await fetchPublishedPlanByIdPublic(planId, locale) : null;

  return <GuestPlanRequestSuccessView planName={plan?.name ?? null} />;
}
