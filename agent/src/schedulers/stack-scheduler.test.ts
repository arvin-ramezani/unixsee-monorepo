import { describe, expect, it, vi } from "vitest";

import type { SiteStackPayload } from "../runtime-probe/types.js";
import { createStackScheduler } from "./stack-scheduler.js";
import type { StackScheduleRecord } from "./stack-schedule-state.js";

function successfulSnapshot(
  domain: string,
  checkedAt: string,
): SiteStackPayload {
  return {
    domain,
    wordpressVersion: "6.8.2",
    phpVersion: "8.3.23",
    imagickVersion: "3.8.0",
    checkedAt,
    fieldStatus: {
      wordpressVersion: { state: "ok" },
      phpVersion: { state: "ok" },
      imagickVersion: { state: "ok" },
    },
  };
}

function failedSnapshot(
  domain: string,
  checkedAt: string,
): SiteStackPayload {
  return {
    domain,
    wordpressVersion: null,
    phpVersion: null,
    imagickVersion: null,
    checkedAt,
    fieldStatus: {
      wordpressVersion: { state: "unknown", reason: "runtime_probe_timeout" },
      phpVersion: { state: "unknown", reason: "runtime_probe_timeout" },
      imagickVersion: { state: "unknown", reason: "runtime_probe_timeout" },
    },
  };
}

function inMemoryState(initial: StackScheduleRecord[] = []) {
  let stored = new Map(initial.map((record) => [record.domain, { ...record }]));
  return {
    loadState: vi.fn(async () =>
      new Map([...stored].map(([key, record]) => [key, { ...record }])),
    ),
    saveState: vi.fn(async (records: ReadonlyMap<string, StackScheduleRecord>) => {
      stored = new Map(
        [...records].map(([key, record]) => [key, { ...record }]),
      );
    }),
  };
}

