import {
  COMPLEMENTARY_SERVICE_FAMILY,
  SERVICE_REQUEST_STATUS,
  SERVICE_ASSIGNMENT_STATUS,
  type ComplementaryServiceRequestType,
  type ComplementaryServiceAssignmentType,
  type ComplementaryServiceFamilyType,
  type ServiceRequestStatusType,
  type ServiceAssignmentStatusType,
} from "@/lib/data/complementary-services-data";

/** Backend ComplementaryRequestStatus → frontend ServiceRequestStatusType */
const STATUS_MAP: Record<string, ServiceRequestStatusType> = {
  SUBMITTED: SERVICE_REQUEST_STATUS.SUBMITTED,
  QUOTED: SERVICE_REQUEST_STATUS.QUOTED,
  ASSIGNED: SERVICE_REQUEST_STATUS.ACCEPTED,
  IN_PROGRESS: SERVICE_REQUEST_STATUS.ACCEPTED,
  COMPLETED: SERVICE_REQUEST_STATUS.ACCEPTED,
  WITHDRAWN: SERVICE_REQUEST_STATUS.DECLINED,
};

/** Catalog item code → frontend family type */
const FAMILY_MAP: Record<string, ComplementaryServiceFamilyType> = {
  SEO: COMPLEMENTARY_SERVICE_FAMILY.SEO,
  GRAPHIC_DESIGN: COMPLEMENTARY_SERVICE_FAMILY.GRAPHIC_DESIGN,
  PRODUCT_DATA_ENTRY: COMPLEMENTARY_SERVICE_FAMILY.PRODUCT_DATA_ENTRY,
  SOCIAL_MEDIA: COMPLEMENTARY_SERVICE_FAMILY.SOCIAL_MEDIA,
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "امروز";
    if (hours < 24) return `${hours} ساعت پیش`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "دیروز";
    if (days < 7) return `${days} روز پیش`;
    return formatDate(iso);
  } catch {
    return iso;
  }
}

function resolveNextAction(status: string): string {
  switch (status) {
    case "SUBMITTED":
      return "بررسی اولیه درخواست";
    case "QUOTED":
      return "پیگیری تصمیم مشتری";
    case "ASSIGNED":
      return "شروع اجرا";
    case "IN_PROGRESS":
      return "پیگیری پیشرفت";
    case "COMPLETED":
      return "تکمیل شده";
    case "WITHDRAWN":
      return "لغو شده";
    default:
      return "بررسی کنید";
  }
}

export type AdminComplementaryRequestApiItem = {
  id: string;
  catalogItemId: string;
  status: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  details?: string | null;
  tenantId?: string | null;
  websiteId?: string | null;
  createdAt: string;
  updatedAt: string;
  catalogItem?: {
    id: string;
    code: string;
    nameFa: string;
    nameEn: string;
    descriptionFa?: string | null;
    descriptionEn?: string | null;
  } | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
  website?: {
    id: string;
    domain: string;
    displayName?: string | null;
  } | null;
  quotations?: Array<{
    id: string;
    amount: number;
    currency: string;
    notes?: string | null;
  }> | null;
  assignments?: Array<{
    id: string;
    requestId: string;
    assigneeNote?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    createdAt: string;
  }> | null;
};

export function mapAdminRequestToUi(
  item: AdminComplementaryRequestApiItem,
): ComplementaryServiceRequestType {
  const family =
    FAMILY_MAP[item.catalogItem?.code ?? ""] ??
    COMPLEMENTARY_SERVICE_FAMILY.SEO;
  const status = STATUS_MAP[item.status] ?? SERVICE_REQUEST_STATUS.SUBMITTED;
  const websiteDomain = item.website?.domain ?? "نامشخص";
  const websiteTitle = item.website?.displayName ?? websiteDomain;
  const customerName = item.tenant?.name ?? item.contactName;
  const lastAssignment = item.assignments?.[item.assignments.length - 1];

  return {
    id: item.id.slice(0, 8).toUpperCase(),
    customerName,
    customerId: item.tenantId ?? "",
    websiteId: item.websiteId ?? "",
    websiteDomain,
    websiteTitle,
    family,
    title: item.catalogItem?.nameFa ?? "سرویس تکمیلی",
    description: item.details ?? item.catalogItem?.descriptionFa ?? "",
    preferredEngagement: "",
    status,
    ownerName: lastAssignment?.assigneeNote ?? null,
    submittedAt: formatDate(item.createdAt),
    updatedAt: formatRelative(item.updatedAt),
    nextAction: resolveNextAction(item.status),
    dueLabel: null,
    customerNote: item.contactEmail ?? null,
  };
}

export function mapAdminAssignmentToUi(
  request: AdminComplementaryRequestApiItem,
  assignment: NonNullable<AdminComplementaryRequestApiItem["assignments"]>[number],
): ComplementaryServiceAssignmentType {
  const family =
    FAMILY_MAP[request.catalogItem?.code ?? ""] ??
    COMPLEMENTARY_SERVICE_FAMILY.SEO;

  return {
    id: assignment.id.slice(0, 8).toUpperCase(),
    requestId: request.id,
    source: "REQUEST" as const,
    createReason: null,
    customerName: request.tenant?.name ?? request.contactName,
    websiteId: request.websiteId ?? "",
    websiteDomain: request.website?.domain ?? "نامشخص",
    websiteTitle: request.website?.displayName ?? undefined,
    family,
    title: request.catalogItem?.nameFa ?? "سرویس تکمیلی",
    description: request.details ?? undefined,
    engagement: null,
    serviceScope: null,
    scopeSummary: null,
    exclusions: null,
    ownerName: assignment.assigneeNote ?? "تخصیص داده نشده",
    commercialModel: "CUSTOM_QUOTE" as const,
    status: assignment.completedAt
      ? SERVICE_ASSIGNMENT_STATUS.COMPLETED
      : SERVICE_ASSIGNMENT_STATUS.ACTIVE,
    startDate: assignment.startedAt
      ? formatDate(assignment.startedAt)
      : formatDate(assignment.createdAt),
    renewalDate: null,
    progressLabel: assignment.completedAt ? "تکمیل شده" : "در حال اجرا",
    agreedAmount: request.quotations?.[0]
      ? `${request.quotations[0].amount.toLocaleString("fa-IR")} تومان`
      : "تعریف نشده",
  };
}

export function mapAdminComplementaryList(
  items: AdminComplementaryRequestApiItem[],
): {
  requests: ComplementaryServiceRequestType[];
  assignments: ComplementaryServiceAssignmentType[];
} {
  const requests: ComplementaryServiceRequestType[] = [];
  const assignments: ComplementaryServiceAssignmentType[] = [];

  for (const item of items) {
    requests.push(mapAdminRequestToUi(item));

    if (item.assignments) {
      for (const assignment of item.assignments) {
        assignments.push(mapAdminAssignmentToUi(item, assignment));
      }
    }
  }

  return { requests, assignments };
}
