import {
  readAgentStateFile,
  writeAgentStateFileAtomic,
} from "./security/filesystem.js";

const TRAFFIC_CURSOR_STATE_FILE = "traffic-cursors.json";
const TRAFFIC_CURSOR_SCHEMA_VERSION = 1;

export type TrafficCoverageReason =
  | "warming_up"
  | "log_rotated_gap"
  | "log_cursor_gap";

export interface TrafficCoverageState {
  state: "ok" | "unknown";
  reason?: TrafficCoverageReason;
  completeAfterMs?: number;
}

export interface TrafficCursorRecord {
  inode: number;
  offset: number;
  lastReadAt: string;
  coverage: TrafficCoverageState;
}

interface PersistedTrafficCursorState {
  version: 1;
  cursors: Record<string, TrafficCursorRecord>;
}

let loaded = false;
let cursors = new Map<string, TrafficCursorRecord>();
let writeChain: Promise<void> = Promise.resolve();

function isSafeCursorRecord(value: unknown): value is TrafficCursorRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<TrafficCursorRecord>;
  if (
    typeof record.inode !== "number" ||
    !Number.isSafeInteger(record.inode) ||
    record.inode < 0
  ) {
    return false;
  }
  if (
    typeof record.offset !== "number" ||
    !Number.isSafeInteger(record.offset) ||
    record.offset < 0
  ) {
    return false;
  }
  if (typeof record.lastReadAt !== "string" || Number.isNaN(Date.parse(record.lastReadAt))) {
    return false;
  }
  if (!record.coverage || typeof record.coverage !== "object") return false;
  if (record.coverage.state !== "ok" && record.coverage.state !== "unknown") {
    return false;
  }
  if (
    record.coverage.reason !== undefined &&
    record.coverage.reason !== "warming_up" &&
    record.coverage.reason !== "log_rotated_gap" &&
    record.coverage.reason !== "log_cursor_gap"
  ) {
    return false;
  }
  if (
    record.coverage.completeAfterMs !== undefined &&
    (typeof record.coverage.completeAfterMs !== "number" ||
      !Number.isSafeInteger(record.coverage.completeAfterMs) ||
      record.coverage.completeAfterMs < 0)
  ) {
    return false;
  }
  return true;
}

function cloneCursor(record: TrafficCursorRecord): TrafficCursorRecord {
  return {
    inode: record.inode,
    offset: record.offset,
    lastReadAt: record.lastReadAt,
    coverage: { ...record.coverage },
  };
}

async function ensureLoaded(): Promise<void> {
  if (loaded) return;

  const raw = await readAgentStateFile(TRAFFIC_CURSOR_STATE_FILE);
  if (!raw) {
    cursors = new Map();
    loaded = true;
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `Corrupt ${TRAFFIC_CURSOR_STATE_FILE}: expected valid JSON.`,
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Corrupt ${TRAFFIC_CURSOR_STATE_FILE}: invalid root object.`);
  }

  const state = parsed as Partial<PersistedTrafficCursorState>;
  if (state.version !== TRAFFIC_CURSOR_SCHEMA_VERSION || !state.cursors) {
    throw new Error(
      `Unsupported ${TRAFFIC_CURSOR_STATE_FILE} schema version.`,
    );
  }

  const next = new Map<string, TrafficCursorRecord>();
  for (const [domain, record] of Object.entries(state.cursors)) {
    if (!isSafeCursorRecord(record)) {
      throw new Error(
        `Corrupt ${TRAFFIC_CURSOR_STATE_FILE}: invalid cursor for ${domain}.`,
      );
    }
    next.set(domain, cloneCursor(record));
  }

  cursors = next;
  loaded = true;
}

function serializeState(): string {
  const ordered = Array.from(cursors.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const state: PersistedTrafficCursorState = {
    version: TRAFFIC_CURSOR_SCHEMA_VERSION,
    cursors: Object.fromEntries(
      ordered.map(([domain, record]) => [domain, cloneCursor(record)]),
    ),
  };
  return `${JSON.stringify(state, null, 2)}\n`;
}

async function queuePersist(): Promise<void> {
  const payload = serializeState();
  writeChain = writeChain
    .catch(() => undefined)
    .then(() => writeAgentStateFileAtomic(TRAFFIC_CURSOR_STATE_FILE, payload));
  return writeChain;
}

export async function getTrafficCursor(
  domain: string,
): Promise<TrafficCursorRecord | null> {
  await ensureLoaded();
  const record = cursors.get(domain);
  return record ? cloneCursor(record) : null;
}

export async function setTrafficCursor(
  domain: string,
  record: TrafficCursorRecord,
): Promise<void> {
  await ensureLoaded();
  cursors.set(domain, cloneCursor(record));
  await queuePersist();
}

export async function removeTrafficCursor(domain: string): Promise<void> {
  await ensureLoaded();
  if (!cursors.delete(domain)) return;
  await queuePersist();
}

/** Test-only visibility into persisted cursor metadata. */
export async function getTrafficCursorStateForTests(): Promise<
  Record<string, TrafficCursorRecord>
> {
  await ensureLoaded();
  return Object.fromEntries(
    Array.from(cursors.entries()).map(([domain, record]) => [
      domain,
      cloneCursor(record),
    ]),
  );
}

export function resetTrafficCursorStateForTests(): void {
  loaded = false;
  cursors = new Map();
  writeChain = Promise.resolve();
}
