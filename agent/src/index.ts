import { promises as fs } from "node:fs";
import { platform } from "node:os";
import { join } from "node:path";

async function bootstrap() {
  const { loadConfig, getConfig } = await import("./config/config.js");
  loadConfig();
  const config = getConfig();

  console.log(`[Unixsee Phase 1 Agent] Bootstrapping ${config.agentVersion}...`);

  if (config.nodeEnv !== "production") {
    console.warn(
      `[WARNING] Agent running in ${config.nodeEnv} mode. Network payloads will be mocked.`,
    );
  }

  if (platform() === "linux" && process.getuid && process.getuid() === 0) {
    console.warn(`[WARNING] Agent is executing with root privileges.`);
    console.warn(
      `[WARNING] For production security, run under a restricted system user.`,
    );
  }

  const { AgentApiError, enrollAgent } = await import("./api/client.js");
  const { initializeIdentity } = await import("./discovery.js");
  const { startEngine } = await import("./engine.js");
  const { resolveAgentInstanceIdCompat } = await import("./identity-compat.js");
  const { persistAgentSecret } = await import("./security.js");

  const RUNTIME_STATE_FILE = ".env";

  async function loadPersistedSecretKey(): Promise<string | null> {
    try {
      const filePath = join(process.cwd(), RUNTIME_STATE_FILE);
      const rawContent = await fs.readFile(filePath, "utf-8");
      const currentMatch = rawContent.match(/^AGENT_SECRET=(.+)$/m);
      const secretKey = currentMatch?.[1];
      return secretKey?.trim().replace(/^["']|["']$/g, "") || null;
    } catch {
      return null;
    }
  }

  async function resolveSecretKey(agentInstanceId: string): Promise<string> {
    const existingSecret =
      config.agentSecret || (await loadPersistedSecretKey());
    if (existingSecret) {
      return existingSecret;
    }

    if (!config.enrollmentToken) {
      throw new Error(
        "No AGENT_SECRET found and ENROLLMENT_TOKEN is missing. Issue a new enrollment token from the admin panel and retry.",
      );
    }

    console.log(
      `[Security] No AGENT_SECRET found. Starting enrollment for agentInstanceId=${agentInstanceId}...`,
    );

    try {
      const enrollment = await enrollAgent(
        agentInstanceId,
        config.enrollmentToken,
      );
      await persistAgentSecret(enrollment.secretKey);
      console.log(
        `[Security] Enrollment completed. HMAC secret persisted for vpsNodeId=${enrollment.vpsNodeId}.`,
      );
      return enrollment.secretKey;
    } catch (error) {
      if (error instanceof AgentApiError) {
        throw new Error(
          `Enrollment failed with HTTP ${error.status}. Request a fresh enrollment token and retry.`,
        );
      }
      throw error;
    }
  }

  const agentInstanceId = await resolveAgentInstanceIdCompat();
  const hostIdentity = await initializeIdentity(agentInstanceId);
  const secretKey = await resolveSecretKey(agentInstanceId);
  startEngine(hostIdentity, secretKey);
}

bootstrap().catch((error) => {
  console.error(`[FATAL] Agent startup failed:`, error);
  process.exit(1);
});
