import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HostIdentity } from "./discovery.js";
import { loadTestConfig } from "./test-helpers.js";

vi.mock("./site-stack.js", () => ({
  enrichSiteStack: vi.fn(),
}));

vi.mock("./traffic.js", () => ({
  ensureTrafficTails: vi.fn().mockResolvedValue(undefined),
  collectActiveVisitors3m: vi.fn(),
}));

import { createEngine } from "./engine.js";
import { enrichSiteStack } from "./site-stack.js";
import {
  collectActiveVisitors3m,
  ensureTrafficTails,
} from "./traffic.js";

const identity: HostIdentity = {
  agentInstanceId: "agent-instance-int-1",
  domains: [
    {
      domain: "example.com",
      documentRoot: "/home/u/domains/example.com/public_html",
      owner: "u",
      appType: "wordpress",
      source: "openlitespeed",
      aliases: ["example.com", "www.example.com"],
      virtualHostName: "example-vhost",
    },
    {
      domain: "legacy.example.net",
      documentRoot: "/home/u/domains/legacy.example.net/public_html",
      owner: "u",
      appType: "wordpress",
      source: "directadmin",
      aliases: ["www.legacy.example.net"],
    },
  ],
};

describe("engine Step 3 ingest separation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadTestConfig();

    vi.mocked(enrichSiteStack).mockResolvedValue([
      {
        domain: "example.com",
        aliases: ["www.example.com"],
        documentRoot: "/home/u/domains/example.com/public_html",
        owner: "u",
        appType: "wordpress",
        source: "openlitespeed",
        controlPanelUrl: "https://panel.example.com:2222",
        wordpressAdminUrl: "https://example.com/wp-admin/",
        wordpressVersion: "6.8.2",
        phpVersion: "8.3.23",
        phpVersionScope: "host",
        imagickVersion: "3.8.0",
        wordpressUpdateStatus: "up_to_date",
        wordpressUpdateCheckedAt: "2026-08-19T11:00:00.000Z",
        fieldStatus: {
          wordpressVersion: { state: "ok" },
          phpVersion: { state: "ok" },
          imagickVersion: { state: "ok" },
          controlPanelUrl: { state: "ok" },
          wordpressAdminUrl: { state: "ok" },
          wordpressUpdateStatus: { state: "ok" },
        },
      },
    ]);

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

  it("builds discovery inventory and stack snapshots as separate sections", async () => {
    const times = [
      new Date("2026-08-19T12:00:00.000Z"),
      new Date("2026-08-19T12:00:01.000Z"),
      new Date("2026-08-19T12:00:02.000Z"),
    ];
    let index = 0;

    const engine = createEngine(identity, "secret", {
      autoStart: false,
      now: () => times[Math.min(index++, times.length - 1)]!,
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

    expect(payload.discoveries?.[0]).not.toHaveProperty("documentRoot");
    expect(payload.discoveries?.[0]).not.toHaveProperty("wordpressVersion");
    expect(payload.discoveries?.[0]).not.toHaveProperty("controlPanelUrl");

    expect(payload.stackSnapshots).toEqual([
      {
        domain: "example.com",
        wordpressVersion: "6.8.2",
        phpVersion: "8.3.23",
        imagickVersion: "3.8.0",
        checkedAt: "2026-08-19T12:00:01.000Z",
        fieldStatus: {
          wordpressVersion: { state: "ok" },
          phpVersion: { state: "ok" },
          imagickVersion: { state: "ok" },
        },
      },
    ]);

    expect(payload.stackSnapshots?.[0]).not.toHaveProperty("documentRoot");
    expect(payload.stackSnapshots?.[0]).not.toHaveProperty("controlPanelUrl");
    expect(payload.stackSnapshots?.[0]).not.toHaveProperty("wordpressAdminUrl");
    expect(payload.stackSnapshots?.[0]).not.toHaveProperty("phpVersionScope");

    expect(enrichSiteStack).toHaveBeenCalledWith([identity.domains[0]]);
    expect(ensureTrafficTails).toHaveBeenCalledWith(["example.com"]);
    expect(collectActiveVisitors3m).toHaveBeenCalledWith(["example.com"]);

    engine.stop();
  });
});
