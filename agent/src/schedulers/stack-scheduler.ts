import type { SiteStackPayload } from "../runtime-probe/types.js";
import {
  loadStackScheduleState as defaultLoadStackScheduleState,
  saveStackScheduleState as defaultSaveStackScheduleState,
  type StackScheduleRecord,
} from "./stack-schedule-state.js";

export type StackRefreshReason =
  | "startup"
  | "new-domain"
  | "scheduled"
  | "manual";

export interface StackSchedulerOptions {
  intervalMs: number;
  concurrency: number;
  jitterMaxMs?: number;
  maxRetries?: number;
  retryBackoffMs?: readonly number[];
  probeDomain: (domain: string) => Promise<SiteStackPayload>;
  now?: () => Date;
  random?: () => number;
  sleep?: (ms: number) => Promise<void>;
  loadState?: () => Promise<Map<string, StackScheduleRecord>>;
  saveState?: (
    records: ReadonlyMap<string, StackScheduleRecord>,
  ) => Promise<void>;
}

export interface StackRefreshBatchResult {
  snapshots: SiteStackPayload[];
  attemptedDomains: string[];
  failedDomains: string[];
}

export interface StackSchedulerHandle {
  initialize: (
    activeDomains: readonly string[],
    options?: { forceDue?: boolean },
  ) => Promise<void>;
  syncDomains: (activeDomains: readonly string[]) => Promise<void>;
  refreshNow: (
    domains: readonly string[],
    reason?: StackRefreshReason,
  ) => Promise<StackRefreshBatchResult>;
  runDue: (activeDomains: readonly string[]) => Promise<StackRefreshBatchResult>;
  getRecord: (domain: string) => StackScheduleRecord | null;
  getRecords: () => StackScheduleRecord[];
}

const DEFAULT_JITTER_MAX_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_BACKOFF_MS = [60_000, 300_000] as const;
export const STACK_SCHEDULER_TICK_MS = 60_000;

const RUNTIME_PROBE_FAILURE_REASONS = new Set([
  "runtime_probe_not_configured",
  "runtime_probe_unreachable",
  "runtime_probe_timeout",
  "runtime_probe_invalid_response",
  "runtime_probe_forbidden",
]);

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function uniqueDomains(domains: readonly string[]): string[] {
  return [...new Set(domains.map(normalizeDomain).filter(Boolean))];
}

function cloneRecord(record: StackScheduleRecord): StackScheduleRecord {
  return { ...record };
}

function isProbeSuccessful(snapshot: SiteStackPayload): boolean {
  return Object.values(snapshot.fieldStatus).every((status) => {
    if (!status.reason) return true;
    return !RUNTIME_PROBE_FAILURE_REASONS.has(status.reason);
  });
}

async function runWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  const runners = Array.from(
    { length: Math.min(Math.max(1, concurrency), items.length) },
    async () => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= items.length) return;
        await worker(items[index], index);
      }
    },
  );

  await Promise.all(runners);
}

