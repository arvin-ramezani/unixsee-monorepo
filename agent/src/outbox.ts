import type {
  Phase1DiscoveryPayload,
  Phase1IngestPayload,
  Phase1StackSnapshotPayload,
  Phase1Visitors24hPayload,
} from "./contracts/phase1-ingest.js";
import type { ActiveVisitorsSample } from "./traffic.js";

export type IngestQueueKind =
  | "discovery"
  | "stack"
  | "visitors24h"
  | "active3m";

type Envelope = Pick<
  Phase1IngestPayload,
  "schemaVersion" | "agentInstanceId" | "agentVersion" | "sentAt"
>;

type DomainValue =
  | Phase1StackSnapshotPayload
  | ActiveVisitorsSample
  | Phase1Visitors24hPayload;

type DomainEntry<T extends DomainValue> = {
  value: T;
  revision: number;
};

type DomainSlot<T extends DomainValue> = {
  envelope: Envelope | null;
  entries: Map<string, DomainEntry<T>>;
  revision: number;
  present: boolean;
};

type DiscoverySlot = {
  envelope: Envelope;
  discoveries: Phase1DiscoveryPayload[];
  revision: number;
};

type AckToken =
  | {
      kind: "discovery";
      revision: number;
    }
  | {
      kind: Exclude<IngestQueueKind, "discovery">;
      revision: number;
      entryRevisions: ReadonlyMap<string, number>;
    };

export type QueuedIngestItem = {
  kind: IngestQueueKind;
  payload: Phase1IngestPayload;
  /** Internal optimistic ACK token. Callers must pass this exact item to ack(). */
  ackToken: AckToken;
};

export type TypedIngestOutbox = {
  enqueue: (payload: Phase1IngestPayload) => void;
  peek: () => QueuedIngestItem | null;
  ack: (item: QueuedIngestItem) => void;
  size: () => number;
  clear: () => void;
  pendingKinds: () => IngestQueueKind[];
};

const PRIORITY: readonly IngestQueueKind[] = [
  "discovery",
  "stack",
  "visitors24h",
  "active3m",
];

function createDomainSlot<T extends DomainValue>(): DomainSlot<T> {
  return {
    envelope: null,
    entries: new Map(),
    revision: 0,
    present: false,
  };
}

