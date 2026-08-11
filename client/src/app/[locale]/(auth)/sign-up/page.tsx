import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignUpForm } from "@/components/auth/sign-up-form";
import type { LocaleType } from "@/types/intl.types";

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.signUp" });
  return { title: t("title") };
}

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SignUpForm />;
}
