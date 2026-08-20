import {
  AgentApiError,
  sendCommandResult as defaultSendCommandResult,
  sendHeartbeat as defaultSendHeartbeat,
  sendPhase1Ingest as defaultSendPhase1Ingest,
} from "./api/client.js";
import { getConfig } from "./config/config.js";
import {
  toPhase1DiscoveryPayload,
  toPhase1StackSnapshotPayload,
  type Phase1IngestPayload,
} from "./contracts/phase1-ingest.js";
import {
  initializeIdentity as defaultInitializeIdentity,
  type DiscoveredDomain,
  type HostIdentity,
} from "./discovery.js";
import { clearPersistedAgentSecret } from "./security.js";
import { createTypedIngestOutbox } from "./outbox.js";
import { executeLeasedCommand } from "./commands/executor.js";
import {
  createCommandResultOutbox,
  type CommandResultOutbox,
} from "./commands/command-result-outbox.js";
import type {
  AgentCommandResultPayload,
  HeartbeatResult,
  LeasedAgentCommand,
} from "./commands/types.js";
import {
  createPeriodicScheduler,
  type PeriodicSchedulerHandle,
} from "./schedulers/periodic-scheduler.js";
import {
  createStackScheduler,
  STACK_SCHEDULER_TICK_MS,
  type StackRefreshReason,
  type StackSchedulerHandle,
} from "./schedulers/stack-scheduler.js";
import type { SiteStackPayload } from "./runtime-probe/types.js";
import { enrichSiteStack as defaultEnrichSiteStack } from "./site-stack.js";
import {
  collectActiveVisitors3m as defaultCollectActiveVisitors3m,
  collectVisitors24h as defaultCollectVisitors24h,
  ensureTrafficTails as defaultEnsureTrafficTails,
  stopTrafficTails,
} from "./traffic.js";


export type EngineDependencies = {
  sendIngest?: (payload: unknown, secretKey: string) => Promise<unknown>;
  sendHeartbeat?: (
    agentInstanceId: string,
    secretKey: string,
  ) => Promise<HeartbeatResult>;
  sendCommandResult?: (
    payload: AgentCommandResultPayload,
    secretKey: string,
  ) => Promise<unknown>;
  commandResultOutbox?: CommandResultOutbox;
  clearSecret?: () => Promise<void>;
  initializeIdentity?: (agentInstanceId: string) => Promise<HostIdentity>;
  enrichSiteStack?: (
    domains: readonly DiscoveredDomain[],
  ) => ReturnType<typeof defaultEnrichSiteStack>;
  stackScheduler?: StackSchedulerHandle;
  ensureTrafficTails?: (domains: readonly string[]) => Promise<void>;
  collectActiveVisitors3m?: typeof defaultCollectActiveVisitors3m;
  collectVisitors24h?: typeof defaultCollectVisitors24h;
  now?: () => Date;
  /** When false, skip scheduler startup and initial ticks (tests). Default true. */
  autoStart?: boolean;
};

export type EngineHandle = {
  enqueue: (payload: Phase1IngestPayload) => void;
  flushQueue: () => Promise<void>;
  runHeartbeat: () => Promise<void>;
  flushCommandResults: () => Promise<void>;
  executeCommand: (command: LeasedAgentCommand) => Promise<void>;
  runDiscovery: () => Promise<void>;
  runStackRefresh: (
    domains?: readonly DiscoveredDomain[],
    reason?: StackRefreshReason,
  ) => Promise<void>;
  runDueStackRefreshes: () => Promise<void>;
  runActiveVisitors: () => Promise<void>;
  runVisitors24h: () => Promise<void>;
  buildDiscoveryPayload: (
    domains?: readonly DiscoveredDomain[],
  ) => Phase1IngestPayload;
  buildStackPayload: (
    domains?: readonly DiscoveredDomain[],
  ) => Promise<Phase1IngestPayload>;
  buildActiveVisitorsPayload: () => Promise<Phase1IngestPayload>;
  buildVisitors24hPayload: () => Promise<Phase1IngestPayload>;
  getQueueLength: () => number;
  getPendingCommandResultCount: () => Promise<number>;
  isSecretInvalidated: () => boolean;
  getActiveSecret: () => string | null;
  getIdentity: () => HostIdentity | null;
  getStackScheduleRecords: () => ReturnType<StackSchedulerHandle["getRecords"]>;
  stop: () => void;
};

