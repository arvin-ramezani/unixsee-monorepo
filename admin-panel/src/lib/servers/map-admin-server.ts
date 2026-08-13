import {
  DISCOVERY_ASSIGNMENT_STATUS,
  ENROLLMENT_TOKEN_STATUS,
  SERVER_AGENT_STATE,
  SERVER_STACK,
  type DiscoveryAssignmentStatusType,
  type EnrollmentTokenStatusType,
  type ServerAgentStateType,
  type ServerEnrollmentTokenRow,
  type ServerType,
  type WebsiteDiscoveryType,
} from "@/lib/data/servers-data";

export type AdminServerEnrollmentTokenDto = {
  id: string;
  status: string;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
  usedAt?: string | Date | null;
  revokedAt?: string | Date | null;
};

export type AdminServerDiscoveryDto = {
  id: string;
  domain: string;
  displayName?: string | null;
  websiteId?: string | null;
  status?: string;
  appType?: string | null;
  controlPanelUrl?: string | null;
  wordpressAdminUrl?: string | null;
  wordpressVersion?: string | null;
  phpVersion?: string | null;
  phpVersionScope?: string | null;
  imagickVersion?: string | null;
  wordpressUpdateStatus?: string | null;
  wordpressUpdateCheckedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastIngestedAt?: string | Date | null;
  assignedAt?: string | Date | null;
};

export type AdminServerReadModelDto = {
  id: string;
  name: string;
  label?: string;
  ipAddress: string;
  notes: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  agent: {
    state: string;
    version?: string;
    lastSeenAt?: string;
    dataFreshness?: "UP_TO_DATE" | "STALE";
  };
  enrollment: {
    status: string;
    issuedAt?: string;
    expiresAt?: string;
  };
  enrollmentTokens?: AdminServerEnrollmentTokenDto[];
  discoveries?: AdminServerDiscoveryDto[];
  vpsNodes?: unknown[];
};

export type AdminServerListResponse = {
  items: AdminServerReadModelDto[];
  total: number;
};

export type EnrollmentRevealDto = {
  id: string;
  serverId: string;
  status: string;
  expiresAt: string | Date | null;
  createdAt: string | Date;
  token: string;
  installCommand: string;
};

