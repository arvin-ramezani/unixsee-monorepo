export const SERVER_AGENT_STATE = {
  PENDING_AGENT: "PENDING_AGENT",
  ENROLLMENT_ISSUED: "ENROLLMENT_ISSUED",
  CONNECTED: "CONNECTED",
  STALE: "STALE",
  DISCONNECTED: "DISCONNECTED",
} as const;

export type ServerAgentStateType =
  (typeof SERVER_AGENT_STATE)[keyof typeof SERVER_AGENT_STATE];

export const ENROLLMENT_TOKEN_STATUS = {
  NONE: "NONE",
  UNUSED: "UNUSED",
  USED: "USED",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
} as const;

export type EnrollmentTokenStatusType =
  (typeof ENROLLMENT_TOKEN_STATUS)[keyof typeof ENROLLMENT_TOKEN_STATUS];

export const DISCOVERY_ASSIGNMENT_STATUS = {
  UNASSIGNED: "UNASSIGNED",
  ASSIGNED: "ASSIGNED",
} as const;

export type DiscoveryAssignmentStatusType =
  (typeof DISCOVERY_ASSIGNMENT_STATUS)[keyof typeof DISCOVERY_ASSIGNMENT_STATUS];

export const SERVER_STACK = {
  CONTROL_PANEL: "DirectAdmin",
  WEB_SERVER: "OpenLiteSpeed",
  APPLICATION: "WooCommerce",
} as const;

/**
 * Fixture shape aligned with Nest admin server/discovery read models
 * (`GET /api/v1/admin/servers`, discoveries). Optional Phase 1 fields mirror
 * `docs/agent/phase1-api-contract.md` for a thin swap when ADR 0003 is lifted.
 */
export type WebsiteDiscoveryType = {
  id: string;
  domain: string;
  title: string;
  controlPanel: typeof SERVER_STACK.CONTROL_PANEL;
  webServer: typeof SERVER_STACK.WEB_SERVER;
  application: typeof SERVER_STACK.APPLICATION;
  assignmentStatus: DiscoveryAssignmentStatusType;
  assignedWebsiteId?: string;
  discoveredAt: string;
  /** Phase 1 agent-sourced fields (optional on fixtures until Nest wiring). */
  controlPanelUrl?: string;
  wordpressAdminUrl?: string;
  wordpressVersion?: string;
  phpVersion?: string;
  phpVersionScope?: "site" | "host" | "unknown";
  imagickVersion?: string;
  wordpressUpdateStatus?: string;
  wordpressUpdateCheckedAt?: string;
  activeVisitors3m?: {
    uniqueIpCount: number;
    windowSeconds: number;
    measuredAt: string;
  };
};

export type ServerEnrollmentType = {
  status: EnrollmentTokenStatusType;
  issuedAt?: string;
  expiresAt?: string;
};

export type ServerEnrollmentTokenRow = {
  id: string;
  status: "ACTIVE" | "USED" | "REVOKED" | "EXPIRED" | string;
  createdAt: string;
  expiresAt?: string | null;
  usedAt?: string | null;
  revokedAt?: string | null;
};

export type ServerAgentType = {
  state: ServerAgentStateType;
  version?: string;
  lastSeenAt?: string;
  dataFreshness?: "UP_TO_DATE" | "STALE";
};

export type ServerType = {
  id: string;
  label: string;
  location: string;
  capacitySummary: string;
  notes: string;
  createdAt: string;
  agent: ServerAgentType;
  enrollment: ServerEnrollmentType;
  enrollmentTokens: ServerEnrollmentTokenRow[];
  discoveries: WebsiteDiscoveryType[];
  websiteIds: string[];
};

export const SERVER_AGENT_STATE_LABELS: Record<ServerAgentStateType, string> = {
  [SERVER_AGENT_STATE.PENDING_AGENT]: "در انتظار Agent",
  [SERVER_AGENT_STATE.ENROLLMENT_ISSUED]: "توکن صادر شده",
  [SERVER_AGENT_STATE.CONNECTED]: "متصل",
  [SERVER_AGENT_STATE.STALE]: "قدیمی",
  [SERVER_AGENT_STATE.DISCONNECTED]: "قطع شده",
};

import { PLAN_OPTIONS } from "@/lib/data/plans-data";

export const SERVER_PLAN_OPTIONS = PLAN_OPTIONS;

