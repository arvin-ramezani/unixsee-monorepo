import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { OtpForm } from "@/components/auth/otp-form";
import { redirect } from "@/i18n/navigation";
import type { IdentifierMode } from "@/lib/zod-schemas/auth-schemas";
import type { LocaleType } from "@/types/intl.types";

type Props = {
  params: Promise<{ locale: LocaleType }>;
  searchParams: Promise<{
    mode?: string;
    identifier?: string;
    display?: string;
    returnTo?: string;
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

  if (mode === "email") {
    redirect({ href: "/sign-in", locale });
  }

  const display =
    query.display?.trim() ||
    query.identifier?.trim() ||
    "+98 ***";

  return (
    <OtpForm display={display} returnTo={query.returnTo} />
  );
}
