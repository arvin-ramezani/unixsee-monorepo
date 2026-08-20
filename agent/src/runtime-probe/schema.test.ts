import { describe, expect, it } from "vitest";

import { parseRuntimeProbeResponse } from "./schema.js";

describe("runtime probe response schema", () => {
  it("accepts the exact allowlisted response shape", () => {
    expect(
      parseRuntimeProbeResponse({
        wordpressVersion: "6.8.2",
        phpVersion: "8.3.23",
        imagickVersion: "3.8.0",
        checkedAt: "2026-08-19T12:00:00.000Z",
      }),
    ).toEqual({
      wordpressVersion: "6.8.2",
      phpVersion: "8.3.23",
      imagickVersion: "3.8.0",
      checkedAt: "2026-08-19T12:00:00.000Z",
    });
  });

  it("allows null WP/Imagick/PHP values so field status can be explicit", () => {
    expect(
      parseRuntimeProbeResponse({
        wordpressVersion: null,
        phpVersion: null,
        imagickVersion: null,
        checkedAt: "2026-08-19T12:00:00.000Z",
      }),
    ).not.toBeNull();
  });

  it("rejects extra fields", () => {
    expect(
      parseRuntimeProbeResponse({
        wordpressVersion: "6.8.2",
        phpVersion: "8.3.23",
        imagickVersion: "3.8.0",
        checkedAt: "2026-08-19T12:00:00.000Z",
        documentRoot: "/home/example",
      }),
    ).toBeNull();
  });

  it("rejects invalid version strings and timestamps", () => {
    expect(
      parseRuntimeProbeResponse({
        wordpressVersion: "<script>alert(1)</script>",
        phpVersion: "8.3.23",
        imagickVersion: "3.8.0",
        checkedAt: "not-a-date",
      }),
    ).toBeNull();
  });
});
