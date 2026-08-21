import { describe, expect, it } from "vitest";
import { retryDelayMs } from "./engine.js";
import { PackedHll, RollingHll24h } from "./hll.js";

describe("bounded 24-hour HLL", () => {
  it("estimates unique visitors within the p=12 error envelope", () => {
    const hll = new PackedHll();
    for (let i = 0; i < 20_000; i++) hll.add(`visitor-${i}`);
    expect(Math.abs(hll.estimate() - 20_000) / 20_000).toBeLessThan(0.06);
    expect(Buffer.from(hll.serialize(), "base64")).toHaveLength(2048);
  });
  it("merges buckets and drops values older than 24 hours", () => {
    const rolling = new RollingHll24h();
    rolling.add("old", 0);
    rolling.add("new", 86_400_000);
    expect(rolling.estimate(86_400_000)).toBe(1);
  });
});

describe("offline retry backoff", () => {
  it("grows exponentially with bounded jitter and a five-minute cap", () => {
    expect(retryDelayMs(1, () => 0)).toBe(800);
    expect(retryDelayMs(2, () => 0.5)).toBe(2_000);
    expect(retryDelayMs(20, () => 0.5)).toBe(300_000);
  });
});
