import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadTestConfig } from "./test-helpers.js";
import {
  HLL_BUCKET_MS,
  HLL_PRECISION,
  HLL_WINDOW_MS,
  addVisitorTo24h,
  ensureVisitors24hDomain,
  getVisitors24hCardinality,
  getVisitors24hStateForTests,
  persistVisitors24hState,
  resetVisitors24hStateForTests,
} from "./traffic-hll.js";

const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;

function visitorKey(index: number): string {
  return createHash("sha256").update(`visitor-${index}`).digest("hex");
}

describe("24h HyperLogLog cardinality ring", () => {
  let stateDir: string;

  beforeEach(async () => {
    resetVisitors24hStateForTests();
    stateDir = await mkdtemp(join(tmpdir(), "unixsee-hll-state-"));
    process.env.UNIXSEE_AGENT_STATE_DIR = stateDir;
    loadTestConfig();
  });

  afterEach(() => {
    resetVisitors24hStateForTests();
    if (originalStateDir === undefined) {
      delete process.env.UNIXSEE_AGENT_STATE_DIR;
    } else {
      process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
    }
  });

  it("uses p=12 and stays within the <=2% cardinality target", async () => {
    const domain = "estimate.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");
    const expected = 100_000;

    await ensureVisitors24hDomain(domain);
    for (let index = 0; index < expected; index += 1) {
      addVisitorTo24h(domain, visitorKey(index), nowMs - 60_000);
    }

    const estimate = await getVisitors24hCardinality(domain, nowMs);
    const relativeError = Math.abs(estimate - expected) / expected;

    expect(HLL_PRECISION).toBe(12);
    expect(relativeError).toBeLessThanOrEqual(0.02);
    expect((await getVisitors24hStateForTests(domain))?.modes).toContain("dense");
  });

  it("deduplicates the same visitor across multiple five-minute buckets", async () => {
    const domain = "repeat.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");
    const key = visitorKey(1);

    await ensureVisitors24hDomain(domain);
    addVisitorTo24h(domain, key, nowMs - HLL_BUCKET_MS * 2);
    addVisitorTo24h(domain, key, nowMs - HLL_BUCKET_MS);
    addVisitorTo24h(domain, key, nowMs - 1_000);

    expect(await getVisitors24hCardinality(domain, nowMs)).toBe(1);
  });

  it("drops buckets that no longer intersect the latest 24 hours", async () => {
    const domain = "expiry.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hDomain(domain);
    addVisitorTo24h(
      domain,
      visitorKey(1),
      nowMs - HLL_WINDOW_MS - HLL_BUCKET_MS,
    );
    addVisitorTo24h(domain, visitorKey(2), nowMs - 60_000);

    expect(await getVisitors24hCardinality(domain, nowMs)).toBe(1);
    expect((await getVisitors24hStateForTests(domain))?.bucketCount).toBe(1);
  });

  it("persists cardinality state without coverage metadata", async () => {
    const domain = "persist.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hDomain(domain);
    addVisitorTo24h(domain, visitorKey(10), nowMs - 10_000);
    addVisitorTo24h(domain, visitorKey(11), nowMs - 5_000);
    await persistVisitors24hState();

    const persisted = await readFile(join(stateDir, "traffic-hll.json"), "utf8");
    expect(persisted).toContain('"version":2');
    expect(persisted).toContain('"precision":12');
    expect(persisted).not.toContain("coverageStartMs");
    expect(persisted).not.toContain("coverageReason");
    expect(persisted).not.toContain("203.0.113.");

    const before = await getVisitors24hCardinality(domain, nowMs);
    resetVisitors24hStateForTests();
    const after = await getVisitors24hCardinality(domain, nowMs);
    expect(after).toBe(before);
  });

  it("keeps observed cardinality independent of later coverage gaps", async () => {
    const domain = "gap-independent.example";
    const nowMs = Date.parse("2026-08-19T12:00:00.000Z");

    await ensureVisitors24hDomain(domain);
    addVisitorTo24h(domain, visitorKey(20), nowMs - 3_600_000);
    addVisitorTo24h(domain, visitorKey(21), nowMs - 60_000);

    // Coverage gaps are managed by traffic-coverage.ts and never clear HLL.
    expect(await getVisitors24hCardinality(domain, nowMs)).toBe(2);
  });
});
