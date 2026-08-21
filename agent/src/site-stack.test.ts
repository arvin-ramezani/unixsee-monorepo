import { describe, expect, it } from "vitest";
import { failedSnapshot, validateProbeResponse } from "./site-stack.js";

describe("protected probe validation", () => {
  it("accepts only the bounded version response", () => {
    const result = validateProbeResponse("example.com", {
      wordpressVersion: "6.8.2",
      phpVersion: "8.3.12",
      imagickVersion: "3.7.0",
      checkedAt: "2026-08-20T00:00:00Z",
      ignored: "value",
    });
    expect(result.phpVersion).toBe("8.3.12");
    expect(result.fieldStatus.wordpressVersion.state).toBe("ok");
    expect(result).not.toHaveProperty("ignored");
  });
  it("returns explicit unknown statuses on probe failure", () => {
    const result = failedSnapshot("example.com", "probe_timeout");
    expect(result.wordpressVersion).toBeNull();
    expect(result.fieldStatus.phpVersion).toEqual({
      state: "unknown",
      reason: "probe_timeout",
    });
  });
  it("rejects malformed versions and timestamps", () => {
    expect(() =>
      validateProbeResponse("example.com", {
        phpVersion: "<script>",
        checkedAt: "bad",
      }),
    ).toThrow();
  });
});
