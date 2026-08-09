import { generatePayloadSignature } from "../security.js";
import { config } from "../config/config.js";

export class AgentApiError extends Error {
  readonly status: number;
  readonly bodyText: string;

  constructor(message: string, status: number, bodyText: string) {
    super(message);
    this.name = "AgentApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

interface PostJsonOptions {
  url: string;
  body: unknown;
  headers?: Record<string, string>;
  maxRetries?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

export async function postJson({
  url,
  body,
  headers = {},
  maxRetries = 3,
}: PostJsonOptions): Promise<unknown> {
  const payloadString = JSON.stringify(body);
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (config.nodeEnv !== "production") {
        console.log(`[Network-Dev] Mocking POST ${url}`);
        await sleep(100);
        return null;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: payloadString,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new AgentApiError(
          `HTTP Status ${response.status}`,
          response.status,
          bodyText,
        );
      }

      return await parseJsonResponse(response);
    } catch (error) {
      attempt += 1;
      if (attempt >= maxRetries || (error instanceof AgentApiError && error.status < 500 && error.status !== 429)) {
        throw error;
      }

      const baseDelay = Math.pow(2, attempt) * 1000;
      const jitteredDelay = baseDelay + Math.random() * 500;
      console.warn(
        `[Network] Request failed. Retrying in ${Math.round(jitteredDelay)}ms... (Attempt ${attempt}/${maxRetries})`,
      );
      await sleep(jitteredDelay);
    }
  }

  throw new Error(`Failed to POST ${url}`);
}

export async function postSignedJson(
  url: string,
  body: unknown,
  secretKey: string,
  maxRetries = 3,
): Promise<unknown> {
  const payloadString = JSON.stringify(body);
  const timestamp = new Date().toISOString();
  const signature = generatePayloadSignature(payloadString, secretKey, timestamp);

  return postJson({
    url,
    body,
    maxRetries,
    headers: {
      "X-Agent-Timestamp": timestamp,
      "X-Agent-Signature": signature,
    },
  });
}

export interface EnrollResult {
  vpsNodeId: string;
  serverId: string;
  secretKey: string;
}

export async function enrollAgent(
  machineId: string,
  enrollmentToken: string,
): Promise<EnrollResult> {
  if (config.nodeEnv !== "production") {
    console.log(
      `[Network-Dev] Mocking enrollment for machineId=${machineId} at ${config.endpoints.enroll}`,
    );
    return {
      vpsNodeId: "dev-vps-node-id",
      serverId: "dev-server-id",
      secretKey: "mock_development_enrolled_secret_key",
    };
  }

  const response = await postJson({
    url: config.endpoints.enroll,
    body: { machineId },
    maxRetries: 2,
    headers: {
      "X-Enrollment-Token": enrollmentToken,
    },
  });

  if (!isRecord(response) || !isRecord(response.data)) {
    throw new Error("Enrollment response missing data payload.");
  }

  const secretKey = response.data.secretKey;
  const vpsNodeId = response.data.vpsNodeId;
  const serverId = response.data.serverId;

  if (
    typeof secretKey !== "string" ||
    !secretKey ||
    typeof vpsNodeId !== "string" ||
    typeof serverId !== "string"
  ) {
    throw new Error("Enrollment response missing secretKey, vpsNodeId, or serverId.");
  }

  return { secretKey, vpsNodeId, serverId };
}

export async function sendHeartbeat(
  machineId: string,
  secretKey: string,
): Promise<unknown> {
  return postSignedJson(config.endpoints.heartbeat, { machineId }, secretKey);
}

export async function sendIngestBatch(
  batch: unknown[],
  secretKey: string,
): Promise<unknown> {
  return postSignedJson(config.endpoints.ingest, { batch }, secretKey);
}
