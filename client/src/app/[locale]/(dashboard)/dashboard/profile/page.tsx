import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PersonalInformationCard } from "@/components/profile/personal-information-card";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { SecuritySection } from "@/components/profile/security-section";
import type { Locale } from "@/i18n/routing";
import {
  profileFixture,
  recoveryCodeFixtures,
  type PasswordState,
  type TwoFactorState,
} from "@/lib/data/profile/profile-data";

interface ProfilePageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    password?: string | string[];
    twoFactor?: string | string[];
    save?: string | string[];
  }>;
}

export async function generateMetadata({
  params,
}: Pick<ProfilePageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.profile");
  return { title: t("title"), description: t("description") };
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { locale } = await params;
  const preview = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Profile");
  const value = (input?: string | string[]) =>
    Array.isArray(input) ? input[0] : input;
  const passwordState: PasswordState =
    value(preview.password) === "not-set"
      ? "not-set"
      : profileFixture.passwordState;
  const twoFactorState: TwoFactorState =
    value(preview.twoFactor) === "enabled"
      ? "enabled"
      : profileFixture.twoFactorState;

  return (
    <DashboardShell
      activeItem="Profile"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <>
        <ProfilePageHeader />
        <PersonalInformationCard
          profile={profileFixture}
          simulateFailure={value(preview.save) === "fail"}
        />
        <SecuritySection
          passwordState={passwordState}
          twoFactorState={twoFactorState}
          recoveryCodes={recoveryCodeFixtures}
        />
      </>
    </DashboardShell>
  );
}
