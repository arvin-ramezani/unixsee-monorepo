import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HostIdentity } from "./discovery.js";
import { createEngine } from "./engine.js";
import { createStackScheduler } from "./schedulers/stack-scheduler.js";
import { loadTestConfig } from "./test-helpers.js";

const initialIdentity: HostIdentity = {
  agentInstanceId: "agent-instance-int-1",
  domains: [
    {
      domain: "example.com",
      source: "openlitespeed",
      aliases: ["www.example.com"],
      virtualHostName: "example-vhost",
    },
  ],
  discoveryChanges: {
    added: [],
    removed: [],
    recovered: [],
    retainedMissing: [],
  },
};

describe("engine independent schedulers", () => {
  beforeEach(() => {
    loadTestConfig();
  });

  it("builds each ingest section independently", async () => {
    const ensureTrafficTails = vi.fn().mockResolvedValue(undefined);
    const collectActiveVisitors3m = vi.fn().mockReturnValue([
      {
        domain: "example.com",
        uniqueVisitorCount: 3,
        windowSeconds: 180,
        windowStartedAt: "2026-08-19T11:57:00.000Z",
        measuredAt: "2026-08-19T12:00:00.000Z",
        status: { state: "ok" },
      },
    ]);
    const collectVisitors24h = vi.fn().mockResolvedValue([
      {
        domain: "example.com",
        uniqueVisitors24h: 487,
        windowSeconds: 86400,
        coverageSeconds: 7200,
        measuredAt: "2026-08-19T12:00:00.000Z",
        algorithm: "hll",
        status: { state: "unknown", reason: "warming_up" },
      },
    ]);
    const enrichSiteStack = vi.fn().mockResolvedValue([
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
    ]);

    const engine = createEngine(initialIdentity, "secret", {
      autoStart: false,
      now: () => new Date("2026-08-19T12:00:00.000Z"),
      sendHeartbeat: vi.fn().mockResolvedValue({}),
      sendIngest: vi.fn().mockResolvedValue({}),
      ensureTrafficTails,
      collectActiveVisitors3m,
      collectVisitors24h,
      enrichSiteStack,
    });

    expect(engine.buildDiscoveryPayload()).toMatchObject({
      agentInstanceId: "agent-instance-int-1",
      discoveries: [
        {
          domain: "example.com",
          aliases: ["www.example.com"],
          virtualHostName: "example-vhost",
          source: "openlitespeed",
        },
      ],
    });

    const stackPayload = await engine.buildStackPayload();
    expect(stackPayload.discoveries).toBeUndefined();
    expect(stackPayload.stackSnapshots).toEqual([
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
    ]);

    const activePayload = await engine.buildActiveVisitorsPayload();
    expect(activePayload.discoveries).toBeUndefined();
    expect(activePayload.activeVisitors3m?.[0]?.uniqueVisitorCount).toBe(3);

    const visitors24hPayload = await engine.buildVisitors24hPayload();
    expect(visitors24hPayload.discoveries).toBeUndefined();
    expect(visitors24hPayload.visitors24h?.[0]?.uniqueVisitors24h).toBe(487);

    engine.stop();
  });

  it("runs an immediate stack refresh only for newly discovered domains", async () => {
    const addedDomain = {
      domain: "new.example.com",
      aliases: [],
      virtualHostName: "new-example-vhost",
      source: "openlitespeed" as const,
    };

    const refreshedIdentity: HostIdentity = {
      agentInstanceId: initialIdentity.agentInstanceId,
      domains: [...initialIdentity.domains, addedDomain],
      discoveryChanges: {
        added: [addedDomain],
        removed: [],
        recovered: [],
        retainedMissing: [],
      },
    };

    const sendIngest = vi.fn().mockResolvedValue({});
    const enrichSiteStack = vi.fn().mockImplementation(async (domains) =>
      domains.map((domain: { domain: string }) => ({
        domain: domain.domain,
        wordpressVersion: null,
        phpVersion: "8.3.23",
        imagickVersion: null,
        checkedAt: "2026-08-19T12:10:00.000Z",
        fieldStatus: {
          wordpressVersion: {
            state: "unsupported" as const,
            reason: "wordpress_not_detected" as const,
          },
          phpVersion: { state: "ok" as const },
          imagickVersion: {
            state: "unsupported" as const,
            reason: "imagick_missing" as const,
          },
        },
      })),
    );

    const stackScheduler = createStackScheduler({
      intervalMs: 21_600_000,
      concurrency: 3,
      jitterMaxMs: 0,
      now: () => new Date("2026-08-19T12:10:00.000Z"),
      loadState: async () => new Map(),
      saveState: async () => undefined,
      probeDomain: async (domain) => {
        const discovered = refreshedIdentity.domains.find(
          (candidate) => candidate.domain === domain,
        );
        if (!discovered) throw new Error(`missing test domain ${domain}`);
        const [snapshot] = await enrichSiteStack([discovered]);
        if (!snapshot) throw new Error(`missing test snapshot ${domain}`);
        return snapshot;
      },
    });

    const engine = createEngine(initialIdentity, "secret", {
      autoStart: false,
      now: () => new Date("2026-08-19T12:10:00.000Z"),
      sendHeartbeat: vi.fn().mockResolvedValue({}),
      sendIngest,
      initializeIdentity: vi.fn().mockResolvedValue(refreshedIdentity),
      ensureTrafficTails: vi.fn().mockResolvedValue(undefined),
      enrichSiteStack,
      stackScheduler,
    });

    await engine.runDiscovery();

    expect(enrichSiteStack).toHaveBeenCalledTimes(1);
    expect(enrichSiteStack).toHaveBeenCalledWith([addedDomain]);
    expect(sendIngest).toHaveBeenCalledTimes(2);

    const firstPayload = sendIngest.mock.calls[0]?.[0] as {
      discoveries?: unknown[];
    };
    const secondPayload = sendIngest.mock.calls[1]?.[0] as {
      stackSnapshots?: Array<{ domain: string }>;
    };

    expect(firstPayload.discoveries).toHaveLength(2);
    expect(secondPayload.stackSnapshots).toEqual([
      expect.objectContaining({ domain: "new.example.com" }),
    ]);

    engine.stop();
  });
});
