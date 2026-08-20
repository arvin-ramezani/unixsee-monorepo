import {
  readAgentStateFile,
  writeAgentStateFileAtomic,
} from "./security/filesystem.js";

const STATE_FILE = "traffic-coverage.json";
const SCHEMA_VERSION = 1 as const;
const WINDOW_SECONDS = 86_400;
const WINDOW_MS = WINDOW_SECONDS * 1000;

export type Visitors24hCoverageReason =
  | "warming_up"
  | "log_rotated_gap"
  | "log_cursor_gap";

interface DomainCoverageState {
  /** Start of the latest continuous, fully observed segment. */
  continuousStartMs: number | null;
  /** Latest instant through which the access-log stream was verified readable. */
  lastObservedAtMs: number | null;
  reason: Visitors24hCoverageReason;
}

interface PersistedCoverageState {
  version: 1;
  windowSeconds: 86400;
  domains: Record<string, DomainCoverageState>;
}

export interface Visitors24hCoverage {
  coverageSeconds: number;
  status: {
    state: "ok" | "unknown";
    reason?: Visitors24hCoverageReason;
  };
}

let loaded = false;
let domainStates = new Map<string, DomainCoverageState>();
let dirty = false;
let writeChain: Promise<void> = Promise.resolve();

function isSafeDomain(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 253 &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0")
  );
}

function isCoverageReason(value: unknown): value is Visitors24hCoverageReason {
  return (
    value === "warming_up" ||
    value === "log_rotated_gap" ||
    value === "log_cursor_gap"
  );
}

function validTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

async function ensureLoaded(): Promise<void> {
  if (loaded) return;

  const raw = await readAgentStateFile(STATE_FILE);
  if (raw === null) {
    domainStates = new Map();
    loaded = true;
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Corrupt ${STATE_FILE}: expected valid JSON.`);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Corrupt ${STATE_FILE}: invalid root object.`);
  }

  const root = parsed as Partial<PersistedCoverageState>;
  if (
    root.version !== SCHEMA_VERSION ||
    root.windowSeconds !== WINDOW_SECONDS ||
    !root.domains ||
    typeof root.domains !== "object"
  ) {
    throw new Error(`Unsupported ${STATE_FILE} schema/configuration.`);
  }

  const next = new Map<string, DomainCoverageState>();
  for (const [domain, value] of Object.entries(root.domains)) {
    if (!isSafeDomain(domain) || !value || typeof value !== "object") {
      throw new Error(`Corrupt ${STATE_FILE}: invalid domain record.`);
    }

    const record = value as Partial<DomainCoverageState>;
    if (
      record.continuousStartMs !== null &&
      !validTimestamp(record.continuousStartMs)
    ) {
      throw new Error(
        `Corrupt ${STATE_FILE}: invalid continuous start for ${domain}.`,
      );
    }
    if (
      record.lastObservedAtMs !== null &&
      !validTimestamp(record.lastObservedAtMs)
    ) {
      throw new Error(
        `Corrupt ${STATE_FILE}: invalid observed timestamp for ${domain}.`,
      );
    }
    if (!isCoverageReason(record.reason)) {
      throw new Error(`Corrupt ${STATE_FILE}: invalid reason for ${domain}.`);
    }
    if (
      record.continuousStartMs !== null &&
      record.lastObservedAtMs !== null &&
      record.lastObservedAtMs < record.continuousStartMs
    ) {
      throw new Error(`Corrupt ${STATE_FILE}: reversed coverage for ${domain}.`);
    }

    next.set(domain, {
      continuousStartMs: record.continuousStartMs ?? null,
      lastObservedAtMs: record.lastObservedAtMs ?? null,
      reason: record.reason,
    });
  }

  domainStates = next;
  loaded = true;
  dirty = false;
}

function serializeState(): string {
  const domains = Object.fromEntries(
    Array.from(domainStates.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([domain, state]) => [domain, state]),
  );

  const payload: PersistedCoverageState = {
    version: SCHEMA_VERSION,
    windowSeconds: WINDOW_SECONDS,
    domains,
  };

  return `${JSON.stringify(payload)}\n`;
}

export async function ensureVisitors24hCoverageDomain(
  domain: string,
): Promise<void> {
  await ensureLoaded();
  if (!isSafeDomain(domain)) {
    throw new Error(`Invalid domain for 24h coverage state: ${domain}`);
  }
  if (!domainStates.has(domain)) {
    domainStates.set(domain, {
      continuousStartMs: null,
      lastObservedAtMs: null,
      reason: "warming_up",
    });
    dirty = true;
  }
}

/**
 * Establish the beginning of coverage for a fresh domain only. This never
 * moves an existing continuous start forward; normal restart/cursor catch-up
 * therefore preserves coverage accumulated before the restart.
 */
