import {
  readAgentStateFile,
  writeAgentStateFileAtomic,
} from "./security/filesystem.js";

const STATE_FILE = "traffic-hll.json";
const SCHEMA_VERSION = 2 as const;

export const HLL_PRECISION = 12 as const;
export const HLL_REGISTER_COUNT = 1 << HLL_PRECISION;
export const HLL_BUCKET_MS = 5 * 60 * 1000;
export const HLL_WINDOW_BUCKETS = 288;
export const HLL_WINDOW_MS = HLL_BUCKET_MS * HLL_WINDOW_BUCKETS;

const SPARSE_TO_DENSE_THRESHOLD = 1024;
const HASH_BITS = 64;
const REMAINING_BITS = HASH_BITS - HLL_PRECISION;

interface SparseBucket {
  startMs: number;
  mode: "sparse";
  registers: Map<number, number>;
}

interface DenseBucket {
  startMs: number;
  mode: "dense";
  registers: Uint8Array;
}

type HllBucket = SparseBucket | DenseBucket;

interface DomainHllState {
  buckets: Map<number, HllBucket>;
}

interface PersistedSparseBucket {
  startMs: number;
  mode: "sparse";
  registers: Array<[number, number]>;
}

interface PersistedDenseBucket {
  startMs: number;
  mode: "dense";
  registersBase64: string;
}

type PersistedBucket = PersistedSparseBucket | PersistedDenseBucket;

interface PersistedDomainState {
  buckets: PersistedBucket[];
}

interface PersistedHllState {
  version: 2;
  precision: 12;
  bucketMs: number;
  windowBuckets: number;
  domains: Record<string, PersistedDomainState>;
}

let loaded = false;
let domainStates = new Map<string, DomainHllState>();
let dirty = false;
let writeChain: Promise<void> = Promise.resolve();

function bucketStartFor(atMs: number): number {
  return Math.floor(atMs / HLL_BUCKET_MS) * HLL_BUCKET_MS;
}

function isSafeDomain(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 253 &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0")
  );
}

function assertRegister(index: number, rank: number): void {
  if (!Number.isSafeInteger(index) || index < 0 || index >= HLL_REGISTER_COUNT) {
    throw new Error(`Invalid HLL register index: ${index}`);
  }
  if (
    !Number.isSafeInteger(rank) ||
    rank < 1 ||
    rank > REMAINING_BITS + 1
  ) {
    throw new Error(`Invalid HLL register rank: ${rank}`);
  }
}

function createSparseBucket(startMs: number): SparseBucket {
  return {
    startMs,
    mode: "sparse",
    registers: new Map<number, number>(),
  };
}

function convertSparseToDense(bucket: SparseBucket): DenseBucket {
  const registers = new Uint8Array(HLL_REGISTER_COUNT);
  for (const [index, rank] of bucket.registers) {
    registers[index] = rank;
  }
  return {
    startMs: bucket.startMs,
    mode: "dense",
    registers,
  };
}

function updateBucket(bucket: HllBucket, index: number, rank: number): HllBucket {
  if (bucket.mode === "dense") {
    if (rank > bucket.registers[index]!) {
      bucket.registers[index] = rank;
      dirty = true;
    }
    return bucket;
  }

  const previous = bucket.registers.get(index) ?? 0;
  if (rank <= previous) return bucket;

  bucket.registers.set(index, rank);
  dirty = true;

  if (bucket.registers.size >= SPARSE_TO_DENSE_THRESHOLD) {
    return convertSparseToDense(bucket);
  }
  return bucket;
}

function parseVisitorKey64(visitorKey: string): bigint {
  if (!/^[0-9a-f]{64}$/i.test(visitorKey)) {
    throw new Error("Visitor key must be a 64-character hexadecimal digest.");
  }
  return BigInt(`0x${visitorKey.slice(0, 16)}`);
}

function indexAndRank(hash: bigint): { index: number; rank: number } {
  const index = Number(hash >> BigInt(REMAINING_BITS));
  const remainingMask = (1n << BigInt(REMAINING_BITS)) - 1n;
  const remaining = hash & remainingMask;

  if (remaining === 0n) {
    return { index, rank: REMAINING_BITS + 1 };
  }

  const bitLength = remaining.toString(2).length;
  const leadingZeros = REMAINING_BITS - bitLength;
  return { index, rank: leadingZeros + 1 };
}

function mergeBucketInto(target: Uint8Array, bucket: HllBucket): void {
  if (bucket.mode === "dense") {
    for (let index = 0; index < HLL_REGISTER_COUNT; index += 1) {
      if (bucket.registers[index]! > target[index]!) {
        target[index] = bucket.registers[index]!;
      }
    }
    return;
  }

  for (const [index, rank] of bucket.registers) {
    if (rank > target[index]!) {
      target[index] = rank;
    }
  }
}

