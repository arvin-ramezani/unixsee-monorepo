import { getConfig } from "./config/config.js";
import {
  readAccessLogRange,
  statAccessLog,
  watchAccessLog,
  type AccessLogWatchHandle,
} from "./security/filesystem.js";
import {
  getTrafficCursor,
  resetTrafficCursorStateForTests,
  setTrafficCursor,
  type TrafficCoverageReason,
  type TrafficCoverageState,
} from "./traffic-cursors.js";
import {
  deriveVisitorKey,
  loadOrCreateVisitorHashKey,
  resetVisitorIdentityForTests,
} from "./visitor-identity.js";
import {
  addVisitorTo24h,
  ensureVisitors24hDomain,
  getVisitors24hCardinality,
  persistVisitors24hState,
  reconcileVisitors24hDomains,
  removeVisitors24hDomain,
  resetVisitors24hStateForTests,
} from "./traffic-hll.js";
import {
  ensureVisitors24hCoverageDomain,
  getVisitors24hCoverage,
  initializeVisitors24hCoverage,
  markVisitors24hCoverageObserved,
  persistVisitors24hCoverageState,
  reconcileVisitors24hCoverageDomains,
  removeVisitors24hCoverageDomain,
  resetVisitors24hCoverageAfterGap,
  resetVisitors24hCoverageStateForTests,
} from "./traffic-coverage.js";

export type VisitorFieldState = "ok" | "unknown" | "unsupported";

export interface VisitorStatus {
  state: VisitorFieldState;
  reason?: string;
}

export interface ActiveVisitorsSample {
  domain: string;
  uniqueVisitorCount: number;
  windowSeconds: 180;
  windowStartedAt: string;
  measuredAt: string;
  status?: VisitorStatus;
}

export interface Visitors24hSample {
  domain: string;
  uniqueVisitors24h: number;
  windowSeconds: 86400;
  coverageSeconds: number;
  measuredAt: string;
  algorithm: "hll";
  status: VisitorStatus;
}

interface ParsedVisitorHit {
  visitorKey: string;
  atMs: number;
}

interface DomainTailState {
  domain: string;
  /** One bounded active-window record per pseudonymous visitor. */
  lastSeenByVisitor: Map<string, number>;
  byteOffset: number;
  inode: number | null;
  initialized: boolean;
  watching: boolean;
  watcher: AccessLogWatchHandle | null;
  readError: VisitorStatus | null;
  coverage: TrafficCoverageState;
  /** Serialize watcher + polling reads per domain. */
  readInFlight: Promise<void> | null;
  /** Coalesce events that arrive while a read is already running. */
  readPending: boolean;
}

interface ProcessedChunk {
  nextOffset: number;
  earliestParsedAtMs: number | null;
}

const domainStates = new Map<string, DomainTailState>();
let reconciliationTimer: ReturnType<typeof setInterval> | null = null;
let reconciliationRunning = false;

const IP_PATTERN = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]/;

function parseLogLine(
  domain: string,
  line: string,
  visitorHashKey: Buffer,
): ParsedVisitorHit | null {
  const match = line.match(IP_PATTERN);
  if (!match) return null;

  const rawAddress = match[1];
  if (!rawAddress) return null;

  // The raw address exists only in this local stack frame. It is converted to
  // a keyed pseudonymous visitor key before anything is retained in state.
  const visitorKey = deriveVisitorKey(domain, rawAddress, visitorHashKey);
  if (!visitorKey) return null;

  const dateToken = match[2];
  if (!dateToken) return null;
  const date = new Date(dateToken.replace(":", " "));
  const atMs = Number.isNaN(date.getTime()) ? Date.now() : date.getTime();

  return { visitorKey, atMs };
}

function rememberVisitor(
  state: DomainTailState,
  hit: ParsedVisitorHit,
): void {
  const previous = state.lastSeenByVisitor.get(hit.visitorKey);
  if (previous === undefined || hit.atMs > previous) {
    state.lastSeenByVisitor.set(hit.visitorKey, hit.atMs);
  }

  // Feed the privacy-preserving 24-hour cardinality ring from the same local
  // pseudonymous visitor key. No raw address reaches HLL state or disk.
  addVisitorTo24h(state.domain, hit.visitorKey, hit.atMs);
}

