import { afterEach, describe, expect, it, vi } from "vitest";
import { enrollAgent, postSignedJson, sendHeartbeat } from "./client.js";
import { loadTestConfig } from "../test-helpers.js";

afterEach(() => vi.unstubAllGlobals());
describe("v0.2 API client", () => {
  it("enrolls with agentInstanceId and never machineId", async () => {
    loadTestConfig({ NODE_ENV: "production" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { vpsNodeId: "vps", serverId: "server", secretKey: "secret" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await enrollAgent("e781f756-b614-4f11-89da-38a180c503e9", "token");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.agentInstanceId).toBeTruthy();
    expect(body.machineId).toBeUndefined();
  });
  it("signs heartbeat bodies containing no hostname", async () => {
    loadTestConfig({ NODE_ENV: "production" });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { agent: {}, commands: [] } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await sendHeartbeat("instance", "secret");
    const init = fetchMock.mock.calls[0][1];
    const body = JSON.parse(init.body as string);
    expect(body).not.toHaveProperty("hostname");
    expect(init.headers["X-Agent-Signature"]).toMatch(/^[0-9a-f]{64}$/);
  });
});
