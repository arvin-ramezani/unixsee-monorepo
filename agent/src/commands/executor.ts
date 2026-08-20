import type { DiscoveredDomain } from "../discovery.js";
import { toPhase1StackSnapshotPayload } from "../contracts/phase1-ingest.js";
import type { StackSchedulerHandle } from "../schedulers/stack-scheduler.js";
import type {
  AgentCommandResultPayload,
  LeasedAgentCommand,
} from "./types.js";

const TRANSPORT_FAILURE_REASONS = new Set([
  "runtime_probe_not_configured",
  "runtime_probe_unreachable",
  "runtime_probe_timeout",
  "runtime_probe_invalid_response",
  "runtime_probe_forbidden",
]);

export interface CommandExecutorContext {
  agentInstanceId: string;
  getActiveDomains: () => readonly DiscoveredDomain[];
  stackScheduler: StackSchedulerHandle;
  now?: () => Date;
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function failureCodeFromSnapshot(
  snapshot: ReturnType<typeof toPhase1StackSnapshotPayload>,
): string {
  for (const status of Object.values(snapshot.fieldStatus)) {
    if (status.reason && TRANSPORT_FAILURE_REASONS.has(status.reason)) {
      return status.reason;
    }
  }
  return "stack_refresh_failed";
}

export async function executeLeasedCommand(
  command: LeasedAgentCommand,
  context: CommandExecutorContext,
): Promise<AgentCommandResultPayload> {
  const now = context.now ?? (() => new Date());
  const completedBase = {
    schemaVersion: "phase1" as const,
    agentInstanceId: context.agentInstanceId,
    commandId: command.id,
    type: "REFRESH_SITE_STACK" as const,
    domain: normalizeDomain(command.domain),
  };

  if (command.type !== "REFRESH_SITE_STACK") {
    return {
      ...completedBase,
      status: "FAILED",
      completedAt: now().toISOString(),
      errorCode: "unsupported_command",
    };
  }

  if (Date.parse(command.expiresAt) <= now().getTime()) {
    return {
      ...completedBase,
      status: "FAILED",
      completedAt: now().toISOString(),
      errorCode: "command_expired",
    };
  }

  const activeDomains = context.getActiveDomains();
  const exactPrimary = activeDomains.find(
    (item) => normalizeDomain(item.domain) === completedBase.domain,
  );
  if (!exactPrimary) {
    return {
      ...completedBase,
      status: "FAILED",
      completedAt: now().toISOString(),
      errorCode: "domain_not_in_inventory",
    };
  }

  await context.stackScheduler.syncDomains(
    activeDomains.map((item) => item.domain),
  );

  const result = await context.stackScheduler.refreshNow(
    [exactPrimary.domain],
    "manual",
  );
  const snapshot = result.snapshots.find(
    (item) => normalizeDomain(item.domain) === completedBase.domain,
  );

  if (!result.attemptedDomains.includes(completedBase.domain)) {
    return {
      ...completedBase,
      status: "FAILED",
      completedAt: now().toISOString(),
      errorCode: "stack_refresh_busy",
    };
  }

  if (!snapshot) {
    return {
      ...completedBase,
      status: "FAILED",
      completedAt: now().toISOString(),
      errorCode: "stack_refresh_failed",
    };
  }

  const outboundSnapshot = toPhase1StackSnapshotPayload(
    snapshot,
    snapshot.checkedAt,
  );
  const failed = result.failedDomains.includes(completedBase.domain);

  if (failed) {
    return {
      ...completedBase,
      status: "FAILED",
      completedAt: now().toISOString(),
      stackSnapshot: outboundSnapshot,
      errorCode: failureCodeFromSnapshot(outboundSnapshot),
    };
  }

  return {
    ...completedBase,
    status: "SUCCEEDED",
    completedAt: now().toISOString(),
    stackSnapshot: outboundSnapshot,
  };
}