function toIsoString(value: string | Date | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function formatFaDateTime(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFaDate(iso: string | Date): string {
  const raw = typeof iso === "string" ? iso : iso.toISOString();
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function mapAgentState(state: string): ServerAgentStateType {
  switch (state) {
    case SERVER_AGENT_STATE.ENROLLMENT_ISSUED:
    case SERVER_AGENT_STATE.CONNECTED:
    case SERVER_AGENT_STATE.STALE:
    case SERVER_AGENT_STATE.DISCONNECTED:
    case SERVER_AGENT_STATE.PENDING_AGENT:
      return state;
    default:
      return SERVER_AGENT_STATE.PENDING_AGENT;
  }
}

function mapEnrollmentStatus(status: string): EnrollmentTokenStatusType {
  switch (status) {
    case ENROLLMENT_TOKEN_STATUS.UNUSED:
    case ENROLLMENT_TOKEN_STATUS.USED:
    case ENROLLMENT_TOKEN_STATUS.EXPIRED:
    case ENROLLMENT_TOKEN_STATUS.REVOKED:
    case ENROLLMENT_TOKEN_STATUS.NONE:
      return status;
    case "ACTIVE":
      return ENROLLMENT_TOKEN_STATUS.UNUSED;
    default:
      return ENROLLMENT_TOKEN_STATUS.NONE;
  }
}

function mapDiscoveryStatus(
  status: string | undefined,
  websiteId: string | null | undefined,
): DiscoveryAssignmentStatusType {
  if (websiteId || status === "ASSIGNED") {
    return DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED;
  }
  return DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED;
}

function mapDiscovery(dto: AdminServerDiscoveryDto): WebsiteDiscoveryType {
  const discoveredAt =
    toIsoString(dto.lastIngestedAt) ??
    toIsoString(dto.updatedAt) ??
    toIsoString(dto.createdAt);

  return {
    id: dto.id,
    domain: dto.domain,
    title: dto.displayName?.trim() || dto.domain,
    controlPanel: SERVER_STACK.CONTROL_PANEL,
    webServer: SERVER_STACK.WEB_SERVER,
    application: SERVER_STACK.APPLICATION,
    assignmentStatus: mapDiscoveryStatus(dto.status, dto.websiteId),
    assignedWebsiteId: dto.websiteId ?? undefined,
    discoveredAt: discoveredAt ? formatFaDate(discoveredAt) : "—",
    controlPanelUrl: dto.controlPanelUrl ?? undefined,
    wordpressAdminUrl: dto.wordpressAdminUrl ?? undefined,
    wordpressVersion: dto.wordpressVersion ?? undefined,
    phpVersion: dto.phpVersion ?? undefined,
    phpVersionScope:
      dto.phpVersionScope === "site" ||
      dto.phpVersionScope === "host" ||
      dto.phpVersionScope === "unknown"
        ? dto.phpVersionScope
        : undefined,
    imagickVersion: dto.imagickVersion ?? undefined,
    wordpressUpdateStatus: dto.wordpressUpdateStatus ?? undefined,
    wordpressUpdateCheckedAt: toIsoString(dto.wordpressUpdateCheckedAt),
  };
}

function mapEnrollmentToken(
  dto: AdminServerEnrollmentTokenDto,
): ServerEnrollmentTokenRow {
  return {
    id: dto.id,
    status: dto.status,
    createdAt: toIsoString(dto.createdAt) ?? String(dto.createdAt),
    expiresAt: toIsoString(dto.expiresAt) ?? null,
    usedAt: toIsoString(dto.usedAt) ?? null,
    revokedAt: toIsoString(dto.revokedAt) ?? null,
  };
}

export function mapAdminServerToUi(dto: AdminServerReadModelDto): ServerType {
  const discoveries = (dto.discoveries ?? []).map(mapDiscovery);
  const websiteIds = discoveries
    .map((discovery) => discovery.assignedWebsiteId)
    .filter((id): id is string => Boolean(id));

  const createdAtIso = toIsoString(dto.createdAt) ?? String(dto.createdAt);

  return {
    id: dto.id,
    label: dto.label?.trim() || dto.name,
    location: dto.ipAddress,
    capacitySummary: "",
    notes: dto.notes?.trim() ?? "",
    createdAt: formatFaDate(createdAtIso),
    agent: {
      state: mapAgentState(dto.agent.state),
      version: dto.agent.version,
      lastSeenAt: formatFaDateTime(dto.agent.lastSeenAt),
      dataFreshness: dto.agent.dataFreshness,
    },
    enrollment: {
      status: mapEnrollmentStatus(dto.enrollment.status),
      issuedAt: formatFaDateTime(dto.enrollment.issuedAt),
      expiresAt: formatFaDateTime(dto.enrollment.expiresAt),
    },
    enrollmentTokens: (dto.enrollmentTokens ?? []).map(mapEnrollmentToken),
    discoveries,
    websiteIds,
  };
}

export function mapAdminServerListToUi(
  response: AdminServerListResponse,
): ServerType[] {
  return response.items.map(mapAdminServerToUi);
}

export function mapEnrollmentRevealToUi(dto: EnrollmentRevealDto) {
  return {
    tokenId: dto.id,
    token: dto.token,
    installCommand: dto.installCommand,
    issuedAt: formatFaDateTime(toIsoString(dto.createdAt)) ?? "اکنون",
    expiresAt:
      formatFaDateTime(toIsoString(dto.expiresAt ?? undefined)) ?? "بدون انقضا",
  };
}
