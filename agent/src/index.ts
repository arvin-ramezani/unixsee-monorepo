import { platform } from "node:os";
import { promises as fs } from "node:fs";
import { join } from "node:path";

import { enrollAgent, AgentApiError } from "./api/client.js";
import { initializeIdentity } from "./discovery.js";
import { startEngine } from "./engine.js";
import { config } from "./config/config.js";
import { persistAgentSecret } from "./security.js";

const RUNTIME_STATE_FILE = ".env";

async function loadPersistedSecretKey(): Promise<string | null> {
  try {
    const filePath = join(process.cwd(), RUNTIME_STATE_FILE);
    const rawContent = await fs.readFile(filePath, "utf-8");
    const currentMatch = rawContent.match(/^AGENT_SECRET=(.+)$/m);
    const legacyMatch = rawContent.match(/^AGENT_SECRET_KEY=(.+)$/m);
    const secretKey = currentMatch?.[1] ?? legacyMatch?.[1];

    return secretKey?.trim().replace(/^["']|["']$/g, "") || null;
  } catch {
    return null;
  }
}

async function resolveSecretKey(machineId: string): Promise<string> {
  const staticSecretKey = config.agentSecret;
  const runtimeSecretKey = await loadPersistedSecretKey();
  const existingSecret = staticSecretKey || runtimeSecretKey;

  if (existingSecret) {
    return existingSecret;
  }

  if (!config.enrollmentToken) {
    throw new Error(
      "No AGENT_SECRET found and ENROLLMENT_TOKEN is missing. Issue a new enrollment token from the admin panel and retry.",
    );
  }

  console.log(`[Security] No AGENT_SECRET found. Starting enrollment for ${machineId}...`);

  try {
    const enrollment = await enrollAgent(machineId, config.enrollmentToken);
    await persistAgentSecret(enrollment.secretKey);
    console.log(
      `[Security] Enrollment completed. HMAC secret persisted for vpsNodeId=${enrollment.vpsNodeId}.`,
    );
    return enrollment.secretKey;
  } catch (error) {
    if (error instanceof AgentApiError) {
      throw new Error(
        `Enrollment failed with HTTP ${error.status}. Request a fresh enrollment token and retry. Details: ${error.bodyText || error.message}`,
      );
    }

    throw error;
  }
}

async function bootstrap() {
  console.log(
    `[Unixsee Agent] Bootstrapping lightweight execution environment...`,
  );

  if (config.nodeEnv !== "production") {
    console.warn(
      `[WARNING] Agent running in ${config.nodeEnv} mode. Network payloads will be mocked.`,
    );
  }

  if (platform() === "linux" && process.getuid && process.getuid() === 0) {
    console.warn(`[WARNING] Agent is executing with root privileges.`);
    console.warn(
      `[WARNING] For production security, this process must run under a restricted system user.`,
    );
  }

  const hostIdentity = await initializeIdentity();
  const secretKey = await resolveSecretKey(hostIdentity.machineId);

  startEngine(hostIdentity, secretKey);
}

bootstrap().catch((error) => {
  console.error(
    `[FATAL] Agent encountered a critical failure during startup:`,
    error,
  );
  process.exit(1);
});
