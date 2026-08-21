import { loadConfig, resetConfigForTests } from "./config/config.js";
export function loadTestConfig(overrides: Record<string, string> = {}) {
  resetConfigForTests();
  return loadConfig({
    NODE_ENV: "test",
    API_BASE_URL: "https://api.test.local",
    PROBE_SECRET: "test-probe-secret",
    AGENT_STATE_DIR: "/tmp/unixsee-agent-test",
    ACCESS_LOG_DIR: "/tmp/unixsee-agent-test-logs",
    OLS_ROUTING_FILES: "/tmp/httpd_config.conf",
    ...overrides,
  });
}
