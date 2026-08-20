import {
  CURRENT_STAFF,
  MEMBERSHIP_ROLE,
  type CustomerUserType,
  type TenantType,
} from "@/lib/data/users-data";
import {
  getRuntimeUser,
  listRuntimeMemberships,
  listRuntimeTenants,
} from "@/lib/data/users-runtime";
import { websiteHasActivePlan } from "@/lib/data/plans-data";
import {
  PLAN_REQUEST_BLOCKER,
  PLAN_REQUEST_STATUS,
  PLAN_REQUESTS,
  type PlanRequestBlockerType,
  type PlanRequestHistoryEntryType,
  type PlanRequestStatusType,
  type PlanRequestType,
} from "@/lib/data/plan-requests-data";
import {
  getRuntimeWebsite,
  listRuntimeWebsitesByTenant,
  setWebsiteActivePlan,
} from "@/lib/data/websites-runtime";

/**
 * Prototype-only in-memory plan-request state for session mutations.
 */
let runtimeRequests: PlanRequestType[] = PLAN_REQUESTS.map((request) => ({
  ...request,
  history: request.history.map((entry) => ({ ...entry })),
}));

export function listRuntimePlanRequests() {
  return runtimeRequests;
}

export function getRuntimePlanRequest(id: string) {
  return runtimeRequests.find((request) => request.id === id);
}

/** After authorization approve, attach the new tenant to waiting plan requests. */
export function attachTenantToLinkedPlanRequests(
  userId: string,
  tenantId: string,
  tenantName: string,
) {
  runtimeRequests = runtimeRequests.map((request) => {
    if (
      request.linkedUserId !== userId ||
      request.linkedTenantId ||
      request.status === PLAN_REQUEST_STATUS.ENABLED ||
      request.status === PLAN_REQUEST_STATUS.DECLINED ||
      request.status === PLAN_REQUEST_STATUS.CANCELLED
    ) {
      return request;
    }

    return refreshDerivedFields({
      ...request,
      linkedTenantId: tenantId,
      linkedTenantName: tenantName,
      history: appendHistory(
        request,
        "اتصال مستأجر پس از تأیید احراز هویت",
        tenantName,
      ),
    });
  });
}

function replaceRequest(updated: PlanRequestType) {
  runtimeRequests = runtimeRequests.map((request) =>
    request.id === updated.id ? updated : request,
  );
  return updated;
}

function appendHistory(
  request: PlanRequestType,
  action: string,
  note?: string | null,
): PlanRequestHistoryEntryType[] {
  const entry: PlanRequestHistoryEntryType = {
    id: `prh-${request.id}-${request.history.length + 1}`,
    at: "اکنون",
    action,
    actorName: CURRENT_STAFF.name,
    note: note ?? null,
  };

  return [entry, ...request.history];
}

export function getPlanRequestBlockers(
  request: PlanRequestType,
): PlanRequestBlockerType[] {
  if (
    request.status === PLAN_REQUEST_STATUS.ENABLED ||
    request.status === PLAN_REQUEST_STATUS.DECLINED ||
    request.status === PLAN_REQUEST_STATUS.CANCELLED
  ) {
    return [];
  }

  const blockers: PlanRequestBlockerType[] = [];

  if (!request.linkedUserId) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_USER);
  } else if (!request.linkedTenantId) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_TENANT);
  }

  if (!request.targetWebsiteId) {
    blockers.push(PLAN_REQUEST_BLOCKER.MISSING_WEBSITE);
  } else {
    const website = getRuntimeWebsite(request.targetWebsiteId);
    if (!website) {
      blockers.push(PLAN_REQUEST_BLOCKER.MISSING_WEBSITE);
    } else if (websiteHasActivePlan(website.service.plan)) {
      blockers.push(PLAN_REQUEST_BLOCKER.ACTIVE_PLAN_CONFLICT);
    }
  }

  return blockers;
}

export function derivePlanRequestStatus(
  request: PlanRequestType,
): PlanRequestStatusType {
  if (
    request.status === PLAN_REQUEST_STATUS.ENABLED ||
    request.status === PLAN_REQUEST_STATUS.DECLINED ||
    request.status === PLAN_REQUEST_STATUS.CANCELLED
  ) {
    return request.status;
  }

  return getPlanRequestBlockers(request).length === 0
    ? PLAN_REQUEST_STATUS.READY_TO_ENABLE
    : PLAN_REQUEST_STATUS.PENDING;
}

