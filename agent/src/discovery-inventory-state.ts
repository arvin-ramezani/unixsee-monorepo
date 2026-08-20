import {
  getAgentStateFilePath,
  readAgentStateFile,
  writeAgentStateFileAtomic,
} from "./security/filesystem.js";

import type { DiscoveredDomain } from "./discovery.js";

const DISCOVERY_STATE_VERSION = 1 as const;
const DISCOVERY_STATE_FILE_NAME = "discovery-inventory.json";
const REMOVAL_MISSING_SCAN_THRESHOLD = 2;

interface PersistedDiscoveryRecord extends DiscoveredDomain {
  firstDiscoveredAt: string;
  lastSeenAt: string;
  consecutiveMissingScans: number;
}

interface PersistedDiscoveryInventory {
  version: typeof DISCOVERY_STATE_VERSION;
  records: PersistedDiscoveryRecord[];
}

export interface DiscoveryInventoryChanges {
  added: DiscoveredDomain[];
  removed: DiscoveredDomain[];
  recovered: DiscoveredDomain[];
  retainedMissing: DiscoveredDomain[];
}

export interface DiscoveryInventoryResult {
  effectiveDomains: DiscoveredDomain[];
  changes: DiscoveryInventoryChanges;
}

export interface DiscoveryInventoryStateOptions {
  observedAt?: Date;
}

export class DiscoveryInventoryStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiscoveryInventoryStateError";
  }
}

function canonicalVhostKey(value: string): string {
  return value.trim().toLowerCase();
}

