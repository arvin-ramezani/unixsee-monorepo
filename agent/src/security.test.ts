import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  AGENT_SECRET_ENV_KEY,
  clearPersistedAgentSecret,
  persistAgentSecret,
} from "./security.js";

const originalAgentRoot = process.env.UNIXSEE_AGENT_ROOT;

describe("security secret persistence", () => {
  let agentRoot: string;

  beforeEach(async () => {
    agentRoot = await mkdtemp(join(tmpdir(), "unixsee-agent-sec-"));
    process.env.UNIXSEE_AGENT_ROOT = agentRoot;
  });

  afterEach(() => {
    if (originalAgentRoot === undefined) {
      delete process.env.UNIXSEE_AGENT_ROOT;
    } else {
      process.env.UNIXSEE_AGENT_ROOT = originalAgentRoot;
    }
  });

  it("persists and clears AGENT_SECRET in the agent-owned .env", async () => {
    await persistAgentSecret("abc123secret");
    const written = await readFile(join(agentRoot, ".env"), "utf-8");
    expect(written).toContain(`${AGENT_SECRET_ENV_KEY}=abc123secret`);

    await clearPersistedAgentSecret();
    const cleared = await readFile(join(agentRoot, ".env"), "utf-8");
    expect(cleared).not.toContain("AGENT_SECRET=");
  });

  it("preserves other env keys when clearing secret", async () => {
    await writeFile(
      join(agentRoot, ".env"),
      "API_BASE_URL=https://api.example.com\nAGENT_SECRET=old\n",
      { mode: 0o600 },
    );
    await clearPersistedAgentSecret();
    const content = await readFile(join(agentRoot, ".env"), "utf-8");
    expect(content).toContain("API_BASE_URL=https://api.example.com");
    expect(content).not.toContain("AGENT_SECRET=");
  });
});
