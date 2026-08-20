import { request } from "node:http";
import { isIP } from "node:net";

import { getConfig } from "../config/config.js";
import { parseRuntimeProbeResponse } from "./schema.js";
import type {
  FieldStatus,
  RuntimeProbeFailureReason,
  RuntimeProbeResponse,
  SiteStackPayload,
} from "./types.js";

const LOOPBACK_HOST = "127.0.0.1";
const RUNTIME_PROBE_PATH = "/.well-known/unixsee/runtime.php";
const MAX_RESPONSE_BYTES = 8 * 1024;

class RuntimeProbeTimeoutError extends Error {
  constructor() {
    super("Runtime probe timed out.");
    this.name = "RuntimeProbeTimeoutError";
  }
}

export class InvalidRuntimeProbeDomainError extends Error {
  constructor(domain: string) {
    super(`Invalid runtime-probe domain: ${domain}`);
    this.name = "InvalidRuntimeProbeDomainError";
  }
}

export interface RuntimeProbeClientOptions {
  /** Test/internal override only. The network destination remains loopback. */
  port?: number;
  /** Test/internal override only. Never supplied by NestJS commands. */
  secret?: string | null;
  /** Test/internal override only. */
  timeoutMs?: number;
  /** Test/internal clock override. */
  now?: () => Date;
}

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function isValidHostname(value: string): boolean {
  if (!value || value.length > 253 || value.includes(" ")) return false;
  if (value === "localhost" || isIP(value) !== 0) return false;
  if (value.includes("/") || value.includes("\\") || value.includes(":")) {
    return false;
  }

  const labels = value.split(".");
  if (labels.length < 2) return false;

  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );
}

function unknownStatus(reason: RuntimeProbeFailureReason): FieldStatus {
  return { state: "unknown", reason };
}

function failurePayload(
  domain: string,
  reason: RuntimeProbeFailureReason,
  checkedAt: string,
): SiteStackPayload {
  const status = unknownStatus(reason);
  return {
    domain,
    wordpressVersion: null,
    phpVersion: null,
    imagickVersion: null,
    checkedAt,
    fieldStatus: {
      wordpressVersion: status,
      phpVersion: status,
      imagickVersion: status,
    },
  };
}

function successPayload(
  domain: string,
  response: RuntimeProbeResponse,
): SiteStackPayload {
  const wordpressStatus: FieldStatus = response.wordpressVersion
    ? { state: "ok" }
    : { state: "unsupported", reason: "wordpress_not_detected" };

  const phpStatus: FieldStatus = response.phpVersion
    ? { state: "ok" }
    : { state: "unknown", reason: "php_version_missing" };

  const imagickStatus: FieldStatus = response.imagickVersion
    ? { state: "ok" }
    : { state: "unsupported", reason: "imagick_missing" };

  return {
    domain,
    wordpressVersion: response.wordpressVersion,
    phpVersion: response.phpVersion,
    imagickVersion: response.imagickVersion,
    checkedAt: response.checkedAt,
    fieldStatus: {
      wordpressVersion: wordpressStatus,
      phpVersion: phpStatus,
      imagickVersion: imagickStatus,
    },
  };
}

function readBoundedResponseBody(
  response: import("node:http").IncomingMessage,
): Promise<Buffer | null> {
  const contentLengthHeader = response.headers["content-length"];
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
      response.resume();
      return Promise.resolve(null);
    }
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    const finish = (value: Buffer | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    response.on("data", (chunk: Buffer | string) => {
      if (settled) return;
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.length;

      if (totalBytes > MAX_RESPONSE_BYTES) {
        finish(null);
        response.destroy();
        return;
      }

      chunks.push(buffer);
    });

    response.on("end", () => {
      finish(Buffer.concat(chunks, totalBytes));
    });

    response.on("error", (error) => {
      if (!settled) reject(error);
    });
  });
}

function performLocalProbe(
  domain: string,
  secret: string,
  port: number,
  timeoutMs: number,
): Promise<
  | { kind: "response"; statusCode: number; contentType: string; body: Buffer | null }
  | { kind: "timeout" }
  | { kind: "unreachable" }
> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (
      result:
        | {
            kind: "response";
            statusCode: number;
            contentType: string;
            body: Buffer | null;
          }
        | { kind: "timeout" }
        | { kind: "unreachable" },
    ) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const req = request(
      {
        protocol: "http:",
        hostname: LOOPBACK_HOST,
        port,
        method: "GET",
        path: RUNTIME_PROBE_PATH,
        headers: {
          Accept: "application/json",
          Connection: "close",
          Host: domain,
          "X-Unixsee-Probe-Secret": secret,
        },
      },
      (response) => {
        void (async () => {
          const body = await readBoundedResponseBody(response);
          finish({
            kind: "response",
            statusCode: response.statusCode ?? 0,
            contentType: String(response.headers["content-type"] ?? ""),
            body,
          });
        })().catch(() => finish({ kind: "unreachable" }));
      },
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new RuntimeProbeTimeoutError());
    });

    req.on("error", (error) => {
      if (error instanceof RuntimeProbeTimeoutError) {
        finish({ kind: "timeout" });
        return;
      }
      finish({ kind: "unreachable" });
    });

    req.end();
  });
}

function resolveFailureReason(
  result:
    | { kind: "timeout" }
    | { kind: "unreachable" }
    | {
        kind: "response";
        statusCode: number;
        contentType: string;
        body: Buffer | null;
      },
): RuntimeProbeFailureReason | null {
  if (result.kind === "timeout") return "runtime_probe_timeout";
  if (result.kind === "unreachable") return "runtime_probe_unreachable";

  if (result.statusCode === 401 || result.statusCode === 403) {
    return "runtime_probe_forbidden";
  }

  // Redirects are intentionally never followed. Missing/broken endpoints are
  // operationally unreachable; all other non-200 responses are invalid.
  if (result.statusCode === 404 || result.statusCode >= 500) {
    return "runtime_probe_unreachable";
  }
  if (result.statusCode !== 200) return "runtime_probe_invalid_response";
  if (!result.body) return "runtime_probe_invalid_response";
  if (!/^application\/json(?:\s*;|$)/i.test(result.contentType)) {
    return "runtime_probe_invalid_response";
  }

  return null;
}

/**
 * Probe exactly one locally discovered OLS vhost.
 *
 * The TCP destination and path are fixed. The validated domain is used only as
 * the HTTP Host header so OpenLiteSpeed selects the target vhost/LSPHP handler.
 * No URL/path from NestJS is accepted here.
 */
export async function probeSiteStack(
  rawDomain: string,
  options: RuntimeProbeClientOptions = {},
): Promise<SiteStackPayload> {
  const domain = normalizeHostname(rawDomain);
  if (!isValidHostname(domain)) {
    throw new InvalidRuntimeProbeDomainError(rawDomain);
  }

  const cfg = getConfig();
  const now = options.now ?? (() => new Date());
  const attemptedAt = now().toISOString();
  const secret = options.secret ?? cfg.runtimeProbeSecret;

  if (!secret) {
    return failurePayload(domain, "runtime_probe_not_configured", attemptedAt);
  }

  const port = options.port ?? cfg.runtimeProbePort;
  const timeoutMs = options.timeoutMs ?? cfg.runtimeProbeTimeoutMs;
  const result = await performLocalProbe(domain, secret, port, timeoutMs);
  const failureReason = resolveFailureReason(result);

  if (failureReason) {
    return failurePayload(domain, failureReason, attemptedAt);
  }

  if (result.kind !== "response" || !result.body) {
    return failurePayload(domain, "runtime_probe_invalid_response", attemptedAt);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(result.body.toString("utf8"));
  } catch {
    return failurePayload(domain, "runtime_probe_invalid_response", attemptedAt);
  }

  const parsed = parseRuntimeProbeResponse(decoded);
  if (!parsed) {
    return failurePayload(domain, "runtime_probe_invalid_response", attemptedAt);
  }

  return successPayload(domain, parsed);
}

export const runtimeProbeConstants = Object.freeze({
  loopbackHost: LOOPBACK_HOST,
  path: RUNTIME_PROBE_PATH,
  maxResponseBytes: MAX_RESPONSE_BYTES,
});
