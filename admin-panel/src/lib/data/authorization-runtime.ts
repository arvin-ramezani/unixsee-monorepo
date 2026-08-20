import {
  AUTHORIZATION_CASES,
  AUTHORIZATION_STATUS,
  type AuthorizationCaseType,
  type AuthorizationFixFieldType,
  type AuthorizationStatusType,
} from "@/lib/data/authorization-data";
import { CURRENT_STAFF } from "@/lib/data/users-data";
import { createTenantForExistingUser } from "@/lib/data/users-runtime";
import { attachTenantToLinkedPlanRequests } from "@/lib/data/plan-requests-runtime";

/**
 * Prototype-only in-memory authorization review state.
 */
let runtimeCases: AuthorizationCaseType[] = AUTHORIZATION_CASES.map((entry) => ({
  ...entry,
  package: { ...entry.package },
  staffFieldsToFix: [...entry.staffFieldsToFix],
  relatedPlanRequestIds: [...entry.relatedPlanRequestIds],
  history: entry.history.map((item) => ({ ...item })),
}));

export function listRuntimeAuthorizationCases() {
  return runtimeCases;
}

export function getRuntimeAuthorizationCase(id: string) {
  return runtimeCases.find((entry) => entry.id === id);
}

export function findAuthorizationCaseByUserId(userId: string) {
  return runtimeCases.find(
    (entry) =>
      entry.userId === userId &&
      entry.status !== AUTHORIZATION_STATUS.DRAFT,
  );
}

function replaceCase(updated: AuthorizationCaseType) {
  runtimeCases = runtimeCases.map((entry) =>
    entry.id === updated.id ? updated : entry,
  );
  return updated;
}

function appendHistory(
  authCase: AuthorizationCaseType,
  action: string,
  note?: string | null,
) {
  return [
    {
      id: `auth-h-${authCase.id}-${authCase.history.length + 1}`,
      at: "اکنون",
      action,
      actorName: CURRENT_STAFF.name,
      note: note ?? null,
    },
    ...authCase.history,
  ];
}

export type AuthorizationDecisionResult =
  | { ok: true; case: AuthorizationCaseType }
  | { ok: false; message: string };

export function approveAuthorizationCase(
  id: string,
): AuthorizationDecisionResult {
  const authCase = getRuntimeAuthorizationCase(id);
  if (!authCase) {
    return { ok: false, message: "پرونده یافت نشد." };
  }
  if (authCase.status !== AUTHORIZATION_STATUS.PENDING_REVIEW) {
    return { ok: false, message: "فقط پرونده‌های در حال بررسی قابل تأیید هستند." };
  }

  const tenantName = `مستأجر ${authCase.userDisplayName}`;
  const tenantResult = createTenantForExistingUser({
    userId: authCase.userId,
    tenantName,
  });

  if (!tenantResult.ok) {
    return { ok: false, message: tenantResult.message };
  }

  const updated = replaceCase({
    ...authCase,
    status: AUTHORIZATION_STATUS.APPROVED,
    tenantId: tenantResult.tenant.id,
    tenantName: tenantResult.tenant.name,
    decidedAt: "اکنون",
    decidedBy: CURRENT_STAFF.name,
    updatedAt: "اکنون",
    staffReason: null,
    staffFieldsToFix: [],
    history: appendHistory(
      authCase,
      "تأیید و ایجاد مستأجر",
      tenantResult.tenant.name,
    ),
  });

  attachTenantToLinkedPlanRequests(
    authCase.userId,
    tenantResult.tenant.id,
    tenantResult.tenant.name,
  );

  return { ok: true, case: updated };
}

export function requestAuthorizationMoreInfo({
  id,
  reason,
  fieldsToFix,
}: {
  id: string;
  reason: string;
  fieldsToFix: AuthorizationFixFieldType[];
}): AuthorizationDecisionResult {
  const authCase = getRuntimeAuthorizationCase(id);
  if (!authCase) {
    return { ok: false, message: "پرونده یافت نشد." };
  }
  if (authCase.status !== AUTHORIZATION_STATUS.PENDING_REVIEW) {
    return { ok: false, message: "فقط پرونده‌های در حال بررسی قابل بازگشت هستند." };
  }
  if (!reason.trim()) {
    return { ok: false, message: "دلیل الزامی است." };
  }

  const updated = replaceCase({
    ...authCase,
    status: AUTHORIZATION_STATUS.NEEDS_MORE_INFO,
    staffReason: reason.trim(),
    staffFieldsToFix: fieldsToFix,
    decidedAt: "اکنون",
    decidedBy: CURRENT_STAFF.name,
    updatedAt: "اکنون",
    history: appendHistory(authCase, "درخواست اطلاعات بیشتر", reason.trim()),
  });

  return { ok: true, case: updated };
}

export function rejectAuthorizationCase({
  id,
  reason,
}: {
  id: string;
  reason: string;
}): AuthorizationDecisionResult {
  const authCase = getRuntimeAuthorizationCase(id);
  if (!authCase) {
    return { ok: false, message: "پرونده یافت نشد." };
  }
  if (authCase.status !== AUTHORIZATION_STATUS.PENDING_REVIEW) {
    return { ok: false, message: "فقط پرونده‌های در حال بررسی قابل رد هستند." };
  }
  if (!reason.trim()) {
    return { ok: false, message: "دلیل الزامی است." };
  }

  const updated = replaceCase({
    ...authCase,
    status: AUTHORIZATION_STATUS.REJECTED,
    staffReason: reason.trim(),
    staffFieldsToFix: [],
    decidedAt: "اکنون",
    decidedBy: CURRENT_STAFF.name,
    updatedAt: "اکنون",
    history: appendHistory(authCase, "رد احراز هویت", reason.trim()),
  });

  return { ok: true, case: updated };
}

export function getAuthorizationQueueSummary(
  cases: AuthorizationCaseType[] = runtimeCases,
) {
  return {
    pending: cases.filter(
      (entry) => entry.status === AUTHORIZATION_STATUS.PENDING_REVIEW,
    ).length,
    needsInfo: cases.filter(
      (entry) => entry.status === AUTHORIZATION_STATUS.NEEDS_MORE_INFO,
    ).length,
    rejected: cases.filter(
      (entry) => entry.status === AUTHORIZATION_STATUS.REJECTED,
    ).length,
    approved: cases.filter(
      (entry) => entry.status === AUTHORIZATION_STATUS.APPROVED,
    ).length,
  };
}

export const AUTHORIZATION_STATUS_FILTER = {
  ALL: "ALL",
  ACTIONABLE: "ACTIONABLE",
  ...AUTHORIZATION_STATUS,
} as const;

export type AuthorizationStatusFilterType =
  | "ALL"
  | "ACTIONABLE"
  | AuthorizationStatusType;

export function filterAuthorizationCases({
  cases = runtimeCases,
  statusFilter,
  query,
}: {
  cases?: AuthorizationCaseType[];
  statusFilter: AuthorizationStatusFilterType;
  query: string;
}) {
  const normalized = query.trim().toLowerCase();

  return cases.filter((entry) => {
    if (statusFilter === "ACTIONABLE") {
      if (
        entry.status !== AUTHORIZATION_STATUS.PENDING_REVIEW &&
        entry.status !== AUTHORIZATION_STATUS.NEEDS_MORE_INFO
      ) {
        return false;
      }
    } else if (statusFilter !== "ALL" && entry.status !== statusFilter) {
      return false;
    }

    if (!normalized) return true;

    const haystack = [
      entry.userDisplayName,
      entry.userEmail ?? "",
      entry.userMobile,
      entry.package.nationalId,
      entry.id,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
