import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { OtpForm } from "@/components/auth/otp-form";
import type { IdentifierMode } from "@/lib/zod-schemas/auth-schemas";
import type { LocaleType } from "@/types/intl.types";

type Props = {
  params: Promise<{ locale: LocaleType }>;
  searchParams: Promise<{
    mode?: string;
    identifier?: string;
    display?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.otp" });
  return { title: t("title") };
}

function resolveMode(mode?: string): IdentifierMode {
  return mode === "email" ? "email" : "phone";
}

export default async function OtpPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const mode = resolveMode(query.mode);
  const display =
    query.display?.trim() ||
    query.identifier?.trim() ||
    (mode === "phone" ? "+98 ***" : "***@***");

  return <OtpForm mode={mode} display={display} />;
}