function nextActionFor(request: PlanRequestType): string {
  if (request.status === PLAN_REQUEST_STATUS.ENABLED) {
    return "مشاهده وب‌سایت فعال";
  }
  if (request.status === PLAN_REQUEST_STATUS.DECLINED) {
    return "بایگانی";
  }
  if (request.status === PLAN_REQUEST_STATUS.CANCELLED) {
    return "بایگانی";
  }

  const blockers = getPlanRequestBlockers(request);
  if (blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_USER)) {
    return "اتصال کاربر موجود";
  }
  if (blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_TENANT)) {
    return "تأیید احراز هویت / ایجاد مستأجر";
  }
  if (blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_WEBSITE)) {
    return "انتخاب وب‌سایت هدف";
  }
  if (blockers.includes(PLAN_REQUEST_BLOCKER.ACTIVE_PLAN_CONFLICT)) {
    return "رفع تداخل پلن فعال";
  }
  return "فعال‌سازی پلن روی وب‌سایت";
}

function refreshDerivedFields(request: PlanRequestType): PlanRequestType {
  const status = derivePlanRequestStatus(request);
  return {
    ...request,
    status,
    nextAction: nextActionFor({ ...request, status }),
    updatedAt: "اکنون",
  };
}

export type LinkExistingUserResultType =
  | { ok: true; request: PlanRequestType; user: CustomerUserType; tenant: TenantType }
  | { ok: false; message: string };

export function linkExistingUserToPlanRequest(
  requestId: string,
  userId: string,
): LinkExistingUserResultType {
  const request = getRuntimePlanRequest(requestId);
  if (!request) {
    return { ok: false, message: "درخواست پیدا نشد." };
  }
  if (
    request.status === PLAN_REQUEST_STATUS.ENABLED ||
    request.status === PLAN_REQUEST_STATUS.DECLINED ||
    request.status === PLAN_REQUEST_STATUS.CANCELLED
  ) {
    return { ok: false, message: "این درخواست دیگر قابل ویرایش نیست." };
  }

  const user = getRuntimeUser(userId);
  if (!user) {
    return { ok: false, message: "کاربر موجود پیدا نشد." };
  }

  const memberships = listRuntimeMemberships().filter(
    (membership) => membership.userId === userId,
  );
  const ownerMembership =
    memberships.find((membership) => membership.role === MEMBERSHIP_ROLE.OWNER) ??
    memberships[0];
  if (!ownerMembership) {
    return {
      ok: false,
      message: "این کاربر عضویت مستأجر ندارد. ابتدا در کاربران عضویت را تکمیل کنید.",
    };
  }

  const tenant = listRuntimeTenants().find(
    (item) => item.id === ownerMembership.tenantId,
  );
  if (!tenant) {
    return { ok: false, message: "مستأجر مرتبط پیدا نشد." };
  }

  const websites = listRuntimeWebsitesByTenant(tenant.id);
  const keepWebsite =
    request.targetWebsiteId &&
    websites.some((website) => website.id === request.targetWebsiteId)
      ? request.targetWebsiteId
      : null;

  const updated = refreshDerivedFields({
    ...request,
    linkedUserId: user.id,
    linkedTenantId: tenant.id,
    targetWebsiteId: keepWebsite,
    history: appendHistory(
      request,
      "اتصال کاربر موجود",
      `${user.displayName} / ${tenant.name}`,
    ),
  });

  return { ok: true, request: replaceRequest(updated), user, tenant };
}

export type SelectWebsiteResultType =
  | { ok: true; request: PlanRequestType }
  | { ok: false; message: string };

export function selectWebsiteForPlanRequest(
  requestId: string,
  websiteId: string,
): SelectWebsiteResultType {
  const request = getRuntimePlanRequest(requestId);
  if (!request) {
    return { ok: false, message: "درخواست پیدا نشد." };
  }
  if (
    request.status === PLAN_REQUEST_STATUS.ENABLED ||
    request.status === PLAN_REQUEST_STATUS.DECLINED ||
    request.status === PLAN_REQUEST_STATUS.CANCELLED
  ) {
    return { ok: false, message: "این درخواست دیگر قابل ویرایش نیست." };
  }

  const website = getRuntimeWebsite(websiteId);
  if (!website) {
    return { ok: false, message: "وب‌سایت پیدا نشد." };
  }

  const tenant = listRuntimeTenants().find(
    (item) => item.id === website.tenantId,
  );
  if (!tenant) {
    return { ok: false, message: "مستأجر مرتبط با وب‌سایت پیدا نشد." };
  }

  const memberships = listRuntimeMemberships().filter(
    (membership) => membership.tenantId === website.tenantId,
  );
  const ownerMembership =
    memberships.find((membership) => membership.role === MEMBERSHIP_ROLE.OWNER) ??
    memberships[0];
  const owner = ownerMembership
    ? getRuntimeUser(ownerMembership.userId)
    : null;

  if (!owner) {
    return {
      ok: false,
      message:
        "برای این وب‌سایت کاربر مالک پیدا نشد. ابتدا در کاربران عضویت را تکمیل کنید.",
    };
  }

  const updated = refreshDerivedFields({
    ...request,
    linkedUserId: owner.id,
    linkedTenantId: tenant.id,
    targetWebsiteId: website.id,
    history: appendHistory(
      request,
      "انتخاب وب‌سایت هدف",
      `${website.domain} · ${owner.displayName}`,
    ),
  });

  return { ok: true, request: replaceRequest(updated) };
}

