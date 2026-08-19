import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HostIdentity } from "./discovery.js";
import { loadTestConfig } from "./test-helpers.js";

vi.mock("./traffic.js", () => ({
  ensureTrafficTails: vi.fn().mockResolvedValue(undefined),
  collectActiveVisitors3m: vi.fn(),
}));

import { createEngine } from "./engine.js";
import {
  collectActiveVisitors3m,
  ensureTrafficTails,
} from "./traffic.js";

const identity: HostIdentity = {
  agentInstanceId: "agent-instance-int-1",
  domains: [
    {
      domain: "example.com",
      source: "openlitespeed",
      aliases: ["www.example.com"],
      virtualHostName: "example-vhost",
    },
  ],
};

describe("engine Step 5 OLS-only discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadTestConfig();

    vi.mocked(collectActiveVisitors3m).mockReturnValue([
      {
        domain: "example.com",
        uniqueIpCount: 3,
        windowSeconds: 180,
        windowStartedAt: "2026-08-19T11:57:00.000Z",
        measuredAt: "2026-08-19T12:00:00.000Z",
        status: { state: "ok" },
      },
    ]);
  });

  it("builds discovery from OLS inventory without legacy stack enrichment", async () => {
    const engine = createEngine(identity, "secret", {
      autoStart: false,
      now: () => new Date("2026-08-19T12:00:00.000Z"),
      sendHeartbeat: vi.fn().mockResolvedValue({}),
      sendIngest: vi.fn().mockResolvedValue({}),
    });

    const payload = await engine.buildIngestPayload();

    expect(payload.agentInstanceId).toBe("agent-instance-int-1");
    expect(payload.discoveries).toEqual([
      {
        domain: "example.com",
        aliases: ["www.example.com"],
        virtualHostName: "example-vhost",
        source: "openlitespeed",
        discoveredAt: "2026-08-19T12:00:00.000Z",
      },
    ]);

    expect(payload.stackSnapshots).toBeUndefined();
    expect(ensureTrafficTails).toHaveBeenCalledWith(["example.com"]);
    expect(collectActiveVisitors3m).toHaveBeenCalledWith(["example.com"]);

    engine.stop();
  });
});
