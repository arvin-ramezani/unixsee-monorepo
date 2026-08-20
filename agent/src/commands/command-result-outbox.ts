import {
  readAgentStateFile,
  writeAgentStateFileAtomic,
} from "../security/filesystem.js";
import type {
  AgentCommandResultPayload,
  PendingAgentCommandResult,
} from "./types.js";

const STATE_FILE = "command-results.json";
const STATE_VERSION = 1;

type PersistedState = {
  version: 1;
  records: PendingAgentCommandResult[];
};

export interface CommandResultOutbox {
  enqueue(
    result: AgentCommandResultPayload,
    commandExpiresAt: string,
  ): Promise<void>;
  has(commandId: string): Promise<boolean>;
  list(now?: Date): Promise<PendingAgentCommandResult[]>;
  ack(commandId: string): Promise<void>;
  size(now?: Date): Promise<number>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseResult(value: unknown): PendingAgentCommandResult | null {
  if (!isRecord(value) || !isRecord(value.result)) return null;
  const result = value.result;
  const commandExpiresAt = value.commandExpiresAt;

  if (
    typeof commandExpiresAt !== "string" ||
    !Number.isFinite(Date.parse(commandExpiresAt)) ||
    result.schemaVersion !== "phase1" ||
    typeof result.agentInstanceId !== "string" ||
    typeof result.commandId !== "string" ||
    result.type !== "REFRESH_SITE_STACK" ||
    typeof result.domain !== "string" ||
    (result.status !== "SUCCEEDED" && result.status !== "FAILED") ||
    typeof result.completedAt !== "string" ||
    !Number.isFinite(Date.parse(result.completedAt))
  ) {
    return null;
  }

  return {
    commandExpiresAt,
    result: result as unknown as AgentCommandResultPayload,
  };
}

export function createCommandResultOutbox(): CommandResultOutbox {
  let loaded = false;
  let records = new Map<string, PendingAgentCommandResult>();
  let mutation = Promise.resolve();

  async function ensureLoaded(): Promise<void> {
    if (loaded) return;
    const raw = await readAgentStateFile(STATE_FILE);
    if (!raw) {
      loaded = true;
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Persisted command result state is invalid JSON.");
    }

    if (!isRecord(parsed) || parsed.version !== STATE_VERSION) {
      throw new Error("Persisted command result state has an unsupported version.");
    }

    if (!Array.isArray(parsed.records)) {
      throw new Error("Persisted command result state is missing records.");
    }

    for (const item of parsed.records) {
      const valid = parseResult(item);
      if (!valid) {
        throw new Error("Persisted command result state contains an invalid record.");
      }
      records.set(valid.result.commandId, valid);
    }
    loaded = true;
  }

  async function persist(): Promise<void> {
    const state: PersistedState = {
      version: STATE_VERSION,
      records: [...records.values()],
    };
    const serialized = `${JSON.stringify(state, null, 2)}\n`;
    mutation = mutation.then(() =>
      writeAgentStateFileAtomic(STATE_FILE, serialized),
    );
    await mutation;
  }

  async function pruneExpired(now: Date): Promise<boolean> {
    let changed = false;
    for (const [id, pending] of records) {
      if (Date.parse(pending.commandExpiresAt) <= now.getTime()) {
        records.delete(id);
        changed = true;
      }
    }
    return changed;
  }

  return {
    async enqueue(result, commandExpiresAt) {
      await ensureLoaded();
      records.set(result.commandId, { result, commandExpiresAt });
      await persist();
    },

    async has(commandId) {
      await ensureLoaded();
      const changed = await pruneExpired(new Date());
      if (changed) await persist();
      return records.has(commandId);
    },

    async list(now = new Date()) {
      await ensureLoaded();
      const changed = await pruneExpired(now);
      if (changed) await persist();
      return [...records.values()].sort((a, b) =>
        a.result.completedAt.localeCompare(b.result.completedAt),
      );
    },

    async ack(commandId) {
      await ensureLoaded();
      if (!records.delete(commandId)) return;
      await persist();
    },

    async size(now = new Date()) {
      await ensureLoaded();
      const changed = await pruneExpired(now);
      if (changed) await persist();
      return records.size;
    },
  };
}