export function createStackScheduler(
  options: StackSchedulerOptions,
): StackSchedulerHandle {
  if (!Number.isFinite(options.intervalMs) || options.intervalMs <= 0) {
    throw new Error("Stack scheduler interval must be a positive number.");
  }
  if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
    throw new Error("Stack scheduler concurrency must be a positive integer.");
  }

  const jitterMaxMs = Math.max(
    0,
    options.jitterMaxMs ?? DEFAULT_JITTER_MAX_MS,
  );
  const maxRetries = Math.max(
    0,
    Math.min(options.maxRetries ?? DEFAULT_MAX_RETRIES, 10),
  );
  const retryBackoffMs =
    options.retryBackoffMs ?? DEFAULT_RETRY_BACKOFF_MS;
  const now = options.now ?? (() => new Date());
  const random = options.random ?? Math.random;
  const sleep =
    options.sleep ??
    ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const loadState = options.loadState ?? defaultLoadStackScheduleState;
  const saveState = options.saveState ?? defaultSaveStackScheduleState;

  let records = new Map<string, StackScheduleRecord>();
  let loaded = false;
  let loading: Promise<void> | null = null;
  let stateMutation: Promise<void> = Promise.resolve();
  const inFlightDomains = new Set<string>();

  async function ensureLoaded(): Promise<void> {
    if (loaded) return;
    if (!loading) {
      loading = (async () => {
        records = await loadState();
        loaded = true;
      })();
    }

    try {
      await loading;
    } finally {
      if (loaded) loading = null;
    }
  }

  async function persist(): Promise<void> {
    const snapshot = new Map(
      [...records.entries()].map(([domain, record]) => [
        domain,
        cloneRecord(record),
      ]),
    );

    stateMutation = stateMutation.then(() => saveState(snapshot));
    await stateMutation;
  }

  async function syncDomainsInternal(
    activeDomains: readonly string[],
    forceDue: boolean,
  ): Promise<void> {
    await ensureLoaded();

    const current = uniqueDomains(activeDomains);
    const active = new Set(current);
    const nowIso = now().toISOString();
    let changed = false;

    for (const existing of [...records.keys()]) {
      if (!active.has(existing)) {
        records.delete(existing);
        changed = true;
      }
    }

    for (const domain of current) {
      const existing = records.get(domain);
      if (!existing) {
        records.set(domain, {
          domain,
          lastStackCheckedAt: null,
          lastAttemptAt: null,
          nextDueAt: nowIso,
          retryAttempt: 0,
        });
        changed = true;
        continue;
      }

      if (forceDue && existing.nextDueAt !== nowIso) {
        existing.nextDueAt = nowIso;
        existing.retryAttempt = 0;
        changed = true;
      }
    }

    if (changed) await persist();
  }

  function getOrCreateRecord(domain: string): StackScheduleRecord {
    const normalized = normalizeDomain(domain);
    const existing = records.get(normalized);
    if (existing) return existing;

    const created: StackScheduleRecord = {
      domain: normalized,
      lastStackCheckedAt: null,
      lastAttemptAt: null,
      nextDueAt: now().toISOString(),
      retryAttempt: 0,
    };
    records.set(normalized, created);
    return created;
  }

  function scheduleSuccessfulProbe(
    record: StackScheduleRecord,
    snapshot: SiteStackPayload,
  ): void {
    const checkedAtMs = Number.isFinite(Date.parse(snapshot.checkedAt))
      ? Date.parse(snapshot.checkedAt)
      : now().getTime();

    const checkedAt = new Date(checkedAtMs).toISOString();
    record.lastAttemptAt = checkedAt;
    record.lastStackCheckedAt = checkedAt;
    record.nextDueAt = new Date(checkedAtMs + options.intervalMs).toISOString();
    record.retryAttempt = 0;
  }

  function scheduleFailedProbe(
    record: StackScheduleRecord,
    attemptedAt: Date,
    reason: StackRefreshReason,
  ): void {
    record.lastAttemptAt = attemptedAt.toISOString();

    // A failed manual request must not accidentally move a healthy automatic
    // schedule. The future command subsystem can report the command failure
    // while this domain retains its existing automatic due time.
    if (reason === "manual") return;

    if (record.retryAttempt < maxRetries) {
      const backoffIndex = Math.min(
        record.retryAttempt,
        Math.max(0, retryBackoffMs.length - 1),
      );
      const backoffMs = retryBackoffMs[backoffIndex] ?? options.intervalMs;
      record.retryAttempt += 1;
      record.nextDueAt = new Date(attemptedAt.getTime() + backoffMs).toISOString();
      return;
    }

    // Bounded retries are exhausted. Return to the normal six-hour schedule;
    // the next failed scheduled cycle may again use the bounded retry budget.
    record.retryAttempt = 0;
    record.nextDueAt = new Date(
      attemptedAt.getTime() + options.intervalMs,
    ).toISOString();
  }

  async function executeDomains(
    rawDomains: readonly string[],
    reason: StackRefreshReason,
  ): Promise<StackRefreshBatchResult> {
    await ensureLoaded();

    const domains = uniqueDomains(rawDomains).filter(
      (domain) => records.has(domain) && !inFlightDomains.has(domain),
    );
    if (domains.length === 0) {
      return { snapshots: [], attemptedDomains: [], failedDomains: [] };
    }

    const snapshots: SiteStackPayload[] = [];
    const failedDomains: string[] = [];

    for (const domain of domains) inFlightDomains.add(domain);

    try {
      await runWithConcurrency(domains, options.concurrency, async (domain) => {
        if (reason === "scheduled" && domains.length > 1 && jitterMaxMs > 0) {
          const jitterMs = Math.floor(random() * (jitterMaxMs + 1));
          if (jitterMs > 0) await sleep(jitterMs);
        }

        const record = getOrCreateRecord(domain);
        const attemptedAt = now();

        try {
          const snapshot = await options.probeDomain(domain);
          snapshots.push(snapshot);

          if (isProbeSuccessful(snapshot)) {
            scheduleSuccessfulProbe(record, snapshot);
          } else {
            failedDomains.push(domain);
            scheduleFailedProbe(record, attemptedAt, reason);
          }
        } catch {
          failedDomains.push(domain);
          scheduleFailedProbe(record, attemptedAt, reason);
        }
      });

      await persist();
    } finally {
      for (const domain of domains) inFlightDomains.delete(domain);
    }

    // Concurrent workers complete nondeterministically. Sort only for stable
    // payload/tests; the scheduler itself remains concurrent.
    snapshots.sort((a, b) => a.domain.localeCompare(b.domain));
    failedDomains.sort();

    return {
      snapshots,
      attemptedDomains: [...domains].sort(),
      failedDomains,
    };
  }

  async function initialize(
    activeDomains: readonly string[],
    initializeOptions: { forceDue?: boolean } = {},
  ): Promise<void> {
    await syncDomainsInternal(activeDomains, initializeOptions.forceDue === true);
  }

  async function syncDomains(activeDomains: readonly string[]): Promise<void> {
    await syncDomainsInternal(activeDomains, false);
  }

  async function refreshNow(
    domains: readonly string[],
    reason: StackRefreshReason = "manual",
  ): Promise<StackRefreshBatchResult> {
    await ensureLoaded();
    return executeDomains(domains, reason);
  }

  async function runDue(
    activeDomains: readonly string[],
  ): Promise<StackRefreshBatchResult> {
    await syncDomainsInternal(activeDomains, false);
    const currentMs = now().getTime();
    const due = [...records.values()]
      .filter((record) => Date.parse(record.nextDueAt) <= currentMs)
      .map((record) => record.domain)
      .sort();

    return executeDomains(due, "scheduled");
  }

  return {
    initialize,
    syncDomains,
    refreshNow,
    runDue,
    getRecord: (domain: string) => {
      const record = records.get(normalizeDomain(domain));
      return record ? cloneRecord(record) : null;
    },
    getRecords: () =>
      [...records.values()]
        .map(cloneRecord)
        .sort((a, b) => a.domain.localeCompare(b.domain)),
  };
}

export const stackSchedulerConstants = Object.freeze({
  tickMs: STACK_SCHEDULER_TICK_MS,
  defaultJitterMaxMs: DEFAULT_JITTER_MAX_MS,
  defaultMaxRetries: DEFAULT_MAX_RETRIES,
  defaultRetryBackoffMs: DEFAULT_RETRY_BACKOFF_MS,
});
