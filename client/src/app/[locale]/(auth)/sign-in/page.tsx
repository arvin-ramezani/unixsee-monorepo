import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignInForm } from "@/components/auth/sign-in-form";
import type { LocaleType } from "@/types/intl.types";

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.signIn" });
  return { title: t("title") };
}

export default async function SignInPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignInForm />;
}
