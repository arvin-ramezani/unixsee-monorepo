import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  deriveVisitorKey,
  loadOrCreateVisitorHashKey,
  resetVisitorIdentityForTests,
} from "./visitor-identity.js";
import { getAgentStateFilePath } from "./security/filesystem.js";
import { loadTestConfig } from "./test-helpers.js";

const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;

describe("local visitor pseudonymization identity", () => {
  beforeEach(async () => {
    loadTestConfig();
    process.env.UNIXSEE_AGENT_STATE_DIR = await mkdtemp(
      join(tmpdir(), "unixsee-visitor-key-"),
    );
    resetVisitorIdentityForTests();
  });

  afterEach(() => {
    resetVisitorIdentityForTests();
    if (originalStateDir === undefined) {
      delete process.env.UNIXSEE_AGENT_STATE_DIR;
    } else {
      process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
    }
  });

  it("creates and persists a 256-bit local key", async () => {
    const key = await loadOrCreateVisitorHashKey();
    expect(key).toHaveLength(32);

    const persisted = (
      await readFile(getAgentStateFilePath("visitor-hash-key"), "utf8")
    ).trim();
    expect(Buffer.from(persisted, "base64url")).toEqual(key);
  });

  it("loads the same key after an in-process restart", async () => {
    const first = await loadOrCreateVisitorHashKey();
    resetVisitorIdentityForTests();
    const second = await loadOrCreateVisitorHashKey();

    expect(second).toEqual(first);
  });

  it("rejects corrupt persisted key material instead of rotating identity", async () => {
    await writeFile(getAgentStateFilePath("visitor-hash-key"), "corrupt\n");

    await expect(loadOrCreateVisitorHashKey()).rejects.toThrow(
      /visitor hash key/i,
    );
  });

  it("produces deterministic domain-scoped keys without exposing the raw IP", () => {
    const key = Buffer.alloc(32, 7);
    const first = deriveVisitorKey("example.com", "203.0.113.7", key);
    const second = deriveVisitorKey("example.com", "203.0.113.7", key);
    const otherDomain = deriveVisitorKey("other.example", "203.0.113.7", key);

    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(second).toBe(first);
    expect(otherDomain).not.toBe(first);
    expect(first).not.toContain("203.0.113.7");
  });

  it("normalizes IPv4-mapped IPv6 visitor addresses", () => {
    const key = Buffer.alloc(32, 9);
    expect(
      deriveVisitorKey("example.com", "::ffff:203.0.113.7", key),
    ).toBe(deriveVisitorKey("example.com", "203.0.113.7", key));
  });
});
