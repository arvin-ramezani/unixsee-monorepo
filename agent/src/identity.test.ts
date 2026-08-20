import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  assertValidAgentInstanceId,
  loadOrCreateAgentInstallationIdentity,
} from "./identity.js";
import { getAgentStateFilePath } from "./security/filesystem.js";
import { loadTestConfig } from "./test-helpers.js";

const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;
const originalExplicitId = process.env.AGENT_INSTANCE_ID;

describe("installation identity", () => {
  beforeEach(async () => {
    loadTestConfig();
    process.env.UNIXSEE_AGENT_STATE_DIR = await mkdtemp(
      join(tmpdir(), "unixsee-agent-identity-"),
    );
    delete process.env.AGENT_INSTANCE_ID;
  });

  afterEach(() => {
    if (originalStateDir === undefined) {
      delete process.env.UNIXSEE_AGENT_STATE_DIR;
    } else {
      process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
    }

    if (originalExplicitId === undefined) {
      delete process.env.AGENT_INSTANCE_ID;
    } else {
      process.env.AGENT_INSTANCE_ID = originalExplicitId;
    }
  });

  it("creates and persists a UUID v4 when no identity exists", async () => {
    const identity = await loadOrCreateAgentInstallationIdentity();

    expect(identity.created).toBe(true);
    expect(identity.agentInstanceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    const persisted = await import("node:fs/promises").then(({ readFile }) =>
      readFile(getAgentStateFilePath("agent-instance-id"), "utf8"),
    );
    expect(persisted.trim()).toBe(identity.agentInstanceId);
  });

  it("returns the same persisted identity across restarts", async () => {
    const first = await loadOrCreateAgentInstallationIdentity();
    const second = await loadOrCreateAgentInstallationIdentity();

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.agentInstanceId).toBe(first.agentInstanceId);
  });

  it("rejects an invalid persisted identity instead of silently replacing it", async () => {
    await writeFile(
      getAgentStateFilePath("agent-instance-id"),
      "legacy-machine-id-value\n",
    );

    await expect(loadOrCreateAgentInstallationIdentity()).rejects.toThrow(
      /Persisted agentInstanceId is invalid/,
    );
  });

  it("does not accept an environment override in place of persisted installation identity", async () => {
    process.env.AGENT_INSTANCE_ID = "11111111-1111-4111-8111-111111111111";

    const identity = await loadOrCreateAgentInstallationIdentity();

    expect(identity.agentInstanceId).not.toBe(process.env.AGENT_INSTANCE_ID);
  });

  it("validates UUID v4 values", () => {
    expect(
      assertValidAgentInstanceId("550e8400-e29b-41d4-a716-446655440000\n"),
    ).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(() => assertValidAgentInstanceId("not-a-uuid")).toThrow();
  });
});
