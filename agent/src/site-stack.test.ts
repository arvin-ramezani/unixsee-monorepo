import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { enrichSiteStack } from "./site-stack.js";
import type { DiscoveredDomain } from "./discovery.js";
import { loadTestConfig } from "./test-helpers.js";

vi.mock("node:child_process", async () => {
  const actual = await vi.importActual<typeof import("node:child_process")>(
    "node:child_process",
  );
  return {
    ...actual,
    execFile: (
      _file: string,
      args: string[],
      _opts: unknown,
      callback?: (error: Error | null, stdout: string, stderr: string) => void,
    ) => {
      const script = Array.isArray(args) ? args.join(" ") : "";
      if (script.includes("PHP_VERSION")) {
        callback?.(null, "8.2.28", "");
        return;
      }
      callback?.(new Error("imagick missing"), "", "fail");
    },
  };
});

describe("site-stack enrichment", () => {
  beforeEach(() => {
    loadTestConfig({ DIRECTADMIN_BASE_URL: "https://panel.test:2222" });
  });

  it("reads WordPress version from version.php", async () => {
    const root = await mkdtemp(join(tmpdir(), "unixsee-wp-"));
    await mkdir(join(root, "wp-includes"), { recursive: true });
    await writeFile(
      join(root, "wp-includes", "version.php"),
      "<?php $wp_version = '6.8.1';\n",
    );

    const domain: DiscoveredDomain = {
      domain: "wp.example",
      documentRoot: root,
      owner: "user",
      appType: "wordpress",
      source: "openlitespeed",
      aliases: ["www.wp.example"],
    };

    const [row] = await enrichSiteStack([domain]);
    expect(row?.wordpressVersion).toBe("6.8.1");
    expect(row?.wordpressAdminUrl).toBe("https://wp.example/wp-admin/");
    expect(row?.controlPanelUrl).toBe("https://panel.test:2222");
    expect(row?.fieldStatus.wordpressVersion?.state).toBe("ok");
  });

  it("returns unsupported imagick when probe fails", async () => {
    const domain: DiscoveredDomain = {
      domain: "php.example",
      documentRoot: "/tmp",
      owner: "user",
      appType: "php",
      source: "filesystem",
      aliases: [],
    };

    const [row] = await enrichSiteStack([domain]);
    expect(row?.imagickVersion).toBeNull();
    expect(row?.fieldStatus.imagickVersion?.state).toBe("unsupported");
  });
});
