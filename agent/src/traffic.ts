import { createHmac, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import { isIP } from "node:net";
import { join } from "node:path";
import type { AppConfig } from "./config/config.js";
import type {
  ActiveVisitors3m,
  Visitors24h,
} from "./contracts/phase1-ingest.js";
import type { FilesystemPolicy } from "./filesystem-policy.js";
import { RollingHll24h } from "./hll.js";
import { readJson, writeJson } from "./state.js";

type Cursor = { inode: number; offset: number; partial: string };
type Persisted = {
  salt: string;
  coverageStartedAt: string;
  cursors: Record<string, Cursor>;
  hll: Record<string, Record<string, string>>;
};

function normalizeIp(token: string): string | null {
  let candidate = token.trim();
  if (candidate.startsWith("[") && candidate.includes("]"))
    candidate = candidate.slice(1, candidate.indexOf("]"));
  if (isIP(candidate)) return candidate.toLowerCase();
  const ipv4Port = candidate.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  return ipv4Port && isIP(ipv4Port[1]) ? ipv4Port[1] : null;
}

function parseApacheTime(line: string, fallback: number): number {
  const match = line.match(
    /\[(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})\]/,
  );
  if (!match) return fallback;
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const month = months[match[2]];
  if (month === undefined) return fallback;
  const utc = Date.UTC(
    +match[3],
    month,
    +match[1],
    +match[4],
    +match[5],
    +match[6],
  );
  const sign = match[7][0] === "+" ? 1 : -1;
  const minutes = +match[7].slice(1, 3) * 60 + +match[7].slice(3, 5);
  return utc - sign * minutes * 60_000;
}

export class TrafficCollector {
  private salt = randomBytes(32);
  private coverageStartedAt = Date.now();
  private cursors = new Map<string, Cursor>();
  private active = new Map<string, Map<string, number>>();
  private hll = new Map<string, RollingHll24h>();
  private readonly statePath: string;

  constructor(
    private readonly config: AppConfig,
    private readonly policy: FilesystemPolicy,
    private readonly now = () => Date.now(),
  ) {
    this.statePath = policy.assertStatePath(
      join(config.stateDir, "traffic-state.json"),
    );
  }

  async restore(): Promise<void> {
    const state = await readJson<Persisted>(this.statePath, this.policy);
    if (!state) return;
    const salt = Buffer.from(state.salt, "base64");
    if (salt.length === 32) this.salt = salt;
    this.coverageStartedAt = Date.parse(state.coverageStartedAt) || this.now();
    this.cursors = new Map(Object.entries(state.cursors));
    for (const [domain, buckets] of Object.entries(state.hll)) {
      const rolling = new RollingHll24h();
      rolling.restore(buckets);
      this.hll.set(domain, rolling);
    }
  }

  async poll(domains: string[]): Promise<void> {
    const activeDomains = new Set(domains);
    for (const domain of this.cursors.keys())
      if (!activeDomains.has(domain)) this.cursors.delete(domain);
    await Promise.all(domains.map((domain) => this.pollDomain(domain)));
    this.pruneActive();
  }

  private async pollDomain(domain: string): Promise<void> {
    const path = this.policy.accessLogPath(domain);
    let stat;
    try {
      stat = await fs.stat(path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
    let cursor = this.cursors.get(domain);
    if (!cursor || cursor.inode !== stat.ino || stat.size < cursor.offset) {
      cursor = {
        inode: stat.ino,
        offset: Math.max(0, stat.size - this.config.maxInitialLogBytes),
        partial: "",
      };
      this.cursors.set(domain, cursor);
    }
    if (stat.size === cursor.offset) return;
    const length = Math.min(
      stat.size - cursor.offset,
      this.config.maxInitialLogBytes,
    );
    const handle = await fs.open(path, "r");
    try {
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buffer, 0, length, cursor.offset);
      cursor.offset += bytesRead;
      const text =
        cursor.partial + buffer.subarray(0, bytesRead).toString("utf8");
      const lines = text.split(/\r?\n/);
      cursor.partial = lines.pop() ?? "";
      for (const line of lines) this.consumeLine(domain, line);
    } finally {
      await handle.close();
    }
  }

  private consumeLine(domain: string, line: string): void {
    const rawIp = normalizeIp(line.split(/\s+/, 1)[0] ?? "");
    if (!rawIp) return;
    const visitorHash = createHmac("sha256", this.salt)
      .update(rawIp)
      .digest("hex");
    const seenAt = parseApacheTime(line, this.now());
    const exact = this.active.get(domain) ?? new Map<string, number>();
    exact.set(visitorHash, Math.max(exact.get(visitorHash) ?? 0, seenAt));
    this.active.set(domain, exact);
    const rolling = this.hll.get(domain) ?? new RollingHll24h();
    rolling.add(visitorHash, seenAt);
    this.hll.set(domain, rolling);
  }

  activeSamples(domains: string[]): ActiveVisitors3m[] {
    const measuredAt = this.now();
    this.pruneActive();
    return domains.map((domain) => ({
      domain,
      uniqueVisitorCount: this.active.get(domain)?.size ?? 0,
      windowSeconds: 180,
      windowStartedAt: new Date(measuredAt - 180_000).toISOString(),
      measuredAt: new Date(measuredAt).toISOString(),
      status: { state: "ok" },
    }));
  }

  visitors24hSamples(domains: string[]): Visitors24h[] {
    const measuredAt = this.now();
    const coverageSeconds = Math.min(
      86_400,
      Math.max(0, Math.floor((measuredAt - this.coverageStartedAt) / 1000)),
    );
    return domains.map((domain) => ({
      domain,
      uniqueVisitors24h: this.hll.get(domain)?.estimate(measuredAt) ?? 0,
      windowSeconds: 86400,
      coverageSeconds,
      measuredAt: new Date(measuredAt).toISOString(),
      algorithm: "hll",
      status:
        coverageSeconds < 86_400
          ? { state: "unknown", reason: "warming_up" }
          : { state: "ok" },
    }));
  }

  async persist(): Promise<void> {
    await writeJson(
      this.statePath,
      {
        salt: this.salt.toString("base64"),
        coverageStartedAt: new Date(this.coverageStartedAt).toISOString(),
        cursors: Object.fromEntries(this.cursors),
        hll: Object.fromEntries(
          Array.from(this.hll, ([domain, rolling]) => [
            domain,
            rolling.serialize(),
          ]),
        ),
      } satisfies Persisted,
      this.policy,
    );
  }

  private pruneActive(): void {
    const cutoff = this.now() - 180_000;
    for (const visitors of this.active.values())
      for (const [hash, seenAt] of visitors)
        if (seenAt < cutoff) visitors.delete(hash);
  }
}
