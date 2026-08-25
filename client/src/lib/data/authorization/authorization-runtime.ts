import {
  AUTHORIZATION_STATUS,
  emptyAuthorizationPackage,
  isPackageComplete,
  type AccountContactSeed,
  type AuthorizationCase,
  type AuthorizationPackage,
  type AuthorizationStatus,
} from "@/lib/data/authorization/authorization-data";

/* eslint-disable no-restricted-syntax -- Prototype-only in-memory mock data (relative-time labels, demo staff reasons, Persian dates); real content is served by NestJS once persistence is wired. */

/**
 * Prototype-only in-memory authorization state for the signed-in customer.
 * NestJS will own persistence later.
 */
let runtimeCase: AuthorizationCase | null = null;
let accountSeed: AccountContactSeed | undefined;

function nowLabel() {
  return "اکنون";
}

export function setAuthorizationAccountSeed(seed?: AccountContactSeed) {
  accountSeed = seed;
}

export function getAuthorizationAccountSeed(): AccountContactSeed {
  return (
    accountSeed ?? {
      mobile: "",
      mobileStatus: "unverified",
      email: "",
      emailStatus: "unverified",
    }
  );
}

export function getRuntimeAuthorizationCase(): AuthorizationCase | null {
  return runtimeCase;
}

/** Replace local prototype state with a Nest-backed case (or clear). */
export function hydrateAuthorizationCase(next: AuthorizationCase | null) {
  runtimeCase = next;
}

export function getAuthorizationStatus(): AuthorizationStatus {
  return runtimeCase?.status ?? AUTHORIZATION_STATUS.NOT_STARTED;
}

export function startAuthorizationDraft(): AuthorizationCase {
  if (
    runtimeCase &&
    (runtimeCase.status === AUTHORIZATION_STATUS.PENDING_REVIEW ||
      runtimeCase.status === AUTHORIZATION_STATUS.APPROVED)
  ) {
    return runtimeCase;
  }

  if (
    runtimeCase &&
    (runtimeCase.status === AUTHORIZATION_STATUS.DRAFT ||
      runtimeCase.status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO ||
      runtimeCase.status === AUTHORIZATION_STATUS.REJECTED)
  ) {
    return runtimeCase;
  }

  runtimeCase = {
    id: "auth-case-client-1",
    status: AUTHORIZATION_STATUS.DRAFT,
    package: emptyAuthorizationPackage(accountSeed),
    staffReason: null,
    staffFieldsToFix: [],
    submittedAt: null,
    decidedAt: null,
    tenantId: null,
    updatedAt: nowLabel(),
  };

  return runtimeCase;
}

export function saveAuthorizationDraft(
  pkg: AuthorizationPackage,
): AuthorizationCase {
  const current = startAuthorizationDraft();
  if (current.status === AUTHORIZATION_STATUS.PENDING_REVIEW) {
    return current;
  }
  if (current.status === AUTHORIZATION_STATUS.APPROVED) {
    return current;
  }

  runtimeCase = {
    ...current,
    status:
      current.status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO ||
      current.status === AUTHORIZATION_STATUS.REJECTED
        ? current.status
        : AUTHORIZATION_STATUS.DRAFT,
    package: { ...pkg },
    updatedAt: nowLabel(),
  };

  return runtimeCase;
}

export function cancelAuthorizationDraft(): void {
  if (!runtimeCase) return;
  if (
    runtimeCase.status === AUTHORIZATION_STATUS.PENDING_REVIEW ||
    runtimeCase.status === AUTHORIZATION_STATUS.APPROVED
  ) {
    return;
  }
  runtimeCase = null;
}

export type SubmitAuthorizationResult =
  | { ok: true; case: AuthorizationCase }
  | { ok: false; messageKey: "incomplete" | "locked" };

export function submitAuthorization(
  pkg: AuthorizationPackage,
): SubmitAuthorizationResult {
  const current = startAuthorizationDraft();
  if (current.status === AUTHORIZATION_STATUS.PENDING_REVIEW) {
    return { ok: false, messageKey: "locked" };
  }
  if (current.status === AUTHORIZATION_STATUS.APPROVED) {
    return { ok: false, messageKey: "locked" };
  }

  if (!isPackageComplete(pkg)) {
    return { ok: false, messageKey: "incomplete" };
  }

  runtimeCase = {
    ...current,
    status: AUTHORIZATION_STATUS.PENDING_REVIEW,
    package: { ...pkg },
    submittedAt: nowLabel(),
    updatedAt: nowLabel(),
    staffReason: null,
    staffFieldsToFix: [],
  };

  return { ok: true, case: runtimeCase };
}

/** Demo helpers for query-param previews in the prototype. */
export function applyAuthorizationPreview(status: AuthorizationStatus) {
  if (status === AUTHORIZATION_STATUS.NOT_STARTED) {
    runtimeCase = null;
    return;
  }

  const base = emptyAuthorizationPackage(accountSeed);
  const filled: AuthorizationPackage = {
    ...base,
    nationalId: "0012345678",
    birthDate: "1370-05-15",
    mobileBelongsToNationalId: Boolean(base.mobile),
    province: "tehran",
    city: "tehran-city",
    address: "خیابان ولیعصر، پلاک ۱۲",
    postalCode: "1234567890",
    nationalIdCardFileName: "national-id.jpg",
    nationalIdCardPreviewUrl: null,
    attestedTruthful: true,
  };

  runtimeCase = {
    id: "auth-case-client-preview",
    status,
    package: filled,
    staffReason:
      status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO
        ? "عکس کارت ملی خوانا نیست. لطفاً تصویر واضح‌تری بارگذاری کنید."
        : status === AUTHORIZATION_STATUS.REJECTED
          ? "اطلاعات کد ملی با مشخصات تماس هم‌خوانی ندارد."
          : null,
    staffFieldsToFix:
      status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO
        ? ["nationalIdCard"]
        : status === AUTHORIZATION_STATUS.REJECTED
          ? ["nationalId", "mobile"]
          : [],
    submittedAt:
      status === AUTHORIZATION_STATUS.DRAFT ? null : "۱۲ مرداد ۱۴۰۵",
    decidedAt:
      status === AUTHORIZATION_STATUS.APPROVED ||
      status === AUTHORIZATION_STATUS.REJECTED ||
      status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO
        ? "۱۳ مرداد ۱۴۰۵"
        : null,
    tenantId:
      status === AUTHORIZATION_STATUS.APPROVED ? "tenant-preview-1" : null,
    updatedAt: nowLabel(),
  };
}

export function resetAuthorizationRuntime() {
  runtimeCase = null;
}