function pruneVisitors(
  lastSeenByVisitor: Map<string, number>,
  windowMs: number,
  nowMs: number,
): void {
  const cutoff = nowMs - windowMs;
  for (const [visitorKey, lastSeenAt] of lastSeenByVisitor) {
    if (lastSeenAt < cutoff) {
      lastSeenByVisitor.delete(visitorKey);
    }
  }
}

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

function closeWatcher(state: DomainTailState): void {
  if (state.watcher) {
    state.watcher.close();
    state.watcher = null;
  }
  state.watching = false;
}

function unknownCoverage(
  reason: TrafficCoverageReason,
  nowMs: number,
  earliestParsedAtMs: number | null,
): TrafficCoverageState {
  const windowMs = getConfig().activeVisitorWindowSeconds * 1000;
  const completeAfterMs =
    earliestParsedAtMs === null
      ? nowMs + windowMs
      : Math.max(nowMs, earliestParsedAtMs + windowMs);

  return {
    state: "unknown",
    reason,
    completeAfterMs,
  };
}

function coverageFromStartupRead(
  reason: TrafficCoverageReason,
  nowMs: number,
  earliestParsedAtMs: number | null,
): TrafficCoverageState {
  const cutoff = nowMs - getConfig().activeVisitorWindowSeconds * 1000;
  if (earliestParsedAtMs !== null && earliestParsedAtMs <= cutoff) {
    return { state: "ok" };
  }
  return unknownCoverage(reason, nowMs, earliestParsedAtMs);
}

function refreshCoverage(state: DomainTailState, nowMs: number): void {
  if (
    state.coverage.state === "unknown" &&
    state.coverage.completeAfterMs !== undefined &&
    nowMs >= state.coverage.completeAfterMs
  ) {
    state.coverage = { state: "ok" };
  }
}

async function ensureState(domain: string): Promise<DomainTailState> {
  const existing = domainStates.get(domain);
  if (existing) return existing;

  const persistedCursor = await getTrafficCursor(domain);
  const state: DomainTailState = {
    domain,
    lastSeenByVisitor: new Map<string, number>(),
    byteOffset: persistedCursor?.offset ?? 0,
    inode: persistedCursor?.inode ?? null,
    initialized: false,
    watching: false,
    watcher: null,
    readError: null,
    coverage: persistedCursor?.coverage ?? {
      state: "unknown",
      reason: "warming_up",
    },
    readInFlight: null,
    readPending: false,
  };
  domainStates.set(domain, state);
  return state;
}

function processCompleteLines(
  state: DomainTailState,
  visitorHashKey: Buffer,
  content: string,
  absoluteStartOffset: number,
  discardLeadingPartialLine: boolean,
): ProcessedChunk {
  let remaining = content;
  let cursor = absoluteStartOffset;

  if (discardLeadingPartialLine) {
    const firstNewline = remaining.indexOf("\n");
    if (firstNewline === -1) {
      // We started in the middle of a line and still do not have its end. Do
      // not advance the durable cursor beyond bytes we cannot parse safely.
      return {
        nextOffset: absoluteStartOffset,
        earliestParsedAtMs: null,
      };
    }

    const skipped = remaining.slice(0, firstNewline + 1);
    cursor += Buffer.byteLength(skipped, "utf8");
    remaining = remaining.slice(firstNewline + 1);
  }

  const lastNewline = remaining.lastIndexOf("\n");
  if (lastNewline === -1) {
    return {
      nextOffset: cursor,
      earliestParsedAtMs: null,
    };
  }

  const complete = remaining.slice(0, lastNewline + 1);
  let earliestParsedAtMs: number | null = null;

  for (const rawLine of complete.split("\n")) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    if (!line) continue;
    const parsed = parseLogLine(state.domain, line, visitorHashKey);
    if (!parsed) continue;
    rememberVisitor(state, parsed);
    if (earliestParsedAtMs === null || parsed.atMs < earliestParsedAtMs) {
      earliestParsedAtMs = parsed.atMs;
    }
  }

  return {
    nextOffset: cursor + Buffer.byteLength(complete, "utf8"),
    earliestParsedAtMs,
  };
}

