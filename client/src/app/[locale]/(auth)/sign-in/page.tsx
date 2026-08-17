import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
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

export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const nextParams = new URLSearchParams();

  if (query.returnTo) {
    nextParams.set("returnTo", query.returnTo);
  }
  if (query.notice) {
    nextParams.set("notice", query.notice);
  }

  const suffix = nextParams.toString();
  redirect({
    href: suffix ? `/auth?${suffix}` : "/auth",
    locale,
  });
}
