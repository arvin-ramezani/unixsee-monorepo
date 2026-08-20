import {
  appendFile,
  mkdtemp,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  collectActiveVisitors3m,
  disableTrafficWatchForTests,
  ensureTrafficTails,
  getTrafficStateSnapshotForTests,
  reconcileTrafficTailsOnce,
  resetTrafficStateForTests,
} from "./traffic.js";
import { getTrafficCursorStateForTests } from "./traffic-cursors.js";
import { loadTestConfig } from "./test-helpers.js";

const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;

function commonLogDate(date = new Date()): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `[${day}/${month}/${year}:${h}:${m}:${s} +0000]`;
}

function logLine(ip: string, path = "/", date = new Date()): string {
  return `${ip} - - ${commonLogDate(date)} "GET ${path} HTTP/1.1" 200 100`;
}

describe("traffic active visitors", () => {
  let logDir: string;
  let stateDir: string;

  beforeEach(async () => {
    resetTrafficStateForTests();
    logDir = await mkdtemp(join(tmpdir(), "unixsee-agent-logs-"));
    stateDir = await mkdtemp(join(tmpdir(), "unixsee-agent-traffic-state-"));
    process.env.UNIXSEE_AGENT_STATE_DIR = stateDir;
    loadTestConfig({ ACCESS_LOG_DIR: logDir });
  });

  afterEach(() => {
    resetTrafficStateForTests();
    if (originalStateDir === undefined) {
      delete process.env.UNIXSEE_AGENT_STATE_DIR;
    } else {
      process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
    }
  });

  it("marks missing logs as unsupported with zero count", async () => {
    await ensureTrafficTails(["missing.example"]);
    const samples = collectActiveVisitors3m(["missing.example"]);
    expect(samples).toHaveLength(1);
    expect(samples[0]?.uniqueIpCount).toBe(0);
    expect(samples[0]?.status).toEqual({
      state: "unsupported",
      reason: "log_missing",
    });
  });

  it("keeps one latest-seen entry per visitor instead of every request hit", async () => {
    const now = new Date();
    const oldEnoughForCoverage = new Date(now.getTime() - 4 * 60_000);
    const lines = [
      logLine("9.9.9.9", "/coverage", oldEnoughForCoverage),
      logLine("1.1.1.1", "/", now),
      logLine("2.2.2.2", "/a", now),
      logLine("1.1.1.1", "/b", now),
      logLine("1.1.1.1", "/c", now),
    ].join("\n");

    await writeFile(join(logDir, "shop.example.log"), `${lines}\n`);
    await ensureTrafficTails(["shop.example"]);

    const samples = collectActiveVisitors3m(["shop.example"]);
    expect(samples[0]?.uniqueIpCount).toBe(2);
    expect(samples[0]?.status?.state).toBe("ok");

    const state = getTrafficStateSnapshotForTests("shop.example");
    expect(state?.visitorKeys).toHaveLength(2);
    expect(state?.visitorKeys.every((key) => /^[0-9a-f]{64}$/.test(key))).toBe(
      true,
    );
  });

  it("does not retain raw visitor IPs in active traffic state", async () => {
    await writeFile(
      join(logDir, "privacy.example.log"),
      `${logLine("203.0.113.42")}\n`,
    );

    await ensureTrafficTails(["privacy.example"]);
    const state = getTrafficStateSnapshotForTests("privacy.example");
    const serializedDerivedState = JSON.stringify(state);

    expect(serializedDerivedState).not.toContain("203.0.113.42");
    expect(state?.visitorKeys).toHaveLength(1);
  });

  it("uses the persisted local hash key across traffic-state restarts", async () => {
    await writeFile(
      join(logDir, "stable.example.log"),
      `${logLine("198.51.100.9")}\n`,
    );

    await ensureTrafficTails(["stable.example"]);
    const firstKey = getTrafficStateSnapshotForTests("stable.example")
      ?.visitorKeys[0];

    resetTrafficStateForTests();
    await ensureTrafficTails(["stable.example"]);
    const secondKey = getTrafficStateSnapshotForTests("stable.example")
      ?.visitorKeys[0];

    expect(firstKey).toBeDefined();
    expect(secondKey).toBe(firstKey);
  });

  it("bounds the initial read to the configured tail size", async () => {
    loadTestConfig({
      ACCESS_LOG_DIR: logDir,
      TRAFFIC_INITIAL_READ_MAX_BYTES: "512",
    });

    const largePrefix = [
      `${logLine("192.0.2.10", "/too-old-prefix")}\n`,
      "x".repeat(4_096),
      "\n",
    ].join("");
    const recentTail = `${logLine("198.51.100.10", "/recent")}\n`;

    await writeFile(
      join(logDir, "bounded.example.log"),
      `${largePrefix}${recentTail}`,
    );

    await ensureTrafficTails(["bounded.example"]);
    const state = getTrafficStateSnapshotForTests("bounded.example");

    expect(state?.visitorKeys).toHaveLength(1);
    expect(state?.byteOffset).toBeGreaterThan(4_096);
    expect(state?.coverage).toMatchObject({
      state: "unknown",
      reason: "warming_up",
    });
  });

  it("surfaces a cursor gap when offline growth exceeds the startup budget", async () => {
    loadTestConfig({
      ACCESS_LOG_DIR: logDir,
      TRAFFIC_INITIAL_READ_MAX_BYTES: "512",
    });

    const path = join(logDir, "cursor-gap.example.log");
    await writeFile(path, `${logLine("198.51.100.15", "/before")}\n`);
    await ensureTrafficTails(["cursor-gap.example"]);

    resetTrafficStateForTests();
    await appendFile(
      path,
      `${"x".repeat(4_096)}\n${logLine("198.51.100.16", "/after")}\n`,
    );
    await ensureTrafficTails(["cursor-gap.example"]);

    const sample = collectActiveVisitors3m(["cursor-gap.example"])[0];
    expect(sample?.status).toEqual({
      state: "unknown",
      reason: "log_cursor_gap",
    });
  });

  it("persists inode and offset and advances them after restart", async () => {
    const path = join(logDir, "cursor.example.log");
    await writeFile(path, `${logLine("198.51.100.20", "/first")}\n`);

    await ensureTrafficTails(["cursor.example"]);
    const firstCursor = (await getTrafficCursorStateForTests())[
      "cursor.example"
    ];
    expect(firstCursor?.offset).toBeGreaterThan(0);
    expect(firstCursor?.inode).toBeGreaterThan(0);

    resetTrafficStateForTests();
    await appendFile(path, `${logLine("198.51.100.21", "/second")}\n`);
    await ensureTrafficTails(["cursor.example"]);

    const secondCursor = (await getTrafficCursorStateForTests())[
      "cursor.example"
    ];
    expect(secondCursor?.inode).toBe(firstCursor?.inode);
    expect(secondCursor?.offset).toBeGreaterThan(firstCursor?.offset ?? 0);
    expect(Date.parse(secondCursor?.lastReadAt ?? "")).not.toBeNaN();
  });

  it("does not advance the durable cursor past a partial final line", async () => {
    const path = join(logDir, "partial.example.log");
    const first = `${logLine("198.51.100.30", "/complete")}\n`;
    const partial = `198.51.100.31 - - ${commonLogDate()} "GET /partial`;
    await writeFile(path, `${first}${partial}`);

    await ensureTrafficTails(["partial.example"]);
    const afterPartial = (await getTrafficCursorStateForTests())[
      "partial.example"
    ];
    expect(afterPartial?.offset).toBe(Buffer.byteLength(first, "utf8"));

    await appendFile(path, ` HTTP/1.1" 200 100\n`);
    await ensureTrafficTails(["partial.example"]);
    const state = getTrafficStateSnapshotForTests("partial.example");
    expect(state?.visitorKeys).toHaveLength(2);
  });

  it("marks truncation as a coverage gap instead of a complete sample", async () => {
    const path = join(logDir, "truncate.example.log");
    await writeFile(
      path,
      `${logLine("198.51.100.40", "/one")}\n${logLine("198.51.100.41", "/two")}\n`,
    );
    await ensureTrafficTails(["truncate.example"]);

    await writeFile(path, `${logLine("198.51.100.42", "/new-file")}\n`);
    await ensureTrafficTails(["truncate.example"]);

    const sample = collectActiveVisitors3m(["truncate.example"])[0];
    expect(sample?.status).toEqual({
      state: "unknown",
      reason: "log_rotated_gap",
    });
  });

  it("persists cursor metadata without raw visitor IPs", async () => {
    await writeFile(
      join(logDir, "cursor-privacy.example.log"),
      `${logLine("203.0.113.77")}\n`,
    );
    await ensureTrafficTails(["cursor-privacy.example"]);

    const persisted = await readFile(
      join(stateDir, "traffic-cursors.json"),
      "utf8",
    );
    expect(persisted).not.toContain("203.0.113.77");
    expect(persisted).toContain('"cursor-privacy.example"');
  });


  it("recovers appended traffic through reconciliation when fs.watch is unavailable", async () => {
    const path = join(logDir, "poll-only.example.log");
    const coverage = new Date(Date.now() - 4 * 60_000);
    await writeFile(
      path,
      `${logLine("198.51.100.60", "/coverage", coverage)}\n`,
    );

    await ensureTrafficTails(["poll-only.example"]);
    disableTrafficWatchForTests("poll-only.example");

    await appendFile(path, `${logLine("198.51.100.61", "/missed-watch")}\n`);
    await reconcileTrafficTailsOnce();

    const sample = collectActiveVisitors3m(["poll-only.example"])[0];
    expect(sample?.uniqueIpCount).toBe(1);
    expect(getTrafficStateSnapshotForTests("poll-only.example")?.watching).toBe(
      true,
    );
  });

  it("detects rotation during reconciliation and reattaches the watcher", async () => {
    const path = join(logDir, "rotate-poll.example.log");
    await writeFile(path, `${logLine("198.51.100.70", "/old")}\n`);
    await ensureTrafficTails(["rotate-poll.example"]);

    const before = getTrafficStateSnapshotForTests("rotate-poll.example");
    disableTrafficWatchForTests("rotate-poll.example");
    await rename(path, `${path}.1`);
    await writeFile(path, `${logLine("198.51.100.71", "/new")}\n`);

    await reconcileTrafficTailsOnce();

    const after = getTrafficStateSnapshotForTests("rotate-poll.example");
    expect(after?.inode).not.toBe(before?.inode);
    expect(after?.watching).toBe(true);

    const sample = collectActiveVisitors3m(["rotate-poll.example"])[0];
    expect(sample?.status).toEqual({
      state: "unknown",
      reason: "log_rotated_gap",
    });
  });

  it("recovers after a temporarily missing log without blocking other domains", async () => {
    const missingPath = join(logDir, "comes-back.example.log");
    const healthyPath = join(logDir, "healthy.example.log");
    await writeFile(missingPath, `${logLine("198.51.100.80")}\n`);
    await writeFile(healthyPath, `${logLine("198.51.100.81")}\n`);
    await ensureTrafficTails(["comes-back.example", "healthy.example"]);

    await unlink(missingPath);
    await appendFile(healthyPath, `${logLine("198.51.100.82", "/still-moving")}\n`);
    await reconcileTrafficTailsOnce();

    expect(collectActiveVisitors3m(["comes-back.example"])[0]?.status).toEqual({
      state: "unsupported",
      reason: "log_missing",
    });

    await writeFile(missingPath, `${logLine("198.51.100.83", "/returned")}\n`);
    await reconcileTrafficTailsOnce();

    const recovered = getTrafficStateSnapshotForTests("comes-back.example");
    expect(recovered?.watching).toBe(true);
    expect(recovered?.visitorKeys).toHaveLength(1);

    const healthy = getTrafficStateSnapshotForTests("healthy.example");
    expect(healthy?.visitorKeys).toHaveLength(2);
  });

  it("closes watchers when domains are removed", async () => {
    await mkdir(logDir, { recursive: true });
    await writeFile(join(logDir, "a.example.log"), "");
    await ensureTrafficTails(["a.example"]);
    await ensureTrafficTails([]);
    const samples = collectActiveVisitors3m(["a.example"]);
    expect(samples[0]?.status?.reason).toBe("log_not_initialized");
  });
});
