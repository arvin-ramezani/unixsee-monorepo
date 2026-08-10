import { beforeEach, describe, expect, it, vi } from "vitest";

import { AgentApiError } from "./api/client.js";
import { createEngine } from "./engine.js";
import type { HostIdentity } from "./discovery.js";
import { loadTestConfig } from "./test-helpers.js";

const identity: HostIdentity = {
  machineId: "machine-1",
  domains: [
    {
      domain: "example.com",
      documentRoot: "/home/u/domains/example.com/public_html",
      owner: "u",
      appType: "wordpress",
      source: "openlitespeed",
      aliases: [],
    },
  ],
};

describe("engine queue ack", () => {
  beforeEach(() => {
    loadTestConfig();
  });

  it("acks only successfully sent payloads on partial failure", async () => {
    const sendIngest = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValue(new Error("network down"));

    const clearSecret = vi.fn().mockResolvedValue(undefined);
    const engine = createEngine(identity, "secret", {
      autoStart: false,
      sendIngest,
      clearSecret,
      sendHeartbeat: vi.fn().mockResolvedValue({}),
    });

    engine.enqueue({ id: 1 });
    engine.enqueue({ id: 2 });
    await engine.flushQueue();

    expect(sendIngest).toHaveBeenCalledTimes(2);
    expect(engine.getQueueLength()).toBe(1);

    await engine.flushQueue();
    expect(engine.getQueueLength()).toBe(1);
    expect(sendIngest).toHaveBeenCalledTimes(3);
    engine.stop();
  });

  it("clears secret and stops on 401 without removing remaining items", async () => {
    const sendIngest = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new AgentApiError("unauthorized", 401, ""));

    const clearSecret = vi.fn().mockResolvedValue(undefined);
    const engine = createEngine(identity, "secret", {
      autoStart: false,
      sendIngest,
      clearSecret,
      sendHeartbeat: vi.fn().mockResolvedValue({}),
    });

    engine.enqueue({ id: 1 });
    engine.enqueue({ id: 2 });
    await engine.flushQueue();

    expect(clearSecret).toHaveBeenCalledTimes(1);
    expect(engine.isSecretInvalidated()).toBe(true);
    expect(engine.getActiveSecret()).toBeNull();
    expect(engine.getQueueLength()).toBe(1);

    await engine.flushQueue();
    expect(sendIngest).toHaveBeenCalledTimes(2);
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
