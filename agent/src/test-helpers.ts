import { loadConfig, resetConfigForTests } from "./config/config.js";

export function loadTestConfig(
  overrides: Record<string, string> = {},
): ReturnType<typeof loadConfig> {
  resetConfigForTests();
  return loadConfig({
    NODE_ENV: "test",
    API_BASE_URL: "https://api.test.local",
    ACCESS_LOG_DIR: "/tmp/unixsee-test-logs",
    ...overrides,
  });
}
