import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { loadTestConfig } from "../test-helpers.js";
import {
  loadStackScheduleState,
  saveStackScheduleState,
  stackScheduleStateConstants,
} from "./stack-schedule-state.js";

const cleanup: string[] = [];

afterEach(async () => {
  delete process.env.UNIXSEE_AGENT_STATE_DIR;
  await Promise.all(cleanup.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("stack schedule persistence", () => {
  it("persists only per-domain scheduling metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "unixsee-stack-schedule-"));
    cleanup.push(root);
    process.env.UNIXSEE_AGENT_STATE_DIR = root;
    loadTestConfig();

    await saveStackScheduleState(
      new Map([
        [
          "example.com",
          {
            domain: "example.com",
            lastStackCheckedAt: "2026-08-19T12:00:00.000Z",
            lastAttemptAt: "2026-08-19T12:00:00.000Z",
            nextDueAt: "2026-08-19T18:00:00.000Z",
            retryAttempt: 0,
          },
        ],
      ]),
    );

    const loaded = await loadStackScheduleState();
    expect(loaded.get("example.com")).toMatchObject({
      lastStackCheckedAt: "2026-08-19T12:00:00.000Z",
      nextDueAt: "2026-08-19T18:00:00.000Z",
    });

    const raw = await readFile(
      join(root, stackScheduleStateConstants.fileName),
      "utf8",
    );
    expect(raw).not.toContain("/home/");
    expect(raw).not.toContain("wp-config");
    expect(raw).not.toContain("runtime-probe-secret");
  });
});
