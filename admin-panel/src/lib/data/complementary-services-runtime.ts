import {
  COMPLEMENTARY_SERVICE_ASSIGNMENTS,
  COMPLEMENTARY_SERVICE_REQUESTS,
  SERVICE_ASSIGNMENT_STATUS,
  SERVICE_REQUEST_STATUS,
  type ComplementaryServiceAssignmentType,
  type ComplementaryServiceFamilyType,
  type ComplementaryServiceRequestType,
  type ServiceCommercialModelType,
} from "@/lib/data/complementary-services-data";

/**
 * Prototype-only in-memory state so list and detail pages share assignments
 * created during this session. Persistence belongs to NestJS later.
 */
let runtimeRequests: ComplementaryServiceRequestType[] =
  COMPLEMENTARY_SERVICE_REQUESTS.map((request) => ({ ...request }));
let runtimeAssignments: ComplementaryServiceAssignmentType[] =
  COMPLEMENTARY_SERVICE_ASSIGNMENTS.map((assignment) => ({ ...assignment }));

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

export type CreateComplementaryAssignmentInput = {
  requestId: string;
  ownerName: string;
  commercialModel: ServiceCommercialModelType;
  startDate: string;
  agreedAmount: string;
};

export function createRuntimeComplementaryAssignment(
  input: CreateComplementaryAssignmentInput,
) {
  const request = runtimeRequests.find((item) => item.id === input.requestId);
  if (!request) return null;

  const createdAssignment: ComplementaryServiceAssignmentType = {
    id: `CSA-${3022 + runtimeAssignments.length}`,
    requestId: request.id,
    customerName: request.customerName,
    websiteId: request.websiteId,
    websiteDomain: request.websiteDomain,
    family: request.family,
    title: request.title,
    ownerName: input.ownerName,
    commercialModel: input.commercialModel,
    status: SERVICE_ASSIGNMENT_STATUS.SCHEDULED,
    startDate: new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
    }).format(new Date(`${input.startDate}T00:00:00`)),
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
    assignment: createdAssignment,
    request: getRuntimeComplementaryRequest(request.id)!,
  };
}
