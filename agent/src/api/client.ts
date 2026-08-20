import { generatePayloadSignature } from "../security.js";
import { getConfig } from "../config/config.js";
import type {
  AgentCommandResultPayload,
  HeartbeatResult,
  LeasedAgentCommand,
} from "../commands/types.js";

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
      if (getConfig().nodeEnv !== "production") {
        console.log(`[Network-Dev] Mocking POST ${url}`);
        await sleep(50);
        return { data: { mocked: true } };
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
      if (
        attempt >= maxRetries ||
        (error instanceof AgentApiError &&
          error.status < 500 &&
          error.status !== 429)
      ) {
        throw error;
      }

      const jitteredDelay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.warn(
        `[Network] Request failed. Retrying in ${Math.round(jitteredDelay)}ms... (${attempt}/${maxRetries})`,
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
  const signature = generatePayloadSignature(
    payloadString,
    secretKey,
    timestamp,
  );

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
  agentInstanceId: string,
  enrollmentToken: string,
): Promise<EnrollResult> {
  const cfg = getConfig();
  if (cfg.nodeEnv !== "production") {
    console.log(
      `[Network-Dev] Mocking enrollment for agentInstanceId=${agentInstanceId}`,
    );
    return {
      vpsNodeId: "dev-vps-node-id",
      serverId: "dev-server-id",
      secretKey: "mock_development_enrolled_secret_key",
    };
  }

  const response = await postJson({
    url: cfg.endpoints.enroll,
    body: { agentInstanceId, agentVersion: cfg.agentVersion },
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
    throw new Error(
      "Enrollment response missing secretKey, vpsNodeId, or serverId.",
    );
  }

  return { secretKey, vpsNodeId, serverId };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseLeasedCommand(value: unknown): LeasedAgentCommand | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    !UUID_PATTERN.test(value.id) ||
    value.type !== "REFRESH_SITE_STACK" ||
    typeof value.domain !== "string" ||
    typeof value.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(value.expiresAt))
  ) {
    return null;
  }

  return {
    id: value.id,
    type: "REFRESH_SITE_STACK",
    domain: value.domain,
    expiresAt: value.expiresAt,
  };
}

function parseHeartbeatResult(
  response: unknown,
  agentInstanceId: string,
): HeartbeatResult {
  if (!isRecord(response) || !isRecord(response.data)) {
    throw new Error("Heartbeat response missing data payload.");
  }

  const data = response.data;
  const commands = Array.isArray(data.commands)
    ? data.commands.flatMap((item) => {
        const command = parseLeasedCommand(item);
        return command ? [command] : [];
      })
    : [];

  const agent = isRecord(data.agent) ? data.agent : {};
  const responseAgentInstanceId =
    typeof agent.agentInstanceId === "string"
      ? agent.agentInstanceId
      : agentInstanceId;

  return {
    agent: {
      agentInstanceId: responseAgentInstanceId,
      status: typeof agent.status === "string" ? agent.status : "ONLINE",
      ...(typeof agent.agentVersion === "string"
        ? { agentVersion: agent.agentVersion }
        : {}),
      ...(typeof agent.lastHeartbeatAt === "string"
        ? { lastHeartbeatAt: agent.lastHeartbeatAt }
        : {}),
      ...(typeof agent.lastSeenAt === "string"
        ? { lastSeenAt: agent.lastSeenAt }
        : {}),
    },
    commands,
  };
}

export async function sendHeartbeat(
  agentInstanceId: string,
  secretKey: string,
): Promise<HeartbeatResult> {
  const cfg = getConfig();

  if (cfg.nodeEnv !== "production") {
    return {
      agent: {
        agentInstanceId,
        status: "ONLINE",
        agentVersion: cfg.agentVersion,
      },
      commands: [],
    };
  }

  const response = await postSignedJson(
    cfg.endpoints.heartbeat,
    {
      schemaVersion: "phase1",
      agentInstanceId,
      agentVersion: cfg.agentVersion,
      sentAt: new Date().toISOString(),
    },
    secretKey,
  );

  return parseHeartbeatResult(response, agentInstanceId);
}

export async function sendPhase1Ingest(
  payload: unknown,
  secretKey: string,
): Promise<unknown> {
  return postSignedJson(getConfig().endpoints.ingest, payload, secretKey);
}

export async function sendCommandResult(
  payload: AgentCommandResultPayload,
  secretKey: string,
): Promise<unknown> {
  return postSignedJson(
    getConfig().endpoints.commandResult,
    payload,
    secretKey,
  );
}
