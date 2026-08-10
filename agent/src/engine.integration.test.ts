import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AgentApiError } from "./api/client.js";
import { createEngine } from "./engine.js";
import type { HostIdentity } from "./discovery.js";
import {
  collectActiveVisitors3m,
  ensureTrafficTails,
  resetTrafficStateForTests,
} from "./traffic.js";
import { enrichSiteStack } from "./site-stack.js";
import { clearPersistedAgentSecret, persistAgentSecret } from "./security.js";
import { loadTestConfig } from "./test-helpers.js";

const identity: HostIdentity = {
  machineId: "machine-int-1",
  domains: [
    {
      domain: "farcoland.com",
      documentRoot: "/home/u/domains/farcoland.com/public_html",
      owner: "u",
      appType: "woocommerce",
      source: "openlitespeed",
      aliases: [],
    },
  ],
};

describe("engine integration", () => {
  let cwd: string;
  let logDir: string;
  let previousCwd: string;

  beforeEach(async () => {
    previousCwd = process.cwd();
    cwd = await mkdtemp(join(tmpdir(), "unixsee-agent-int-"));
    logDir = join(cwd, "logs");
    process.chdir(cwd);
    resetTrafficStateForTests();
    loadTestConfig({
      NODE_ENV: "test",
      ACCESS_LOG_DIR: logDir,
      DIRECTADMIN_BASE_URL: "https://panel.test:2222",
    });
    await persistAgentSecret("live-secret", cwd);
  });

  afterEach(() => {
    resetTrafficStateForTests();
    process.chdir(previousCwd);
  });

  it("clears persisted secret after ingest 401 and does not re-ack sent payloads", async () => {
    const clearSecret = async () => clearPersistedAgentSecret(cwd);
    const sendIngest = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(new AgentApiError("revoked", 401, ""));

    const engine = createEngine(identity, "live-secret", {
      autoStart: false,
      sendIngest,
      clearSecret,
      sendHeartbeat: vi.fn().mockResolvedValue({}),
    });

    engine.enqueue({ schemaVersion: "phase1", n: 1 });
    engine.enqueue({ schemaVersion: "phase1", n: 2 });
    await engine.flushQueue();

    const envContent = await readFile(join(cwd, ".env"), "utf-8");
    expect(envContent).not.toContain("AGENT_SECRET=");
    expect(engine.isSecretInvalidated()).toBe(true);
    expect(engine.getQueueLength()).toBe(1);

    await engine.flushQueue();
    expect(sendIngest).toHaveBeenCalledTimes(2);
    engine.stop();
  });

  it("builds ingest with unsupported visitor status when log is missing", async () => {
    await ensureTrafficTails(["farcoland.com"]);
    const visitors = collectActiveVisitors3m(["farcoland.com"]);
    expect(visitors[0]?.status?.state).toBe("unsupported");

    const discoveries = await enrichSiteStack(identity.domains);
    expect(discoveries[0]?.domain).toBe("farcoland.com");
    expect(discoveries[0]?.controlPanelUrl).toBe("https://panel.test:2222");

    const payload = {
      schemaVersion: "phase1",
      machineId: identity.machineId,
      discoveries,
      activeVisitors3m: visitors,
    };

    expect(payload.activeVisitors3m[0]?.uniqueIpCount).toBe(0);
    expect(payload.activeVisitors3m[0]?.status?.reason).toBe("log_missing");
  });

  it("builds visitor sample ok when log exists", async () => {
    const { mkdir } = await import("node:fs/promises");
    await mkdir(logDir, { recursive: true });
    await writeFile(join(logDir, "farcoland.com.log"), "");
    await ensureTrafficTails(["farcoland.com"]);
    const visitors = collectActiveVisitors3m(["farcoland.com"]);
    expect(visitors[0]?.status?.state).toBe("ok");
    expect(visitors[0]?.uniqueIpCount).toBe(0);
  });
});
