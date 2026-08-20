import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  discoverEffectiveOpenLiteSpeedInventory,
  discoverOpenLiteSpeedInventory,
  normalizeMappedHostname,
  OpenLiteSpeedDiscoveryError,
  parseOpenLiteSpeedInventory,
} from "./discovery.js";
import { loadTestConfig } from "./test-helpers.js";

const vhosts = `
virtualhost shop-vhost {
  vhRoot /unused/shop
  configFile /unused/shop/vhconf.conf
}

virtualhost api-vhost {
  vhRoot /unused/api
  configFile /unused/api/vhconf.conf
}
`;

describe("OpenLiteSpeed inventory discovery", () => {
  const originalListenerPaths = process.env.OPENLITESPEED_LISTENER_PATHS;
  const originalDeclarationPaths =
    process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS;
  const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;

  beforeEach(() => {
    loadTestConfig();
    delete process.env.OPENLITESPEED_LISTENER_PATHS;
    delete process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS;
    delete process.env.UNIXSEE_AGENT_STATE_DIR;
  });

  afterEach(() => {
    if (originalListenerPaths === undefined) {
      delete process.env.OPENLITESPEED_LISTENER_PATHS;
    } else {
      process.env.OPENLITESPEED_LISTENER_PATHS = originalListenerPaths;
    }

    if (originalDeclarationPaths === undefined) {
      delete process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS;
    } else {
      process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS =
        originalDeclarationPaths;
    }

    if (originalStateDir === undefined) {
      delete process.env.UNIXSEE_AGENT_STATE_DIR;
    } else {
      process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
    }
  });

  it("preserves www as an alias and prefers the first non-www mapping", () => {
    const inventory = parseOpenLiteSpeedInventory({
      listenerConfigs: [
        `
listener HTTP {
  address *:80
  map shop-vhost www.example.com, example.com, cdn.example.com
}
`,
      ],
      vhostDeclarationConfigs: [vhosts],
    });

    expect(inventory).toEqual([
      {
        domain: "example.com",
        aliases: ["www.example.com", "cdn.example.com"],
        virtualHostName: "shop-vhost",
        source: "openlitespeed",
      },
    ]);
  });

  it("deduplicates one vhost mapped by both HTTP and HTTPS listeners", () => {
    const inventory = parseOpenLiteSpeedInventory({
      listenerConfigs: [
        `
listener HTTP {
  map shop-vhost example.com,www.example.com
}
listener HTTPS {
  secure 1
  map shop-vhost example.com,www.example.com
}
`,
      ],
      vhostDeclarationConfigs: [vhosts],
    });

    expect(inventory).toHaveLength(1);
    expect(inventory[0]).toMatchObject({
      domain: "example.com",
      aliases: ["www.example.com"],
      virtualHostName: "shop-vhost",
    });
  });

  it("requires an active vhost declaration for a listener mapping", () => {
    const inventory = parseOpenLiteSpeedInventory({
      listenerConfigs: [
        `
listener HTTP {
  map missing-vhost ghost.example.com
  map api-vhost api.example.com
}
`,
      ],
      vhostDeclarationConfigs: [vhosts],
    });

    expect(inventory).toEqual([
      {
        domain: "api.example.com",
        aliases: [],
        virtualHostName: "api-vhost",
        source: "openlitespeed",
      },
    ]);
  });

  it("ignores stale internal vhost names without rejecting legitimate hostnames", () => {
    const inventory = parseOpenLiteSpeedInventory({
      listenerConfigs: [
        `
listener HTTP {
  map shop-vhost.old ignored.example.com
  map shop-vhost old.example.com,www.old.example.com
}
`,
      ],
      vhostDeclarationConfigs: [
        `${vhosts}\nvirtualhost shop-vhost.old {\n}\n`,
      ],
    });

    expect(inventory).toEqual([
      {
        domain: "old.example.com",
        aliases: ["www.old.example.com"],
        virtualHostName: "shop-vhost",
        source: "openlitespeed",
      },
    ]);
  });

  it("rejects wildcards, variables, URL-shaped values, IPs, and invalid hosts", () => {
    expect(normalizeMappedHostname("*.example.com")).toBeNull();
    expect(normalizeMappedHostname("$VH_NAME")).toBeNull();
    expect(normalizeMappedHostname("https://example.com")).toBeNull();
    expect(normalizeMappedHostname("127.0.0.1")).toBeNull();
    expect(normalizeMappedHostname("localhost")).toBeNull();
    expect(normalizeMappedHostname("WWW.Example.COM.")).toBe(
      "www.example.com",
    );
  });

  it("reads only explicitly configured listener/declaration files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "unixsee-ols-discovery-"));
    const listenersPath = join(dir, "listeners.conf");
    const declarationsPath = join(dir, "httpd-vhosts.conf");

    await writeFile(
      listenersPath,
      `listener HTTP {\n  map shop-vhost www.example.com,example.com\n}\n`,
    );
    await writeFile(declarationsPath, vhosts);

    process.env.OPENLITESPEED_LISTENER_PATHS = listenersPath;
    process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS = declarationsPath;

    const inventory = await discoverOpenLiteSpeedInventory();

    expect(inventory).toEqual([
      {
        domain: "example.com",
        aliases: ["www.example.com"],
        virtualHostName: "shop-vhost",
        source: "openlitespeed",
      },
    ]);
    expect(inventory[0]).not.toHaveProperty("documentRoot");
    expect(inventory[0]).not.toHaveProperty("owner");
    expect(inventory[0]).not.toHaveProperty("appType");
    expect(inventory[0]).not.toHaveProperty("configFile");
  });

  it("throws on unreadable listener configuration instead of treating failure as an empty successful scan", async () => {
    const dir = await mkdtemp(join(tmpdir(), "unixsee-ols-discovery-"));
    const declarationsPath = join(dir, "httpd-vhosts.conf");
    await writeFile(declarationsPath, vhosts);

    process.env.OPENLITESPEED_LISTENER_PATHS = join(dir, "missing-listeners.conf");
    process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS = declarationsPath;

    await expect(discoverOpenLiteSpeedInventory()).rejects.toMatchObject<
      Partial<OpenLiteSpeedDiscoveryError>
    >({
      reason: "ols_listener_config_unreadable",
    });
  });


  it("does not count a failed OLS scan toward the two-scan removal threshold", async () => {
    const dir = await mkdtemp(join(tmpdir(), "unixsee-ols-discovery-state-"));
    const listenersPath = join(dir, "listeners.conf");
    const declarationsPath = join(dir, "httpd-vhosts.conf");
    process.env.UNIXSEE_AGENT_STATE_DIR = dir;

    await writeFile(
      listenersPath,
      `listener HTTP {\n  map shop-vhost example.com,www.example.com\n}\n`,
    );
    await writeFile(declarationsPath, vhosts);

    process.env.OPENLITESPEED_LISTENER_PATHS = listenersPath;
    process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS = declarationsPath;

    const initial = await discoverEffectiveOpenLiteSpeedInventory({
      observedAt: new Date("2026-08-19T12:00:00.000Z"),
    });
    expect(initial.changes.added).toHaveLength(1);

    process.env.OPENLITESPEED_LISTENER_PATHS = join(dir, "missing.conf");
    await expect(
      discoverEffectiveOpenLiteSpeedInventory({
        observedAt: new Date("2026-08-19T12:10:00.000Z"),
      }),
    ).rejects.toMatchObject({ reason: "ols_listener_config_unreadable" });

    await writeFile(listenersPath, `listener HTTP {\n  address *:80\n}\n`);
    process.env.OPENLITESPEED_LISTENER_PATHS = listenersPath;

    const firstSuccessfulMiss = await discoverEffectiveOpenLiteSpeedInventory({
      observedAt: new Date("2026-08-19T12:20:00.000Z"),
    });

    expect(firstSuccessfulMiss.domains).toEqual([
      {
        domain: "example.com",
        aliases: ["www.example.com"],
        virtualHostName: "shop-vhost",
        source: "openlitespeed",
      },
    ]);
    expect(firstSuccessfulMiss.changes.retainedMissing).toHaveLength(1);
    expect(firstSuccessfulMiss.changes.removed).toEqual([]);
  });

  it("treats a readable configuration with no maps as a successful empty inventory", () => {
    expect(
      parseOpenLiteSpeedInventory({
        listenerConfigs: ["listener HTTP { address *:80 }"],
        vhostDeclarationConfigs: [vhosts],
      }),
    ).toEqual([]);
  });
});
