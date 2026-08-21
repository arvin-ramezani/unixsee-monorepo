import { promises as fs } from "node:fs";
import type { AppConfig } from "./config/config.js";
import type { OlsDiscovery } from "./contracts/phase1-ingest.js";
import type { FilesystemPolicy } from "./filesystem-policy.js";

const DOMAIN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const cleanDomain = (value: string) =>
  value.trim().toLowerCase().replace(/\.$/, "");

export function parseOlsRouting(
  content: string,
  discoveredAt = new Date(),
): OlsDiscovery[] {
  const declared = new Set(
    Array.from(
      content.matchAll(/\bvirtualhost\s+([^\s{]+)\s*\{/gi),
      (match) => match[1],
    ),
  );
  const byVhost = new Map<string, string[]>();
  for (const match of content.matchAll(/^\s*map\s+([^\s,]+)\s+(.+)$/gim)) {
    const virtualHostName = match[1];
    if (!declared.has(virtualHostName)) continue;
    const names = match[2]
      .split(/[\s,]+/)
      .map(cleanDomain)
      .filter((name) => DOMAIN.test(name));
    if (names.length === 0) continue;
    const existing = byVhost.get(virtualHostName) ?? [];
    for (const name of names) if (!existing.includes(name)) existing.push(name);
    byVhost.set(virtualHostName, existing);
  }
  return Array.from(byVhost, ([virtualHostName, names]) => {
    const primary = names.find((name) => !name.startsWith("www.")) ?? names[0];
    return {
      domain: primary,
      aliases: names.filter((name) => name !== primary),
      virtualHostName,
      source: "openlitespeed" as const,
      discoveredAt: discoveredAt.toISOString(),
    };
  }).sort((a, b) => a.domain.localeCompare(b.domain));
}

export class OlsDiscoveryTracker {
  private inventory = new Map<string, OlsDiscovery>();
  private misses = new Map<string, number>();

  acceptSuccessfulScan(scan: OlsDiscovery[]): OlsDiscovery[] {
    const current = new Set(scan.map((item) => item.domain));
    for (const item of scan) {
      this.inventory.set(item.domain, item);
      this.misses.delete(item.domain);
    }
    for (const domain of this.inventory.keys()) {
      if (current.has(domain)) continue;
      const misses = (this.misses.get(domain) ?? 0) + 1;
      if (misses >= 2) {
        this.inventory.delete(domain);
        this.misses.delete(domain);
      } else this.misses.set(domain, misses);
    }
    return Array.from(this.inventory.values()).sort((a, b) =>
      a.domain.localeCompare(b.domain),
    );
  }
}

export async function scanOlsInventory(
  config: AppConfig,
  policy: FilesystemPolicy,
): Promise<OlsDiscovery[]> {
  const contents = await Promise.all(
    config.routingFiles.map((path) =>
      fs.readFile(policy.assertRoutingFile(path), "utf8"),
    ),
  );
  const merged = new Map<string, OlsDiscovery>();
  for (const item of parseOlsRouting(contents.join("\n"))) {
    const existing = merged.get(item.virtualHostName);
    if (!existing) merged.set(item.virtualHostName, item);
    else {
      const names = [
        existing.domain,
        ...existing.aliases,
        item.domain,
        ...item.aliases,
      ];
      const unique = [...new Set(names)];
      const primary =
        unique.find((name) => !name.startsWith("www.")) ?? unique[0];
      merged.set(item.virtualHostName, {
        ...existing,
        domain: primary,
        aliases: unique.filter((name) => name !== primary),
      });
    }
  }
  return Array.from(merged.values()).sort((a, b) =>
    a.domain.localeCompare(b.domain),
  );
}
