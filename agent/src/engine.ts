import { join } from "node:path";
import {
  AgentApiError,
  sendCommandResult,
  sendHeartbeat,
  sendPhase1Ingest,
} from "./api/client.js";
import type { AppConfig } from "./config/config.js";
import type {
  AgentCommand,
  CommandResult,
  Phase1Ingest,
} from "./contracts/phase1-ingest.js";
import { OlsDiscoveryTracker, scanOlsInventory } from "./discovery.js";
import type { FilesystemPolicy } from "./filesystem-policy.js";
import { clearPersistedAgentSecret } from "./security.js";
import { probeSiteStack, probeSiteStacks } from "./site-stack.js";
import { readJson, writeJson } from "./state.js";
import { TrafficCollector } from "./traffic.js";

const MAX_QUEUE = 30;
const MAX_BACKOFF_MS = 5 * 60 * 1000;
export function retryDelayMs(attempt: number, random = Math.random): number {
  const exponential = Math.min(
    MAX_BACKOFF_MS,
    1_000 * 2 ** Math.max(0, attempt - 1),
  );
  return Math.round(exponential * (0.8 + random() * 0.4));
}
type QueueItem =
  | { kind: "ingest"; payload: Phase1Ingest }
  | { kind: "command"; commandId: string; payload: CommandResult };
type CachedResults = Record<string, CommandResult>;

export type EngineHandle = {
  runDiscovery(): Promise<void>;
  runHeartbeat(): Promise<void>;
  runTrafficPoll(): Promise<void>;
  runActiveVisitors(): Promise<void>;
  runVisitors24h(): Promise<void>;
  runScheduledStack(): Promise<void>;
  flushQueue(): Promise<void>;
  getQueueLength(): number;
  stop(): void;
};

