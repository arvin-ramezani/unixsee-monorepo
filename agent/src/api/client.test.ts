import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AgentApiError,
  postJson,
  postSignedJson,
  sendHeartbeat,
} from "./client.js";
import { loadTestConfig } from "../test-helpers.js";

describe("api client retries", () => {
  beforeEach(() => {
    loadTestConfig({ NODE_ENV: "production" });
    vi.stubGlobal("fetch", vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("retries on 503 then succeeds", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ok: true } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const pending = postJson({
      url: "https://api.test.local/x",
      body: { a: 1 },
      maxRetries: 3,
    });
    await vi.runAllTimersAsync();
    const result = await pending;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: { ok: true } });
  });

  it("retries on 429", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response("slow", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const pending = postJson({
      url: "https://api.test.local/x",
      body: {},
      maxRetries: 3,
    });
    await vi.runAllTimersAsync();
    await pending;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry on 401", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 401 }));

    await expect(
      postJson({
        url: "https://api.test.local/x",
        body: {},
        maxRetries: 3,
      }),
    ).rejects.toBeInstanceOf(AgentApiError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry on 400", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response("bad", { status: 400 }));

    await expect(
      postJson({
        url: "https://api.test.local/x",
        body: {},
        maxRetries: 3,
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("parses only allowlisted REFRESH_SITE_STACK commands from heartbeat", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            agent: { agentInstanceId: "agent-1", status: "ONLINE" },
            commands: [
              {
                id: "6e00ef4d-afc5-4324-9da0-169f2dc987ac",
                type: "REFRESH_SITE_STACK",
                domain: "example.com",
                expiresAt: "2026-08-19T12:10:00.000Z",
              },
              {
                id: "bad",
                type: "RUN_COMMAND",
                domain: "example.com",
                expiresAt: "2026-08-19T12:10:00.000Z",
              },
            ],
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const heartbeat = await sendHeartbeat("agent-1", "secret-key");
    expect(heartbeat.commands).toHaveLength(1);
    expect(heartbeat.commands[0]?.type).toBe("REFRESH_SITE_STACK");
  });

  it("sends HMAC signature headers", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await postSignedJson(
      "https://api.test.local/ingest",
      { agentInstanceId: "agent-1" },
      "secret-key",
    );

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Agent-Timestamp"]).toBeTruthy();
    expect(headers["X-Agent-Signature"]).toMatch(/^[a-f0-9]{64}$/);
  });
});
