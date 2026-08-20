import { beforeEach, describe, expect, it, vi } from "vitest";

import { AgentApiError } from "./api/client.js";
import type { Phase1IngestPayload } from "./contracts/phase1-ingest.js";
import { createEngine } from "./engine.js";
import type { HostIdentity } from "./discovery.js";
import { loadTestConfig } from "./test-helpers.js";

const identity: HostIdentity = {
  agentInstanceId: "agent-instance-1",
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

function activePayload(count: number): Phase1IngestPayload {
  return {
    schemaVersion: "phase1",
    agentInstanceId: identity.agentInstanceId,
    agentVersion: "0.1.0",
    sentAt: "2026-08-19T12:00:00.000Z",
    activeVisitors3m: [
      {
        domain: "example.com",
        uniqueVisitorCount: count,
        windowSeconds: 180,
        windowStartedAt: "2026-08-19T11:57:00.000Z",
        measuredAt: "2026-08-19T12:00:00.000Z",
        status: { state: "ok" },
      },
    ],
  };
}

function discoveryPayload(): Phase1IngestPayload {
  return {
    schemaVersion: "phase1",
    agentInstanceId: identity.agentInstanceId,
    agentVersion: "0.1.0",
    sentAt: "2026-08-19T12:00:00.000Z",
    discoveries: [
      {
        domain: "example.com",
        aliases: ["www.example.com"],
        virtualHostName: "example-vhost",
        source: "openlitespeed",
        discoveredAt: "2026-08-19T12:00:00.000Z",
      },
    ],
  };
}

describe("engine typed offline queue", () => {
  beforeEach(() => {
    loadTestConfig();
  });

  it("coalesces stale active samples while offline", async () => {
    const sendIngest = vi.fn().mockRejectedValue(new Error("network down"));
    const engine = createEngine(identity, "secret", {
      autoStart: false,
      sendIngest,
      clearSecret: vi.fn().mockResolvedValue(undefined),
      sendHeartbeat: vi.fn().mockResolvedValue({}),
    });

    for (let count = 1; count <= 100; count += 1) {
      engine.enqueue(activePayload(count));
    }

    expect(engine.getQueueLength()).toBe(1);
    await engine.flushQueue();
    expect(engine.getQueueLength()).toBe(1);
    expect(sendIngest).toHaveBeenCalledTimes(1);
    expect(
      (sendIngest.mock.calls[0]?.[0] as Phase1IngestPayload)
        .activeVisitors3m?.[0]?.uniqueVisitorCount,
    ).toBe(100);
    engine.stop();
  });

  it("acks only the successfully sent typed section on partial failure", async () => {
    const sendIngest = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValue(new Error("network down"));

    const engine = createEngine(identity, "secret", {
      autoStart: false,
      sendIngest,
      clearSecret: vi.fn().mockResolvedValue(undefined),
      sendHeartbeat: vi.fn().mockResolvedValue({}),
    });

    engine.enqueue(activePayload(2));
    engine.enqueue(discoveryPayload());
    await engine.flushQueue();

    // Discovery has higher priority and was ACKed. Active remains pending.
    expect(sendIngest).toHaveBeenCalledTimes(2);
    expect(
      (sendIngest.mock.calls[0]?.[0] as Phase1IngestPayload).discoveries,
    ).toBeDefined();
    expect(engine.getQueueLength()).toBe(1);

    await engine.flushQueue();
    expect(engine.getQueueLength()).toBe(1);
    expect(sendIngest).toHaveBeenCalledTimes(3);
    engine.stop();
  });

  it("clears secret and stops on 401 without ACKing the rejected section", async () => {
    const sendIngest = vi
      .fn()
      .mockRejectedValueOnce(new AgentApiError("unauthorized", 401, ""));

    const clearSecret = vi.fn().mockResolvedValue(undefined);
    const engine = createEngine(identity, "secret", {
      autoStart: false,
      sendIngest,
      clearSecret,
      sendHeartbeat: vi.fn().mockResolvedValue({}),
    });

    engine.enqueue(activePayload(1));
    await engine.flushQueue();

    expect(clearSecret).toHaveBeenCalledTimes(1);
    expect(engine.isSecretInvalidated()).toBe(true);
    expect(engine.getActiveSecret()).toBeNull();
    expect(engine.getQueueLength()).toBe(1);

    await engine.flushQueue();
    expect(sendIngest).toHaveBeenCalledTimes(1);
    engine.stop();
  });

  it("invalidates secret on heartbeat 401", async () => {
    const clearSecret = vi.fn().mockResolvedValue(undefined);
    const engine = createEngine(identity, "secret", {
      autoStart: false,
      clearSecret,
      sendIngest: vi.fn(),
      sendHeartbeat: vi
        .fn()
        .mockRejectedValue(new AgentApiError("unauthorized", 401, "")),
    });

    await engine.runHeartbeat();
    expect(clearSecret).toHaveBeenCalled();
    expect(engine.isSecretInvalidated()).toBe(true);
    engine.stop();
  });
});
