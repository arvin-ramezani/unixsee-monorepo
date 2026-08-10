import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  AGENT_SECRET_ENV_KEY,
  clearPersistedAgentSecret,
  persistAgentSecret,
} from "./security.js";

describe("security secret persistence", () => {
  let cwd: string;
  let previousCwd: string;

  beforeEach(async () => {
    previousCwd = process.cwd();
    cwd = await mkdtemp(join(tmpdir(), "unixsee-agent-sec-"));
    process.chdir(cwd);
  });

  afterEach(() => {
    process.chdir(previousCwd);
  });

  it("persists and clears AGENT_SECRET in .env", async () => {
    await persistAgentSecret("abc123secret", cwd);
    const written = await readFile(join(cwd, ".env"), "utf-8");
    expect(written).toContain(`${AGENT_SECRET_ENV_KEY}=abc123secret`);

    await clearPersistedAgentSecret(cwd);
    const cleared = await readFile(join(cwd, ".env"), "utf-8");
    expect(cleared).not.toContain("AGENT_SECRET=");
  });

  it("preserves other env keys when clearing secret", async () => {
    await writeFile(
      join(cwd, ".env"),
      "API_BASE_URL=https://api.example.com\nAGENT_SECRET=old\n",
      { mode: 0o600 },
    );
    await clearPersistedAgentSecret(cwd);
    const content = await readFile(join(cwd, ".env"), "utf-8");
    expect(content).toContain("API_BASE_URL=https://api.example.com");
    expect(content).not.toContain("AGENT_SECRET=");
  });
});
