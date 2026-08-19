import { readFile } from "node:fs/promises";
import { platform } from "node:os";

const AGENT_INSTANCE_ID_STATE_PATH =
  "/opt/unixsee-agent/state/agent-instance-id";

async function readTrimmed(path: string): Promise<string | null> {
  try {
    const value = (await readFile(path, "utf8")).trim();
    return value || null;
  } catch {
    return null;
  }
}

/**
 * Temporary identity bridge while the agent is migrated step-by-step.
 *
 * Priority:
 *  1. explicit AGENT_INSTANCE_ID,
 *  2. future/correct agent-owned state file if already provisioned,
 *  3. legacy machine-id fallback,
 *  4. deterministic local-development placeholder on non-Linux hosts.
 *
 * The legacy machine-id fallback is removed in the dedicated identity/security
 * rewrite. It is intentionally not part of discovery anymore.
 */
export async function resolveAgentInstanceIdCompat(): Promise<string> {
  const explicit = process.env.AGENT_INSTANCE_ID?.trim();
  if (explicit) return explicit;

  const persisted = await readTrimmed(AGENT_INSTANCE_ID_STATE_PATH);
  if (persisted) return persisted;

  for (const legacyPath of ["/etc/machine-id", "/var/lib/dbus/machine-id"]) {
    const legacy = await readTrimmed(legacyPath);
    if (legacy) return legacy;
  }

  if (platform() !== "linux") {
    return "dev-local-agent-instance-id";
  }

  throw new Error(
    "Unable to resolve agentInstanceId during compatibility migration. The dedicated identity step must provision /opt/unixsee-agent/state/agent-instance-id.",
  );
}
