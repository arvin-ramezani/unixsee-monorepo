import type { UserProfile } from "@/lib/data/profile/profile-data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^(09\d{9}|\+989\d{9})$/;

export function normalizeProfileMobile(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function isValidProfileEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidProfileMobile(value: string): boolean {
  return MOBILE_RE.test(normalizeProfileMobile(value));
}

/** Saved contact that is present and verified satisfies the other channel. */
export function hasVerifiedPhone(profile: UserProfile): boolean {
  return (
    profile.mobileStatus === "verified" &&
    Boolean(normalizeProfileMobile(profile.mobile))
  );
}

export function hasVerifiedEmail(profile: UserProfile): boolean {
  return profile.emailStatus === "verified" && Boolean(profile.email.trim());
}

/**
 * At least one verified contact is enough. Email is required only when phone
 * is not verified; mobile is required only when email is not verified.
 */
export function getContactFieldRequirements(saved: UserProfile): {
  emailRequired: boolean;
  mobileRequired: boolean;
} {
  return {
    emailRequired: !hasVerifiedPhone(saved),
    mobileRequired: !hasVerifiedEmail(saved),
  };
}