export type EnablePlanResultType =
  | { ok: true; request: PlanRequestType }
  | { ok: false; message: string };

export function enablePlanRequest(requestId: string): EnablePlanResultType {
  const request = getRuntimePlanRequest(requestId);
  if (!request) {
    return { ok: false, message: "درخواست پیدا نشد." };
  }

  const blockers = getPlanRequestBlockers(request);
  if (blockers.length > 0) {
    if (blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_USER)) {
      return {
        ok: false,
        message:
          "فعال‌سازی ممکن نیست. کاربر باید از قبل وجود داشته باشد و به درخواست متصل شود.",
      };
    }
    if (blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_TENANT)) {
      return {
        ok: false,
        message:
          "فعال‌سازی ممکن نیست. ابتدا احراز هویت را تأیید کنید تا مستأجر ایجاد شود.",
      };
    }
    if (blockers.includes(PLAN_REQUEST_BLOCKER.MISSING_WEBSITE)) {
      return { ok: false, message: "ابتدا وب‌سایت هدف را انتخاب کنید." };
    }
    if (blockers.includes(PLAN_REQUEST_BLOCKER.ACTIVE_PLAN_CONFLICT)) {
      return {
        ok: false,
        message:
          "وب‌سایت انتخاب‌شده از قبل پلن فعال دارد. فعال‌سازی مسدود است.",
      };
    }
  }

  if (!request.targetWebsiteId) {
    return { ok: false, message: "وب‌سایت هدف مشخص نیست." };
  }

  const website = setWebsiteActivePlan(
    request.targetWebsiteId,
    request.chosenPlanName,
  );
  if (!website) {
    return { ok: false, message: "به‌روزرسانی پلن وب‌سایت ناموفق بود." };
  }

  const updated: PlanRequestType = {
    ...request,
    status: PLAN_REQUEST_STATUS.ENABLED,
    nextAction: "مشاهده وب‌سایت فعال",
    updatedAt: "اکنون",
    history: appendHistory(
      request,
      "فعال‌سازی پلن",
      `${request.chosenPlanName} روی ${website.domain}`,
    ),
  };

  return { ok: true, request: replaceRequest(updated) };
}

export type RefusePlanResultType =
  | { ok: true; request: PlanRequestType }
  | { ok: false; message: string };

export function refusePlanRequest(
  requestId: string,
  kind: "declined" | "cancelled",
  reason: string,
): RefusePlanResultType {
  const request = getRuntimePlanRequest(requestId);
  if (!request) {
    return { ok: false, message: "درخواست پیدا نشد." };
  }
  if (
    request.status === PLAN_REQUEST_STATUS.ENABLED ||
    request.status === PLAN_REQUEST_STATUS.DECLINED ||
    request.status === PLAN_REQUEST_STATUS.CANCELLED
  ) {
    return { ok: false, message: "این درخواست دیگر قابل ویرایش نیست." };
  }

  const trimmed = reason.trim();
  if (!trimmed) {
    return { ok: false, message: "دلیل الزامی است." };
  }

  const status =
    kind === "declined"
      ? PLAN_REQUEST_STATUS.DECLINED
      : PLAN_REQUEST_STATUS.CANCELLED;

  const updated: PlanRequestType = {
    ...request,
    status,
    nextAction: "بایگانی",
    terminalReason: trimmed,
    updatedAt: "اکنون",
    history: appendHistory(
      request,
      kind === "declined" ? "رد درخواست" : "لغو درخواست",
      trimmed,
    ),
  };

  return { ok: true, request: replaceRequest(updated) };
}