function envelopeOf(payload: Phase1IngestPayload): Envelope {
  return {
    schemaVersion: payload.schemaVersion,
    agentInstanceId: payload.agentInstanceId,
    ...(payload.agentVersion !== undefined
      ? { agentVersion: payload.agentVersion }
      : {}),
    sentAt: payload.sentAt,
  };
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function replaceDiscovery(
  payload: Phase1IngestPayload,
  nextRevision: () => number,
): DiscoverySlot | null {
  if (payload.discoveries === undefined) return null;

  return {
    envelope: envelopeOf(payload),
    discoveries: payload.discoveries.map((item) => ({
      ...item,
      aliases: [...item.aliases],
    })),
    revision: nextRevision(),
  };
}

function mergeDomainSection<T extends DomainValue>(
  slot: DomainSlot<T>,
  payload: Phase1IngestPayload,
  items: readonly T[] | undefined,
  nextRevision: () => number,
): void {
  if (items === undefined) return;

  slot.envelope = envelopeOf(payload);
  slot.present = true;
  slot.revision = nextRevision();

  for (const item of items) {
    const domain = normalizeDomain(item.domain);
    slot.entries.set(domain, {
      value: { ...item, domain } as T,
      revision: slot.revision,
    });
  }
}

function pruneDomainSlot<T extends DomainValue>(
  slot: DomainSlot<T>,
  activeDomains: ReadonlySet<string>,
): void {
  for (const domain of slot.entries.keys()) {
    if (!activeDomains.has(domain)) {
      slot.entries.delete(domain);
    }
  }
}

function buildDomainItem<T extends DomainValue>(
  kind: Exclude<IngestQueueKind, "discovery">,
  slot: DomainSlot<T>,
  sectionName: "stackSnapshots" | "activeVisitors3m" | "visitors24h",
): QueuedIngestItem | null {
  if (!slot.present || !slot.envelope) return null;

  const entries = [...slot.entries.entries()];
  const entryRevisions = new Map(
    entries.map(([domain, entry]) => [domain, entry.revision]),
  );
  const values = entries.map(([, entry]) => entry.value);

  return {
    kind,
    payload: {
      ...slot.envelope,
      [sectionName]: values,
    } as Phase1IngestPayload,
    ackToken: {
      kind,
      revision: slot.revision,
      entryRevisions,
    },
  };
}

/**
 * In-memory typed ingest outbox.
 *
 * Coalescing rules:
 * - discovery: latest complete inventory snapshot replaces the previous one;
 * - stack: latest unsent snapshot per domain wins;
 * - active 3m: latest unsent sample per domain wins;
 * - visitors 24h: latest unsent sample per domain wins.
 *
 * A discovery snapshot also prunes pending domain-scoped data for domains that
 * are no longer part of the effective inventory. This prevents stale traffic
 * or stack state for a confirmed-removed site from being sent after removal.
 *
 * ACK is revision-aware. If a newer value arrives while an older value is in
 * flight, acknowledging the older send does not delete the newer value.
 */
export function createTypedIngestOutbox(): TypedIngestOutbox {
  let revision = 0;
  let discovery: DiscoverySlot | null = null;
  const stack = createDomainSlot<Phase1StackSnapshotPayload>();
  const active3m = createDomainSlot<ActiveVisitorsSample>();
  const visitors24h = createDomainSlot<Phase1Visitors24hPayload>();

  const nextRevision = () => {
    revision += 1;
    return revision;
  };

  function enqueue(payload: Phase1IngestPayload): void {
    if (payload.discoveries !== undefined) {
      discovery = replaceDiscovery(payload, nextRevision);
      const activeDomains = new Set(
        payload.discoveries.map((item) => normalizeDomain(item.domain)),
      );
      pruneDomainSlot(stack, activeDomains);
      pruneDomainSlot(active3m, activeDomains);
      pruneDomainSlot(visitors24h, activeDomains);
    }

    mergeDomainSection(
      stack,
      payload,
      payload.stackSnapshots,
      nextRevision,
    );
    mergeDomainSection(
      active3m,
      payload,
      payload.activeVisitors3m,
      nextRevision,
    );
    mergeDomainSection(
      visitors24h,
      payload,
      payload.visitors24h,
      nextRevision,
    );
  }

  function peek(): QueuedIngestItem | null {
    for (const kind of PRIORITY) {
      if (kind === "discovery") {
        if (!discovery) continue;
        return {
          kind,
          payload: {
            ...discovery.envelope,
            discoveries: discovery.discoveries.map((item) => ({
              ...item,
              aliases: [...item.aliases],
            })),
          },
          ackToken: {
            kind,
            revision: discovery.revision,
          },
        };
      }

      if (kind === "stack") {
        const item = buildDomainItem("stack", stack, "stackSnapshots");
        if (item) return item;
        continue;
      }

      if (kind === "visitors24h") {
        const item = buildDomainItem(
          "visitors24h",
          visitors24h,
          "visitors24h",
        );
        if (item) return item;
        continue;
      }

      const item = buildDomainItem(
        "active3m",
        active3m,
        "activeVisitors3m",
      );
      if (item) return item;
    }

    return null;
  }

  function ackDomainSlot<T extends DomainValue>(
    slot: DomainSlot<T>,
    token: Extract<AckToken, { kind: Exclude<IngestQueueKind, "discovery"> }>,
  ): void {
    for (const [domain, sentRevision] of token.entryRevisions) {
      const current = slot.entries.get(domain);
      if (current?.revision === sentRevision) {
        slot.entries.delete(domain);
      }
    }

    if (slot.revision === token.revision && slot.entries.size === 0) {
      slot.present = false;
      slot.envelope = null;
    }
  }

  function ack(item: QueuedIngestItem): void {
    const token = item.ackToken;

    if (token.kind === "discovery") {
      if (discovery?.revision === token.revision) {
        discovery = null;
      }
      return;
    }

    if (token.kind === "stack") {
      ackDomainSlot(stack, token);
      return;
    }
    if (token.kind === "visitors24h") {
      ackDomainSlot(visitors24h, token);
      return;
    }
    ackDomainSlot(active3m, token);
  }

  function pendingKinds(): IngestQueueKind[] {
    const result: IngestQueueKind[] = [];
    if (discovery) result.push("discovery");
    if (stack.present) result.push("stack");
    if (visitors24h.present) result.push("visitors24h");
    if (active3m.present) result.push("active3m");
    return result;
  }

  function clear(): void {
    discovery = null;
    stack.entries.clear();
    stack.envelope = null;
    stack.present = false;
    active3m.entries.clear();
    active3m.envelope = null;
    active3m.present = false;
    visitors24h.entries.clear();
    visitors24h.envelope = null;
    visitors24h.present = false;
  }

  return {
    enqueue,
    peek,
    ack,
    size: () => pendingKinds().length,
    clear,
    pendingKinds,
  };
}
