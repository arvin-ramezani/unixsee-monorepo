type NodeEnvironment = "production" | "development" | "test";

const AGENT_API_PREFIX = "/api/internal/agent/v1";
export const AGENT_VERSION = "0.1.0";

export type AppConfig = {
  nodeEnv: NodeEnvironment;
  agentSecret: string | null;
  enrollmentToken: string | null;
  agentVersion: string;
  apiBaseUrl: string;
  endpoints: {
    enroll: string;
    ingest: string;
    heartbeat: string;
  };
  transmitIntervalMs: number;
  heartbeatIntervalMs: number;
  rediscoveryIntervalMs: number;
  trafficWindowSeconds: number;
  openLiteSpeedServerRoot: string;
  openLiteSpeedDiscoverOrphanVhosts: boolean;
  webDiscoveryIncludeFallbacks: boolean;
  accessLogDir: string;
  directAdminBaseUrl: string | null;
  directAdminUsersRoot: string;
};

let cachedConfig: AppConfig | null = null;

function readOptionalVariable(
  env: NodeJS.ProcessEnv,
  name: string,
): string | undefined {
  const value = env[name]?.trim();
  return value || undefined;
}

function readRequiredVariable(env: NodeJS.ProcessEnv, name: string): string {
  const value = readOptionalVariable(env, name);
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

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = parseNodeEnvironment(env.NODE_ENV);
  const agentSecret = readOptionalVariable(env, "AGENT_SECRET") ?? null;
  const enrollmentToken = readOptionalVariable(env, "ENROLLMENT_TOKEN") ?? null;
  const apiBaseUrl = parseUrl(
    readRequiredVariable(env, "API_BASE_URL"),
    "API_BASE_URL",
  );

  cachedConfig = {
    nodeEnv,
    agentSecret,
    enrollmentToken,
    agentVersion: AGENT_VERSION,
    apiBaseUrl,
    endpoints: {
      enroll: joinApiPath(apiBaseUrl, `${AGENT_API_PREFIX}/enroll`),
      ingest: joinApiPath(apiBaseUrl, `${AGENT_API_PREFIX}/ingest`),
      heartbeat: joinApiPath(apiBaseUrl, `${AGENT_API_PREFIX}/heartbeat`),
    },
    transmitIntervalMs: parsePositiveInt(
      env.TRANSMIT_INTERVAL_MS,
      60_000,
      "TRANSMIT_INTERVAL_MS",
    ),
    heartbeatIntervalMs: parsePositiveInt(
      env.HEARTBEAT_INTERVAL_MS,
      30_000,
      "HEARTBEAT_INTERVAL_MS",
    ),
    rediscoveryIntervalMs: parsePositiveInt(
      env.REDISCOVERY_INTERVAL_MS,
      600_000,
      "REDISCOVERY_INTERVAL_MS",
    ),
    trafficWindowSeconds: parsePositiveInt(
      env.TRAFFIC_WINDOW_SECONDS,
      180,
      "TRAFFIC_WINDOW_SECONDS",
    ),
    openLiteSpeedServerRoot:
      readOptionalVariable(env, "OPENLITESPEED_SERVER_ROOT") ??
      "/usr/local/lsws",
    openLiteSpeedDiscoverOrphanVhosts:
      env.OPENLITESPEED_DISCOVER_ORPHAN_VHOSTS === "true",
    webDiscoveryIncludeFallbacks: env.WEB_DISCOVERY_INCLUDE_FALLBACKS === "true",
    accessLogDir:
      readOptionalVariable(env, "ACCESS_LOG_DIR") ?? "/var/log/httpd/domains",
    directAdminBaseUrl: readOptionalVariable(env, "DIRECTADMIN_BASE_URL") ?? null,
    directAdminUsersRoot:
      readOptionalVariable(env, "DIRECTADMIN_USERS_ROOT") ??
      "/usr/local/directadmin/data/users",
  };

  return cachedConfig;
}

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    throw new Error("Config not loaded. Call loadConfig() before use.");
  }
  return cachedConfig;
}

export function resetConfigForTests(): void {
  cachedConfig = null;
}

/** @deprecated Prefer getConfig() after loadConfig(). */
export const config: AppConfig = new Proxy({} as AppConfig, {
  get(_target, property, receiver) {
    return Reflect.get(getConfig(), property, receiver);
  },
});
