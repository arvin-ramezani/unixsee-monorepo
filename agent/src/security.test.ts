import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FilesystemPolicy } from "./filesystem-policy.js";
import { loadOrCreateAgentInstanceId } from "./state.js";

describe("installation identity and filesystem policy", () => {
  it("creates and reuses a mode-0600 installation UUID", async () => {
    const stateDir = await mkdtemp(join(tmpdir(), "unixsee-state-"));
    const policy = new FilesystemPolicy({
      stateDir,
      accessLogDir: join(stateDir, "logs"),
      routingFiles: [join(stateDir, "ols.conf")],
    });
    const first = await loadOrCreateAgentInstanceId(stateDir, policy);
    const second = await loadOrCreateAgentInstanceId(stateDir, policy);
    expect(second).toBe(first);
    expect(
      (await readFile(join(stateDir, "agent-instance-id"), "utf8")).trim(),
    ).toBe(first);
  });
  it("rejects forbidden and traversal paths", () => {
    const policy = new FilesystemPolicy({
      stateDir: "/opt/unixsee-agent/state",
      accessLogDir: "/var/log/httpd/domains",
      routingFiles: ["/usr/local/lsws/conf/httpd_config.conf"],
    });
    expect(() => policy.assertRoutingFile("/etc/machine-id")).toThrow(
      /forbidden/,
    );
    expect(() =>
      policy.assertStatePath("/opt/unixsee-agent/state/../../etc/passwd"),
    ).toThrow();
    expect(() => policy.accessLogPath("../../etc/passwd")).toThrow();
  });
});
