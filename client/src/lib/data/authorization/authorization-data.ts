import { toNationalPhone } from "@/lib/phone/international-phone";
import type { VerificationStatus } from "@/lib/data/profile/profile-data";

export const AUTHORIZATION_STATUS = {
  NOT_STARTED: "not_started",
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  NEEDS_MORE_INFO: "needs_more_info",
  REJECTED: "rejected",
  APPROVED: "approved",
} as const;

export type AuthorizationStatus =
  (typeof AUTHORIZATION_STATUS)[keyof typeof AUTHORIZATION_STATUS];

export const AUTHORIZATION_STEPS = {
  IDENTITY: "identity",
  CONTACTS: "contacts",
  ADDRESS: "address",
  DOCUMENT: "document",
  REVIEW: "review",
} as const;

export type AuthorizationStep =
  (typeof AUTHORIZATION_STEPS)[keyof typeof AUTHORIZATION_STEPS];

export const AUTHORIZATION_STEP_ORDER = [
  AUTHORIZATION_STEPS.IDENTITY,
  AUTHORIZATION_STEPS.CONTACTS,
  AUTHORIZATION_STEPS.ADDRESS,
  AUTHORIZATION_STEPS.DOCUMENT,
  AUTHORIZATION_STEPS.REVIEW,
] as const;

export type ContactChallengeState =
  "skipped_already_verified" | "verified" | "pending" | "unverified";

/** Signed-in account contacts used to seed and skip-reverify. */
export type AccountContactSeed = {
  mobile: string;
  mobileStatus: VerificationStatus;
  email: string;
  emailStatus: VerificationStatus;
};

export type AuthorizationPackage = {
  nationalId: string;
  birthDate: string;
  mobile: string;
  mobileChallenge: ContactChallengeState;
  /** Customer confirms account mobile belongs to the same national ID. */
  mobileBelongsToNationalId: boolean;
  email: string;
  emailChallenge: ContactChallengeState;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  nationalIdCardFileName: string | null;
  /** Object URL or placeholder path for prototype preview only. */
  nationalIdCardPreviewUrl: string | null;
  attestedTruthful: boolean;
};

export type AuthorizationCase = {
  id: string;
  status: AuthorizationStatus;
  package: AuthorizationPackage;
  staffReason: string | null;
  staffFieldsToFix: string[];
  submittedAt: string | null;
  decidedAt: string | null;
  tenantId: string | null;
  updatedAt: string;
};

/* eslint-disable no-restricted-syntax -- Bilingual reference data: Persian sits in labelFa paired with labelEn (localized typed module, the pattern docs/engineering/nextjs.md permits). */
export const IRAN_PROVINCES = [
  { id: "tehran", labelFa: "تهران", labelEn: "Tehran" },
  { id: "isfahan", labelFa: "اصفهان", labelEn: "Isfahan" },
  { id: "fars", labelFa: "فارس", labelEn: "Fars" },
  { id: "razavi_khorasan", labelFa: "خراسان رضوی", labelEn: "Razavi Khorasan" },
  { id: "alborz", labelFa: "البرز", labelEn: "Alborz" },
] as const;

export const IRAN_CITIES: Record<
  string,
  { id: string; labelFa: string; labelEn: string }[]
> = {
  tehran: [
    { id: "tehran-city", labelFa: "تهران", labelEn: "Tehran" },
    { id: "shemiranat", labelFa: "شمیرانات", labelEn: "Shemiranat" },
  ],
  isfahan: [
    { id: "isfahan-city", labelFa: "اصفهان", labelEn: "Isfahan" },
    { id: "kashan", labelFa: "کاشان", labelEn: "Kashan" },
  ],
  fars: [
    { id: "shiraz", labelFa: "شیراز", labelEn: "Shiraz" },
    { id: "marvdasht", labelFa: "مرودشت", labelEn: "Marvdasht" },
  ],
  razavi_khorasan: [
    { id: "mashhad", labelFa: "مشهد", labelEn: "Mashhad" },
    { id: "neyshabur", labelFa: "نیشابور", labelEn: "Neyshabur" },
  ],
  alborz: [
    { id: "karaj", labelFa: "کرج", labelEn: "Karaj" },
    { id: "nazarabad", labelFa: "نظرآباد", labelEn: "Nazarabad" },
  ],
};
/* eslint-enable no-restricted-syntax */

