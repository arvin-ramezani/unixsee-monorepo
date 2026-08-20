import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthEntryForm } from "@/components/auth/auth-entry-form";
import type { LocaleType } from "@/types/intl.types";

type Props = {
  params: Promise<{ locale: LocaleType }>;
  searchParams: Promise<{ returnTo?: string; notice?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.entry" });
  return { title: t("title") };
}

export default async function AuthPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { returnTo, notice } = await searchParams;

  return <AuthEntryForm returnTo={returnTo} notice={notice} />;
}
