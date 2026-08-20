import { loadConfig, resetConfigForTests } from "./config/config.js";

export function loadTestConfig(
  overrides: Record<string, string> = {},
): ReturnType<typeof loadConfig> {
  resetConfigForTests();
  return loadConfig({
    NODE_ENV: "test",
    API_BASE_URL: "https://api.test.local",
    ACCESS_LOG_DIR: "/tmp/unixsee-test-logs",
    TRAFFIC_RECONCILE_INTERVAL_MS: "60000",
    OLS_DISCOVERY_INTERVAL_MS: "600000",
    STACK_PROBE_INTERVAL_MS: "21600000",
    STACK_PROBE_CONCURRENCY: "3",
    ...overrides,
  });
}
