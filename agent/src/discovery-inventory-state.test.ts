import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { DiscoveredDomain } from "./discovery.js";
import {
  getDiscoveryInventoryStatePath,
  updateDiscoveryInventoryState,
} from "./discovery-inventory-state.js";

function site(
  domain = "example.com",
  virtualHostName = "example-vhost",
): DiscoveredDomain {
  return {
    domain,
    aliases: [`www.${domain}`],
    virtualHostName,
    source: "openlitespeed",
  };
}

const originalStateDir = process.env.UNIXSEE_AGENT_STATE_DIR;

async function useTempStateDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "unixsee-discovery-state-"));
  process.env.UNIXSEE_AGENT_STATE_DIR = dir;
  return dir;
}

afterEach(() => {
  if (originalStateDir === undefined) {
    delete process.env.UNIXSEE_AGENT_STATE_DIR;
  } else {
    process.env.UNIXSEE_AGENT_STATE_DIR = originalStateDir;
  }
});

describe("persisted OLS discovery inventory", () => {
  it("adds a newly discovered vhost immediately", async () => {
    await useTempStateDir();
    const current = site();

    const result = await updateDiscoveryInventoryState([current], {
      observedAt: new Date("2026-08-19T12:00:00.000Z"),
    });

    expect(result.effectiveDomains).toEqual([current]);
    expect(result.changes.added).toEqual([current]);
    expect(result.changes.removed).toEqual([]);
  });

  it("retains a site after the first successful scan where it is absent", async () => {
    await useTempStateDir();
    const current = site();

    await updateDiscoveryInventoryState([current], {
      observedAt: new Date("2026-08-19T12:00:00.000Z"),
    });

    const firstMiss = await updateDiscoveryInventoryState([], {
      observedAt: new Date("2026-08-19T12:10:00.000Z"),
    });

    expect(firstMiss.effectiveDomains).toEqual([current]);
    expect(firstMiss.changes.retainedMissing).toEqual([current]);
    expect(firstMiss.changes.removed).toEqual([]);
  });

  it("removes a site only after the second consecutive successful absent scan", async () => {
    await useTempStateDir();
    const current = site();

    await updateDiscoveryInventoryState([current], {
      observedAt: new Date("2026-08-19T12:00:00.000Z"),
    });
    await updateDiscoveryInventoryState([], {
      observedAt: new Date("2026-08-19T12:10:00.000Z"),
    });

    const secondMiss = await updateDiscoveryInventoryState([], {
      observedAt: new Date("2026-08-19T12:20:00.000Z"),
    });

    expect(secondMiss.effectiveDomains).toEqual([]);
    expect(secondMiss.changes.removed).toEqual([current]);
    expect(secondMiss.changes.retainedMissing).toEqual([]);
  });

  it("resets the missing counter when a site reappears before confirmation", async () => {
    await useTempStateDir();
    const current = site();

    await updateDiscoveryInventoryState([current], {
      observedAt: new Date("2026-08-19T12:00:00.000Z"),
    });
    await updateDiscoveryInventoryState([], {
      observedAt: new Date("2026-08-19T12:10:00.000Z"),
    });

    const recovered = await updateDiscoveryInventoryState([current], {
      observedAt: new Date("2026-08-19T12:20:00.000Z"),
    });

    expect(recovered.effectiveDomains).toEqual([current]);
    expect(recovered.changes.recovered).toEqual([current]);

    const nextMiss = await updateDiscoveryInventoryState([], {
      observedAt: new Date("2026-08-19T12:30:00.000Z"),
    });

    expect(nextMiss.effectiveDomains).toEqual([current]);
    expect(nextMiss.changes.removed).toEqual([]);
    expect(nextMiss.changes.retainedMissing).toEqual([current]);
  });

  it("persists only derived inventory state under the agent-owned state directory", async () => {
    await useTempStateDir();
    const current = site();

    await updateDiscoveryInventoryState([current], {
      observedAt: new Date("2026-08-19T12:00:00.000Z"),
    });

    const persisted = JSON.parse(
      await readFile(getDiscoveryInventoryStatePath(), "utf8"),
    ) as {
      version: number;
      records: Array<Record<string, unknown>>;
    };

    expect(persisted.version).toBe(1);
    expect(persisted.records).toHaveLength(1);
    expect(persisted.records[0]).toMatchObject({
      domain: "example.com",
      virtualHostName: "example-vhost",
      consecutiveMissingScans: 0,
      firstDiscoveredAt: "2026-08-19T12:00:00.000Z",
      lastSeenAt: "2026-08-19T12:00:00.000Z",
    });
    expect(persisted.records[0]).not.toHaveProperty("documentRoot");
    expect(persisted.records[0]).not.toHaveProperty("owner");
  });
});
