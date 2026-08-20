import {
  readAgentStateFile,
  writeAgentStateFileAtomic,
} from "../security/filesystem.js";

const STACK_SCHEDULE_STATE_FILE = "stack-schedule.json";
const STATE_VERSION = 1;

export interface StackScheduleRecord {
  domain: string;
  lastStackCheckedAt: string | null;
  lastAttemptAt: string | null;
  nextDueAt: string;
  retryAttempt: number;
}

interface PersistedStackScheduleState {
  version: 1;
  domains: StackScheduleRecord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 64 &&
    Number.isFinite(Date.parse(value))
  );
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function isValidRecord(value: unknown): value is StackScheduleRecord {
  if (!isRecord(value)) return false;

  return (
    typeof value.domain === "string" &&
    value.domain.trim().length > 0 &&
    (value.lastStackCheckedAt === null || isIsoTimestamp(value.lastStackCheckedAt)) &&
    (value.lastAttemptAt === null || isIsoTimestamp(value.lastAttemptAt)) &&
    isIsoTimestamp(value.nextDueAt) &&
    Number.isInteger(value.retryAttempt) &&
    Number(value.retryAttempt) >= 0
  );
}

export async function loadStackScheduleState(): Promise<Map<string, StackScheduleRecord>> {
  const raw = await readAgentStateFile(STACK_SCHEDULE_STATE_FILE);
  if (raw === null) return new Map();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Persisted stack schedule state is invalid JSON.");
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== STATE_VERSION ||
    !Array.isArray(parsed.domains) ||
    !parsed.domains.every(isValidRecord)
  ) {
    throw new Error("Persisted stack schedule state has an invalid schema.");
  }

  const records = new Map<string, StackScheduleRecord>();
  for (const item of parsed.domains) {
    const domain = normalizeDomain(item.domain);
    if (!domain || records.has(domain)) continue;

    records.set(domain, {
      domain,
      lastStackCheckedAt: item.lastStackCheckedAt,
      lastAttemptAt: item.lastAttemptAt,
      nextDueAt: item.nextDueAt,
      retryAttempt: item.retryAttempt,
    });
  }

  return records;
}

export async function saveStackScheduleState(
  records: ReadonlyMap<string, StackScheduleRecord>,
): Promise<void> {
  const payload: PersistedStackScheduleState = {
    version: STATE_VERSION,
    domains: [...records.values()]
      .map((record) => ({ ...record }))
      .sort((a, b) => a.domain.localeCompare(b.domain)),
  };

  await writeAgentStateFileAtomic(
    STACK_SCHEDULE_STATE_FILE,
    `${JSON.stringify(payload)}\n`,
  );
}

export const stackScheduleStateConstants = Object.freeze({
  fileName: STACK_SCHEDULE_STATE_FILE,
  version: STATE_VERSION,
});
