import {
  appendFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FilesystemPolicy } from "./filesystem-policy.js";
import { loadTestConfig } from "./test-helpers.js";
import { TrafficCollector } from "./traffic.js";

describe("incremental traffic collection", () => {
  it("deduplicates active IPs, HMACs immediately, and persists no raw address", async () => {
    const root = await mkdtemp(join(tmpdir(), "unixsee-traffic-"));
    const logs = join(root, "logs");
    const state = join(root, "state");
    await mkdir(logs);
    await mkdir(state);
    const config = loadTestConfig({
      AGENT_STATE_DIR: state,
      ACCESS_LOG_DIR: logs,
      OLS_ROUTING_FILES: join(root, "ols.conf"),
    });
    const policy = new FilesystemPolicy({
      stateDir: state,
      accessLogDir: logs,
      routingFiles: config.routingFiles,
    });
    const line =
      '203.0.113.9 - - [20/Aug/2026:12:00:00 +0000] "GET / HTTP/1.1" 200 10\n';
    await writeFile(join(logs, "example.com.log"), line + line);
    const now = () => Date.parse("2026-08-20T12:00:30Z");
    const collector = new TrafficCollector(config, policy, now);
    await collector.poll(["example.com"]);
    expect(collector.activeSamples(["example.com"])[0].uniqueVisitorCount).toBe(
      1,
    );
    expect(collector.visitors24hSamples(["example.com"])[0].status.reason).toBe(
      "warming_up",
    );
    await collector.persist();
    expect(
      await readFile(join(state, "traffic-state.json"), "utf8"),
    ).not.toContain("203.0.113.9");
  });
  it("holds partial lines and follows a rotated inode", async () => {
    const root = await mkdtemp(join(tmpdir(), "unixsee-rotate-"));
    const logs = join(root, "logs");
    const state = join(root, "state");
    await mkdir(logs);
    await mkdir(state);
    const config = loadTestConfig({
      AGENT_STATE_DIR: state,
      ACCESS_LOG_DIR: logs,
      OLS_ROUTING_FILES: join(root, "ols.conf"),
    });
    const policy = new FilesystemPolicy({
      stateDir: state,
      accessLogDir: logs,
      routingFiles: config.routingFiles,
    });
    const path = join(logs, "example.com.log");
    const collector = new TrafficCollector(config, policy);

    await writeFile(path, "198.51.100.10 partial");
    await collector.poll(["example.com"]);
    expect(collector.activeSamples(["example.com"])[0].uniqueVisitorCount).toBe(
      0,
    );

    await appendFile(path, "\n");
    await collector.poll(["example.com"]);
    expect(collector.activeSamples(["example.com"])[0].uniqueVisitorCount).toBe(
      1,
    );

    await rename(path, `${path}.1`);
    await writeFile(path, "2001:db8::10 rotated\n");
    await collector.poll(["example.com"]);
    expect(collector.activeSamples(["example.com"])[0].uniqueVisitorCount).toBe(
      2,
    );
  });
  it("recovers from truncation without throwing", async () => {
    const root = await mkdtemp(join(tmpdir(), "unixsee-truncate-"));
    const logs = join(root, "logs");
    const state = join(root, "state");
    await mkdir(logs);
    await mkdir(state);
    const config = loadTestConfig({
      AGENT_STATE_DIR: state,
      ACCESS_LOG_DIR: logs,
      OLS_ROUTING_FILES: join(root, "ols.conf"),
    });
    const policy = new FilesystemPolicy({
      stateDir: state,
      accessLogDir: logs,
      routingFiles: config.routingFiles,
    });
    const path = join(logs, "example.com.log");
    await writeFile(path, "198.51.100.1 x\n");
    const collector = new TrafficCollector(config, policy);
    await collector.poll(["example.com"]);
    await writeFile(path, "198.51.100.2 x\n");
    await expect(collector.poll(["example.com"])).resolves.toBeUndefined();
  });
});