async function persistCursor(state: DomainTailState): Promise<void> {
  if (state.inode === null) return;
  await setTrafficCursor(state.domain, {
    inode: state.inode,
    offset: state.byteOffset,
    lastReadAt: new Date().toISOString(),
    coverage: { ...state.coverage },
  });
}

async function initializeFromBoundedTail(
  state: DomainTailState,
  visitorHashKey: Buffer,
  fileStats: { size: number; inode: number },
): Promise<void> {
  const nowMs = Date.now();
  const previousInode = state.inode;
  const previousOffset = state.byteOffset;

  const hadCursor = previousInode !== null;
  const rotatedOrTruncated =
    hadCursor &&
    (previousInode !== fileStats.inode || fileStats.size < previousOffset);

  const maxBytes = getConfig().trafficInitialReadMaxBytes;
  let coverageReason: TrafficCoverageReason = rotatedOrTruncated
    ? "log_rotated_gap"
    : "warming_up";
  let start: number;

  if (
    hadCursor &&
    !rotatedOrTruncated &&
    previousInode === fileStats.inode &&
    fileStats.size >= previousOffset
  ) {
    const unreadBytes = fileStats.size - previousOffset;
    if (unreadBytes > maxBytes) {
      // The agent was offline long enough that continuing from the cursor would
      // exceed the bounded startup budget. Read the newest bounded tail and
      // surface the skipped interval until current-window coverage is proven.
      start = Math.max(0, fileStats.size - maxBytes);
      coverageReason = "log_cursor_gap";
    } else {
      // Continue through every byte appended after the durable cursor, while
      // spending any remaining startup budget on bounded backfill so the
      // rolling active window can recover immediately when possible.
      const backfillBudget = maxBytes - unreadBytes;
      start = Math.max(0, previousOffset - backfillBudget);
    }
  } else {
    start = Math.max(0, fileStats.size - maxBytes);
  }
  const content =
    fileStats.size > start
      ? await readAccessLogRange(state.domain, start, fileStats.size)
      : "";

  // Cardinality and coverage are intentionally independent. A missing cursor
  // or rotation may reduce COVERAGE, but previously observed HLL buckets remain
  // valid observations inside the rolling 24-hour cardinality window.

  state.inode = fileStats.inode;
  state.lastSeenByVisitor.clear();

  const processed = processCompleteLines(
    state,
    visitorHashKey,
    content,
    start,
    start > 0,
  );

  state.byteOffset = processed.nextOffset;
  state.coverage = coverageFromStartupRead(
    coverageReason,
    nowMs,
    processed.earliestParsedAtMs,
  );
  state.initialized = true;
  state.readError = null;

  const recoveredStartMs = processed.earliestParsedAtMs ?? nowMs;
  if (rotatedOrTruncated) {
    resetVisitors24hCoverageAfterGap(
      state.domain,
      "log_rotated_gap",
      recoveredStartMs,
      nowMs,
    );
  } else if (coverageReason === "log_cursor_gap") {
    resetVisitors24hCoverageAfterGap(
      state.domain,
      "log_cursor_gap",
      recoveredStartMs,
      nowMs,
    );
  } else {
    initializeVisitors24hCoverage(
      state.domain,
      recoveredStartMs,
      "warming_up",
    );
    markVisitors24hCoverageObserved(
      state.domain,
      nowMs,
      recoveredStartMs,
    );
  }

  await Promise.all([
    persistCursor(state),
    persistVisitors24hState(),
    persistVisitors24hCoverageState(),
  ]);
}

