type NodeEnvironment = "production" | "development" | "test";

const AGENT_API_PREFIX = "/api/internal/agent/v1";
export const AGENT_VERSION = "0.2.0";

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
    commandResult: (id: string) => string;
  };
  stateDir: string;
  routingFiles: string[];
  accessLogDir: string;
  openLiteSpeedServerRoot: string;
  probe: {
    scheme: "http" | "https";
    port: number;
    path: string;
    secret: string;
    timeoutMs: number;
    concurrency: number;
  };
  intervals: {
    heartbeatMs: number;
    trafficPollMs: number;
    activeVisitorsMs: number;
    visitors24hMs: number;
    discoveryMs: number;
    stackMs: number;
  };
  maxInitialLogBytes: number;
};

let cachedConfig: AppConfig | null = null;
const optional = (env: NodeJS.ProcessEnv, name: string) =>
  env[name]?.trim() || undefined;
const required = (env: NodeJS.ProcessEnv, name: string) => {
  const value = optional(env, name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};
const positive = (
  value: string | undefined,
  fallback: number,
  name: string,
) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0)
    throw new Error(`Invalid ${name}.`);
  return parsed;
};
const url = (value: string) => {
  const parsed = new URL(value);
  return parsed.toString().replace(/\/$/, "");
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = env.NODE_ENV;
  if (
    nodeEnv !== "production" &&
    nodeEnv !== "development" &&
    nodeEnv !== "test"
  )
    throw new Error("Invalid NODE_ENV.");
  const apiBaseUrl = url(required(env, "API_BASE_URL"));
  const prefix = `${apiBaseUrl}${AGENT_API_PREFIX}`;
  const scheme = optional(env, "PROBE_SCHEME") ?? "https";
  if (scheme !== "http" && scheme !== "https")
    throw new Error("PROBE_SCHEME must be http or https.");
  const root = optional(env, "OPENLITESPEED_SERVER_ROOT") ?? "/usr/local/lsws";
  const routingFiles = (
    optional(env, "OLS_ROUTING_FILES") ?? `${root}/conf/httpd_config.conf`
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  cachedConfig = {
    nodeEnv,
    agentSecret: optional(env, "AGENT_SECRET") ?? null,
    enrollmentToken: optional(env, "ENROLLMENT_TOKEN") ?? null,
    agentVersion: AGENT_VERSION,
    apiBaseUrl,
    endpoints: {
      enroll: `${prefix}/enroll`,
      ingest: `${prefix}/ingest`,
      heartbeat: `${prefix}/heartbeat`,
      commandResult: (id) =>
        `${prefix}/commands/${encodeURIComponent(id)}/result`,
    },
    stateDir: optional(env, "AGENT_STATE_DIR") ?? "/opt/unixsee-agent/state",
    routingFiles,
    accessLogDir: optional(env, "ACCESS_LOG_DIR") ?? "/var/log/httpd/domains",
    openLiteSpeedServerRoot: root,
    probe: {
      scheme,
      port: positive(
        env.PROBE_PORT,
        scheme === "https" ? 443 : 80,
        "PROBE_PORT",
      ),
      path: optional(env, "PROBE_PATH") ?? "/.unixsee/v1/site-stack.php",
      secret: required(env, "PROBE_SECRET"),
      timeoutMs: positive(env.PROBE_TIMEOUT_MS, 5_000, "PROBE_TIMEOUT_MS"),
      concurrency: positive(env.PROBE_CONCURRENCY, 3, "PROBE_CONCURRENCY"),
    },
    intervals: {
      heartbeatMs: positive(
        env.HEARTBEAT_INTERVAL_MS,
        30_000,
        "HEARTBEAT_INTERVAL_MS",
      ),
      trafficPollMs: positive(
        env.TRAFFIC_POLL_INTERVAL_MS,
        1_000,
        "TRAFFIC_POLL_INTERVAL_MS",
      ),
      activeVisitorsMs: positive(
        env.ACTIVE_VISITORS_INTERVAL_MS,
        30_000,
        "ACTIVE_VISITORS_INTERVAL_MS",
      ),
      visitors24hMs: positive(
        env.VISITORS_24H_INTERVAL_MS,
        300_000,
        "VISITORS_24H_INTERVAL_MS",
      ),
      discoveryMs: positive(
        env.DISCOVERY_INTERVAL_MS,
        600_000,
        "DISCOVERY_INTERVAL_MS",
      ),
      stackMs: positive(env.STACK_INTERVAL_MS, 21_600_000, "STACK_INTERVAL_MS"),
    },
    maxInitialLogBytes: positive(
      env.MAX_INITIAL_LOG_BYTES,
      4 * 1024 * 1024,
      "MAX_INITIAL_LOG_BYTES",
    ),
  };
  return cachedConfig;
}

export function getConfig(): AppConfig {
  if (!cachedConfig) throw new Error("Config not loaded.");
  return cachedConfig;
}
export function resetConfigForTests() {
  cachedConfig = null;
}
export const config: AppConfig = new Proxy({} as AppConfig, {
  get: (_target, property) => Reflect.get(getConfig(), property),
});
