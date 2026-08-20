import { createHmac, randomBytes } from "node:crypto";
import { isIP } from "node:net";

import {
  createAgentStateFileIfAbsent,
  readAgentStateFile,
} from "./security/filesystem.js";

const VISITOR_HASH_KEY_FILE = "visitor-hash-key";
const VISITOR_HASH_KEY_BYTES = 32;
const VISITOR_KEY_CONTEXT = "unixsee-visitor-v1";

let cachedVisitorHashKey: Buffer | null = null;

function decodePersistedKey(value: string): Buffer {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error("Persisted visitor hash key is empty.");
  }

  let decoded: Buffer;
  try {
    decoded = Buffer.from(normalized, "base64url");
  } catch {
    throw new Error("Persisted visitor hash key is invalid base64url data.");
  }

  if (decoded.length !== VISITOR_HASH_KEY_BYTES) {
    throw new Error(
      `Persisted visitor hash key has invalid length. Expected ${VISITOR_HASH_KEY_BYTES} bytes.`,
    );
  }

  return decoded;
}

/**
 * Loads the locally generated visitor pseudonymization key from agent-owned
 * state, creating it exactly once when absent. The key never leaves the VPS.
 */
export async function loadOrCreateVisitorHashKey(): Promise<Buffer> {
  if (cachedVisitorHashKey) {
    return cachedVisitorHashKey;
  }

  const existing = await readAgentStateFile(VISITOR_HASH_KEY_FILE);
  if (existing !== null) {
    cachedVisitorHashKey = decodePersistedKey(existing);
    return cachedVisitorHashKey;
  }

  const candidate = randomBytes(VISITOR_HASH_KEY_BYTES);
  const serialized = `${candidate.toString("base64url")}\n`;
  const created = await createAgentStateFileIfAbsent(
    VISITOR_HASH_KEY_FILE,
    serialized,
  );

  if (created) {
    cachedVisitorHashKey = candidate;
    return cachedVisitorHashKey;
  }

  // Another process may have won the exclusive create race.
  const concurrent = await readAgentStateFile(VISITOR_HASH_KEY_FILE);
  if (concurrent === null) {
    throw new Error(
      "Visitor hash key creation raced but no persisted key is available.",
    );
  }

  cachedVisitorHashKey = decodePersistedKey(concurrent);
  return cachedVisitorHashKey;
}

function normalizeVisitorAddress(rawAddress: string): string | null {
  let normalized = rawAddress.trim().toLowerCase();
  if (!normalized || normalized === "-") return null;

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    normalized = normalized.slice(1, -1);
  }

  // Treat IPv4-mapped IPv6 addresses as the equivalent IPv4 identity so the
  // same client is not double-counted solely because of log representation.
  const mappedIpv4 = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mappedIpv4?.[1] && isIP(mappedIpv4[1]) === 4) {
    normalized = mappedIpv4[1];
  }

  return isIP(normalized) === 0 ? null : normalized;
}

/**
 * Convert one raw log IP into a deterministic, domain-scoped pseudonymous
 * visitor key. Callers must discard the raw address immediately afterwards.
 */
export function deriveVisitorKey(
  domain: string,
  rawAddress: string,
  hashKey: Buffer,
): string | null {
  if (hashKey.length !== VISITOR_HASH_KEY_BYTES) {
    throw new Error("Visitor hash key must be exactly 32 bytes.");
  }

  const address = normalizeVisitorAddress(rawAddress);
  if (!address) return null;

  const normalizedDomain = domain.trim().toLowerCase().replace(/\.$/, "");
  if (!normalizedDomain) {
    throw new Error("Cannot derive visitor key without a domain.");
  }

  return createHmac("sha256", hashKey)
    .update(VISITOR_KEY_CONTEXT)
    .update("\0")
    .update(normalizedDomain)
    .update("\0")
    .update(address)
    .digest("hex");
}

export function resetVisitorIdentityForTests(): void {
  cachedVisitorHashKey = null;
}
