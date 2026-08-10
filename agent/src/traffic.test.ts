import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  collectActiveVisitors3m,
  ensureTrafficTails,
  resetTrafficStateForTests,
} from "./traffic.js";
import { loadTestConfig } from "./test-helpers.js";

describe("traffic active visitors", () => {
  let logDir: string;

  beforeEach(async () => {
    resetTrafficStateForTests();
    logDir = await mkdtemp(join(tmpdir(), "unixsee-agent-logs-"));
    loadTestConfig({ ACCESS_LOG_DIR: logDir });
  });

  afterEach(() => {
    resetTrafficStateForTests();
  });

  it("marks missing logs as unsupported with zero count", async () => {
    await ensureTrafficTails(["missing.example"]);
    const samples = collectActiveVisitors3m(["missing.example"]);
    expect(samples).toHaveLength(1);
    expect(samples[0]?.uniqueIpCount).toBe(0);
    expect(samples[0]?.status).toEqual({
      state: "unsupported",
      reason: "log_missing",
    });
  });

  it("counts unique IPs from a readable access log", async () => {
    const now = new Date();
    const stamp = now.toISOString().replace("T", ":").slice(0, 20) + "0000]";
    // Common Log Format date: [09/Aug/2026:12:00:00 +0000]
    const day = String(now.getUTCDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[now.getUTCMonth()];
    const year = now.getUTCFullYear();
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    const s = String(now.getUTCSeconds()).padStart(2, "0");
    const dateToken = `[${day}/${month}/${year}:${h}:${m}:${s} +0000]`;

    const lines = [
      `1.1.1.1 - - ${dateToken} "GET / HTTP/1.1" 200 100`,
      `2.2.2.2 - - ${dateToken} "GET /a HTTP/1.1" 200 100`,
      `1.1.1.1 - - ${dateToken} "GET /b HTTP/1.1" 200 100`,
    ].join("\n");

    await writeFile(join(logDir, "shop.example.log"), `${lines}\n`);
    await ensureTrafficTails(["shop.example"]);
    const samples = collectActiveVisitors3m(["shop.example"]);
    expect(samples[0]?.uniqueIpCount).toBe(2);
    expect(samples[0]?.status?.state).toBe("ok");
    void stamp;
  });

  it("closes watchers when domains are removed", async () => {
    await mkdir(logDir, { recursive: true });
    await writeFile(join(logDir, "a.example.log"), "");
    await ensureTrafficTails(["a.example"]);
    await ensureTrafficTails([]);
    const samples = collectActiveVisitors3m(["a.example"]);
    expect(samples[0]?.status?.reason).toBe("log_not_initialized");
  });
});
