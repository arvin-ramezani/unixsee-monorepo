export type ComplementaryServiceType =
  "seo" | "graphic-design" | "product-data-entry" | "social-media-support";

export type EngagementType = "recurring" | "one-time";
export type ConsultationEngagementPreference = EngagementType | "not-sure";
export type ComplementaryServiceStatus =
  "requested" | "active" | "completed" | "cancelled" | "expired";

export interface ServiceWebsite {
  id: string;
  name: string;
  domain: string;
}

export type ServiceUsage =
  | {
      type: "quota";
      unit: "design-requests" | "posts" | "products";
      used: number;
      total: number;
      renewsAt?: string;
    }
  | {
      type: "project";
      stageKey: "discovery" | "production" | "review" | "delivered";
      progress: number;
      expectedCompletionAt?: string;
    };

export interface ServiceActivity {
  id: string;
  eventKey:
    | "consultationRequested"
    | "serviceActivated"
    | "projectStarted"
    | "quotaUsed"
    | "deliverableCompleted"
    | "periodRenewed"
    | "projectCompleted";
  occurredAt: string;
}

export interface ComplementaryService {
  id: string;
  serviceType: ComplementaryServiceType;
  title?: string;
  titleKey?:
    | "campaignDesign"
    | "socialSupport"
    | "catalogEntry"
    | "seoAudit"
    | "logoDesign";
  websiteId: string;
  websiteName: string;
  domain: string;
  engagementType: EngagementType;
  status: ComplementaryServiceStatus;
  startedAt?: string;
  endsAt?: string;
  completedAt?: string;
  usage?: ServiceUsage;
  scopeKeys: Array<
    | "designAllowance"
    | "postPlanning"
    | "productEntry"
    | "seoAudit"
    | "logoPackage"
  >;
  activity: ServiceActivity[];
}

export interface ConsultationRequest {
  id: string;
  serviceType: ComplementaryServiceType;
  websiteId: string;
  websiteName: string;
  domain: string;
  engagementPreference: ConsultationEngagementPreference;
  title?: string;
  summary?: string;
  titleKey?: "seasonalSeo" | "newBrandSystem" | "monthlySocial";
  summaryKey?: "seasonalSeo" | "newBrandSystem" | "monthlySocial";
  status: "requested" | "cancelled";
  canWithdraw?: boolean;
  requestedAt: string;
}

export const serviceWebsites: ServiceWebsite[] = [
  { id: "greenario-store", name: "Greenario Store", domain: "greenario.com" },
  { id: "luna-studio", name: "Luna Studio", domain: "lunastudio.co" },
  { id: "orbit-labs", name: "Orbit Labs", domain: "orbitlabs.io" },
  { id: "nova-agency", name: "Nova Agency", domain: "novaagency.com" },
];

