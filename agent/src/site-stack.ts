import http from "node:http";
import https from "node:https";
import type { AppConfig } from "./config/config.js";
import type {
  FieldStatus,
  SiteStackSnapshot,
} from "./contracts/phase1-ingest.js";

const VERSION = /^[0-9A-Za-z][0-9A-Za-z.+_-]{0,63}$/;
const status = (state: FieldStatus["state"], reason?: string): FieldStatus => ({
  state,
  ...(reason ? { reason } : {}),
});
const value = (input: unknown) =>
  typeof input === "string" && VERSION.test(input) ? input : null;

export function validateProbeResponse(
  domain: string,
  input: unknown,
): SiteStackSnapshot {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("probe_invalid_json");
  const body = input as Record<string, unknown>;
  if (
    typeof body.checkedAt !== "string" ||
    !Number.isFinite(Date.parse(body.checkedAt))
  )
    throw new Error("probe_invalid_checked_at");
  const wordpressVersion = value(body.wordpressVersion);
  const phpVersion = value(body.phpVersion);
  const imagickVersion = value(body.imagickVersion);
  return {
    domain,
    wordpressVersion,
    phpVersion,
    imagickVersion,
    checkedAt: new Date(body.checkedAt).toISOString(),
    fieldStatus: {
      wordpressVersion: wordpressVersion
        ? status("ok")
        : status("unknown", "not_reported"),
      phpVersion: phpVersion ? status("ok") : status("unknown", "not_reported"),
      imagickVersion: imagickVersion
        ? status("ok")
        : status("unsupported", "extension_not_loaded"),
    },
  };
}

export async function probeSiteStack(
  domain: string,
  config: AppConfig,
): Promise<SiteStackSnapshot> {
  const transport = config.probe.scheme === "https" ? https : http;
  return new Promise((resolve) => {
    const request = transport.request(
      {
        host: "127.0.0.1",
        port: config.probe.port,
        path: config.probe.path,
        method: "GET",
        headers: {
          Host: domain,
          "X-Unixsee-Probe-Secret": config.probe.secret,
          Accept: "application/json",
        },
        servername: domain,
        rejectUnauthorized: false,
        timeout: config.probe.timeoutMs,
      },
      (response) => {
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > 8192)
            request.destroy(new Error("probe_response_too_large"));
          else chunks.push(chunk);
        });
        response.on("end", () => {
          try {
            if (response.statusCode !== 200)
              throw new Error(`probe_http_${response.statusCode ?? 0}`);
            resolve(
              validateProbeResponse(
                domain,
                JSON.parse(Buffer.concat(chunks).toString("utf8")),
              ),
            );
          } catch (error) {
            const reason =
              error instanceof Error ? error.message : "probe_failed";
            resolve(failedSnapshot(domain, reason));
          }
        });
      },
    );
    request.on("timeout", () => request.destroy(new Error("probe_timeout")));
    request.on("error", (error) =>
      resolve(failedSnapshot(domain, error.message)),
    );
    request.end();
  });
}

export function failedSnapshot(
  domain: string,
  reason: string,
): SiteStackSnapshot {
  return {
    domain,
    wordpressVersion: null,
    phpVersion: null,
    imagickVersion: null,
    checkedAt: new Date().toISOString(),
    fieldStatus: {
      wordpressVersion: status("unknown", reason),
      phpVersion: status("unknown", reason),
      imagickVersion: status("unknown", reason),
    },
  };
}

export async function probeSiteStacks(
  domains: string[],
  config: AppConfig,
): Promise<SiteStackSnapshot[]> {
  const output: SiteStackSnapshot[] = [];
  let next = 0;
  await Promise.all(
    Array.from(
      { length: Math.min(config.probe.concurrency, domains.length) },
      async () => {
        while (next < domains.length) {
          const index = next++;
          output[index] = await probeSiteStack(domains[index], config);
        }
      },
    ),
  );
  return output;
}
