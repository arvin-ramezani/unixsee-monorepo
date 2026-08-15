import {
  ASSIGNMENT_CREATE_SOURCE,
  COMPLEMENTARY_SERVICE_ASSIGNMENTS,
  COMPLEMENTARY_SERVICE_REQUESTS,
  SERVICE_ASSIGNMENT_STATUS,
  SERVICE_REQUEST_STATUS,
  type ComplementaryServiceAssignmentType,
  type ComplementaryServiceFamilyType,
  type ComplementaryServiceRequestType,
  type ServiceCommercialModelType,
  type ServiceEngagementType,
  type ServiceRequestStatusType,
} from "@/lib/data/complementary-services-data";
import { getRuntimeWebsite } from "@/lib/data/websites-runtime";

/**
 * Prototype-only in-memory state so list and detail pages share assignments
 * created during this session. Persistence belongs to NestJS later.
 */
let runtimeRequests: ComplementaryServiceRequestType[] =
  COMPLEMENTARY_SERVICE_REQUESTS.map((request) => ({ ...request }));
let runtimeAssignments: ComplementaryServiceAssignmentType[] =
  COMPLEMENTARY_SERVICE_ASSIGNMENTS.map((assignment) => ({ ...assignment }));

const PENDING_REQUEST_STATUSES = new Set<ServiceRequestStatusType>([
  SERVICE_REQUEST_STATUS.SUBMITTED,
  SERVICE_REQUEST_STATUS.UNDER_REVIEW,
  SERVICE_REQUEST_STATUS.NEEDS_CUSTOMER_INFORMATION,
  SERVICE_REQUEST_STATUS.SCOPED,
  SERVICE_REQUEST_STATUS.QUOTED,
  SERVICE_REQUEST_STATUS.ACCEPTED,
]);

export function listRuntimeComplementaryRequests() {
  return runtimeRequests;
}

export function listRuntimeComplementaryAssignments() {
  return runtimeAssignments;
}

export function getRuntimeComplementaryRequest(id: string) {
  return runtimeRequests.find((request) => request.id === id);
}

export function hasRuntimeDuplicateAssignment(
  websiteId: string,
  family: ComplementaryServiceFamilyType,
) {
  return runtimeAssignments.some(
    (assignment) =>
      assignment.websiteId === websiteId &&
      assignment.family === family &&
      assignment.status !== SERVICE_ASSIGNMENT_STATUS.COMPLETED,
  );
}

export function hasRuntimeDuplicatePendingRequest(
  websiteId: string,
  family: ComplementaryServiceFamilyType,
  excludeRequestId?: string,
) {
  return runtimeRequests.some(
    (request) =>
      request.websiteId === websiteId &&
      request.family === family &&
      PENDING_REQUEST_STATUSES.has(request.status) &&
      request.id !== excludeRequestId,
  );
}

export function findRuntimeDuplicateAssignment(
  websiteId: string,
  family: ComplementaryServiceFamilyType,
) {
  return (
    runtimeAssignments.find(
      (assignment) =>
        assignment.websiteId === websiteId &&
        assignment.family === family &&
        assignment.status !== SERVICE_ASSIGNMENT_STATUS.COMPLETED,
    ) ?? null
  );
}

function formatStartDate(isoDate: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
  }).format(new Date(`${isoDate}T00:00:00`));
}

function nextAssignmentId() {
  return `CSA-${3022 + runtimeAssignments.length}`;
}

export type CreateComplementaryAssignmentFromRequestInput = {
  requestId: string;
  ownerName: string;
  commercialModel: ServiceCommercialModelType;
  startDate: string;
  agreedAmount: string;
  title?: string;
  description?: string;
  engagement?: ServiceEngagementType | null;
  serviceScope?: string | null;
  scopeSummary?: string | null;
  exclusions?: string | null;
};