export const complementaryServices: ComplementaryService[] = [
  {
    id: "svc-design-campaign",
    serviceType: "graphic-design",
    titleKey: "campaignDesign",
    websiteId: "greenario-store",
    websiteName: "Greenario Store",
    domain: "greenario.com",
    engagementType: "recurring",
    status: "active",
    startedAt: "2026-07-01T00:00:00Z",
    endsAt: "2026-07-31T23:59:59Z",
    usage: {
      type: "quota",
      unit: "design-requests",
      used: 4,
      total: 5,
      renewsAt: "2026-08-01T00:00:00Z",
    },
    scopeKeys: ["designAllowance"],
    activity: [
      {
        id: "a1",
        eventKey: "consultationRequested",
        occurredAt: "2026-06-24T09:00:00Z",
      },
      {
        id: "a2",
        eventKey: "serviceActivated",
        occurredAt: "2026-07-01T09:00:00Z",
      },
      {
        id: "a3",
        eventKey: "deliverableCompleted",
        occurredAt: "2026-07-14T15:30:00Z",
      },
    ],
  },
  {
    id: "svc-social-monthly",
    serviceType: "social-media-support",
    titleKey: "socialSupport",
    websiteId: "luna-studio",
    websiteName: "Luna Studio",
    domain: "lunastudio.co",
    engagementType: "recurring",
    status: "active",
    startedAt: "2026-07-01T00:00:00Z",
    endsAt: "2026-07-31T23:59:59Z",
    usage: {
      type: "quota",
      unit: "posts",
      used: 12,
      total: 12,
      renewsAt: "2026-08-01T00:00:00Z",
    },
    scopeKeys: ["postPlanning"],
    activity: [
      {
        id: "b1",
        eventKey: "serviceActivated",
        occurredAt: "2026-07-01T08:00:00Z",
      },
      { id: "b2", eventKey: "quotaUsed", occurredAt: "2026-07-18T12:00:00Z" },
    ],
  },
  {
    id: "svc-product-catalog",
    serviceType: "product-data-entry",
    titleKey: "catalogEntry",
    websiteId: "greenario-store",
    websiteName: "Greenario Store",
    domain: "greenario.com",
    engagementType: "one-time",
    status: "active",
    startedAt: "2026-07-08T00:00:00Z",
    endsAt: "2026-07-29T00:00:00Z",
    usage: { type: "quota", unit: "products", used: 160, total: 300 },
    scopeKeys: ["productEntry"],
    activity: [
      {
        id: "c1",
        eventKey: "projectStarted",
        occurredAt: "2026-07-08T08:00:00Z",
      },
      { id: "c2", eventKey: "quotaUsed", occurredAt: "2026-07-18T17:00:00Z" },
    ],
  },
  {
    id: "svc-seo-audit",
    serviceType: "seo",
    titleKey: "seoAudit",
    websiteId: "nova-agency",
    websiteName: "Nova Agency",
    domain: "novaagency.com",
    engagementType: "one-time",
    status: "active",
    startedAt: "2026-07-11T00:00:00Z",
    endsAt: "2026-07-25T00:00:00Z",
    usage: {
      type: "project",
      stageKey: "review",
      progress: 72,
      expectedCompletionAt: "2026-07-25T00:00:00Z",
    },
    scopeKeys: ["seoAudit"],
    activity: [
      {
        id: "d1",
        eventKey: "consultationRequested",
        occurredAt: "2026-07-03T11:00:00Z",
      },
      {
        id: "d2",
        eventKey: "projectStarted",
        occurredAt: "2026-07-11T08:30:00Z",
      },
    ],
  },
  {
    id: "svc-logo-complete",
    serviceType: "graphic-design",
    titleKey: "logoDesign",
    websiteId: "orbit-labs",
    websiteName: "Orbit Labs",
    domain: "orbitlabs.io",
    engagementType: "one-time",
    status: "completed",
    startedAt: "2026-05-04T00:00:00Z",
    endsAt: "2026-05-22T00:00:00Z",
    completedAt: "2026-05-20T15:00:00Z",
    usage: {
      type: "project",
      stageKey: "delivered",
      progress: 100,
      expectedCompletionAt: "2026-05-22T00:00:00Z",
    },
    scopeKeys: ["logoPackage"],
    activity: [
      {
        id: "e1",
        eventKey: "projectStarted",
        occurredAt: "2026-05-04T09:00:00Z",
      },
      {
        id: "e2",
        eventKey: "projectCompleted",
        occurredAt: "2026-05-20T15:00:00Z",
      },
    ],
  },
  {
    id: "svc-social-expired",
    serviceType: "social-media-support",
    titleKey: "socialSupport",
    websiteId: "nova-agency",
    websiteName: "Nova Agency",
    domain: "novaagency.com",
    engagementType: "recurring",
    status: "expired",
    startedAt: "2026-04-01T00:00:00Z",
    endsAt: "2026-04-30T23:59:59Z",
    completedAt: "2026-04-30T23:59:59Z",
    usage: { type: "quota", unit: "posts", used: 10, total: 12 },
    scopeKeys: ["postPlanning"],
    activity: [
      {
        id: "f1",
        eventKey: "periodRenewed",
        occurredAt: "2026-04-01T00:00:00Z",
      },
    ],
  },
  {
    id: "svc-seo-cancelled",
    serviceType: "seo",
    titleKey: "seoAudit",
    websiteId: "luna-studio",
    websiteName: "Luna Studio",
    domain: "lunastudio.co",
    engagementType: "one-time",
    status: "cancelled",
    startedAt: "2026-06-05T00:00:00Z",
    endsAt: "2026-06-19T00:00:00Z",
    completedAt: "2026-06-10T13:20:00Z",
    usage: {
      type: "project",
      stageKey: "discovery",
      progress: 15,
      expectedCompletionAt: "2026-06-19T00:00:00Z",
    },
    scopeKeys: ["seoAudit"],
    activity: [
      {
        id: "g1",
        eventKey: "consultationRequested",
        occurredAt: "2026-06-01T10:00:00Z",
      },
    ],
  },
];

export const consultationRequests: ConsultationRequest[] = [
  {
    id: "req-seo-seasonal",
    serviceType: "seo",
    websiteId: "greenario-store",
    websiteName: "Greenario Store",
    domain: "greenario.com",
    engagementPreference: "not-sure",
    titleKey: "seasonalSeo",
    summaryKey: "seasonalSeo",
    status: "requested",
    requestedAt: "2026-07-18T10:30:00Z",
  },
  {
    id: "req-brand-system",
    serviceType: "graphic-design",
    websiteId: "luna-studio",
    websiteName: "Luna Studio",
    domain: "lunastudio.co",
    engagementPreference: "one-time",
    titleKey: "newBrandSystem",
    summaryKey: "newBrandSystem",
    status: "requested",
    requestedAt: "2026-07-16T08:15:00Z",
  },
  {
    id: "req-social-cancelled",
    serviceType: "social-media-support",
    websiteId: "orbit-labs",
    websiteName: "Orbit Labs",
    domain: "orbitlabs.io",
    engagementPreference: "recurring",
    titleKey: "monthlySocial",
    summaryKey: "monthlySocial",
    status: "cancelled",
    requestedAt: "2026-06-08T08:15:00Z",
  },
];

export const serviceTypes: ComplementaryServiceType[] = [
  "seo",
  "graphic-design",
  "product-data-entry",
  "social-media-support",
];

export function getComplementaryService(serviceId: string) {
  return complementaryServices.find((service) => service.id === serviceId);
}
