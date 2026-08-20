import { platform } from "node:os";

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
  const { loadOrCreateAgentInstallationIdentity } = await import("./identity.js");
  const { persistAgentSecret } = await import("./security.js");
  const { readAgentEnvironmentFile } = await import(
    "./security/filesystem.js"
  );

  async function loadPersistedSecretKey(): Promise<string | null> {
    try {
      const rawContent = await readAgentEnvironmentFile();
      const currentMatch = rawContent.match(/^AGENT_SECRET=(.+)$/m);
      const secretKey = currentMatch?.[1];
      return secretKey?.trim().replace(/^["']|["']$/g, "") || null;
    } catch {
      return null;
    }
  }

  async function resolveSecretKey(
    agentInstanceId: string,
    identityWasCreated: boolean,
  ): Promise<string> {
    const existingSecret =
      config.agentSecret || (await loadPersistedSecretKey());

    if (!identityWasCreated && existingSecret) {
      return existingSecret;
    }

    if (identityWasCreated && existingSecret && !config.enrollmentToken) {
      throw new Error(
        "A new agentInstanceId was created, but an existing AGENT_SECRET is present. The secret may belong to the legacy machine identity. Re-enroll this installation once with a fresh enrollment token instead of reusing the old secret.",
      );
    }

    if (!config.enrollmentToken) {
      throw new Error(
        "No usable AGENT_SECRET found and ENROLLMENT_TOKEN is missing. Issue a new enrollment token from the admin panel and retry.",
      );
    }

    console.log(
      `[Security] Starting enrollment for agentInstanceId=${agentInstanceId}...`,
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

  const installationIdentity =
    await loadOrCreateAgentInstallationIdentity();
  const { agentInstanceId } = installationIdentity;

  console.log(
    installationIdentity.created
      ? `[Security] Created persistent agentInstanceId=${agentInstanceId}.`
      : `[Security] Loaded persistent agentInstanceId=${agentInstanceId}.`,
  );

  const hostIdentity = await initializeIdentity(agentInstanceId);
  const secretKey = await resolveSecretKey(
    agentInstanceId,
    installationIdentity.created,
  );
  startEngine(hostIdentity, secretKey);
}

bootstrap().catch((error) => {
  console.error(`[FATAL] Agent startup failed:`, error);
  process.exit(1);
});