function estimateRegisters(registers: Uint8Array): number {
  const m = HLL_REGISTER_COUNT;
  const alpha = 0.7213 / (1 + 1.079 / m);

  let harmonic = 0;
  let zeroRegisters = 0;
  for (const register of registers) {
    harmonic += 2 ** -register;
    if (register === 0) zeroRegisters += 1;
  }

  let estimate = (alpha * m * m) / harmonic;

  // Standard HLL small-range correction (linear counting).
  if (estimate <= 2.5 * m && zeroRegisters > 0) {
    estimate = m * Math.log(m / zeroRegisters);
  }

  // Large-range correction for a 64-bit hash space. This branch is far above
  // expected Phase 1 traffic, but keeps the estimator mathematically complete.
  const twoTo64 = 2 ** 64;
  if (estimate > twoTo64 / 30 && estimate < twoTo64) {
    estimate = -twoTo64 * Math.log(1 - estimate / twoTo64);
  }

  if (!Number.isFinite(estimate) || estimate < 0) return 0;
  return Math.round(estimate);
}

function pruneDomain(state: DomainHllState, nowMs: number): boolean {
  const cutoff = nowMs - HLL_WINDOW_MS;
  let changed = false;
  for (const [startMs] of state.buckets) {
    // Keep buckets that intersect the latest 24-hour window.
    if (startMs + HLL_BUCKET_MS <= cutoff) {
      state.buckets.delete(startMs);
      changed = true;
    }
  }
  if (changed) dirty = true;
  return changed;
}

function serializeBucket(bucket: HllBucket): PersistedBucket {
  if (bucket.mode === "dense") {
    return {
      startMs: bucket.startMs,
      mode: "dense",
      registersBase64: Buffer.from(bucket.registers).toString("base64"),
    };
  }

  return {
    startMs: bucket.startMs,
    mode: "sparse",
    registers: Array.from(bucket.registers.entries()).sort(
      ([left], [right]) => left - right,
    ),
  };
}

function deserializeBucket(value: unknown): HllBucket {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid HLL bucket record.");
  }

  const bucket = value as {
    startMs?: unknown;
    mode?: unknown;
    registers?: unknown;
    registersBase64?: unknown;
  };
  if (
    typeof bucket.startMs !== "number" ||
    !Number.isSafeInteger(bucket.startMs) ||
    bucket.startMs < 0 ||
    bucket.startMs % HLL_BUCKET_MS !== 0
  ) {
    throw new Error("Invalid HLL bucket timestamp.");
  }

  if (bucket.mode === "dense") {
    if (typeof bucket.registersBase64 !== "string") {
      throw new Error("Invalid dense HLL bucket payload.");
    }
    const decoded = Buffer.from(bucket.registersBase64, "base64");
    if (decoded.length !== HLL_REGISTER_COUNT) {
      throw new Error("Invalid dense HLL register count.");
    }
    for (const rank of decoded) {
      if (rank > REMAINING_BITS + 1) {
        throw new Error("Invalid dense HLL register rank.");
      }
    }
    return {
      startMs: bucket.startMs,
      mode: "dense",
      registers: Uint8Array.from(decoded),
    };
  }

  if (bucket.mode === "sparse") {
    if (!Array.isArray(bucket.registers)) {
      throw new Error("Invalid sparse HLL bucket payload.");
    }
    const registers = new Map<number, number>();
    for (const pair of bucket.registers) {
      if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error("Invalid sparse HLL register tuple.");
      }
      const [index, rank] = pair;
      if (typeof index !== "number" || typeof rank !== "number") {
        throw new Error("Invalid sparse HLL register value.");
      }
      assertRegister(index, rank);
      const previous = registers.get(index) ?? 0;
      if (rank > previous) registers.set(index, rank);
    }
    if (registers.size >= SPARSE_TO_DENSE_THRESHOLD) {
      return convertSparseToDense({
        startMs: bucket.startMs,
        mode: "sparse",
        registers,
      });
    }
    return {
      startMs: bucket.startMs,
      mode: "sparse",
      registers,
    };
  }

  throw new Error("Unsupported HLL bucket mode.");
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

  const root = parsed as {
    version?: unknown;
    precision?: unknown;
    bucketMs?: unknown;
    windowBuckets?: unknown;
    domains?: unknown;
  };
  if (
    (root.version !== 1 && root.version !== SCHEMA_VERSION) ||
    root.precision !== HLL_PRECISION ||
    root.bucketMs !== HLL_BUCKET_MS ||
    root.windowBuckets !== HLL_WINDOW_BUCKETS ||
    !root.domains ||
    typeof root.domains !== "object"
  ) {
    throw new Error(`Unsupported ${STATE_FILE} schema/configuration.`);
  }

  const next = new Map<string, DomainHllState>();
  for (const [domain, value] of Object.entries(
    root.domains as Record<string, unknown>,
  )) {
    if (!isSafeDomain(domain) || !value || typeof value !== "object") {
      throw new Error(`Corrupt ${STATE_FILE}: invalid domain record.`);
    }

    const persisted = value as { buckets?: unknown };
    if (!Array.isArray(persisted.buckets)) {
      throw new Error(`Corrupt ${STATE_FILE}: invalid buckets for ${domain}.`);
    }

    const buckets = new Map<number, HllBucket>();
    for (const rawBucket of persisted.buckets) {
      const bucket = deserializeBucket(rawBucket);
      buckets.set(bucket.startMs, bucket);
    }

    next.set(domain, { buckets });
  }

  domainStates = next;
  loaded = true;
  // A legacy v1 file is rewritten in cardinality-only v2 form on the next
  // persistence pass. Its old coverage fields are intentionally ignored.
  dirty = root.version === 1;
}

