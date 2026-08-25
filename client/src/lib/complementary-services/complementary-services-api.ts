import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import { publicFetch } from "@/lib/api/public-fetch";
import { serverFetch } from "@/lib/api/server-fetch";
import type {
  ComplementaryService,
  ComplementaryServiceType,
  ConsultationEngagementPreference,
  ConsultationRequest,
  ServiceWebsite,
} from "@/lib/data/complementary-services/complementary-services-data";
import type {
  ComplementaryCatalogItem,
  ComplementaryRequestFormData,
  ComplementaryRequestSummary,
  ComplementaryWebsiteOption,
  WebsiteManagementCoverage,
} from "@/lib/complementary-services/types";
import { catalogCodeToServiceType } from "@/lib/complementary-services/types";

type FetchResult<T> =
  { ok: true; data: T } | { ok: false; error: MappedApiError };

type NestWebsite = {
  id: string;
  domain: string;
  displayName: string | null;
  managementCoverage: WebsiteManagementCoverage;
};

type NestAssignment = {
  id: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

type NestComplementaryRequest = ComplementaryRequestSummary & {
  title: string | null;
  details: string | null;
  engagementPreference: "ONE_TIME" | "RECURRING" | "NOT_SURE" | null;
  createdAt: string;
  catalogItem: ComplementaryCatalogItem;
  website: NestWebsite | null;
  assignments: NestAssignment[];
};

type RequestList = {
  items: NestComplementaryRequest[];
  total: number;
};

export type ComplementaryServicesDashboardData = {
  services: ComplementaryService[];
  requests: ConsultationRequest[];
  websites: ServiceWebsite[];
};

function failure(response: Parameters<typeof mapApiError>[0]): {
  ok: false;
  error: MappedApiError;
} {
  return {
    ok: false,
    error: mapApiError(response) ?? {
      key: "generic",
      code: null,
      statusCode: response?.statusCode ?? null,
    },
  };
}

async function fetchSourceData(): Promise<
  FetchResult<{
    catalog: ComplementaryCatalogItem[];
    websites: ComplementaryWebsiteOption[];
    requests: NestComplementaryRequest[];
  }>
> {
  try {
    const [catalogResponse, websitesResponse, requestsResponse] =
      await Promise.all([
        publicFetch<ComplementaryCatalogItem[]>("/public/service-catalog", {
          method: "GET",
        }),
        serverFetch<NestWebsite[]>("/websites", { method: "GET" }),
        serverFetch<RequestList>("/complementary-service-requests?take=100", {
          method: "GET",
        }),
      ]);

    if (!catalogResponse.success || !catalogResponse.data) {
      return failure(catalogResponse);
    }
    if (!websitesResponse.success || !websitesResponse.data) {
      return failure(websitesResponse);
    }
    if (!requestsResponse.success || !requestsResponse.data) {
      return failure(requestsResponse);
    }

    return {
      ok: true,
      data: {
        catalog: catalogResponse.data,
        websites: websitesResponse.data.map((website) => ({
          id: website.id,
          name: website.displayName?.trim() || website.domain,
          domain: website.domain,
          managementCoverage: website.managementCoverage,
        })),
        requests: requestsResponse.data.items,
      },
    };
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}

export async function fetchComplementaryRequestFormData(): Promise<
  FetchResult<ComplementaryRequestFormData>
> {
  const source = await fetchSourceData();
  if (!source.ok) return source;

  return {
    ok: true,
    data: {
      catalog: source.data.catalog,
      websites: source.data.websites,
      requests: source.data.requests,
    },
  };
}

function engagementPreference(
  value: NestComplementaryRequest["engagementPreference"],
): ConsultationEngagementPreference {
  if (value === "RECURRING") return "recurring";
  if (value === "ONE_TIME") return "one-time";
  return "not-sure";
}

function requestWebsite(request: NestComplementaryRequest) {
  const domain = request.websiteDomain ?? request.website?.domain ?? "";
  const websiteId = request.websiteId ?? `domain:${domain}`;
  return {
    domain,
    websiteId,
    websiteName: request.website?.displayName?.trim() || domain,
  };
}

function toService(
  request: NestComplementaryRequest,
  serviceType: ComplementaryServiceType,
): ComplementaryService | null {
  const assignment = request.assignments[0];
  if (!assignment) return null;
  const website = requestWebsite(request);
  const completed = request.status === "COMPLETED";

  return {
    id: assignment.id,
    serviceType,
    title: request.title ?? request.catalogItem.nameFa,
    ...website,
    engagementType:
      request.engagementPreference === "RECURRING" ? "recurring" : "one-time",
    status: completed ? "completed" : "active",
    startedAt: assignment.startedAt ?? assignment.createdAt,
    completedAt:
      assignment.completedAt ?? (completed ? assignment.createdAt : undefined),
    scopeKeys: [],
    activity: [
      {
        id: `${request.id}:requested`,
        eventKey: "consultationRequested",
        occurredAt: request.createdAt,
      },
      {
        id: `${assignment.id}:activated`,
        eventKey: "serviceActivated",
        occurredAt: assignment.startedAt ?? assignment.createdAt,
      },
      ...(completed
        ? [
            {
              id: `${assignment.id}:completed`,
              eventKey: "projectCompleted" as const,
              occurredAt: assignment.completedAt ?? assignment.createdAt,
            },
          ]
        : []),
    ],
  };
}

function toRequest(
  request: NestComplementaryRequest,
  serviceType: ComplementaryServiceType,
): ConsultationRequest {
  return {
    id: request.id,
    serviceType,
    ...requestWebsite(request),
    engagementPreference: engagementPreference(request.engagementPreference),
    title: request.title ?? request.catalogItem.nameFa,
    summary: request.details ?? "",
    status:
      request.status === "CANCELLED" || request.status === "WITHDRAWN"
        ? "cancelled"
        : "requested",
    canWithdraw: request.status === "SUBMITTED" || request.status === "QUOTED",
    requestedAt: request.createdAt,
  };
}

export async function fetchComplementaryServicesDashboardData(): Promise<
  FetchResult<ComplementaryServicesDashboardData>
> {
  const source = await fetchSourceData();
  if (!source.ok) return source;

  const websiteMap = new Map<string, ServiceWebsite>();
  for (const website of source.data.websites) {
    websiteMap.set(website.id, website);
  }

  const services: ComplementaryService[] = [];
  const requests: ConsultationRequest[] = [];
  for (const request of source.data.requests) {
    const serviceType = catalogCodeToServiceType(request.catalogItem.code);
    if (!serviceType) continue;

    const target = requestWebsite(request);
    if (target.domain && !websiteMap.has(target.websiteId)) {
      websiteMap.set(target.websiteId, {
        id: target.websiteId,
        name: target.websiteName,
        domain: target.domain,
      });
    }

    const service = toService(request, serviceType);
    if (service) services.push(service);
    else requests.push(toRequest(request, serviceType));
  }

  return {
    ok: true,
    data: { services, requests, websites: [...websiteMap.values()] },
  };
}
