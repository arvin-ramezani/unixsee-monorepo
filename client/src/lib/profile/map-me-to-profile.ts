import {
  profileFixture,
  type UserProfile,
  type VerificationStatus,
} from "@/lib/data/profile/profile-data";
import type { SafeAuthUser } from "@/types/auth.types";

export type MeProfileResponse = SafeAuthUser & {
  locale?: string | null;
  phoneVerifiedAt?: string | null;
  emailVerifiedAt?: string | null;
  avatarUrl?: string | null;
};

function statusFromVerifiedAt(
  value: string | null | undefined,
): VerificationStatus {
  return value ? "verified" : "unverified";
}

function mapLocale(locale: string | null | undefined): "fa" | "en" {
  if (!locale) return "fa";
  return locale.toLowerCase().startsWith("en") ? "en" : "fa";
}

/**
 * Map Nest `/users/me` into the profile form model.
 * Password / 2FA / avatar stay fixture overlays until those APIs exist.
 */
export function mapMeToUserProfile(
  me: MeProfileResponse,
  overlays: Pick<UserProfile, "passwordState" | "twoFactorState"> = {
    passwordState: profileFixture.passwordState,
    twoFactorState: profileFixture.twoFactorState,
  },
): UserProfile {
  return {
    fullName: me.fullName?.trim() || "",
    email: me.email?.trim() || "",
    emailStatus: statusFromVerifiedAt(me.emailVerifiedAt),
    mobile: me.phoneNumber?.trim() || "",
    mobileStatus: statusFromVerifiedAt(me.phoneVerifiedAt),
    preferredLanguage: mapLocale(me.locale),
    avatarUrl: me.avatarUrl ?? undefined,
    passwordState: overlays.passwordState,
    twoFactorState: overlays.twoFactorState,
  };
}
