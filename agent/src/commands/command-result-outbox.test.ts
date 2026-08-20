import { beforeEach, describe, expect, it, vi } from "vitest";

const files = new Map<string, string>();

vi.mock("../security/filesystem.js", () => ({
  readAgentStateFile: vi.fn(async (name: string) => files.get(name) ?? null),
  writeAgentStateFileAtomic: vi.fn(async (name: string, value: string) => {
    files.set(name, value);
  }),
}));

import { createCommandResultOutbox } from "./command-result-outbox.js";

const result = {
  schemaVersion: "phase1" as const,
  agentInstanceId: "agent-1",
  commandId: "6e00ef4d-afc5-4324-9da0-169f2dc987ac",
  type: "REFRESH_SITE_STACK" as const,
  domain: "example.com",
  status: "FAILED" as const,
  completedAt: "2026-08-19T12:00:00.000Z",
  errorCode: "domain_not_in_inventory",
};

describe("persistent command result outbox", () => {
  beforeEach(() => files.clear());

  it("persists a result until acknowledged", async () => {
    const outbox = createCommandResultOutbox();
    await outbox.enqueue(result, "2026-08-19T12:10:00.000Z");

    const restarted = createCommandResultOutbox();
    expect(
      await restarted.has(result.commandId),
    ).toBe(true);

    await restarted.ack(result.commandId);
    expect(await restarted.size(new Date("2026-08-19T12:01:00.000Z"))).toBe(0);
  });

  it("drops a result only after the command itself expires", async () => {
    const outbox = createCommandResultOutbox();
    await outbox.enqueue(result, "2026-08-19T12:10:00.000Z");

    expect(await outbox.size(new Date("2026-08-19T12:09:59.000Z"))).toBe(1);
    expect(await outbox.size(new Date("2026-08-19T12:10:00.000Z"))).toBe(0);
  });
});
