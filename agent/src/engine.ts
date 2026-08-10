import { hostname } from "node:os";

import {
  AgentApiError,
  sendHeartbeat as defaultSendHeartbeat,
  sendPhase1Ingest as defaultSendPhase1Ingest,
} from "./api/client.js";
import { getConfig } from "./config/config.js";
import { initializeIdentity, type HostIdentity } from "./discovery.js";
import { clearPersistedAgentSecret } from "./security.js";
import { enrichSiteStack } from "./site-stack.js";
import {
  collectActiveVisitors3m,
  ensureTrafficTails,
} from "./traffic.js";

const MAX_QUEUE_SIZE = 30;

export type EngineDependencies = {
  sendIngest?: (payload: unknown, secretKey: string) => Promise<unknown>;
  sendHeartbeat?: (
    machineId: string,
    secretKey: string,
    hostname?: string,
  ) => Promise<unknown>;
  clearSecret?: () => Promise<void>;
  resolveHostname?: () => string;
  now?: () => Date;
  /** When false, skip intervals and initial ticks (tests). Default true. */
  autoStart?: boolean;
};

export type EngineHandle = {
  enqueue: (payload: unknown) => void;
  flushQueue: () => Promise<void>;
  runHeartbeat: () => Promise<void>;
  runTransmit: () => Promise<void>;
  buildIngestPayload: () => Promise<unknown>;
  getQueueLength: () => number;
  isSecretInvalidated: () => boolean;
  getActiveSecret: () => string | null;
  stop: () => void;
};

export function createEngine(
  hostIdentity: HostIdentity,
  secretKey: string,
  deps: EngineDependencies = {},
): EngineHandle {
  const sendIngest = deps.sendIngest ?? defaultSendPhase1Ingest;
  const sendHeartbeatFn = deps.sendHeartbeat ?? defaultSendHeartbeat;
  const clearSecret = deps.clearSecret ?? clearPersistedAgentSecret;
  const resolveHostname = deps.resolveHostname ?? hostname;
  const now = deps.now ?? (() => new Date());

  let offlineQueue: unknown[] = [];
  let isTransmitting = false;
  let activeSecretKey: string | null = secretKey;
  let secretInvalidated = false;
  let identity: HostIdentity | null = hostIdentity;
  const timers: ReturnType<typeof setInterval>[] = [];

  function assertSecretReady(): string {
    if (!activeSecretKey || secretInvalidated) {
      throw new Error(
        "Agent secret is missing or invalidated. Re-enroll with a new ENROLLMENT_TOKEN.",
      );
    }
    return activeSecretKey;
  }

  async function invalidateSecret(reason: string): Promise<void> {
    secretInvalidated = true;
    activeSecretKey = null;
    try {
      await clearSecret();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Security] Failed to clear persisted secret: ${message}`);
    }
    console.error(
      `[Security] ${reason} Re-issue an enrollment token from the admin panel and restart with ENROLLMENT_TOKEN.`,
    );
  }

  async function buildIngestPayload(): Promise<unknown> {
    if (!identity) {
      throw new Error("Host identity not initialized.");
    }

    const discoveries = await enrichSiteStack(identity.domains);
    const domains = identity.domains.map((domain) => domain.domain);
    await ensureTrafficTails(domains);
    const activeVisitors3m = collectActiveVisitors3m(domains);
    const cfg = getConfig();

    return {
      schemaVersion: "phase1" as const,
      machineId: identity.machineId,
      agentVersion: cfg.agentVersion,
      sentAt: now().toISOString(),
      discoveries,
      activeVisitors3m,
    };
  }

  async function flushQueue(): Promise<void> {
    if (isTransmitting || offlineQueue.length === 0 || secretInvalidated) {
      return;
    }
    isTransmitting = true;
    let transmitted = 0;

    try {
      while (offlineQueue.length > 0 && !secretInvalidated) {
        const secret = assertSecretReady();
        const payload = offlineQueue[0];
        await sendIngest(payload, secret);
        offlineQueue.shift();
        transmitted += 1;
      }
      if (transmitted > 0) {
        console.log(`[Network] Transmitted ${transmitted} ingest payload(s).`);
      }
    } catch (error: unknown) {
      if (error instanceof AgentApiError && error.status === 401) {
        await invalidateSecret("Ingest rejected with HTTP 401.");
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Network] Transmission failed:`, message);
    } finally {
      isTransmitting = false;
    }
  }

  function enqueue(payload: unknown): void {
    offlineQueue.push(payload);
    if (offlineQueue.length > MAX_QUEUE_SIZE) {
      offlineQueue.shift();
      console.warn("[Network] Offline queue full; dropped oldest payload.");
    }
  }

  async function runHeartbeat(): Promise<void> {
    if (!identity || secretInvalidated) return;
    try {
      const secret = assertSecretReady();
      await sendHeartbeatFn(identity.machineId, secret, resolveHostname());
    } catch (error: unknown) {
      if (error instanceof AgentApiError && error.status === 401) {
        await invalidateSecret("Heartbeat rejected with HTTP 401.");
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Network] Heartbeat failed:`, message);
    }
  }

  async function runTransmit(): Promise<void> {
    if (!identity || secretInvalidated) return;
    try {
      const payload = await buildIngestPayload();
      enqueue(payload);
      await flushQueue();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Engine] Transmit tick failed:`, message);
    }
  }

  async function refreshDiscovery(): Promise<void> {
    try {
      const refreshed = await initializeIdentity();
      if (identity) {
        identity.domains = refreshed.domains;
      } else {
        identity = refreshed;
      }
      console.log(
        `[Discovery] Rediscovery complete. Domains: ${refreshed.domains.length}`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Discovery] Rediscovery failed:`, message);
    }
  }

  const cfg = getConfig();
  console.log(
    `[Engine] Phase 1 loops — transmit ${cfg.transmitIntervalMs / 1000}s, heartbeat ${cfg.heartbeatIntervalMs / 1000}s, rediscovery ${cfg.rediscoveryIntervalMs / 1000}s.`,
  );

  const autoStart = deps.autoStart !== false;
  if (autoStart) {
    void runHeartbeat();
    void runTransmit();

    timers.push(
      setInterval(() => {
        void runHeartbeat();
      }, cfg.heartbeatIntervalMs),
    );
    timers.push(
      setInterval(() => {
        void runTransmit();
      }, cfg.transmitIntervalMs),
    );
    timers.push(
      setInterval(() => {
        void refreshDiscovery();
      }, cfg.rediscoveryIntervalMs),
    );
  }

  return {
    enqueue,
    flushQueue,
    runHeartbeat,
    runTransmit,
    buildIngestPayload,
    getQueueLength: () => offlineQueue.length,
    isSecretInvalidated: () => secretInvalidated,
    getActiveSecret: () => activeSecretKey,
    stop: () => {
      for (const timer of timers) {
        clearInterval(timer);
      }
      timers.length = 0;
    },
  };
}

export function startEngine(
  hostIdentity: HostIdentity,
  secretKey: string,
): EngineHandle {
  return createEngine(hostIdentity, secretKey);
}
