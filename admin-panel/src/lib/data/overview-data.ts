import {
  COMPLEMENTARY_SERVICE_FAMILY_LABELS,
  COMPLEMENTARY_SERVICE_REQUESTS,
  SERVICE_REQUEST_STATUS,
  type ComplementaryServiceRequestType,
  type ServiceRequestStatusType,
} from "@/lib/data/complementary-services-data";
import {
  PLAN_REQUEST_STATUS,
  PLAN_REQUESTS,
  type PlanRequestStatusType,
  type PlanRequestType,
} from "@/lib/data/plan-requests-data";
import {
  TICKET_STATUS,
  TICKETS,
  type TicketType,
} from "@/lib/data/tickets-data";
import { formatRelativeTime, formatTicketNumber } from "@/lib/tickets-utils";

export const OVERVIEW_SEVERITY = {
  CRITICAL: "CRITICAL",
  WARNING: "WARNING",
  INFO: "INFO",
} as const;

export type OverviewSeverityType =
  (typeof OVERVIEW_SEVERITY)[keyof typeof OVERVIEW_SEVERITY];

export const OVERVIEW_SEVERITY_LABELS: Record<OverviewSeverityType, string> = {
  [OVERVIEW_SEVERITY.CRITICAL]: "بحرانی",
  [OVERVIEW_SEVERITY.WARNING]: "هشدار",
  [OVERVIEW_SEVERITY.INFO]: "عادی",
};

export const OVERVIEW_ITEM_TYPE = {
  TICKET: "TICKET",
  PLAN_REQUEST: "PLAN_REQUEST",
  COMPLEMENTARY_REQUEST: "COMPLEMENTARY_REQUEST",
} as const;

export type OverviewItemType =
  (typeof OVERVIEW_ITEM_TYPE)[keyof typeof OVERVIEW_ITEM_TYPE];

export const OVERVIEW_ITEM_TYPE_LABELS: Record<OverviewItemType, string> = {
  [OVERVIEW_ITEM_TYPE.TICKET]: "تیکت",
  [OVERVIEW_ITEM_TYPE.PLAN_REQUEST]: "درخواست پلن",
  [OVERVIEW_ITEM_TYPE.COMPLEMENTARY_REQUEST]: "خدمات تکمیلی",
};

export const OVERVIEW_SECTION_ID = {
  TICKETS: "tickets",
  PLAN_REQUESTS: "plan-requests",
  COMPLEMENTARY: "complementary",
} as const;

export type OverviewSectionIdType =
  (typeof OVERVIEW_SECTION_ID)[keyof typeof OVERVIEW_SECTION_ID];

export const OVERVIEW_SECTION_TITLES: Record<OverviewSectionIdType, string> = {
  [OVERVIEW_SECTION_ID.TICKETS]: "تیکت‌ها",
  [OVERVIEW_SECTION_ID.PLAN_REQUESTS]: "درخواست‌های پلن",
  [OVERVIEW_SECTION_ID.COMPLEMENTARY]: "خدمات تکمیلی",
};

export const OVERVIEW_SECTION_LOAD_STATE = {
  READY: "ready",
  FAILED: "failed",
  EMPTY: "empty",
} as const;

export type OverviewSectionLoadStateType =
  (typeof OVERVIEW_SECTION_LOAD_STATE)[keyof typeof OVERVIEW_SECTION_LOAD_STATE];

export type OverviewAttentionItemType = {
  id: string;
  severity: OverviewSeverityType;
  type: OverviewItemType;
  title: string;
  customerName: string | null;
  customerHref: string | null;
  ageLabel: string;
  slaHint: string | null;
  href: string;
  nextHint: string;
  sectionId: OverviewSectionIdType;
};

export type OverviewAttentionCountType = {
  id: string;
  label: string;
  count: number;
  hint: string;
  href: string;
  emphasis: boolean;
};

export type OverviewSectionType = {
  id: OverviewSectionIdType;
  title: string;
  items: OverviewAttentionItemType[];
  viewAllHref: string;
  loadState: OverviewSectionLoadStateType;
  errorMessage: string | null;
};

