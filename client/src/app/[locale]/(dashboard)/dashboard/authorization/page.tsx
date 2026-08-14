import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { NestAuthorizationCaseDto } from "@/actions/authorization/authorization-case";
import { AuthorizationPageClient } from "@/components/authorization/authorization-page-client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Locale } from "@/i18n/routing";
import { serverFetch } from "@/lib/api/server-fetch";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { mapNestAuthorizationCase } from "@/lib/authorization/map-nest-case";
import {
  AUTHORIZATION_STATUS,
  type AccountContactSeed,
  type AuthorizationCase,
  type AuthorizationStatus,
} from "@/lib/data/authorization/authorization-data";

interface AuthorizationPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ status?: string | string[] }>;
}

const PREVIEW_STATUSES = new Set<string>(Object.values(AUTHORIZATION_STATUS));

export async function generateMetadata({
  params,
}: Pick<AuthorizationPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.authorization");
  return { title: t("title"), description: t("description") };
}

export default async function AuthorizationPage({
  params,
  searchParams,
}: AuthorizationPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Authorization");
  const raw = Array.isArray(query.status) ? query.status[0] : query.status;
  const previewStatus =
    raw && PREVIEW_STATUSES.has(raw)
      ? (raw as AuthorizationStatus)
      : undefined;

  const me = await getCurrentUser();
  const accountContacts: AccountContactSeed = {
    mobile: me?.phoneNumber?.trim() ?? "",
    mobileStatus: me?.phoneVerifiedAt ? "verified" : "unverified",
    email: me?.email?.trim() ?? "",
    emailStatus: me?.emailVerifiedAt ? "verified" : "unverified",
  };

  let initialCase: AuthorizationCase | null = null;
  if (!previewStatus) {
    try {
      const response = await serverFetch<NestAuthorizationCaseDto | null>(
        "/authorization-cases/me",
        { method: "GET" },
      );
      if (response.success && response.data) {
        initialCase = mapNestAuthorizationCase(response.data);
      }
    } catch {
      initialCase = null;
    }
  }

  return (
    <DashboardShell
      activeItem="Profile"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <div className="space-y-4">
        <p className="text-muted-foreground max-w-2xl text-sm leading-6">
          {t("description")}
        </p>
        <AuthorizationPageClient
          previewStatus={previewStatus}
          accountContacts={accountContacts}
          initialCase={initialCase}
        />
      </div>
    </DashboardShell>
  );
}