async function readIncrementalLines(
  state: DomainTailState,
  visitorHashKey: Buffer,
  fileStats: { size: number; inode: number },
): Promise<void> {
  const nowMs = Date.now();
  refreshCoverage(state, nowMs);

  const rotated = state.inode !== null && fileStats.inode !== state.inode;
  const truncated = fileStats.size < state.byteOffset;

  if (rotated || truncated) {
    const maxBytes = getConfig().trafficInitialReadMaxBytes;
    const start = Math.max(0, fileStats.size - maxBytes);
    const content =
      fileStats.size > start
        ? await readAccessLogRange(state.domain, start, fileStats.size)
        : "";

    state.inode = fileStats.inode;
    const processed = processCompleteLines(
      state,
      visitorHashKey,
      content,
      start,
      start > 0,
    );
    state.byteOffset = processed.nextOffset;
    state.coverage = coverageFromStartupRead(
      "log_rotated_gap",
      nowMs,
      processed.earliestParsedAtMs,
    );
    state.readError = null;
    resetVisitors24hCoverageAfterGap(
      state.domain,
      "log_rotated_gap",
      processed.earliestParsedAtMs ?? nowMs,
      nowMs,
    );
    await Promise.all([
      persistCursor(state),
      persistVisitors24hState(),
      persistVisitors24hCoverageState(),
    ]);
    return;
  }

  state.inode = fileStats.inode;

  if (fileStats.size === state.byteOffset) {
    state.readError = null;
    initializeVisitors24hCoverage(state.domain, nowMs, "warming_up");
    markVisitors24hCoverageObserved(state.domain, nowMs);
    await Promise.all([
      persistCursor(state),
      persistVisitors24hCoverageState(),
    ]);
    return;
  }

  const content = await readAccessLogRange(
    state.domain,
    state.byteOffset,
    fileStats.size,
  );
  const processed = processCompleteLines(
    state,
    visitorHashKey,
    content,
    state.byteOffset,
    false,
  );
  state.byteOffset = processed.nextOffset;
  state.readError = null;
  initializeVisitors24hCoverage(
    state.domain,
    processed.earliestParsedAtMs ?? nowMs,
    "warming_up",
  );
  markVisitors24hCoverageObserved(
    state.domain,
    nowMs,
    processed.earliestParsedAtMs ?? nowMs,
  );
  await Promise.all([
    persistCursor(state),
    persistVisitors24hState(),
    persistVisitors24hCoverageState(),
  ]);
}

async function readNewLines(
  state: DomainTailState,
  visitorHashKey: Buffer,
): Promise<void> {
  let fileStats;
  try {
    fileStats = await statAccessLog(state.domain);
  } catch (error: unknown) {
    const code = errorCode(error);
    state.readError = {
      state: "unsupported",
      reason: code === "ENOENT" ? "log_missing" : "log_unreadable",
    };

    // A watcher bound to an old inode will not reliably follow a removed or
    // replaced path. Periodic reconciliation will reopen it when the path is
    // healthy again.
    closeWatcher(state);
    return;
  }

  try {
    if (!state.initialized) {
      await initializeFromBoundedTail(state, visitorHashKey, fileStats);
    } else {
      await readIncrementalLines(state, visitorHashKey, fileStats);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    state.readError = {
      state: "unsupported",
      reason: `log_read_failed:${message.slice(0, 80)}`,
    };
  }
}

function isStateActive(state: DomainTailState): boolean {
  return domainStates.get(state.domain) === state;
}

function startWatch(state: DomainTailState, visitorHashKey: Buffer): void {
  if (!isStateActive(state) || state.watching || state.readError) return;

  try {
    state.watcher = watchAccessLog(state.domain, () => {
      // fs.watch is only a low-latency hint. The durable correctness path is
      // the periodic reconciliation loop below, so coalescing/dropped watch
      // events cannot permanently stall collection.
      void queueDomainRead(state, visitorHashKey, "watch");
    });
    state.watching = true;
  } catch {
    // Polling reconciliation remains active even if a platform/filesystem
    // cannot provide a watcher for this log.
    state.watching = false;
    state.watcher = null;
  }
}

function refreshWatchAfterRead(
  state: DomainTailState,
  visitorHashKey: Buffer,
  previousInode: number | null,
): void {
  if (!isStateActive(state)) {
    closeWatcher(state);
    return;
  }
  if (state.readError) return;

  const inodeChanged =
    previousInode !== null &&
    state.inode !== null &&
    previousInode !== state.inode;

  if (inodeChanged) {
    closeWatcher(state);
  }

  if (!state.watching) {
    startWatch(state, visitorHashKey);
  }
}

function queueDomainRead(
  state: DomainTailState,
  visitorHashKey: Buffer,
  source: "watch" | "reconcile" | "ensure",
): Promise<void> {
  if (state.readInFlight) {
    state.readPending = true;
    return state.readInFlight;
  }

  const run = async (): Promise<void> => {
    do {
      state.readPending = false;
      const previousInode = state.inode;

      try {
        await readNewLines(state, visitorHashKey);
        refreshWatchAfterRead(state, visitorHashKey, previousInode);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `[Traffic] ${source} read failed for ${state.domain}: ${message}`,
        );
        state.readError = {
          state: "unsupported",
          reason: source === "watch" ? "log_watch_read_failed" : "log_read_failed",
        };
      }
    } while (state.readPending && isStateActive(state));
  };

  const inFlight = run().finally(() => {
    if (state.readInFlight === inFlight) {
      state.readInFlight = null;
    }
  });

  state.readInFlight = inFlight;
  return inFlight;
}