export type OverviewSnapshotType = {
  generatedAtLabel: string;
  attentionCounts: OverviewAttentionCountType[];
  sections: OverviewSectionType[];
};

const ACTIONABLE_PLAN_STATUSES = new Set<PlanRequestStatusType>([
  PLAN_REQUEST_STATUS.PENDING,
  PLAN_REQUEST_STATUS.READY_TO_ENABLE,
]);

const ACTIONABLE_COMPLEMENTARY_STATUSES = new Set<ServiceRequestStatusType>([
  SERVICE_REQUEST_STATUS.SUBMITTED,
  SERVICE_REQUEST_STATUS.UNDER_REVIEW,
  SERVICE_REQUEST_STATUS.SCOPED,
  SERVICE_REQUEST_STATUS.ACCEPTED,
]);

const TICKET_SLA_RISK_MS = 48 * 60 * 60 * 1000;
const OVERVIEW_REFERENCE_NOW = new Date("2026-08-08T12:00:00Z");
const SECTION_PREVIEW_LIMIT = 5;

function isTicketSlaRisk(ticket: TicketType, now: Date) {
  if (ticket.status === TICKET_STATUS.RESOLVED) return false;
  if (ticket.status === TICKET_STATUS.CLOSED) return false;
  if (ticket.status === TICKET_STATUS.SUBMITTED) return false;

  const updatedAt = new Date(ticket.updatedAt).getTime();
  if (Number.isNaN(updatedAt)) return false;

  return now.getTime() - updatedAt >= TICKET_SLA_RISK_MS;
}

function buildTicketItems(
  tickets: TicketType[],
  now: Date,
): OverviewAttentionItemType[] {
  return tickets
    .filter(
      (ticket) =>
        ticket.status !== TICKET_STATUS.RESOLVED &&
        ticket.status !== TICKET_STATUS.CLOSED,
    )
    .map((ticket) => {
      const slaRisk = isTicketSlaRisk(ticket, now);
      const isUnassigned = ticket.status === TICKET_STATUS.SUBMITTED;

      return {
        id: `ticket-${ticket.id}`,
        severity: slaRisk
          ? OVERVIEW_SEVERITY.WARNING
          : isUnassigned
            ? OVERVIEW_SEVERITY.WARNING
            : OVERVIEW_SEVERITY.INFO,
        type: OVERVIEW_ITEM_TYPE.TICKET,
        title: `${formatTicketNumber(ticket.id)} · ${ticket.subject}`,
        customerName: ticket.fullName,
        customerHref: `/users/${ticket.userId}`,
        ageLabel: formatRelativeTime(ticket.updatedAt, now),
        slaHint: slaRisk ? "ریسک SLA" : isUnassigned ? "تخصیص‌نشده" : null,
        href: `/tickets/${ticket.id}`,
        nextHint: isUnassigned ? "تخصیص" : "بررسی",
        sectionId: OVERVIEW_SECTION_ID.TICKETS,
      } satisfies OverviewAttentionItemType;
    });
}

function buildPlanRequestItems(
  requests: PlanRequestType[],
): OverviewAttentionItemType[] {
  return requests
    .filter((request) => ACTIONABLE_PLAN_STATUSES.has(request.status))
    .map((request) => ({
      id: `plan-${request.id}`,
      severity:
        request.status === PLAN_REQUEST_STATUS.READY_TO_ENABLE
          ? OVERVIEW_SEVERITY.WARNING
          : OVERVIEW_SEVERITY.INFO,
      type: OVERVIEW_ITEM_TYPE.PLAN_REQUEST,
      title: `${request.chosenPlanName} · ${request.contactName}`,
      customerName: request.contactName,
      customerHref: request.linkedUserId
        ? `/users/${request.linkedUserId}`
        : null,
      ageLabel: request.updatedAt,
      slaHint: request.nextAction,
      href: "/plan-requests?status=ACTIONABLE",
      nextHint: "بررسی",
      sectionId: OVERVIEW_SECTION_ID.PLAN_REQUESTS,
    }));
}