export function createRuntimeComplementaryAssignment(
  input: CreateComplementaryAssignmentFromRequestInput,
) {
  const request = runtimeRequests.find((item) => item.id === input.requestId);
  if (!request) return null;

  if (request.status !== SERVICE_REQUEST_STATUS.ACCEPTED) {
    return { ok: false as const, reason: "not_accepted" as const };
  }

  const existing = findRuntimeDuplicateAssignment(
    request.websiteId,
    request.family,
  );
  if (existing) {
    return {
      ok: false as const,
      reason: "duplicate" as const,
      assignment: existing,
    };
  }

  const createdAssignment: ComplementaryServiceAssignmentType = {
    id: nextAssignmentId(),
    requestId: request.id,
    source: ASSIGNMENT_CREATE_SOURCE.REQUEST,
    createReason: null,
    customerName: request.customerName,
    websiteId: request.websiteId,
    websiteDomain: request.websiteDomain,
    websiteTitle: request.websiteTitle,
    family: request.family,
    title: input.title?.trim() || request.title,
    description: input.description?.trim() || request.description,
    engagement: input.engagement ?? null,
    serviceScope: input.serviceScope ?? null,
    scopeSummary: input.scopeSummary?.trim() || input.description?.trim() || request.description,
    exclusions: input.exclusions?.trim() || null,
    ownerName: input.ownerName,
    commercialModel: input.commercialModel,
    status: SERVICE_ASSIGNMENT_STATUS.SCHEDULED,
    startDate: formatStartDate(input.startDate),
    renewalDate: null,
    progressLabel: "در انتظار رسیدن تاریخ شروع",
    agreedAmount: input.agreedAmount,
  };

  runtimeAssignments = [createdAssignment, ...runtimeAssignments];
  runtimeRequests = runtimeRequests.map((currentRequest) =>
    currentRequest.id === request.id
      ? {
          ...currentRequest,
          status: SERVICE_REQUEST_STATUS.ACTIVATED,
          nextAction: "مشاهده سرویس ایجادشده",
          updatedAt: "همین حالا",
        }
      : currentRequest,
  );

  return {
    ok: true as const,
    assignment: createdAssignment,
    request: getRuntimeComplementaryRequest(request.id)!,
  };
}

export type CreateStaffComplementaryAssignmentInput = {
  websiteId: string;
  family: ComplementaryServiceFamilyType;
  title: string;
  description: string;
  engagement: ServiceEngagementType;
  serviceScope: string | null;
  scopeSummary: string;
  exclusions: string | null;
  ownerName: string;
  commercialModel: ServiceCommercialModelType;
  startDate: string;
  agreedAmount: string;
  createReason: string;
};

export function createRuntimeStaffComplementaryAssignment(
  input: CreateStaffComplementaryAssignmentInput,
) {
  const website = getRuntimeWebsite(input.websiteId);
  if (!website) {
    return { ok: false as const, reason: "website_missing" as const };
  }

  if (!website.tenantId) {
    return { ok: false as const, reason: "tenant_required" as const };
  }

  const existing = findRuntimeDuplicateAssignment(
    website.id,
    input.family,
  );
  if (existing) {
    return {
      ok: false as const,
      reason: "duplicate" as const,
      assignment: existing,
    };
  }

  const createdAssignment: ComplementaryServiceAssignmentType = {
    id: nextAssignmentId(),
    requestId: null,
    source: ASSIGNMENT_CREATE_SOURCE.STAFF,
    createReason: input.createReason.trim(),
    customerName: website.tenantName,
    websiteId: website.id,
    websiteDomain: website.domain,
    websiteTitle: website.title,
    family: input.family,
    title: input.title.trim(),
    description: input.description.trim(),
    engagement: input.engagement,
    serviceScope: input.serviceScope,
    scopeSummary: input.scopeSummary.trim(),
    exclusions: input.exclusions?.trim() || null,
    ownerName: input.ownerName,
    commercialModel: input.commercialModel,
    status: SERVICE_ASSIGNMENT_STATUS.SCHEDULED,
    startDate: formatStartDate(input.startDate),
    renewalDate: null,
    progressLabel: "در انتظار رسیدن تاریخ شروع",
    agreedAmount: input.agreedAmount.trim(),
  };

  runtimeAssignments = [createdAssignment, ...runtimeAssignments];

  return {
    ok: true as const,
    assignment: createdAssignment,
  };
}

export function declineRuntimeComplementaryRequest(input: {
  requestId: string;
  reason: string;
}) {
  const request = runtimeRequests.find((item) => item.id === input.requestId);
  if (!request) {
    return { ok: false as const, reason: "missing" as const };
  }

  if (
    request.status === SERVICE_REQUEST_STATUS.ACTIVATED ||
    request.status === SERVICE_REQUEST_STATUS.DECLINED
  ) {
    return { ok: false as const, reason: "not_rejectable" as const };
  }

  const trimmedReason = input.reason.trim();
  if (!trimmedReason) {
    return { ok: false as const, reason: "reason_required" as const };
  }

  runtimeRequests = runtimeRequests.map((currentRequest) =>
    currentRequest.id === request.id
      ? {
          ...currentRequest,
          status: SERVICE_REQUEST_STATUS.DECLINED,
          nextAction: "درخواست رد شده است",
          dueLabel: null,
          updatedAt: "همین حالا",
          customerNote: trimmedReason,
        }
      : currentRequest,
  );

  return {
    ok: true as const,
    request: getRuntimeComplementaryRequest(request.id)!,
  };
}
