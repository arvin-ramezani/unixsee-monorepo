import type { Phase1StackSnapshotPayload } from "../contracts/phase1-ingest.js";

export const REFRESH_SITE_STACK = "REFRESH_SITE_STACK" as const;

export interface LeasedAgentCommand {
  id: string;
  type: typeof REFRESH_SITE_STACK;
  domain: string;
  expiresAt: string;
}

export interface HeartbeatResult {
  agent: {
    agentInstanceId: string;
    status: string;
    agentVersion?: string | null;
    lastHeartbeatAt?: string | null;
    lastSeenAt?: string | null;
  };
  commands: LeasedAgentCommand[];
}

export interface AgentCommandResultPayload {
  schemaVersion: "phase1";
  agentInstanceId: string;
  commandId: string;
  type: typeof REFRESH_SITE_STACK;
  domain: string;
  status: "SUCCEEDED" | "FAILED";
  completedAt: string;
  stackSnapshot?: Phase1StackSnapshotPayload;
  errorCode?: string;
}

export interface PendingAgentCommandResult {
  result: AgentCommandResultPayload;
  commandExpiresAt: string;
}