function serializeState(): string {
  const orderedDomains = Array.from(domainStates.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const state: PersistedHllState = {
    version: SCHEMA_VERSION,
    precision: HLL_PRECISION,
    bucketMs: HLL_BUCKET_MS,
    windowBuckets: HLL_WINDOW_BUCKETS,
    domains: Object.fromEntries(
      orderedDomains.map(([domain, state]) => [
        domain,
        {
          buckets: Array.from(state.buckets.values())
            .sort((a, b) => a.startMs - b.startMs)
            .map(serializeBucket),
        },
      ]),
    ),
  };

  return `${JSON.stringify(state)}\n`;
}

export async function ensureVisitors24hDomain(domain: string): Promise<void> {
  await ensureLoaded();
  if (!isSafeDomain(domain)) {
    throw new Error(`Invalid domain for 24h cardinality state: ${domain}`);
  }
  if (!domainStates.has(domain)) {
    domainStates.set(domain, {
      buckets: new Map(),
    });
    dirty = true;
  }
}

export function addVisitorTo24h(
  domain: string,
  visitorKey: string,
  atMs: number,
): void {
  const state = domainStates.get(domain);
  if (!state) {
    throw new Error(`24h cardinality state not initialized for ${domain}.`);
  }
  if (!Number.isFinite(atMs) || atMs < 0) return;

  const startMs = bucketStartFor(atMs);
  let bucket = state.buckets.get(startMs);
  if (!bucket) {
    bucket = createSparseBucket(startMs);
    state.buckets.set(startMs, bucket);
    dirty = true;
  }

  const { index, rank } = indexAndRank(parseVisitorKey64(visitorKey));
  const updated = updateBucket(bucket, index, rank);
  if (updated !== bucket) {
    state.buckets.set(startMs, updated);
    dirty = true;
  }
}


export async function removeVisitors24hDomain(domain: string): Promise<void> {
  await ensureLoaded();
  if (!domainStates.delete(domain)) return;
  dirty = true;
  await persistVisitors24hState();
}

/** Remove persisted sketches for domains no longer in the effective OLS inventory. */
export async function reconcileVisitors24hDomains(
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
    await persistVisitors24hState();
  }
}

export async function persistVisitors24hState(): Promise<void> {
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

export async function getVisitors24hCardinality(
  domain: string,
  nowMs: number,
): Promise<number> {
  await ensureVisitors24hDomain(domain);
  const state = domainStates.get(domain)!;
  pruneDomain(state, nowMs);

  const merged = new Uint8Array(HLL_REGISTER_COUNT);
  const cutoff = nowMs - HLL_WINDOW_MS;
  for (const bucket of state.buckets.values()) {
    if (bucket.startMs <= nowMs && bucket.startMs + HLL_BUCKET_MS > cutoff) {
      mergeBucketInto(merged, bucket);
    }
  }

  return estimateRegisters(merged);
}

/** Test-only state inspection; contains only derived HLL data. */
export async function getVisitors24hStateForTests(domain: string): Promise<{
  bucketCount: number;
  modes: Array<"sparse" | "dense">;
} | null> {
  await ensureLoaded();
  const state = domainStates.get(domain);
  if (!state) return null;
  return {
    bucketCount: state.buckets.size,
    modes: Array.from(state.buckets.values()).map((bucket) => bucket.mode),
  };
}

export function resetVisitors24hStateForTests(): void {
  loaded = false;
  domainStates = new Map();
  dirty = false;
  writeChain = Promise.resolve();
}
