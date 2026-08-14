/**
 * Profile UI model. Contact fields + verification and fullName/locale come from
 * Nest `/users/me` (+ PATCH / OTP verify). Avatar is local preview only (no S3).
 * Password / 2FA remain fixture overlays until those APIs exist.
 */
export type VerificationStatus = "verified" | "unverified" | "pending";
export type PasswordState = "set" | "not-set";
export type TwoFactorState = "enabled" | "disabled";

export interface UserProfile {
  fullName: string;
  email: string;
  emailStatus: VerificationStatus;
  mobile: string;
  mobileStatus: VerificationStatus;
  preferredLanguage: "fa" | "en";
  avatarUrl?: string;
  passwordState: PasswordState;
  twoFactorState: TwoFactorState;
}

export const profileFixture: UserProfile = {
  fullName: "Jane Cooper",
  email: "jane@example.com",
  emailStatus: "verified",
  mobile: "+989121234567",
  mobileStatus: "verified",
  preferredLanguage: "fa",
  passwordState: "set",
  twoFactorState: "disabled",
};

export const recoveryCodeFixtures = [
  "UXS-7KQ2-MN4P",
  "UXS-9RTA-3VWX",
  "UXS-5HJD-8CBN",
  "UXS-2PLM-6FGE",
] as const;
