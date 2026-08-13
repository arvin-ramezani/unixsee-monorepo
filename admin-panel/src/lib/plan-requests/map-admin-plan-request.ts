import {
  PLAN_REQUEST_STATUS,
  type PlanRequestStatusType,
  type PlanRequestType,
} from "@/lib/data/plan-requests-data";
import {
  resolvePlanRequestIntake,
  PLAN_REQUEST_INTAKE,
  type PlanRequestIntakeType,
} from "@/lib/plan-requests/plan-request-intake";

export type NestPlanRequestStatus =
  | "SUBMITTED"
  | "LINKED"
  | "ENABLED"
  | "DECLINED";

export type AdminPlanRequestDto = {
  id: string;
  planId: string;
  status: NestPlanRequestStatus | string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  websiteDomain: string | null;
  notes: string | null;
  tenantId: string | null;
  linkedUserId: string | null;
  websiteId: string | null;
  declineReason: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: string;
    code: string;
    nameFa: string;
    nameEn: string;
  } | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
  website?: {
    id: string;
    domain: string;
    name?: string | null;
  } | null;
  linkedUser?: {
    id: string;
    fullName: string | null;
  } | null;
};

export type AdminPlanRequestListResponse = {
  items: AdminPlanRequestDto[];
  total: number;
};

function formatFaDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function mapNestStatusToUi(status: string): PlanRequestStatusType {
  switch (status) {
    case "LINKED":
      return PLAN_REQUEST_STATUS.READY_TO_ENABLE;
    case "ENABLED":
      return PLAN_REQUEST_STATUS.ENABLED;
    case "DECLINED":
      return PLAN_REQUEST_STATUS.DECLINED;
    case "SUBMITTED":
    default:
      return PLAN_REQUEST_STATUS.PENDING;
  }
}

function nextActionFor(
  item: AdminPlanRequestDto,
  intakeType: PlanRequestIntakeType,
): string {
  const status = mapNestStatusToUi(item.status);
  if (status === PLAN_REQUEST_STATUS.ENABLED) {
    return "مشاهده وب‌سایت فعال";
  }
  if (status === PLAN_REQUEST_STATUS.DECLINED) {
    return "بایگانی";
  }
  if (!item.linkedUserId || !item.tenantId) {
    return intakeType === PLAN_REQUEST_INTAKE.PUBLIC
      ? "یافتن کاربر موجود و اتصال"
      : "تکمیل اتصال حساب مشتری";
  }
  if (!item.websiteId) {
    return "انتخاب وب‌سایت هدف";
  }
  if (status === PLAN_REQUEST_STATUS.READY_TO_ENABLE) {
    return "فعال‌سازی پلن روی وب‌سایت";
  }
  return "بررسی درخواست";
}

export function mapAdminPlanRequestToUi(
  item: AdminPlanRequestDto,
): PlanRequestType {
  const planName =
    item.plan?.nameEn?.trim() ||
    item.plan?.nameFa?.trim() ||
    item.plan?.code ||
    "—";
  const intakeType = resolvePlanRequestIntake(item);

  return {
    id: item.id,
    chosenPlanId: item.plan?.code ?? item.planId,
    chosenPlanName: planName,
    intakeType,
    contactName: item.contactName,
    contactEmail: item.contactEmail,
    contactMobile: item.contactPhone,
    domainHint: item.websiteDomain,
    notes: item.notes,
    linkedUserId: item.linkedUserId,
    linkedUserName: item.linkedUser?.fullName?.trim() || null,
    linkedTenantId: item.tenantId,
    linkedTenantName: item.tenant?.name?.trim() || null,
    targetWebsiteId: item.websiteId,
    targetWebsiteDomain: item.website?.domain ?? null,
    status: mapNestStatusToUi(item.status),
    nextAction: nextActionFor(item, intakeType),
    submittedAt: formatFaDate(item.createdAt),
    updatedAt: formatFaDate(item.updatedAt),
    terminalReason: item.declineReason,
    history: [],
  };
}

export function mapAdminPlanRequestListToUi(
  response: AdminPlanRequestListResponse,
): PlanRequestType[] {
  return response.items.map(mapAdminPlanRequestToUi);
}
