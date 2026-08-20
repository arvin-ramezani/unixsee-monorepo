import { randomUUID } from "node:crypto";

import {
  createAgentStateFileIfAbsent,
  readAgentStateFile,
} from "./security/filesystem.js";

const AGENT_INSTANCE_ID_FILE = "agent-instance-id";
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AgentInstallationIdentity {
  agentInstanceId: string;
  created: boolean;
}

function normalizeAgentInstanceId(value: string): string {
  return value.trim().toLowerCase();
}

export function assertValidAgentInstanceId(value: string): string {
  const normalized = normalizeAgentInstanceId(value);
  if (!UUID_V4_PATTERN.test(normalized)) {
    throw new Error(
      `Persisted agentInstanceId is invalid. Expected a UUID v4 in agent-owned state file ${AGENT_INSTANCE_ID_FILE}.`,
    );
  }
  return normalized;
}

/**
 * Load the installation-scoped identity from agent-owned state, creating it
 * exactly once when absent.
 *
 * The identity is deliberately unrelated to host hardware/OS identity and is
 * never derived from OS machine identity, hostname, process metadata, network
 * interfaces, or other host fingerprints.
 */
export async function loadOrCreateAgentInstallationIdentity(): Promise<AgentInstallationIdentity> {
  const existing = await readAgentStateFile(AGENT_INSTANCE_ID_FILE);
  if (existing !== null) {
    return {
      agentInstanceId: assertValidAgentInstanceId(existing),
      created: false,
    };
  }

  const candidate = randomUUID().toLowerCase();
  const created = await createAgentStateFileIfAbsent(
    AGENT_INSTANCE_ID_FILE,
    `${candidate}\n`,
  );

  if (created) {
    return {
      agentInstanceId: candidate,
      created: true,
    };
  }

  // Another process may have created the identity between the read and the
  // exclusive create. Read the winner rather than overwriting it.
  const concurrent = await readAgentStateFile(AGENT_INSTANCE_ID_FILE);
  if (concurrent === null) {
    throw new Error(
      "agentInstanceId creation raced but no persisted identity is available.",
    );
  }

  return {
    agentInstanceId: assertValidAgentInstanceId(concurrent),
    created: false,
  };
}

export async function resolveAgentInstanceId(): Promise<string> {
  return (await loadOrCreateAgentInstallationIdentity()).agentInstanceId;
}
