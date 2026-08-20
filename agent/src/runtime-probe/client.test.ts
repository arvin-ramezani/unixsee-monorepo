import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadConfig, resetConfigForTests } from "../config/config.js";
import {
  InvalidRuntimeProbeDomainError,
  probeSiteStack,
  runtimeProbeConstants,
} from "./client.js";

const servers: Server[] = [];

async function listen(
  handler: Parameters<typeof createServer>[0],
): Promise<{ server: Server; port: number }> {
  const server = createServer(handler);
  servers.push(server);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  return {
    server,
    port: (server.address() as AddressInfo).port,
  };
}

beforeEach(() => {
  resetConfigForTests();
  loadConfig({
    NODE_ENV: "test",
    API_BASE_URL: "https://api.example.test",
  });
});

afterEach(async () => {
  resetConfigForTests();
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections?.();
          server.close(() => resolve());
        }),
    ),
  );
});

describe("protected local runtime probe", () => {
  it("uses only loopback + fixed path and selects the vhost with Host", async () => {
    const { port } = await listen((req, res) => {
      expect(req.url).toBe(runtimeProbeConstants.path);
      expect(req.headers.host).toBe("example.com");
      expect(req.headers["x-unixsee-probe-secret"]).toBe("probe-secret");

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          wordpressVersion: "6.8.2",
          phpVersion: "8.3.23",
          imagickVersion: "3.8.0",
          checkedAt: "2026-08-19T12:00:00.000Z",
        }),
      );
    });

    const result = await probeSiteStack("Example.COM.", {
      port,
      secret: "probe-secret",
    });

    expect(runtimeProbeConstants.loopbackHost).toBe("127.0.0.1");
    expect(result).toEqual({
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
    });
  });

  it("maps missing WordPress and Imagick without fabricating versions", async () => {
    const { port } = await listen((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          wordpressVersion: null,
          phpVersion: "8.3.23",
          imagickVersion: null,
          checkedAt: "2026-08-19T12:00:00.000Z",
        }),
      );
    });

    const result = await probeSiteStack("example.com", {
      port,
      secret: "probe-secret",
    });

    expect(result.wordpressVersion).toBeNull();
    expect(result.imagickVersion).toBeNull();
    expect(result.fieldStatus.wordpressVersion).toEqual({
      state: "unsupported",
      reason: "wordpress_not_detected",
    });
    expect(result.fieldStatus.imagickVersion).toEqual({
      state: "unsupported",
      reason: "imagick_missing",
    });
  });

  it("returns forbidden status for 403", async () => {
    const { port } = await listen((_req, res) => {
      res.writeHead(403);
      res.end();
    });

    const result = await probeSiteStack("example.com", {
      port,
      secret: "wrong-secret",
      now: () => new Date("2026-08-19T12:00:00.000Z"),
    });

    expect(result.fieldStatus.phpVersion).toEqual({
      state: "unknown",
      reason: "runtime_probe_forbidden",
    });
    expect(result.checkedAt).toBe("2026-08-19T12:00:00.000Z");
  });

  it("times out without hanging the domain", async () => {
    const { port } = await listen(() => {
      // Deliberately never respond.
    });

    const result = await probeSiteStack("example.com", {
      port,
      secret: "probe-secret",
      timeoutMs: 25,
    });

    expect(result.fieldStatus.wordpressVersion.reason).toBe(
      "runtime_probe_timeout",
    );
  });

  it("does not follow redirects", async () => {
    const { port } = await listen((_req, res) => {
      res.writeHead(302, { Location: "http://attacker.invalid/" });
      res.end();
    });

    const result = await probeSiteStack("example.com", {
      port,
      secret: "probe-secret",
    });

    expect(result.fieldStatus.phpVersion.reason).toBe(
      "runtime_probe_invalid_response",
    );
  });

  it("rejects invalid JSON and oversized responses", async () => {
    const invalid = await listen((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("{broken-json");
    });

    const invalidResult = await probeSiteStack("example.com", {
      port: invalid.port,
      secret: "probe-secret",
    });
    expect(invalidResult.fieldStatus.phpVersion.reason).toBe(
      "runtime_probe_invalid_response",
    );

    const oversized = await listen((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("x".repeat(runtimeProbeConstants.maxResponseBytes + 1));
    });

    const oversizedResult = await probeSiteStack("example.com", {
      port: oversized.port,
      secret: "probe-secret",
    });
    expect(oversizedResult.fieldStatus.phpVersion.reason).toBe(
      "runtime_probe_invalid_response",
    );
  });

  it("returns not-configured instead of attempting network access without a secret", async () => {
    const result = await probeSiteStack("example.com", {
      secret: null,
      now: () => new Date("2026-08-19T12:00:00.000Z"),
    });

    expect(result.fieldStatus.phpVersion).toEqual({
      state: "unknown",
      reason: "runtime_probe_not_configured",
    });
  });

  it("rejects non-hostname input before making a request", async () => {
    await expect(
      probeSiteStack("http://example.com/anything", {
        secret: "probe-secret",
      }),
    ).rejects.toBeInstanceOf(InvalidRuntimeProbeDomainError);
  });
});