export async function createEngine(input: {
  agentInstanceId: string;
  secret: string;
  config: AppConfig;
  policy: FilesystemPolicy;
  autoStart?: boolean;
}): Promise<EngineHandle> {
  const { agentInstanceId, config, policy } = input;
  let secret: string | null = input.secret;
  let flushing = false;
  let retryAttempt = 0;
  let retryAfter = 0;
  let inventory: Awaited<ReturnType<typeof scanOlsInventory>> = [];
  const tracker = new OlsDiscoveryTracker();
  const queue: QueueItem[] = [];
  const timers: Array<
    ReturnType<typeof setInterval> | ReturnType<typeof setTimeout>
  > = [];
  const traffic = new TrafficCollector(config, policy);
  const resultPath = policy.assertStatePath(
    join(config.stateDir, "command-results.json"),
  );
  let results = (await readJson<CachedResults>(resultPath, policy)) ?? {};
  await traffic.restore();

  const envelope = (
    section: Partial<
      Pick<
        Phase1Ingest,
        "discoveries" | "siteStacks" | "activeVisitors3m" | "visitors24h"
      >
    >,
  ): Phase1Ingest => ({
    schemaVersion: "phase1",
    agentInstanceId,
    agentVersion: config.agentVersion,
    sentAt: new Date().toISOString(),
    ...section,
  });
  const enqueue = (item: QueueItem) => {
    queue.push(item);
    if (queue.length > MAX_QUEUE) queue.shift();
  };

  async function invalidateSecret(): Promise<void> {
    secret = null;
    await clearPersistedAgentSecret(config.stateDir, policy);
  }
  async function flushQueue(): Promise<void> {
    if (flushing || !secret || Date.now() < retryAfter) return;
    flushing = true;
    try {
      while (queue.length && secret) {
        const item = queue[0];
        if (item.kind === "ingest")
          await sendPhase1Ingest(item.payload, secret);
        else await sendCommandResult(item.commandId, item.payload, secret);
        queue.shift();
        retryAttempt = 0;
        retryAfter = 0;
      }
    } catch (error) {
      if (error instanceof AgentApiError && error.status === 401) {
        await invalidateSecret();
      } else {
        retryAttempt += 1;
        retryAfter = Date.now() + retryDelayMs(retryAttempt);
      }
    } finally {
      flushing = false;
    }
  }
  async function transmit(section: Parameters<typeof envelope>[0]) {
    enqueue({ kind: "ingest", payload: envelope(section) });
    await flushQueue();
  }

  async function runDiscovery(): Promise<void> {
    try {
      const previous = new Set(inventory.map((item) => item.domain));
      inventory = tracker.acceptSuccessfulScan(
        await scanOlsInventory(config, policy),
      );
      await transmit({ discoveries: inventory });
      const added = inventory
        .filter((item) => !previous.has(item.domain))
        .map((item) => item.domain);
      if (added.length) await runStack(added);
    } catch {
      /* unsuccessful scans never advance removal debounce */
    }
  }
  async function runStack(domains: string[]): Promise<void> {
    if (!domains.length) return;
    await transmit({ siteStacks: await probeSiteStacks(domains, config) });
  }
  async function runTrafficPoll(): Promise<void> {
    await traffic.poll(inventory.map((item) => item.domain));
  }
  async function runActiveVisitors(): Promise<void> {
    await transmit({
      activeVisitors3m: traffic.activeSamples(
        inventory.map((item) => item.domain),
      ),
    });
  }
  async function runVisitors24h(): Promise<void> {
    await transmit({
      visitors24h: traffic.visitors24hSamples(
        inventory.map((item) => item.domain),
      ),
    });
    await traffic.persist();
  }
  async function runScheduledStack(): Promise<void> {
    await runStack(inventory.map((item) => item.domain));
  }

  async function persistResult(
    commandId: string,
    result: CommandResult,
  ): Promise<void> {
    results[commandId] = result;
    const entries = Object.entries(results);
    if (entries.length > 30) results = Object.fromEntries(entries.slice(-30));
    await writeJson(resultPath, results, policy);
  }
  async function executeCommand(command: AgentCommand): Promise<void> {
    const cached = results[command.id];
    if (cached) {
      enqueue({ kind: "command", commandId: command.id, payload: cached });
      return;
    }
    const now = Date.now();
    if (
      command.type !== "REFRESH_SITE_STACK" ||
      Date.parse(command.expiresAt) <= now ||
      Date.parse(command.leaseExpiresAt) <= now ||
      !inventory.some((item) => item.domain === command.domain)
    )
      return;
    const snapshot = await probeSiteStack(command.domain, config);
    const succeeded = snapshot.fieldStatus.phpVersion.state === "ok";
    const result: CommandResult = succeeded
      ? {
          agentInstanceId,
          status: "SUCCEEDED",
          finishedAt: new Date().toISOString(),
          stackSnapshot: snapshot,
        }
      : {
          agentInstanceId,
          status: "FAILED",
          finishedAt: new Date().toISOString(),
          errorCode: snapshot.fieldStatus.phpVersion.reason ?? "probe_failed",
        };
    await persistResult(command.id, result);
    enqueue({ kind: "command", commandId: command.id, payload: result });
  }
  async function runHeartbeat(): Promise<void> {
    if (!secret) return;
    try {
      const response = await sendHeartbeat(agentInstanceId, secret);
      for (const command of response.commands) await executeCommand(command);
      await flushQueue();
    } catch (error) {
      if (error instanceof AgentApiError && error.status === 401)
        await invalidateSecret();
    }
  }

  function scheduleStackWithJitter(): void {
    const jitter = 0.9 + Math.random() * 0.2;
    timers.push(
      setTimeout(
        async () => {
          await runScheduledStack();
          scheduleStackWithJitter();
        },
        Math.round(config.intervals.stackMs * jitter),
      ),
    );
  }
  const handle: EngineHandle = {
    runDiscovery,
    runHeartbeat,
    runTrafficPoll,
    runActiveVisitors,
    runVisitors24h,
    runScheduledStack,
    flushQueue,
    getQueueLength: () => queue.length,
    stop: () => {
      for (const timer of timers) {
        clearInterval(timer);
        clearTimeout(timer);
      }
    },
  };
  if (input.autoStart !== false) {
    await runDiscovery();
    await runTrafficPoll();
    await runHeartbeat();
    timers.push(
      setInterval(() => void runHeartbeat(), config.intervals.heartbeatMs),
    );
    timers.push(
      setInterval(() => void runTrafficPoll(), config.intervals.trafficPollMs),
    );
    timers.push(
      setInterval(
        () => void runActiveVisitors(),
        config.intervals.activeVisitorsMs,
      ),
    );
    timers.push(
      setInterval(() => void runVisitors24h(), config.intervals.visitors24hMs),
    );
    timers.push(
      setInterval(() => void runDiscovery(), config.intervals.discoveryMs),
    );
    scheduleStackWithJitter();
  }
  return handle;
}
