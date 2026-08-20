import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadTestConfig } from "./test-helpers.js";
import {
  ensureVisitors24hCoverageDomain,
  getVisitors24hCoverage,
  getVisitors24hCoverageStateForTests,
  initializeVisitors24hCoverage,
  markVisitors24hCoverageObserved,
  persistVisitors24hCoverageState,
  resetVisitors24hCoverageAfterGap,
  resetVisitors24hCoverageStateForTests,
} from "./traffic-coverage.js";

const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;

describe("24h traffic coverage", () => {
  let stateDir: string;

  beforeEach(async () => {
    resetVisitors24hCoverageStateForTests();
    stateDir = await mkdtemp(join(tmpdir(), "unixsee-coverage-state-"));
    process.env.UNIXSEE_AGENT_STATE_DIR = stateDir;
    loadTestConfig();
  });

  afterEach(() => {
    resetVisitors24hCoverageStateForTests();
    if (originalStateDir === undefined) {
      delete process.env.UNIXSEE_AGENT_STATE_DIR;
    } else {
      process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
    }
  });

  it("reports warming_up independently from cardinality", async () => {
    const domain = "warming.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hCoverageDomain(domain);
    initializeVisitors24hCoverage(domain, nowMs - 2 * 60 * 60 * 1000, "warming_up");
    markVisitors24hCoverageObserved(domain, nowMs);

    expect(await getVisitors24hCoverage(domain, nowMs)).toEqual({
      coverageSeconds: 7200,
      status: { state: "unknown", reason: "warming_up" },
    });
  });

  it("becomes ok only after a full continuous 24 hours", async () => {
    const domain = "full.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hCoverageDomain(domain);
    initializeVisitors24hCoverage(domain, nowMs - 86_400_000, "warming_up");
    markVisitors24hCoverageObserved(domain, nowMs);

    expect(await getVisitors24hCoverage(domain, nowMs)).toEqual({
      coverageSeconds: 86_400,
      status: { state: "ok" },
    });
  });

  it("resets coverage after a cursor gap without any cardinality concern", async () => {
    const domain = "gap.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hCoverageDomain(domain);
    initializeVisitors24hCoverage(domain, nowMs - 86_400_000, "warming_up");
    markVisitors24hCoverageObserved(domain, nowMs - 3_600_000);

    resetVisitors24hCoverageAfterGap(
      domain,
      "log_cursor_gap",
      nowMs - 1800_000,
      nowMs,
    );

    expect(await getVisitors24hCoverage(domain, nowMs)).toEqual({
      coverageSeconds: 1800,
      status: { state: "unknown", reason: "log_cursor_gap" },
    });
  });

  it("persists coverage separately from HLL state", async () => {
    const domain = "persist.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hCoverageDomain(domain);
    initializeVisitors24hCoverage(domain, nowMs - 3600_000, "warming_up");
    markVisitors24hCoverageObserved(domain, nowMs);
    await persistVisitors24hCoverageState();

    const persisted = await readFile(
      join(stateDir, "traffic-coverage.json"),
      "utf8",
    );
    expect(persisted).toContain('"continuousStartMs"');
    expect(persisted).not.toContain("registers");
    expect(persisted).not.toContain("visitor");

    resetVisitors24hCoverageStateForTests();
    expect(await getVisitors24hCoverage(domain, nowMs)).toEqual({
      coverageSeconds: 3600,
      status: { state: "unknown", reason: "warming_up" },
    });
  });

  it("tracks last observed time rather than assuming coverage to wall-clock now", async () => {
    const domain = "stale.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hCoverageDomain(domain);
    initializeVisitors24hCoverage(domain, nowMs - 7200_000, "warming_up");
    markVisitors24hCoverageObserved(domain, nowMs - 60_000);

    expect((await getVisitors24hCoverage(domain, nowMs)).coverageSeconds).toBe(7140);
    expect(await getVisitors24hCoverageStateForTests(domain)).toEqual({
      continuousStartMs: nowMs - 7200_000,
      lastObservedAtMs: nowMs - 60_000,
      reason: "warming_up",
    });
  });
});
