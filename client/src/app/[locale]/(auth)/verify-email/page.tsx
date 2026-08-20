import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  VerifyEmailForm,
  type VerifyEmailStatus,
} from "@/components/auth/verify-email-form";
import type { LocaleType } from "@/types/intl.types";

type Props = {
  params: Promise<{ locale: LocaleType }>;
  searchParams: Promise<{ status?: string; email?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth.verifyEmail" });
  return { title: t("pendingTitle") };
}

function resolveStatus(status?: string): VerifyEmailStatus {
  if (status === "success" || status === "expired") return status;
  return "pending";
}

export default async function VerifyEmailPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;

  return (
    <VerifyEmailForm
      status={resolveStatus(query.status)}
      email={query.email?.trim()}
    />
  );
}