export const AUTHORIZATION_UPLOAD = {
  accept: "image/jpeg,image/png,image/webp",
  maxBytes: 5 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export function normalizeContact(value: string) {
  return value.replace(/[\s()-]/g, "").toLowerCase();
}

function normalizeMobileForCompare(value: string) {
  const national = toNationalPhone(value);
  if (national) return national;
  return normalizeContact(value);
}

/** Account already has a mobile (phone signup / profile) — KYC uses checkbox, not OTP. */
export function accountHasMobile(account: AccountContactSeed) {
  return Boolean(normalizeContact(account.mobile));
}

export function mobileMatchesAccount(
  mobile: string,
  account: AccountContactSeed,
) {
  if (!normalizeContact(account.mobile)) return false;
  return (
    normalizeMobileForCompare(mobile) ===
    normalizeMobileForCompare(account.mobile)
  );
}

export function emptyAuthorizationPackage(
  account?: AccountContactSeed,
): AuthorizationPackage {
  const seed = account ?? {
    mobile: "",
    mobileStatus: "unverified" as const,
    email: "",
    emailStatus: "unverified" as const,
  };
  const mobile = seed.mobile.trim();
  const email = seed.email.trim();
  const hasAccountMobile = accountHasMobile(seed);
  const emailVerified = Boolean(email) && seed.emailStatus === "verified";

  return {
    nationalId: "",
    birthDate: "",
    mobile,
    mobileChallenge: hasAccountMobile
      ? "skipped_already_verified"
      : "unverified",
    mobileBelongsToNationalId: false,
    email,
    emailChallenge: emailVerified ? "skipped_already_verified" : "unverified",
    province: "",
    city: "",
    address: "",
    postalCode: "",
    nationalIdCardFileName: null,
    nationalIdCardPreviewUrl: null,
    attestedTruthful: false,
  };
}

export function resolveMobileChallenge(
  mobile: string,
  account: AccountContactSeed,
): ContactChallengeState {
  if (accountHasMobile(account) && mobileMatchesAccount(mobile, account)) {
    return "skipped_already_verified";
  }
  return "unverified";
}

export function resolveEmailChallenge(
  email: string,
  account: AccountContactSeed,
): ContactChallengeState {
  const same =
    Boolean(normalizeContact(account.email)) &&
    normalizeContact(email) === normalizeContact(account.email);
  if (same && account.emailStatus === "verified") {
    return "skipped_already_verified";
  }
  return "unverified";
}

export function isContactSatisfied(state: ContactChallengeState) {
  return state === "skipped_already_verified" || state === "verified";
}

export function isPackageComplete(pkg: AuthorizationPackage) {
  return Boolean(
    pkg.nationalId.trim() &&
    pkg.birthDate.trim() &&
    pkg.mobile.trim() &&
    isContactSatisfied(pkg.mobileChallenge) &&
    (pkg.mobileChallenge !== "skipped_already_verified" ||
      pkg.mobileBelongsToNationalId) &&
    pkg.email.trim() &&
    isContactSatisfied(pkg.emailChallenge) &&
    pkg.province &&
    pkg.city &&
    pkg.address.trim() &&
    pkg.postalCode.trim() &&
    pkg.nationalIdCardFileName &&
    pkg.attestedTruthful,
  );
}

export const EDITABLE_STATUSES: AuthorizationStatus[] = [
  AUTHORIZATION_STATUS.NOT_STARTED,
  AUTHORIZATION_STATUS.DRAFT,
  AUTHORIZATION_STATUS.NEEDS_MORE_INFO,
  AUTHORIZATION_STATUS.REJECTED,
];

export function canEditAuthorization(status: AuthorizationStatus) {
  return EDITABLE_STATUSES.includes(status);
}
