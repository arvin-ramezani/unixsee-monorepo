type NodeEnvironment = "production" | "development" | "test";

const AGENT_API_PREFIX = "/api/internal/agent/v1";

function readOptionalVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readRequiredVariable(name: string): string {
  const value = readOptionalVariable(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseNodeEnvironment(value: string | undefined): NodeEnvironment {
  if (value === "production" || value === "development" || value === "test") {
    return value;
  }

  throw new Error(
    `Invalid NODE_ENV. Expected production, development, or test. Received: ${value ?? "empty"}`,
  );
}

function parseUrl(value: string, name: string): string {
  try {
    const parsed = new URL(value);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Invalid ${name} URL: ${value}`);
  }
}

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}. Expected a positive integer.`);
  }

  return parsed;
}

function joinApiPath(baseUrl: string, path: string): string {
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

const nodeEnv = parseNodeEnvironment(process.env.NODE_ENV);
const agentSecret = readOptionalVariable("AGENT_SECRET") ?? null;
const enrollmentToken = readOptionalVariable("ENROLLMENT_TOKEN") ?? null;
const apiBaseUrl = parseUrl(readRequiredVariable("API_BASE_URL"), "API_BASE_URL");

export const config = {
  nodeEnv,
  agentSecret,
  enrollmentToken,
  apiBaseUrl,
  endpoints: {
    enroll: joinApiPath(apiBaseUrl, `${AGENT_API_PREFIX}/enroll`),
    ingest: joinApiPath(apiBaseUrl, `${AGENT_API_PREFIX}/ingest`),
    heartbeat: joinApiPath(apiBaseUrl, `${AGENT_API_PREFIX}/heartbeat`),
  },
  collectionIntervalMs: parsePositiveInt(
    process.env.COLLECTION_INTERVAL_MS,
    10_000,
    "COLLECTION_INTERVAL_MS",
  ),
  transmitIntervalMs: parsePositiveInt(
    process.env.TRANSMIT_INTERVAL_MS,
    60_000,
    "TRANSMIT_INTERVAL_MS",
  ),
  heartbeatIntervalMs: parsePositiveInt(
    process.env.HEARTBEAT_INTERVAL_MS,
    30_000,
    "HEARTBEAT_INTERVAL_MS",
  ),
  rediscoveryIntervalMs: parsePositiveInt(
    process.env.REDISCOVERY_INTERVAL_MS,
    600_000,
    "REDISCOVERY_INTERVAL_MS",
  ),
  openLiteSpeedServerRoot:
    readOptionalVariable("OPENLITESPEED_SERVER_ROOT") ?? "/usr/local/lsws",
  openLiteSpeedDiscoverOrphanVhosts:
    process.env.OPENLITESPEED_DISCOVER_ORPHAN_VHOSTS === "true",
  webDiscoveryIncludeFallbacks:
    process.env.WEB_DISCOVERY_INCLUDE_FALLBACKS === "true",
} as const;

export type AppConfig = typeof config;
