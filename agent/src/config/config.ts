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
    commandResult: string;
  };
  heartbeatIntervalMs: number;
  olsDiscoveryIntervalMs: number;
  stackProbeIntervalMs: number;
  stackProbeConcurrency: number;
  activeVisitorWindowSeconds: number;
  activeVisitorSampleIntervalMs: number;
  visitors24hSampleIntervalMs: number;
  trafficInitialReadMaxBytes: number;
  trafficReconcileIntervalMs: number;
  openLiteSpeedServerRoot: string;
  openLiteSpeedDiscoverOrphanVhosts: boolean;
  webDiscoveryIncludeFallbacks: boolean;
  accessLogDir: string;
  runtimeProbeSecret: string | null;
  runtimeProbePort: number;
  runtimeProbeTimeoutMs: number;
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

function parsePort(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  const parsed = parsePositiveInt(value, fallback, name);
  if (parsed > 65_535) {
    throw new Error(`Invalid ${name}. Expected a TCP port between 1 and 65535.`);
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
      commandResult: joinApiPath(apiBaseUrl, `${AGENT_API_PREFIX}/command-results`),
    },
    heartbeatIntervalMs: parsePositiveInt(
      env.HEARTBEAT_INTERVAL_MS,
      30_000,
      "HEARTBEAT_INTERVAL_MS",
    ),
    olsDiscoveryIntervalMs: parsePositiveInt(
      env.OLS_DISCOVERY_INTERVAL_MS,
      600_000,
      "OLS_DISCOVERY_INTERVAL_MS",
    ),
    stackProbeIntervalMs: parsePositiveInt(
      env.STACK_PROBE_INTERVAL_MS,
      21_600_000,
      "STACK_PROBE_INTERVAL_MS",
    ),
    stackProbeConcurrency: parsePositiveInt(
      env.STACK_PROBE_CONCURRENCY,
      3,
      "STACK_PROBE_CONCURRENCY",
    ),
    activeVisitorWindowSeconds: parsePositiveInt(
      env.ACTIVE_VISITOR_WINDOW_SECONDS ?? env.TRAFFIC_WINDOW_SECONDS,
      180,
      "ACTIVE_VISITOR_WINDOW_SECONDS",
    ),
    activeVisitorSampleIntervalMs: parsePositiveInt(
      env.ACTIVE_VISITOR_SAMPLE_INTERVAL_MS,
      30_000,
      "ACTIVE_VISITOR_SAMPLE_INTERVAL_MS",
    ),
    visitors24hSampleIntervalMs: parsePositiveInt(
      env.VISITORS_24H_SAMPLE_INTERVAL_MS,
      300_000,
      "VISITORS_24H_SAMPLE_INTERVAL_MS",
    ),
    trafficInitialReadMaxBytes: parsePositiveInt(
      env.TRAFFIC_INITIAL_READ_MAX_BYTES,
      1_048_576,
      "TRAFFIC_INITIAL_READ_MAX_BYTES",
    ),
    trafficReconcileIntervalMs: parsePositiveInt(
      env.TRAFFIC_RECONCILE_INTERVAL_MS,
      15_000,
      "TRAFFIC_RECONCILE_INTERVAL_MS",
    ),
    openLiteSpeedServerRoot:
      readOptionalVariable(env, "OPENLITESPEED_SERVER_ROOT") ??
      "/usr/local/lsws",
    openLiteSpeedDiscoverOrphanVhosts:
      env.OPENLITESPEED_DISCOVER_ORPHAN_VHOSTS === "true",
    webDiscoveryIncludeFallbacks: env.WEB_DISCOVERY_INCLUDE_FALLBACKS === "true",
    accessLogDir:
      readOptionalVariable(env, "ACCESS_LOG_DIR") ?? "/var/log/httpd/domains",
    runtimeProbeSecret:
      readOptionalVariable(env, "RUNTIME_PROBE_SECRET") ?? null,
    runtimeProbePort: parsePort(
      env.RUNTIME_PROBE_PORT,
      80,
      "RUNTIME_PROBE_PORT",
    ),
    runtimeProbeTimeoutMs: parsePositiveInt(
      env.RUNTIME_PROBE_TIMEOUT_MS,
      5_000,
      "RUNTIME_PROBE_TIMEOUT_MS",
    ),
    directAdminBaseUrl: readOptionalVariable(env, "DIRECTADMIN_BASE_URL") ?? null,
    directAdminUsersRoot:
      readOptionalVariable(env, "DIRECTADMIN_USERS_ROOT") ??
      "/usr/local/directadmin/data/users",
  };

  if (
    cachedConfig.olsDiscoveryIntervalMs < 300_000 ||
    cachedConfig.olsDiscoveryIntervalMs > 600_000
  ) {
    throw new Error(
      "Invalid OLS_DISCOVERY_INTERVAL_MS. Phase 1 requires a value between 300000 and 600000 ms.",
    );
  }
  if (cachedConfig.stackProbeIntervalMs !== 21_600_000) {
    throw new Error(
      "Invalid STACK_PROBE_INTERVAL_MS. Phase 1 requires exactly 21600000 ms (6 hours).",
    );
  }
  if (cachedConfig.stackProbeConcurrency > 20) {
    throw new Error(
      "Invalid STACK_PROBE_CONCURRENCY. Expected a value between 1 and 20.",
    );
  }

  if (cachedConfig.activeVisitorWindowSeconds !== 180) {
    throw new Error(
      "Invalid ACTIVE_VISITOR_WINDOW_SECONDS. Phase 1 requires exactly 180 seconds.",
    );
  }
  if (cachedConfig.activeVisitorSampleIntervalMs !== 30_000) {
    throw new Error(
      "Invalid ACTIVE_VISITOR_SAMPLE_INTERVAL_MS. Phase 1 requires exactly 30000 ms.",
    );
  }
  if (cachedConfig.visitors24hSampleIntervalMs !== 300_000) {
    throw new Error(
      "Invalid VISITORS_24H_SAMPLE_INTERVAL_MS. Phase 1 requires exactly 300000 ms.",
    );
  }

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