describe("per-domain stack scheduler", () => {
  it("forces every active domain due on startup, then schedules success +6h", async () => {
    let currentMs = Date.parse("2026-08-19T12:00:00.000Z");
    const state = inMemoryState([
      {
        domain: "example.com",
        lastStackCheckedAt: "2026-08-19T11:00:00.000Z",
        lastAttemptAt: "2026-08-19T11:00:00.000Z",
        nextDueAt: "2026-08-19T17:00:00.000Z",
        retryAttempt: 0,
      },
    ]);

    const scheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 3,
      jitterMaxMs: 0,
      now: () => new Date(currentMs),
      probeDomain: async (domain) =>
        successfulSnapshot(domain, new Date(currentMs).toISOString()),
      ...state,
    });

    await scheduler.initialize(["example.com"], { forceDue: true });
    expect(scheduler.getRecord("example.com")?.nextDueAt).toBe(
      "2026-08-19T12:00:00.000Z",
    );

    await scheduler.refreshNow(["example.com"], "startup");
    expect(scheduler.getRecord("example.com")).toMatchObject({
      lastStackCheckedAt: "2026-08-19T12:00:00.000Z",
      nextDueAt: "2026-08-19T18:00:00.000Z",
      retryAttempt: 0,
    });
  });

  it("probes only domains whose individual nextDueAt has passed", async () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const state = inMemoryState([
      {
        domain: "due.example.com",
        lastStackCheckedAt: "2026-08-19T06:00:00.000Z",
        lastAttemptAt: "2026-08-19T06:00:00.000Z",
        nextDueAt: "2026-08-19T12:00:00.000Z",
        retryAttempt: 0,
      },
      {
        domain: "later.example.com",
        lastStackCheckedAt: "2026-08-19T10:00:00.000Z",
        lastAttemptAt: "2026-08-19T10:00:00.000Z",
        nextDueAt: "2026-08-19T16:00:00.000Z",
        retryAttempt: 0,
      },
    ]);
    const probeDomain = vi.fn(async (domain: string) =>
      successfulSnapshot(domain, now.toISOString()),
    );

    const scheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 3,
      jitterMaxMs: 0,
      now: () => now,
      probeDomain,
      ...state,
    });

    const result = await scheduler.runDue([
      "due.example.com",
      "later.example.com",
    ]);

    expect(result.attemptedDomains).toEqual(["due.example.com"]);
    expect(probeDomain).toHaveBeenCalledTimes(1);
    expect(probeDomain).toHaveBeenCalledWith("due.example.com");
  });

  it("limits concurrent probes", async () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const state = inMemoryState();
    let active = 0;
    let maxActive = 0;
    const releases: Array<() => void> = [];

    const scheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 3,
      jitterMaxMs: 0,
      now: () => now,
      probeDomain: async (domain) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise<void>((resolve) => releases.push(resolve));
        active -= 1;
        return successfulSnapshot(domain, now.toISOString());
      },
      ...state,
    });

    const domains = Array.from({ length: 7 }, (_, index) => `site${index}.example.com`);
    await scheduler.initialize(domains);
    const pending = scheduler.refreshNow(domains, "startup");

    await vi.waitFor(() => expect(releases.length).toBe(3));
    while (releases.length > 0) {
      releases.shift()?.();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    await pending;

    expect(maxActive).toBe(3);
  });

  it("applies jitter only to bulk scheduled refreshes", async () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const state = inMemoryState();
    const sleep = vi.fn(async () => undefined);

    const scheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 1,
      jitterMaxMs: 30_000,
      random: () => 0.5,
      sleep,
      now: () => now,
      probeDomain: async (domain) => successfulSnapshot(domain, now.toISOString()),
      ...state,
    });

    await scheduler.initialize(["a.example.com", "b.example.com"]);
    await scheduler.runDue(["a.example.com", "b.example.com"]);
    expect(sleep).toHaveBeenCalledTimes(2);

    sleep.mockClear();
    await scheduler.refreshNow(["a.example.com"], "manual");
    expect(sleep).not.toHaveBeenCalled();
  });

  it("uses bounded retries after scheduled probe failures", async () => {
    let currentMs = Date.parse("2026-08-19T12:00:00.000Z");
    const state = inMemoryState();
    const scheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 1,
      jitterMaxMs: 0,
      maxRetries: 2,
      retryBackoffMs: [60_000, 300_000],
      now: () => new Date(currentMs),
      probeDomain: async (domain) =>
        failedSnapshot(domain, new Date(currentMs).toISOString()),
      ...state,
    });

    await scheduler.initialize(["example.com"]);

    await scheduler.runDue(["example.com"]);
    expect(scheduler.getRecord("example.com")).toMatchObject({
      retryAttempt: 1,
      nextDueAt: "2026-08-19T12:01:00.000Z",
      lastStackCheckedAt: null,
    });

    currentMs += 60_000;
    await scheduler.runDue(["example.com"]);
    expect(scheduler.getRecord("example.com")).toMatchObject({
      retryAttempt: 2,
      nextDueAt: "2026-08-19T12:06:00.000Z",
    });

    currentMs += 300_000;
    await scheduler.runDue(["example.com"]);
    expect(scheduler.getRecord("example.com")).toMatchObject({
      retryAttempt: 0,
      nextDueAt: "2026-08-19T18:06:00.000Z",
      lastStackCheckedAt: null,
    });
  });

  it("does not move the automatic due time after a failed manual refresh", async () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const originalDue = "2026-08-19T17:00:00.000Z";
    const state = inMemoryState([
      {
        domain: "example.com",
        lastStackCheckedAt: "2026-08-19T11:00:00.000Z",
        lastAttemptAt: "2026-08-19T11:00:00.000Z",
        nextDueAt: originalDue,
        retryAttempt: 0,
      },
    ]);

    const scheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 1,
      jitterMaxMs: 0,
      now: () => now,
      probeDomain: async (domain) => failedSnapshot(domain, now.toISOString()),
      ...state,
    });

    await scheduler.initialize(["example.com"]);
    await scheduler.refreshNow(["example.com"], "manual");

    expect(scheduler.getRecord("example.com")).toMatchObject({
      lastStackCheckedAt: "2026-08-19T11:00:00.000Z",
      lastAttemptAt: "2026-08-19T12:00:00.000Z",
      nextDueAt: originalDue,
      retryAttempt: 0,
    });
  });

  it("removes schedule records for domains no longer active", async () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const state = inMemoryState();
    const scheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 1,
      jitterMaxMs: 0,
      now: () => now,
      probeDomain: async (domain) => successfulSnapshot(domain, now.toISOString()),
      ...state,
    });

    await scheduler.initialize(["a.example.com", "b.example.com"]);
    await scheduler.syncDomains(["b.example.com"]);

    expect(scheduler.getRecord("a.example.com")).toBeNull();
    expect(scheduler.getRecord("b.example.com")).not.toBeNull();
  });
});