function buildComplementaryItems(
  requests: ComplementaryServiceRequestType[],
): OverviewAttentionItemType[] {
  return requests
    .filter((request) =>
      ACTIONABLE_COMPLEMENTARY_STATUSES.has(request.status),
    )
    .map((request) => ({
      id: `complementary-${request.id}`,
      severity: OVERVIEW_SEVERITY.INFO,
      type: OVERVIEW_ITEM_TYPE.COMPLEMENTARY_REQUEST,
      title: `${COMPLEMENTARY_SERVICE_FAMILY_LABELS[request.family]} · ${request.title}`,
      customerName: request.customerName,
      customerHref: `/users/${request.customerId}`,
      ageLabel: request.updatedAt,
      slaHint: request.nextAction,
      href: "/complementary-services?status=ACTIONABLE",
      nextHint: "بررسی",
      sectionId: OVERVIEW_SECTION_ID.COMPLEMENTARY,
    }));
}

function takePreview(items: OverviewAttentionItemType[]) {
  return items.slice(0, SECTION_PREVIEW_LIMIT);
}

function sectionState(
  items: OverviewAttentionItemType[],
): OverviewSectionLoadStateType {
  return items.length === 0
    ? OVERVIEW_SECTION_LOAD_STATE.EMPTY
    : OVERVIEW_SECTION_LOAD_STATE.READY;
}

export function buildOverviewSnapshot(options?: {
  now?: Date;
}): OverviewSnapshotType {
  const now = options?.now ?? OVERVIEW_REFERENCE_NOW;

  const ticketItems = buildTicketItems(TICKETS, now);
  const planItems = buildPlanRequestItems(PLAN_REQUESTS);
  const complementaryItems = buildComplementaryItems(
    COMPLEMENTARY_SERVICE_REQUESTS,
  );

  const slaTicketCount = ticketItems.filter(
    (item) => item.slaHint === "ریسک SLA",
  ).length;
  const unassignedTicketCount = ticketItems.filter(
    (item) => item.slaHint === "تخصیص‌نشده",
  ).length;
  const ticketAttentionCount = slaTicketCount + unassignedTicketCount;

  const attentionCounts: OverviewAttentionCountType[] = [
    {
      id: "tickets",
      label: "تیکت نیازمند اقدام",
      count: ticketAttentionCount,
      hint: "ریسک SLA یا تخصیص‌نشده",
      href: "/tickets?status=SUBMITTED",
      emphasis: ticketAttentionCount > 0,
    },
    {
      id: "plan-requests",
      label: "درخواست پلن",
      count: planItems.length,
      hint: "در انتظار بررسی یا فعال‌سازی",
      href: "/plan-requests?status=ACTIONABLE",
      emphasis: planItems.length > 0,
    },
    {
      id: "complementary",
      label: "خدمات تکمیلی",
      count: complementaryItems.length,
      hint: "درخواست مشتری در صف بررسی",
      href: "/complementary-services?status=ACTIONABLE",
      emphasis: complementaryItems.length > 0,
    },
  ];

  const sections: OverviewSectionType[] = [
    {
      id: OVERVIEW_SECTION_ID.TICKETS,
      title: OVERVIEW_SECTION_TITLES[OVERVIEW_SECTION_ID.TICKETS],
      items: takePreview(ticketItems),
      viewAllHref: "/tickets?status=SUBMITTED",
      loadState: sectionState(ticketItems),
      errorMessage: null,
    },
    {
      id: OVERVIEW_SECTION_ID.PLAN_REQUESTS,
      title: OVERVIEW_SECTION_TITLES[OVERVIEW_SECTION_ID.PLAN_REQUESTS],
      items: takePreview(planItems),
      viewAllHref: "/plan-requests?status=ACTIONABLE",
      loadState: sectionState(planItems),
      errorMessage: null,
    },
    {
      id: OVERVIEW_SECTION_ID.COMPLEMENTARY,
      title: OVERVIEW_SECTION_TITLES[OVERVIEW_SECTION_ID.COMPLEMENTARY],
      items: takePreview(complementaryItems),
      viewAllHref: "/complementary-services?status=ACTIONABLE",
      loadState: sectionState(complementaryItems),
      errorMessage: null,
    },
  ];

  return {
    generatedAtLabel: "اکنون · داده‌های نمایشی",
    attentionCounts,
    sections,
  };
}