async function reconcileOneDomain(
  state: DomainTailState,
  visitorHashKey: Buffer,
): Promise<void> {
  if (!isStateActive(state)) return;
  try {
    await queueDomainRead(state, visitorHashKey, "reconcile");
  } catch (error: unknown) {
    // Isolation guarantee: a broken domain never aborts reconciliation for
    // other domains on the VPS.
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[Traffic] Reconciliation failed for ${state.domain}: ${message}`);
  }
}

export async function reconcileTrafficTailsOnce(): Promise<void> {
  if (reconciliationRunning || domainStates.size === 0) return;

  reconciliationRunning = true;
  try {
    const visitorHashKey = await loadOrCreateVisitorHashKey();
    const states = Array.from(domainStates.values());
    await Promise.allSettled(
      states.map((state) => reconcileOneDomain(state, visitorHashKey)),
    );
  } finally {
    reconciliationRunning = false;
  }
}

function startReconciliationLoop(): void {
  if (reconciliationTimer || domainStates.size === 0) return;

  reconciliationTimer = setInterval(() => {
    void reconcileTrafficTailsOnce().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Traffic] Reconciliation tick failed: ${message}`);
    });
  }, getConfig().trafficReconcileIntervalMs);

  // Do not keep a standalone CLI/test process alive solely because the
  // reconciliation safety net exists. systemd still owns the real service.
  reconciliationTimer.unref?.();
}

function stopReconciliationLoop(): void {
  if (!reconciliationTimer) return;
  clearInterval(reconciliationTimer);
  reconciliationTimer = null;
}