export function createEngine(
  hostIdentity: HostIdentity,
  secretKey: string,
  deps: EngineDependencies = {},
): EngineHandle {
  const sendIngest = deps.sendIngest ?? defaultSendPhase1Ingest;
  const sendHeartbeatFn = deps.sendHeartbeat ?? defaultSendHeartbeat;
  const sendCommandResultFn =
    deps.sendCommandResult ?? defaultSendCommandResult;
  const clearSecret = deps.clearSecret ?? clearPersistedAgentSecret;
  const initializeIdentityFn =
    deps.initializeIdentity ?? defaultInitializeIdentity;
  const enrichSiteStack = deps.enrichSiteStack ?? defaultEnrichSiteStack;
  const ensureTrafficTails =
    deps.ensureTrafficTails ?? defaultEnsureTrafficTails;
  const collectActiveVisitors3m =
    deps.collectActiveVisitors3m ?? defaultCollectActiveVisitors3m;
  const collectVisitors24h =
    deps.collectVisitors24h ?? defaultCollectVisitors24h;
  const now = deps.now ?? (() => new Date());

  const offlineQueue = createTypedIngestOutbox();
  const commandResultOutbox =
    deps.commandResultOutbox ?? createCommandResultOutbox();
  const commandIdsInFlight = new Set<string>();
  let isTransmitting = false;
  let activeSecretKey: string | null = secretKey;
  let secretInvalidated = false;
  let identity: HostIdentity | null = hostIdentity;
  let stopped = false;
  const schedulers: PeriodicSchedulerHandle[] = [];

  function assertSecretReady(): string {
    if (!activeSecretKey || secretInvalidated) {
      throw new Error(
        "Agent secret is missing or invalidated. Re-enroll with a new ENROLLMENT_TOKEN.",
      );
    }
    return activeSecretKey;
  }

  function stopSchedulers(): void {
    for (const scheduler of schedulers) {
      scheduler.stop();
    }
  }

  async function invalidateSecret(reason: string): Promise<void> {
    if (secretInvalidated) return;

    secretInvalidated = true;
    activeSecretKey = null;
    stopSchedulers();
    stopTrafficTails();

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

  function requireIdentity(): HostIdentity {
    if (!identity) {
      throw new Error("Host identity not initialized.");
    }
    return identity;
  }

  function findDiscoveredDomain(domain: string): DiscoveredDomain {
    const normalized = domain.trim().toLowerCase().replace(/\.$/, "");
    const discovered = requireIdentity().domains.find(
      (item) => item.domain === normalized,
    );
    if (!discovered) {
      throw new Error(`Stack scheduler domain is no longer active: ${domain}`);
    }
    return discovered;
  }

  const cfg = getConfig();
  const stackScheduler =
    deps.stackScheduler ??
    createStackScheduler({
      intervalMs: cfg.stackProbeIntervalMs,
      concurrency: cfg.stackProbeConcurrency,
      probeDomain: async (domain) => {
        const [result] = await enrichSiteStack([findDiscoveredDomain(domain)]);
        if (!result) {
          throw new Error(`Stack probe returned no result for ${domain}.`);
        }
        return result;
      },
      now,
    });

  function buildEnvelopeBase(currentIdentity: HostIdentity) {
    return {
      schemaVersion: "phase1" as const,
      agentInstanceId: currentIdentity.agentInstanceId,
      agentVersion: getConfig().agentVersion,
      sentAt: now().toISOString(),
    };
  }

  function buildDiscoveryPayload(
    domains: readonly DiscoveredDomain[] = requireIdentity().domains,
  ): Phase1IngestPayload {
    const currentIdentity = requireIdentity();
    const discoveredAt = now().toISOString();
    const discoveries = domains.flatMap((domain) => {
      const outbound = toPhase1DiscoveryPayload(domain, discoveredAt);
      return outbound ? [outbound] : [];
    });

    return {
      ...buildEnvelopeBase(currentIdentity),
      discoveries,
    };
  }

  async function buildStackPayload(
    domains: readonly DiscoveredDomain[] = requireIdentity().domains,
  ): Promise<Phase1IngestPayload> {
    const currentIdentity = requireIdentity();
    const stackResults = await enrichSiteStack(domains);

    return {
      ...buildEnvelopeBase(currentIdentity),
      stackSnapshots: stackResults.map((stack) =>
        toPhase1StackSnapshotPayload(stack, stack.checkedAt),
      ),
    };
  }

  function buildStackPayloadFromSnapshots(
    snapshots: readonly SiteStackPayload[],
  ): Phase1IngestPayload {
    const currentIdentity = requireIdentity();
    return {
      ...buildEnvelopeBase(currentIdentity),
      stackSnapshots: snapshots.map((stack) =>
        toPhase1StackSnapshotPayload(stack, stack.checkedAt),
      ),
    };
  }

  async function buildActiveVisitorsPayload(): Promise<Phase1IngestPayload> {
    const currentIdentity = requireIdentity();
    const domains = currentIdentity.domains.map((site) => site.domain);
    await ensureTrafficTails(domains);

    return {
      ...buildEnvelopeBase(currentIdentity),
      activeVisitors3m: collectActiveVisitors3m(domains),
    };
  }

  async function buildVisitors24hPayload(): Promise<Phase1IngestPayload> {
    const currentIdentity = requireIdentity();
    const domains = currentIdentity.domains.map((site) => site.domain);
    await ensureTrafficTails(domains);

    return {
      ...buildEnvelopeBase(currentIdentity),
      visitors24h: await collectVisitors24h(domains),
    };
  }

  async function flushQueue(): Promise<void> {
    if (
      isTransmitting ||
      offlineQueue.size() === 0 ||
      secretInvalidated ||
      stopped
    ) {
      return;
    }

    isTransmitting = true;
    let transmitted = 0;

    try {
      while (offlineQueue.size() > 0 && !secretInvalidated && !stopped) {
        const secret = assertSecretReady();
        const queued = offlineQueue.peek();
        if (!queued) break;

        await sendIngest(queued.payload, secret);
        offlineQueue.ack(queued);
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
      console.error(`[Network] Transmission failed: ${message}`);
    } finally {
      isTransmitting = false;
    }
  }

  function enqueue(payload: Phase1IngestPayload): void {
    if (stopped || secretInvalidated) return;
    offlineQueue.enqueue(payload);
  }

  async function enqueueAndFlush(payload: Phase1IngestPayload): Promise<void> {
    enqueue(payload);
    await flushQueue();
  }

  async function flushCommandResults(): Promise<void> {
    if (secretInvalidated || stopped) return;

    const pending = await commandResultOutbox.list(now());
    for (const item of pending) {
      if (secretInvalidated || stopped) return;

      try {
        const secret = assertSecretReady();
        await sendCommandResultFn(item.result, secret);
        await commandResultOutbox.ack(item.result.commandId);
      } catch (error: unknown) {
        if (error instanceof AgentApiError && error.status === 401) {
          await invalidateSecret("Command result rejected with HTTP 401.");
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `[Command] Result delivery deferred for ${item.result.commandId}: ${message}`,
        );
        return;
      }
    }
  }

  async function executeCommand(command: LeasedAgentCommand): Promise<void> {
    if (!identity || secretInvalidated || stopped) return;
    if (commandIdsInFlight.has(command.id)) return;

    if (await commandResultOutbox.has(command.id)) {
      await flushCommandResults();
      return;
    }

    commandIdsInFlight.add(command.id);
    try {
      const result = await executeLeasedCommand(command, {
        agentInstanceId: identity.agentInstanceId,
        getActiveDomains: () => requireIdentity().domains,
        stackScheduler,
        now,
      });

      // Persist before network delivery. A crash after the probe but before the
      // POST therefore does not force the command to run again.
      await commandResultOutbox.enqueue(result, command.expiresAt);
      await flushCommandResults();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Command] ${command.id} execution failed: ${message}`);
    } finally {
      commandIdsInFlight.delete(command.id);
    }
  }

  async function runHeartbeat(): Promise<void> {
    if (!identity || secretInvalidated || stopped) return;

    try {
      await flushCommandResults();
      if (secretInvalidated || stopped) return;

      const secret = assertSecretReady();
      const heartbeat = await sendHeartbeatFn(identity.agentInstanceId, secret);

      for (const command of heartbeat.commands ?? []) {
        await executeCommand(command);
      }
    } catch (error: unknown) {
      if (error instanceof AgentApiError && error.status === 401) {
        await invalidateSecret("Heartbeat rejected with HTTP 401.");
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Network] Heartbeat failed: ${message}`);
    }
  }

  async function publishDiscoverySnapshot(
    domains: readonly DiscoveredDomain[] = requireIdentity().domains,
  ): Promise<void> {
    if (secretInvalidated || stopped) return;

    try {
      await enqueueAndFlush(buildDiscoveryPayload(domains));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Discovery] Snapshot publish failed: ${message}`);
    }
  }

  async function publishStackSnapshots(
    snapshots: readonly SiteStackPayload[],
  ): Promise<void> {
    if (snapshots.length === 0 || secretInvalidated || stopped) return;
    await enqueueAndFlush(buildStackPayloadFromSnapshots(snapshots));
  }

  async function runStackRefresh(
    domains: readonly DiscoveredDomain[] = requireIdentity().domains,
    reason: StackRefreshReason = "manual",
  ): Promise<void> {
    if (!identity || secretInvalidated || stopped || domains.length === 0) {
      return;
    }

    try {
      await stackScheduler.syncDomains(
        requireIdentity().domains.map((domain) => domain.domain),
      );
      const result = await stackScheduler.refreshNow(
        domains.map((domain) => domain.domain),
        reason,
      );
      await publishStackSnapshots(result.snapshots);

      if (result.attemptedDomains.length > 0) {
        console.log(
          `[Stack] ${reason} refresh attempted ${result.attemptedDomains.length} site(s); failed=${result.failedDomains.length}: ${result.attemptedDomains.join(", ")}`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Stack] ${reason} refresh failed: ${message}`);
    }
  }

  async function runDueStackRefreshes(): Promise<void> {
    if (!identity || secretInvalidated || stopped) return;

    try {
      const result = await stackScheduler.runDue(
        identity.domains.map((domain) => domain.domain),
      );
      await publishStackSnapshots(result.snapshots);

      if (result.attemptedDomains.length > 0) {
        console.log(
          `[Stack] Scheduled due refresh attempted ${result.attemptedDomains.length} site(s); failed=${result.failedDomains.length}.`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Stack] Due scheduler failed: ${message}`);
    }
  }

  async function runDiscovery(): Promise<void> {
    if (!identity || secretInvalidated || stopped) return;

    try {
      const refreshed = await initializeIdentityFn(identity.agentInstanceId);
      identity = refreshed;

      const effectiveDomains = refreshed.domains.map((site) => site.domain);
      await ensureTrafficTails(effectiveDomains);
      await stackScheduler.syncDomains(effectiveDomains);
      await enqueueAndFlush(buildDiscoveryPayload(refreshed.domains));

      console.log(
        `[Discovery] Scan complete. Effective domains: ${refreshed.domains.length}; added=${refreshed.discoveryChanges.added.length}; removed=${refreshed.discoveryChanges.removed.length}; retainedMissing=${refreshed.discoveryChanges.retainedMissing.length}.`,
      );

      if (refreshed.discoveryChanges.added.length > 0) {
        await runStackRefresh(refreshed.discoveryChanges.added, "new-domain");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Discovery] Scheduled scan failed: ${message}`);
    }
  }

  async function runActiveVisitors(): Promise<void> {
    if (!identity || secretInvalidated || stopped) return;

    try {
      await enqueueAndFlush(await buildActiveVisitorsPayload());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Traffic] Active visitor sample failed: ${message}`);
    }
  }

  async function runVisitors24h(): Promise<void> {
    if (!identity || secretInvalidated || stopped) return;

    try {
      await enqueueAndFlush(await buildVisitors24hPayload());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Traffic] 24h visitor snapshot failed: ${message}`);
    }
  }

  function registerScheduler(
    name: string,
    intervalMs: number,
    task: () => Promise<void>,
  ): void {
    const scheduler = createPeriodicScheduler({
      name,
      intervalMs,
      task,
      onSkippedOverlap: (schedulerName) => {
        console.warn(
          `[Scheduler:${schedulerName}] Previous execution still running; skipping overlapping tick.`,
        );
      },
    });

    scheduler.start();
    schedulers.push(scheduler);
  }

  console.log(
    `[Engine] Independent Phase 1 schedulers — heartbeat ${cfg.heartbeatIntervalMs / 1000}s, OLS discovery ${cfg.olsDiscoveryIntervalMs / 1000}s, active visitors ${cfg.activeVisitorSampleIntervalMs / 1000}s, visitors24h ${cfg.visitors24hSampleIntervalMs / 1000}s, stack ${cfg.stackProbeIntervalMs / 3_600_000}h/domain, concurrency ${cfg.stackProbeConcurrency}.`,
  );

  const autoStart = deps.autoStart !== false;
  if (autoStart) {
    // initializeIdentity() already performed the startup OLS scan before the
    // engine was created. Publish that effective inventory immediately rather
    // than performing a duplicate OLS scan here.
    void ensureTrafficTails(hostIdentity.domains.map((site) => site.domain));
    void runHeartbeat();
    void publishDiscoverySnapshot(hostIdentity.domains);
    void (async () => {
      try {
        await stackScheduler.initialize(
          hostIdentity.domains.map((domain) => domain.domain),
          { forceDue: true },
        );
        await runStackRefresh(hostIdentity.domains, "startup");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Stack] Startup scheduler initialization failed: ${message}`);
      }
    })();
    void runActiveVisitors();
    void runVisitors24h();

    registerScheduler(
      "heartbeat",
      cfg.heartbeatIntervalMs,
      runHeartbeat,
    );
    registerScheduler(
      "ols-discovery",
      cfg.olsDiscoveryIntervalMs,
      runDiscovery,
    );
    registerScheduler(
      "active-visitors-3m",
      cfg.activeVisitorSampleIntervalMs,
      runActiveVisitors,
    );
    registerScheduler(
      "visitors-24h",
      cfg.visitors24hSampleIntervalMs,
      runVisitors24h,
    );
    registerScheduler(
      "site-stack-due",
      STACK_SCHEDULER_TICK_MS,
      runDueStackRefreshes,
    );
  }

  return {
    enqueue,
    flushQueue,
    runHeartbeat,
    flushCommandResults,
    executeCommand,
    runDiscovery,
    runStackRefresh,
    runDueStackRefreshes,
    runActiveVisitors,
    runVisitors24h,
    buildDiscoveryPayload,
    buildStackPayload,
    buildActiveVisitorsPayload,
    buildVisitors24hPayload,
    getQueueLength: () => offlineQueue.size(),
    getPendingCommandResultCount: () => commandResultOutbox.size(now()),
    isSecretInvalidated: () => secretInvalidated,
    getActiveSecret: () => activeSecretKey,
    getIdentity: () => identity,
    getStackScheduleRecords: () => stackScheduler.getRecords(),
    stop: () => {
      if (stopped) return;
      stopped = true;
      stopSchedulers();
      stopTrafficTails();
      offlineQueue.clear();
      identity = null;
    },
  };
}

export function startEngine(
  identity: HostIdentity,
  secretKey: string,
): EngineHandle {
  return createEngine(identity, secretKey);
}