export function initializeVisitors24hCoverage(
  domain: string,
  startMs: number,
  reason: Visitors24hCoverageReason,
): void {
  const state = domainStates.get(domain);
  if (!state) {
    throw new Error(`24h coverage state not initialized for ${domain}.`);
  }
  if (!validTimestamp(startMs)) return;

  if (state.continuousStartMs === null) {
    state.continuousStartMs = startMs;
    state.lastObservedAtMs = startMs;
    state.reason = reason;
    dirty = true;
  }
}

/** Mark the access-log stream as continuously observed through this instant. */
export function markVisitors24hCoverageObserved(
  domain: string,
  observedAtMs: number,
  startIfEmptyMs: number = observedAtMs,
): void {
  const state = domainStates.get(domain);
  if (!state) {
    throw new Error(`24h coverage state not initialized for ${domain}.`);
  }
  if (!validTimestamp(observedAtMs) || !validTimestamp(startIfEmptyMs)) return;

  if (state.continuousStartMs === null) {
    state.continuousStartMs = Math.min(startIfEmptyMs, observedAtMs);
    state.reason = "warming_up";
    dirty = true;
  }

  if (
    state.lastObservedAtMs === null ||
    observedAtMs > state.lastObservedAtMs
  ) {
    state.lastObservedAtMs = observedAtMs;
    dirty = true;
  }
}

/**
 * A proven unrecoverable log gap resets only COVERAGE. HLL cardinality is
 * intentionally untouched so pre-gap observed visitors remain part of the
 * rolling observed-cardinality estimate.
 */
export function resetVisitors24hCoverageAfterGap(
  domain: string,
  reason: Exclude<Visitors24hCoverageReason, "warming_up">,
  recoveredStartMs: number,
  observedAtMs: number,
): void {
  const state = domainStates.get(domain);
  if (!state) {
    throw new Error(`24h coverage state not initialized for ${domain}.`);
  }
  if (!validTimestamp(recoveredStartMs) || !validTimestamp(observedAtMs)) return;

  state.continuousStartMs = Math.min(recoveredStartMs, observedAtMs);
  state.lastObservedAtMs = observedAtMs;
  state.reason = reason;
  dirty = true;
}

export async function getVisitors24hCoverage(
  domain: string,
  nowMs: number,
): Promise<Visitors24hCoverage> {
  await ensureVisitors24hCoverageDomain(domain);
  const state = domainStates.get(domain)!;

  const effectiveEnd =
    state.lastObservedAtMs === null
      ? null
      : Math.min(state.lastObservedAtMs, nowMs);

  const coverageSeconds =
    state.continuousStartMs === null || effectiveEnd === null
      ? 0
      : Math.max(
          0,
          Math.min(
            WINDOW_SECONDS,
            Math.floor((effectiveEnd - state.continuousStartMs) / 1000),
          ),
        );

  if (coverageSeconds >= WINDOW_SECONDS) {
    return {
      coverageSeconds: WINDOW_SECONDS,
      status: { state: "ok" },
    };
  }

  return {
    coverageSeconds,
    status: {
      state: "unknown",
      reason: state.reason,
    },
  };
}

export async function removeVisitors24hCoverageDomain(
  domain: string,
): Promise<void> {
  await ensureLoaded();
  if (!domainStates.delete(domain)) return;
  dirty = true;
  await persistVisitors24hCoverageState();
}

export async function reconcileVisitors24hCoverageDomains(
  activeDomains: readonly string[],
): Promise<void> {
  await ensureLoaded();
  const active = new Set(activeDomains);
  let changed = false;
  for (const domain of domainStates.keys()) {
    if (!active.has(domain)) {
      domainStates.delete(domain);
      changed = true;
    }
  }
  if (changed) {
    dirty = true;
    await persistVisitors24hCoverageState();
  }
}

export async function persistVisitors24hCoverageState(): Promise<void> {
  await ensureLoaded();

  writeChain = writeChain
    .catch(() => undefined)
    .then(async () => {
      if (!dirty) return;
      const payload = serializeState();
      dirty = false;
      try {
        await writeAgentStateFileAtomic(STATE_FILE, payload);
      } catch (error) {
        dirty = true;
        throw error;
      }
    });

  return writeChain;
}

export async function getVisitors24hCoverageStateForTests(
  domain: string,
): Promise<DomainCoverageState | null> {
  await ensureLoaded();
  const state = domainStates.get(domain);
  return state ? { ...state } : null;
}

export function resetVisitors24hCoverageStateForTests(): void {
  loaded = false;
  domainStates = new Map();
  dirty = false;
  writeChain = Promise.resolve();
}
