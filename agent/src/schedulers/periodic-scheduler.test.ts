import { describe, expect, it, vi } from "vitest";

import { createPeriodicScheduler } from "./periodic-scheduler.js";

describe("createPeriodicScheduler", () => {
  it("does not overlap executions of the same scheduler", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const task = vi.fn(async () => gate);
    const skipped = vi.fn();

    const scheduler = createPeriodicScheduler({
      name: "stack",
      intervalMs: 60_000,
      task,
      onSkippedOverlap: skipped,
    });

    const first = scheduler.trigger();
    await Promise.resolve();
    await scheduler.trigger();

    expect(task).toHaveBeenCalledTimes(1);
    expect(skipped).toHaveBeenCalledWith("stack");

    release();
    await first;
    scheduler.stop();
  });

  it("keeps independent scheduler instances independent", async () => {
    const first = vi.fn().mockResolvedValue(undefined);
    const second = vi.fn().mockResolvedValue(undefined);

    const heartbeat = createPeriodicScheduler({
      name: "heartbeat",
      intervalMs: 30_000,
      task: first,
    });
    const discovery = createPeriodicScheduler({
      name: "discovery",
      intervalMs: 600_000,
      task: second,
    });

    await Promise.all([heartbeat.trigger(), discovery.trigger()]);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    heartbeat.stop();
    discovery.stop();
  });
});