function cloneDomain(record: DiscoveredDomain): DiscoveredDomain {
  return {
    domain: record.domain,
    aliases: [...record.aliases],
    virtualHostName: record.virtualHostName,
    source: "openlitespeed",
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidPersistedRecord(value: unknown): value is PersistedDiscoveryRecord {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Partial<PersistedDiscoveryRecord>;
  return (
    isNonEmptyString(record.domain) &&
    Array.isArray(record.aliases) &&
    record.aliases.every(isNonEmptyString) &&
    isNonEmptyString(record.virtualHostName) &&
    record.source === "openlitespeed" &&
    isNonEmptyString(record.firstDiscoveredAt) &&
    isNonEmptyString(record.lastSeenAt) &&
    typeof record.consecutiveMissingScans === "number" &&
    Number.isInteger(record.consecutiveMissingScans) &&
    record.consecutiveMissingScans >= 0
  );
}

function parsePersistedState(raw: string): PersistedDiscoveryInventory {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DiscoveryInventoryStateError(
      "Discovery inventory state is not valid JSON.",
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new DiscoveryInventoryStateError(
      "Discovery inventory state has an invalid root value.",
    );
  }

  const state = parsed as Partial<PersistedDiscoveryInventory>;
  if (
    state.version !== DISCOVERY_STATE_VERSION ||
    !Array.isArray(state.records) ||
    !state.records.every(isValidPersistedRecord)
  ) {
    throw new DiscoveryInventoryStateError(
      "Discovery inventory state has an unsupported or invalid schema.",
    );
  }

  const seenVhosts = new Set<string>();
  for (const record of state.records) {
    const key = canonicalVhostKey(record.virtualHostName);
    if (seenVhosts.has(key)) {
      throw new DiscoveryInventoryStateError(
        `Discovery inventory state contains duplicate vhost ${record.virtualHostName}.`,
      );
    }
    seenVhosts.add(key);
  }

  return {
    version: DISCOVERY_STATE_VERSION,
    records: state.records.map((record) => ({
      ...record,
      aliases: [...record.aliases],
    })),
  };
}

export function getDiscoveryInventoryStatePath(): string {
  return getAgentStateFilePath(DISCOVERY_STATE_FILE_NAME);
}

async function loadState(): Promise<PersistedDiscoveryInventory> {
  try {
    const raw = await readAgentStateFile(DISCOVERY_STATE_FILE_NAME);
    if (raw === null) {
      return { version: DISCOVERY_STATE_VERSION, records: [] };
    }
    return parsePersistedState(raw);
  } catch (error: unknown) {
    if (error instanceof DiscoveryInventoryStateError) throw error;

    const message = error instanceof Error ? error.message : String(error);
    throw new DiscoveryInventoryStateError(
      `Unable to read discovery inventory state: ${message}`,
    );
  }
}

async function persistState(state: PersistedDiscoveryInventory): Promise<void> {
  try {
    await writeAgentStateFileAtomic(
      DISCOVERY_STATE_FILE_NAME,
      `${JSON.stringify(state, null, 2)}\n`,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new DiscoveryInventoryStateError(
      `Unable to persist discovery inventory state: ${message}`,
    );
  }
}

/**
 * Pure state transition for one SUCCESSFUL OLS scan.
 *
 * A site remains effective after its first successful absent scan. It is
 * removed only after the second consecutive successful scan where the vhost is
 * absent. Failed OLS scans must never call this transition, so failures cannot
 * increment missing counters.
 */
export function reconcileSuccessfulDiscoveryScan(
  previous: readonly PersistedDiscoveryRecord[],
  scannedDomains: readonly DiscoveredDomain[],
  observedAtIso: string,
): {
  nextRecords: PersistedDiscoveryRecord[];
  result: DiscoveryInventoryResult;
} {
  const previousByVhost = new Map(
    previous.map((record) => [canonicalVhostKey(record.virtualHostName), record]),
  );
  const scannedKeys = new Set<string>();
  const nextRecords: PersistedDiscoveryRecord[] = [];
  const added: DiscoveredDomain[] = [];
  const removed: DiscoveredDomain[] = [];
  const recovered: DiscoveredDomain[] = [];
  const retainedMissing: DiscoveredDomain[] = [];

  for (const scanned of scannedDomains) {
    const key = canonicalVhostKey(scanned.virtualHostName);
    if (!key || scannedKeys.has(key)) continue;
    scannedKeys.add(key);

    const existing = previousByVhost.get(key);
    if (!existing) {
      const record: PersistedDiscoveryRecord = {
        ...cloneDomain(scanned),
        firstDiscoveredAt: observedAtIso,
        lastSeenAt: observedAtIso,
        consecutiveMissingScans: 0,
      };
      nextRecords.push(record);
      added.push(cloneDomain(record));
      continue;
    }

    const recoveredFromMissing = existing.consecutiveMissingScans > 0;
    const record: PersistedDiscoveryRecord = {
      ...cloneDomain(scanned),
      firstDiscoveredAt: existing.firstDiscoveredAt,
      lastSeenAt: observedAtIso,
      consecutiveMissingScans: 0,
    };
    nextRecords.push(record);

    if (recoveredFromMissing) {
      recovered.push(cloneDomain(record));
    }
  }

  for (const existing of previous) {
    const key = canonicalVhostKey(existing.virtualHostName);
    if (scannedKeys.has(key)) continue;

    const nextMissingCount = existing.consecutiveMissingScans + 1;
    if (nextMissingCount >= REMOVAL_MISSING_SCAN_THRESHOLD) {
      removed.push(cloneDomain(existing));
      continue;
    }

    const retained: PersistedDiscoveryRecord = {
      ...existing,
      aliases: [...existing.aliases],
      consecutiveMissingScans: nextMissingCount,
    };
    nextRecords.push(retained);
    retainedMissing.push(cloneDomain(retained));
  }

  return {
    nextRecords,
    result: {
      effectiveDomains: nextRecords.map(cloneDomain),
      changes: {
        added,
        removed,
        recovered,
        retainedMissing,
      },
    },
  };
}

/**
 * Apply one successful raw OLS scan to persisted agent-owned inventory state.
 */
export async function updateDiscoveryInventoryState(
  scannedDomains: readonly DiscoveredDomain[],
  options: DiscoveryInventoryStateOptions = {},
): Promise<DiscoveryInventoryResult> {
  const observedAtIso = (options.observedAt ?? new Date()).toISOString();
  const previous = await loadState();

  const transition = reconcileSuccessfulDiscoveryScan(
    previous.records,
    scannedDomains,
    observedAtIso,
  );

  await persistState({
    version: DISCOVERY_STATE_VERSION,
    records: transition.nextRecords,
  });

  return transition.result;
}
