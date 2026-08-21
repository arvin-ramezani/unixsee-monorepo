export type FieldState = "ok" | "unknown" | "unsupported";
export type FieldStatus = { state: FieldState; reason?: string };

export type OlsDiscovery = {
  domain: string;
  aliases: string[];
  virtualHostName: string;
  source: "openlitespeed";
  discoveredAt: string;
};

export type SiteStackSnapshot = {
  domain: string;
  wordpressVersion: string | null;
  phpVersion: string | null;
  imagickVersion: string | null;
  checkedAt: string;
  fieldStatus: Record<
    "wordpressVersion" | "phpVersion" | "imagickVersion",
    FieldStatus
  >;
};

export type ActiveVisitors3m = {
  domain: string;
  uniqueVisitorCount: number | null;
  windowSeconds: 180;
  windowStartedAt: string;
  measuredAt: string;
  status: FieldStatus;
};

export type Visitors24h = {
  domain: string;
  uniqueVisitors24h: number | null;
  windowSeconds: 86400;
  coverageSeconds: number;
  measuredAt: string;
  algorithm: "hll";
  status: FieldStatus;
};

export type Phase1Ingest = {
  schemaVersion: "phase1";
  agentInstanceId: string;
  agentVersion: string;
  sentAt: string;
  discoveries?: OlsDiscovery[];
  siteStacks?: SiteStackSnapshot[];
  activeVisitors3m?: ActiveVisitors3m[];
  visitors24h?: Visitors24h[];
};

export type AgentCommand = {
  id: string;
  type: "REFRESH_SITE_STACK";
  domain: string;
  expiresAt: string;
  leaseExpiresAt: string;
};

export type HeartbeatData = {
  agent: { agentInstanceId: string; status: string; lastHeartbeatAt: string };
  commands: AgentCommand[];
};

export type CommandResult = {
  agentInstanceId: string;
  status: "SUCCEEDED" | "FAILED";
  finishedAt: string;
  stackSnapshot?: SiteStackSnapshot;
  errorCode?: string;
};
