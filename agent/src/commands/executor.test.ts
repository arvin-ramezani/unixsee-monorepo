import { describe, expect, it, vi } from "vitest";
import { executeLeasedCommand } from "./executor.js";
import type { StackSchedulerHandle } from "../schedulers/stack-scheduler.js";

function scheduler(overrides: Partial<StackSchedulerHandle> = {}): StackSchedulerHandle {
  return {
    initialize: vi.fn(async () => undefined),
    syncDomains: vi.fn(async () => undefined),
    refreshNow: vi.fn(async () => ({
      snapshots: [
        {
          domain: "example.com",
          wordpressVersion: "6.8.2",
          phpVersion: "8.3.23",
          imagickVersion: "3.8.0",
          checkedAt: "2026-08-19T12:00:00.000Z",
          fieldStatus: {
            wordpressVersion: { state: "ok" },
            phpVersion: { state: "ok" },
            imagickVersion: { state: "ok" },
          },
        },
      ],
      attemptedDomains: ["example.com"],
      failedDomains: [],
    })),
    runDue: vi.fn(async () => ({
      snapshots: [],
      attemptedDomains: [],
      failedDomains: [],
    })),
    getRecord: vi.fn(() => null),
    getRecords: vi.fn(() => []),
    ...overrides,
  };
}

const command = {
  id: "6e00ef4d-afc5-4324-9da0-169f2dc987ac",
  type: "REFRESH_SITE_STACK" as const,
  domain: "example.com",
  expiresAt: "2026-08-19T12:10:00.000Z",
};

describe("REFRESH_SITE_STACK command executor", () => {
  it("runs one manual stack refresh for an exact primary OLS domain", async () => {
    const stackScheduler = scheduler();
    const result = await executeLeasedCommand(command, {
      agentInstanceId: "agent-1",
      getActiveDomains: () => [
        {
          domain: "example.com",
          aliases: ["www.example.com"],
          virtualHostName: "example-vhost",
          source: "openlitespeed",
        },
      ],
      stackScheduler,
      now: () => new Date("2026-08-19T12:00:01.000Z"),
    });

    expect(stackScheduler.refreshNow).toHaveBeenCalledWith(
      ["example.com"],
      "manual",
    );
    expect(result.status).toBe("SUCCEEDED");
    expect(result.stackSnapshot?.phpVersion).toBe("8.3.23");
  });

  it("rejects aliases because commands must target the exact primary inventory domain", async () => {
    const stackScheduler = scheduler();
    const result = await executeLeasedCommand(
      { ...command, domain: "www.example.com" },
      {
        agentInstanceId: "agent-1",
        getActiveDomains: () => [
          {
            domain: "example.com",
            aliases: ["www.example.com"],
            virtualHostName: "example-vhost",
            source: "openlitespeed",
          },
        ],
        stackScheduler,
        now: () => new Date("2026-08-19T12:00:01.000Z"),
      },
    );

    expect(result).toMatchObject({
      status: "FAILED",
      errorCode: "domain_not_in_inventory",
    });
    expect(stackScheduler.refreshNow).not.toHaveBeenCalled();
  });

  it("does not execute an expired command", async () => {
    const stackScheduler = scheduler();
    const result = await executeLeasedCommand(command, {
      agentInstanceId: "agent-1",
      getActiveDomains: () => [],
      stackScheduler,
      now: () => new Date("2026-08-19T12:11:00.000Z"),
    });

    expect(result.errorCode).toBe("command_expired");
    expect(stackScheduler.refreshNow).not.toHaveBeenCalled();
  });
});