export async function ensureTrafficTails(domains: string[]): Promise<void> {
  // Fail closed if the local visitor pseudonymization key is missing/corrupt.
  // Do not silently rotate it because that would change visitor identity and
  // invalidate future restart-persistent cardinality state.
  const visitorHashKey = await loadOrCreateVisitorHashKey();

  const active = new Set(domains);
  for (const domain of domains) {
    try {
      await Promise.all([
        ensureVisitors24hDomain(domain),
        ensureVisitors24hCoverageDomain(domain),
      ]);
      const state = await ensureState(domain);
      await queueDomainRead(state, visitorHashKey, "ensure");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Traffic] ensure failed for ${domain}: ${message}`);
      const state = domainStates.get(domain);
      if (state) {
        state.readError = {
          state: "unsupported",
          reason: "log_ensure_failed",
        };
      }
    }
  }

  for (const [domain, state] of domainStates) {
    if (!active.has(domain)) {
      closeWatcher(state);
      domainStates.delete(domain);
      await Promise.all([
        removeVisitors24hDomain(domain),
        removeVisitors24hCoverageDomain(domain),
      ]);
    }
  }

  // Also remove persisted HLL sketches for domains that are no longer in the
  // effective OLS inventory, including stale state loaded after a restart.
  await Promise.all([
    reconcileVisitors24hDomains(domains),
    reconcileVisitors24hCoverageDomains(domains),
  ]);

  if (domainStates.size > 0) {
    startReconciliationLoop();
  } else {
    stopReconciliationLoop();
  }
}

export function stopTrafficTails(): void {
  stopReconciliationLoop();
  for (const state of domainStates.values()) {
    closeWatcher(state);
  }
  domainStates.clear();
}

export function collectActiveVisitors3m(
  domains: string[],
): ActiveVisitorsSample[] {
  const nowMs = Date.now();
  const windowMs = getConfig().activeVisitorWindowSeconds * 1000;
  const measuredAt = new Date(nowMs).toISOString();
  const windowStartedAt = new Date(nowMs - windowMs).toISOString();
  const windowSeconds = 180 as const;

  return domains.map((domain) => {
    const state = domainStates.get(domain);
    if (!state) {
      return {
        domain,
        uniqueVisitorCount: 0,
        windowSeconds,
        windowStartedAt,
        measuredAt,
        status: { state: "unsupported", reason: "log_not_initialized" },
      };
    }

    if (state.readError) {
      return {
        domain,
        uniqueVisitorCount: 0,
        windowSeconds,
        windowStartedAt,
        measuredAt,
        status: state.readError,
      };
    }

    pruneVisitors(state.lastSeenByVisitor, windowMs, nowMs);
    refreshCoverage(state, nowMs);

    const status: VisitorStatus =
      state.coverage.state === "ok"
        ? { state: "ok" }
        : {
            state: "unknown",
            reason: state.coverage.reason ?? "warming_up",
          };

    return {
      domain,
      // Exact number of pseudonymous visitor keys seen within the rolling window.
      uniqueVisitorCount: state.lastSeenByVisitor.size,
      windowSeconds,
      windowStartedAt,
      measuredAt,
      status,
    };
  });
}

export async function collectVisitors24h(
  domains: string[],
): Promise<Visitors24hSample[]> {
  const nowMs = Date.now();
  const measuredAt = new Date(nowMs).toISOString();

  return Promise.all(
    domains.map(async (domain) => {
      await Promise.all([
        ensureVisitors24hDomain(domain),
        ensureVisitors24hCoverageDomain(domain),
      ]);
      const [uniqueVisitors24h, coverage] = await Promise.all([
        getVisitors24hCardinality(domain, nowMs),
        getVisitors24hCoverage(domain, nowMs),
      ]);
      const state = domainStates.get(domain);

      return {
        domain,
        uniqueVisitors24h,
        windowSeconds: 86400 as const,
        coverageSeconds: coverage.coverageSeconds,
        measuredAt,
        algorithm: "hll" as const,
        status: state?.readError
          ? { ...state.readError }
          : coverage.status,
      };
    }),
  );
}

/** Test-only visibility into derived state; never exposes the local hash key. */
export function getTrafficStateSnapshotForTests(domain: string): {
  visitorKeys: string[];
  lastSeenAt: number[];
  byteOffset: number;
  inode: number | null;
  coverage: TrafficCoverageState;
  watching: boolean;
} | null {
  const state = domainStates.get(domain);
  if (!state) return null;

  return {
    visitorKeys: Array.from(state.lastSeenByVisitor.keys()),
    lastSeenAt: Array.from(state.lastSeenByVisitor.values()),
    byteOffset: state.byteOffset,
    inode: state.inode,
    coverage: { ...state.coverage },
    watching: state.watching,
  };
}

/** Test-only helper to simulate a dropped/unavailable fs.watch subscription. */
export function disableTrafficWatchForTests(domain: string): void {
  const state = domainStates.get(domain);
  if (state) closeWatcher(state);
}

export function resetTrafficStateForTests(): void {
  stopTrafficTails();
  reconciliationRunning = false;
  resetVisitorIdentityForTests();
  resetTrafficCursorStateForTests();
  resetVisitors24hStateForTests();
  resetVisitors24hCoverageStateForTests();
}
