import { generatePayloadSignature } from "../security.js";
import { getConfig } from "../config/config.js";
import type {
  CommandResult,
  HeartbeatData,
} from "../contracts/phase1-ingest.js";

export class AgentApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly bodyText: string,
  ) {
    super(message);
    this.name = "AgentApiError";
  }
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>,
  maxRetries = 3,
): Promise<unknown> {
  if (getConfig().nodeEnv !== "production")
    return { data: { mocked: true, commands: [] } };
  const payload = JSON.stringify(body);
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: payload,
      });
      if (!response.ok)
        throw new AgentApiError(
          `HTTP ${response.status}`,
          response.status,
          await response.text().catch(() => ""),
        );
      return response.headers.get("content-type")?.includes("application/json")
        ? response.json()
        : null;
    } catch (error) {
      if (
        attempt + 1 >= maxRetries ||
        (error instanceof AgentApiError &&
          error.status < 500 &&
          error.status !== 429)
      )
        throw error;
      await sleep(
        Math.min(30_000, 2 ** (attempt + 1) * 1_000 + Math.random() * 750),
      );
    }
  }
  throw new Error("request_failed");
}

export async function postSignedJson(
  url: string,
  body: unknown,
  secret: string,
): Promise<unknown> {
  const timestamp = new Date().toISOString();
  return postJson(url, body, {
    "X-Agent-Timestamp": timestamp,
    "X-Agent-Signature": generatePayloadSignature(
      JSON.stringify(body),
      secret,
      timestamp,
    ),
  });
}

export async function enrollAgent(
  agentInstanceId: string,
  token: string,
): Promise<{ vpsNodeId: string; serverId: string; secretKey: string }> {
  const config = getConfig();
  if (config.nodeEnv !== "production")
    return {
      vpsNodeId: "dev-vps",
      serverId: "dev-server",
      secretKey: "development-secret",
    };
  const response = await postJson(
    config.endpoints.enroll,
    { agentInstanceId, agentVersion: config.agentVersion },
    { "X-Enrollment-Token": token },
    2,
  );
  if (!record(response) || !record(response.data))
    throw new Error("Enrollment response missing data.");
  const { vpsNodeId, serverId, secretKey } = response.data;
  if (
    typeof vpsNodeId !== "string" ||
    typeof serverId !== "string" ||
    typeof secretKey !== "string"
  )
    throw new Error("Enrollment response is invalid.");
  return { vpsNodeId, serverId, secretKey };
}

export async function sendHeartbeat(
  agentInstanceId: string,
  secret: string,
): Promise<HeartbeatData> {
  const config = getConfig();
  const response = await postSignedJson(
    config.endpoints.heartbeat,
    {
      schemaVersion: "phase1",
      agentInstanceId,
      agentVersion: config.agentVersion,
      sentAt: new Date().toISOString(),
    },
    secret,
  );
  if (config.nodeEnv !== "production")
    return {
      agent: {
        agentInstanceId,
        status: "ONLINE",
        lastHeartbeatAt: new Date().toISOString(),
      },
      commands: [],
    };
  if (
    !record(response) ||
    !record(response.data) ||
    !Array.isArray(response.data.commands)
  )
    throw new Error("Heartbeat response is invalid.");
  return response.data as unknown as HeartbeatData;
}
export async function sendPhase1Ingest(
  payload: unknown,
  secret: string,
): Promise<unknown> {
  return postSignedJson(getConfig().endpoints.ingest, payload, secret);
}
export async function sendCommandResult(
  id: string,
  payload: CommandResult,
  secret: string,
): Promise<unknown> {
  return postSignedJson(
    getConfig().endpoints.commandResult(id),
    payload,
    secret,
  );
}
