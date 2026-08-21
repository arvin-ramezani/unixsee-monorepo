import { loadConfig } from "./config/config.js";
import { FilesystemPolicy } from "./filesystem-policy.js";
import { loadOrCreateAgentInstanceId } from "./state.js";
import { enrollAgent } from "./api/client.js";
import { createEngine } from "./engine.js";
import { loadAgentSecret, persistAgentSecret } from "./security.js";

async function bootstrap() {
  const config = loadConfig();
  const policy = new FilesystemPolicy({
    stateDir: config.stateDir,
    accessLogDir: config.accessLogDir,
    routingFiles: config.routingFiles,
  });
  const agentInstanceId = await loadOrCreateAgentInstanceId(
    config.stateDir,
    policy,
  );
  let secret =
    config.agentSecret ?? (await loadAgentSecret(config.stateDir, policy));
  if (!secret) {
    if (!config.enrollmentToken)
      throw new Error("Agent enrollment requires ENROLLMENT_TOKEN.");
    const enrolled = await enrollAgent(agentInstanceId, config.enrollmentToken);
    secret = enrolled.secretKey;
    await persistAgentSecret(secret, config.stateDir, policy);
  }
  await createEngine({ agentInstanceId, secret, config, policy });
  console.log(
    `[Unixsee Agent] ${config.agentVersion} started for installation ${agentInstanceId}.`,
  );
}

bootstrap().catch((error) => {
  console.error(
    "[Unixsee Agent] startup failed",
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
});
