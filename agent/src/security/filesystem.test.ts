import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadConfig, resetConfigForTests } from "../config/config.js";
import {
  FilesystemBoundaryError,
  createAgentStateFileIfAbsent,
  getAgentStateFilePath,
  readAccessLogRange,
  readAgentStateFile,
  readOpenLiteSpeedRoutingConfigs,
  statAccessLog,
  writeAgentStateFileAtomic,
} from "./filesystem.js";

const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;
const originalListenerPaths = process.env.OPENLITESPEED_LISTENER_PATHS;

afterEach(() => {
  resetConfigForTests();

  if (originalStateDir === undefined) {
    delete process.env.UNIXSEE_AGENT_STATE_DIR;
  } else {
    process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
  }

  if (originalListenerPaths === undefined) {
    delete process.env.OPENLITESPEED_LISTENER_PATHS;
  } else {
    process.env.OPENLITESPEED_LISTENER_PATHS = originalListenerPaths;
  }
});

describe("positive filesystem allowlist", () => {
  it("allows only simple agent-owned state file names", async () => {
    const stateDir = await mkdtemp(join(tmpdir(), "unixsee-state-"));
    process.env.UNIXSEE_AGENT_STATE_DIR = stateDir;

    await writeAgentStateFileAtomic("inventory.json", '{"ok":true}\n');
    expect(await readAgentStateFile("inventory.json")).toBe('{"ok":true}\n');
    expect(await readFile(getAgentStateFilePath("inventory.json"), "utf8")).toBe(
      '{"ok":true}\n',
    );

    expect(() => getAgentStateFilePath("../outside.json")).toThrow(
      FilesystemBoundaryError,
    );
    await expect(readAgentStateFile("folder/file.json")).rejects.toThrow(
      FilesystemBoundaryError,
    );
  });

  it("creates an agent state file only once without overwriting it", async () => {
    const stateDir = await mkdtemp(join(tmpdir(), "unixsee-state-create-"));
    process.env.UNIXSEE_AGENT_STATE_DIR = stateDir;

    expect(
      await createAgentStateFileIfAbsent("agent-instance-id", "first\n"),
    ).toBe(true);
    expect(
      await createAgentStateFileIfAbsent("agent-instance-id", "second\n"),
    ).toBe(false);
    expect(await readAgentStateFile("agent-instance-id")).toBe("first\n");
  });

  it("reads OLS fixture paths in test mode through the routing capability", async () => {
    const dir = await mkdtemp(join(tmpdir(), "unixsee-ols-fs-"));
    const listenerPath = join(dir, "listeners.conf");
    await writeFile(listenerPath, "listener HTTP { address *:80 }\n");

    loadConfig({
      NODE_ENV: "test",
      API_BASE_URL: "https://api.test.local",
    });
    process.env.OPENLITESPEED_LISTENER_PATHS = listenerPath;

    const result = await readOpenLiteSpeedRoutingConfigs("listener");
    expect(result.contents).toEqual(["listener HTTP { address *:80 }\n"]);
  });

  it("rejects production OLS config paths outside the configured OLS conf tree", async () => {
    const root = await mkdtemp(join(tmpdir(), "unixsee-ols-root-"));
    const outside = await mkdtemp(join(tmpdir(), "unixsee-ols-outside-"));
    await mkdir(join(root, "conf"), { recursive: true });
    const outsideFile = join(outside, "listeners.conf");
    await writeFile(outsideFile, "listener HTTP {}\n");

    loadConfig({
      NODE_ENV: "production",
      API_BASE_URL: "https://api.example.com",
      OPENLITESPEED_SERVER_ROOT: root,
    });
    process.env.OPENLITESPEED_LISTENER_PATHS = outsideFile;

    await expect(readOpenLiteSpeedRoutingConfigs("listener")).rejects.toThrow(
      FilesystemBoundaryError,
    );
  });

  it("derives access-log paths from the approved log directory and safe domain", async () => {
    const logDir = await mkdtemp(join(tmpdir(), "unixsee-log-fs-"));
    loadConfig({
      NODE_ENV: "test",
      API_BASE_URL: "https://api.test.local",
      ACCESS_LOG_DIR: logDir,
    });

    await writeFile(join(logDir, "example.com.log"), "abcdef");
    expect(await statAccessLog("example.com")).toMatchObject({ size: 6 });
    expect(await readAccessLogRange("example.com", 1, 4)).toBe("bcd");

    await expect(statAccessLog("../etc/passwd")).rejects.toThrow(
      FilesystemBoundaryError,
    );
  });
});
