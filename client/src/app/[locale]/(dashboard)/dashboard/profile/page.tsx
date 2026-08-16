import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthorizationProfileLinkCard } from "@/components/authorization/authorization-profile-link-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PersonalInformationCard } from "@/components/profile/personal-information-card";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { SecuritySection } from "@/components/profile/security-section";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  profileFixture,
  recoveryCodeFixtures,
  type PasswordState,
  type TwoFactorState,
  type UserProfile,
} from "@/lib/data/profile/profile-data";
import { mapMeToUserProfile } from "@/lib/profile/map-me-to-profile";

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

  const me = await getCurrentUser();
  const nestBacked = Boolean(me);
  const profile: UserProfile = me
    ? mapMeToUserProfile(me, { passwordState, twoFactorState })
    : {
        ...profileFixture,
        passwordState,
        twoFactorState,
      };

  return (
    <DashboardShell
      activeItem="Profile"
      breadcrumbs={[{ label: t("title") }]}
      searchPlaceholder={t("searchHeader")}
    >
      <>
        <ProfilePageHeader />

        <AuthorizationProfileLinkCard className="mb-4" />

        {!nestBacked && (
          <div
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
            role="status"
          >
            {t("personal.nestUnavailable")}
          </div>
        )}
        <PersonalInformationCard
          profile={profile}
          nestBacked={nestBacked}
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
