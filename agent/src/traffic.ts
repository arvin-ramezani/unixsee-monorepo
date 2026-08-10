import { createReadStream, watch, type FSWatcher } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createInterface } from "node:readline";
import { join } from "node:path";

import { getConfig } from "./config/config.js";

export type VisitorFieldState = "ok" | "unknown" | "unsupported";

export interface VisitorStatus {
  state: VisitorFieldState;
  reason?: string;
}

export interface ActiveVisitorsSample {
  domain: string;
  uniqueIpCount: number;
  windowSeconds: number;
  windowStartedAt: string;
  measuredAt: string;
  status?: VisitorStatus;
}

interface IpHit {
  ip: string;
  atMs: number;
}

interface DomainTailState {
  domain: string;
  logPath: string;
  hits: IpHit[];
  byteOffset: number;
  inode: number | null;
  watching: boolean;
  watcher: FSWatcher | null;
  readError: VisitorStatus | null;
}

const domainStates = new Map<string, DomainTailState>();

const IP_PATTERN = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]/;

function parseLogLine(line: string): { ip: string; atMs: number } | null {
  const match = line.match(IP_PATTERN);
  if (!match) return null;

  const ip = match[1];
  if (!ip || ip === "-") return null;

  const date = new Date(match[2].replace(":", " "));
  const atMs = Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
  return { ip, atMs };
}

function pruneHits(hits: IpHit[], windowMs: number, nowMs: number): IpHit[] {
  const cutoff = nowMs - windowMs;
  return hits.filter((hit) => hit.atMs >= cutoff);
}

function uniqueIpCount(hits: IpHit[]): number {
  return new Set(hits.map((hit) => hit.ip)).size;
}

function closeWatcher(state: DomainTailState): void {
  if (state.watcher) {
    state.watcher.close();
    state.watcher = null;
  }
  state.watching = false;
}

async function ensureState(domain: string): Promise<DomainTailState> {
  const existing = domainStates.get(domain);
  if (existing) return existing;

  const logPath = join(getConfig().accessLogDir, `${domain}.log`);
  const state: DomainTailState = {
    domain,
    logPath,
    hits: [],
    byteOffset: 0,
    inode: null,
    watching: false,
    watcher: null,
    readError: null,
  };
  domainStates.set(domain, state);
  return state;
}

async function readNewLines(state: DomainTailState): Promise<void> {
  try {
    await access(state.logPath);
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code)
        : undefined;
    state.readError = {
      state: "unsupported",
      reason: code === "ENOENT" ? "log_missing" : "log_unreadable",
    };
    return;
  }

  try {
    const fileStats = await stat(state.logPath);
    const inode = Number(fileStats.ino);
    if (state.inode !== null && inode !== state.inode) {
      state.byteOffset = 0;
    }
    state.inode = inode;

    if (fileStats.size < state.byteOffset) {
      state.byteOffset = 0;
    }
    if (fileStats.size === state.byteOffset) {
      state.readError = null;
      return;
    }

    const stream = createReadStream(state.logPath, {
      encoding: "utf-8",
      start: state.byteOffset,
    });
    const reader = createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of reader) {
      const parsed = parseLogLine(line);
      if (parsed) {
        state.hits.push(parsed);
      }
    }

    state.byteOffset = fileStats.size;
    state.readError = null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    state.readError = {
      state: "unsupported",
      reason: `log_read_failed:${message.slice(0, 80)}`,
    };
  }
}

function startWatch(state: DomainTailState): void {
  if (state.watching) return;

  try {
    const watcher = watch(state.logPath, () => {
      void readNewLines(state).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[Traffic] Tail failed for ${state.domain}: ${message}`);
        state.readError = {
          state: "unsupported",
          reason: "log_watch_read_failed",
        };
      });
    });
    state.watcher = watcher;
    state.watching = true;
  } catch {
    state.watching = false;
    state.watcher = null;
  }
}

export async function ensureTrafficTails(domains: string[]): Promise<void> {
  const active = new Set(domains);
  for (const domain of domains) {
    try {
      const state = await ensureState(domain);
      await readNewLines(state);
      startWatch(state);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Traffic] ensure failed for ${domain}: ${message}`);
      const state = await ensureState(domain);
      state.readError = {
        state: "unsupported",
        reason: "log_ensure_failed",
      };
    }
  }

  for (const [domain, state] of domainStates) {
    if (!active.has(domain)) {
      closeWatcher(state);
      domainStates.delete(domain);
    }
  }
}

export function collectActiveVisitors3m(
  domains: string[],
): ActiveVisitorsSample[] {
  const nowMs = Date.now();
  const windowMs = getConfig().trafficWindowSeconds * 1000;
  const measuredAt = new Date(nowMs).toISOString();
  const windowStartedAt = new Date(nowMs - windowMs).toISOString();
  const windowSeconds = getConfig().trafficWindowSeconds;

  return domains.map((domain) => {
    const state = domainStates.get(domain);
    if (!state) {
      return {
        domain,
        uniqueIpCount: 0,
        windowSeconds,
        windowStartedAt,
        measuredAt,
        status: { state: "unsupported", reason: "log_not_initialized" },
      };
    }

    if (state.readError) {
      return {
        domain,
        uniqueIpCount: 0,
        windowSeconds,
        windowStartedAt,
        measuredAt,
        status: state.readError,
      };
    }

    state.hits = pruneHits(state.hits, windowMs, nowMs);
    return {
      domain,
      uniqueIpCount: uniqueIpCount(state.hits),
      windowSeconds,
      windowStartedAt,
      measuredAt,
      status: { state: "ok" },
    };
  });
}

export function resetTrafficStateForTests(): void {
  for (const state of domainStates.values()) {
    closeWatcher(state);
  }
  domainStates.clear();
}