export const SERVERS: ServerType[] = [
  {
    id: "server-001",
    label: "VPS-DE-03",
    location: "فرانکفورت، آلمان",
    capacitySummary: "۸ vCPU · ۳۲ GB RAM · ۴۰۰ GB NVMe",
    notes: "سرور اصلی فروشگاه‌های اروپایی",
    createdAt: "۱۲ اردیبهشت ۱۴۰۳",
    agent: {
      state: SERVER_AGENT_STATE.CONNECTED,
      version: "1.4.2",
      lastSeenAt: "۱ دقیقه پیش",
      dataFreshness: "UP_TO_DATE",
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.USED,
      issuedAt: "۱۲ اردیبهشت ۱۴۰۳",
      expiresAt: "۱۳ اردیبهشت ۱۴۰۳",
    },
    discoveries: [
      {
        id: "discovery-001",
        domain: "greenario.com",
        title: "فروشگاه آرتین",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
        assignedWebsiteId: "website-001",
        discoveredAt: "۱۲ اردیبهشت ۱۴۰۳",
        controlPanelUrl: "https://vps-de-03.example:2222",
        wordpressAdminUrl: "https://greenario.com/wp-admin/",
        wordpressVersion: "6.8.1",
        phpVersion: "8.2.28",
        phpVersionScope: "host",
        imagickVersion: "3.7.0",
        wordpressUpdateStatus: "up_to_date",
        wordpressUpdateCheckedAt: "2026-08-09T11:55:00.000Z",
        activeVisitors3m: {
          uniqueIpCount: 14,
          windowSeconds: 180,
          measuredAt: "2026-08-09T12:00:00.000Z",
        },
      },
    ],
    enrollmentTokens: [],
    websiteIds: ["website-001"],
  },
  {
    id: "server-002",
    label: "VPS-IR-07",
    location: "تهران، ایران",
    capacitySummary: "۴ vCPU · ۱۶ GB RAM · ۲۰۰ GB NVMe",
    notes: "ترافیک کمپین اخیر روی این سرور است",
    createdAt: "۲۰ خرداد ۱۴۰۲",
    agent: {
      state: SERVER_AGENT_STATE.STALE,
      version: "1.4.0",
      lastSeenAt: "۲۵ دقیقه پیش",
      dataFreshness: "STALE",
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.USED,
      issuedAt: "۲۰ خرداد ۱۴۰۲",
      expiresAt: "۲۱ خرداد ۱۴۰۲",
    },
    discoveries: [
      {
        id: "discovery-002",
        domain: "artin-shop.ir",
        title: "فروشگاه اینترنتی آرتین",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
        assignedWebsiteId: "website-002",
        discoveredAt: "۲۰ خرداد ۱۴۰۲",
      },
      {
        id: "discovery-007",
        domain: "artin-wholesale.ir",
        title: "عمده‌فروشی آرتین",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED,
        discoveredAt: "۵ مرداد ۱۴۰۶",
      },
    ],
    enrollmentTokens: [],
    websiteIds: ["website-002"],
  },
  {
    id: "server-003",
    label: "VPS-IR-11",
    location: "مشهد، ایران",
    capacitySummary: "۲ vCPU · ۸ GB RAM · ۱۰۰ GB SSD",
    notes: "Agent قطع شده؛ نیاز به صدور مجدد توکن",
    createdAt: "۸ مرداد ۱۴۰۶",
    agent: {
      state: SERVER_AGENT_STATE.DISCONNECTED,
      version: "1.3.8",
      lastSeenAt: "۱ روز پیش",
      dataFreshness: "STALE",
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.REVOKED,
      issuedAt: "۸ مرداد ۱۴۰۶",
      expiresAt: "۹ مرداد ۱۴۰۶",
    },
    discoveries: [
      {
        id: "discovery-003",
        domain: "ali-studio.ir",
        title: "پورتفولیو علی",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
        assignedWebsiteId: "website-003",
        discoveredAt: "۸ مرداد ۱۴۰۶",
      },
    ],
    enrollmentTokens: [],
    websiteIds: ["website-003"],
  },
  {
    id: "server-004",
    label: "VPS-DE-04",
    location: "فرانکفورت، آلمان",
    capacitySummary: "۸ vCPU · ۳۲ GB RAM · ۵۰۰ GB NVMe",
    notes: "",
    createdAt: "۵ اسفند ۱۴۰۲",
    agent: {
      state: SERVER_AGENT_STATE.CONNECTED,
      version: "1.4.2",
      lastSeenAt: "۴ دقیقه پیش",
      dataFreshness: "UP_TO_DATE",
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.USED,
      issuedAt: "۵ اسفند ۱۴۰۲",
      expiresAt: "۶ اسفند ۱۴۰۲",
    },
    discoveries: [
      {
        id: "discovery-004",
        domain: "parsmod.com",
        title: "پارس مد",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
        assignedWebsiteId: "website-004",
        discoveredAt: "۵ اسفند ۱۴۰۲",
      },
      {
        id: "discovery-008",
        domain: "parsmod-b2b.com",
        title: "پارس مد B2B",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED,
        discoveredAt: "۲ مرداد ۱۴۰۶",
      },
    ],
    enrollmentTokens: [],
    websiteIds: ["website-004"],
  },
  {
    id: "server-005",
    label: "VPS-UK-02",
    location: "لندن، انگلستان",
    capacitySummary: "۱۶ vCPU · ۶۴ GB RAM · ۱ TB NVMe",
    notes: "VIP customers",
    createdAt: "۱۵ فروردین ۱۴۰۳",
    agent: {
      state: SERVER_AGENT_STATE.CONNECTED,
      version: "1.4.2",
      lastSeenAt: "۲ دقیقه پیش",
      dataFreshness: "UP_TO_DATE",
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.USED,
      issuedAt: "۱۵ فروردین ۱۴۰۳",
      expiresAt: "۱۶ فروردین ۱۴۰۳",
    },
    discoveries: [
      {
        id: "discovery-005",
        domain: "mohammadi-design.ir",
        title: "استودیو طراحی محمدی",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
        assignedWebsiteId: "website-005",
        discoveredAt: "۱۵ فروردین ۱۴۰۳",
      },
    ],
    enrollmentTokens: [],
    websiteIds: ["website-005"],
  },
  {
    id: "server-006",
    label: "VPS-IR-09",
    location: "تهران، ایران",
    capacitySummary: "۴ vCPU · ۱۶ GB RAM · ۲۵۰ GB NVMe",
    notes: "داده‌های Agent قدیمی است",
    createdAt: "۲۵ تیر ۱۴۰۱",
    agent: {
      state: SERVER_AGENT_STATE.STALE,
      version: "1.4.1",
      lastSeenAt: "۳۰ دقیقه پیش",
      dataFreshness: "STALE",
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.USED,
      issuedAt: "۲۵ تیر ۱۴۰۱",
      expiresAt: "۲۶ تیر ۱۴۰۱",
    },
    discoveries: [
      {
        id: "discovery-006",
        domain: "habibeh.ir",
        title: "فروشگاه حبیبه",
        controlPanel: SERVER_STACK.CONTROL_PANEL,
        webServer: SERVER_STACK.WEB_SERVER,
        application: SERVER_STACK.APPLICATION,
        assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
        assignedWebsiteId: "website-006",
        discoveredAt: "۲۵ تیر ۱۴۰۱",
      },
    ],
    enrollmentTokens: [],
    websiteIds: ["website-006"],
  },
  {
    id: "server-007",
    label: "VPS-IR-14",
    location: "تهران، ایران",
    capacitySummary: "۲ vCPU · ۸ GB RAM · ۱۰۰ GB SSD",
    notes: "توکن صادر شده؛ در انتظار اولین ارتباط Agent",
    createdAt: "۶ مرداد ۱۴۰۶",
    agent: {
      state: SERVER_AGENT_STATE.ENROLLMENT_ISSUED,
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.UNUSED,
      issuedAt: "۶ مرداد ۱۴۰۶، ۱۴:۲۰",
      expiresAt: "۷ مرداد ۱۴۰۶، ۱۴:۲۰",
    },
    discoveries: [],
    enrollmentTokens: [],
    websiteIds: [],
  },
  {
    id: "server-008",
    label: "VPS-IR-15",
    location: "اصفهان، ایران",
    capacitySummary: "۲ vCPU · ۸ GB RAM · ۱۰۰ GB SSD",
    notes: "سرور جدید؛ هنوز Agent نصب نشده",
    createdAt: "۷ مرداد ۱۴۰۶",
    agent: {
      state: SERVER_AGENT_STATE.PENDING_AGENT,
    },
    enrollment: {
      status: ENROLLMENT_TOKEN_STATUS.NONE,
    },
    discoveries: [],
    enrollmentTokens: [],
    websiteIds: [],
  },
];

export function getServerById(
  servers: ServerType[],
  id: string,
): ServerType | undefined {
  return servers.find((server) => server.id === id);
}

export function getServersSummary(servers: ServerType[]) {
  return {
    total: servers.length,
    pendingAgent: servers.filter(
      (server) => server.agent.state === SERVER_AGENT_STATE.PENDING_AGENT,
    ).length,
    enrollmentIssued: servers.filter(
      (server) => server.agent.state === SERVER_AGENT_STATE.ENROLLMENT_ISSUED,
    ).length,
    connected: servers.filter(
      (server) => server.agent.state === SERVER_AGENT_STATE.CONNECTED,
    ).length,
    stale: servers.filter(
      (server) => server.agent.state === SERVER_AGENT_STATE.STALE,
    ).length,
    disconnected: servers.filter(
      (server) => server.agent.state === SERVER_AGENT_STATE.DISCONNECTED,
    ).length,
    unassignedDiscoveries: servers.reduce(
      (count, server) =>
        count +
        server.discoveries.filter(
          (discovery) =>
            discovery.assignmentStatus === DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED,
        ).length,
      0,
    ),
  };
}

