import { describe, expect, it } from "vitest";

import type { Phase1IngestPayload } from "./contracts/phase1-ingest.js";
import { createTypedIngestOutbox } from "./outbox.js";

function base(sentAt: string): Omit<Phase1IngestPayload, "discoveries" | "stackSnapshots" | "activeVisitors3m" | "visitors24h"> {
  return {
    schemaVersion: "phase1",
    agentInstanceId: "agent-1",
    agentVersion: "0.1.0",
    sentAt,
  };
}

function activePayload(
  count: number,
  sentAt = "2026-08-19T12:00:00.000Z",
): Phase1IngestPayload {
  return {
    ...base(sentAt),
    activeVisitors3m: [
      {
        domain: "example.com",
        uniqueVisitorCount: count,
        windowSeconds: 180,
        windowStartedAt: "2026-08-19T11:57:00.000Z",
        measuredAt: "2026-08-19T12:00:00.000Z",
        status: { state: "ok" },
      },
    ],
  };
}

describe("typed ingest outbox", () => {
  it("coalesces repeated active samples instead of growing the queue", () => {
    const outbox = createTypedIngestOutbox();

    for (let count = 1; count <= 100; count += 1) {
      outbox.enqueue(activePayload(count));
    }

    expect(outbox.size()).toBe(1);
    expect(outbox.pendingKinds()).toEqual(["active3m"]);
    expect(outbox.peek()?.payload.activeVisitors3m?.[0]?.uniqueVisitorCount).toBe(100);
  });

  it("keeps discovery and traffic as separate typed slots", () => {
    const outbox = createTypedIngestOutbox();
    outbox.enqueue(activePayload(7));
    outbox.enqueue({
      ...base("2026-08-19T12:00:01.000Z"),
      discoveries: [
        {
          domain: "example.com",
          aliases: ["www.example.com"],
          virtualHostName: "example-vhost",
          source: "openlitespeed",
          discoveredAt: "2026-08-19T12:00:01.000Z",
        },
      ],
    });

    expect(outbox.size()).toBe(2);
    expect(outbox.pendingKinds()).toEqual(["discovery", "active3m"]);
    expect(outbox.peek()?.kind).toBe("discovery");
  });

  it("merges stack snapshots by domain and keeps the newest value", () => {
    const outbox = createTypedIngestOutbox();
    outbox.enqueue({
      ...base("2026-08-19T12:00:00.000Z"),
      stackSnapshots: [
        {
          domain: "a.example.com",
          wordpressVersion: "6.8.1",
          phpVersion: "8.3.22",
          imagickVersion: "3.7.0",
          checkedAt: "2026-08-19T12:00:00.000Z",
          fieldStatus: {
            wordpressVersion: { state: "ok" },
            phpVersion: { state: "ok" },
            imagickVersion: { state: "ok" },
          },
        },
      ],
    });
    outbox.enqueue({
      ...base("2026-08-19T12:05:00.000Z"),
      stackSnapshots: [
        {
          domain: "b.example.com",
          wordpressVersion: "6.8.2",
          phpVersion: "8.3.23",
          imagickVersion: "3.8.0",
          checkedAt: "2026-08-19T12:05:00.000Z",
          fieldStatus: {
            wordpressVersion: { state: "ok" },
            phpVersion: { state: "ok" },
            imagickVersion: { state: "ok" },
          },
        },
        {
          domain: "a.example.com",
          wordpressVersion: "6.8.3",
          phpVersion: "8.3.24",
          imagickVersion: "3.8.0",
          checkedAt: "2026-08-19T12:05:00.000Z",
          fieldStatus: {
            wordpressVersion: { state: "ok" },
            phpVersion: { state: "ok" },
            imagickVersion: { state: "ok" },
          },
        },
      ],
    });

    const snapshots = outbox.peek()?.payload.stackSnapshots ?? [];
    expect(outbox.size()).toBe(1);
    expect(snapshots).toHaveLength(2);
    expect(snapshots.find((item) => item.domain === "a.example.com")?.wordpressVersion).toBe("6.8.3");
  });

  it("does not ACK a newer coalesced value that arrived while an older one was in flight", () => {
    const outbox = createTypedIngestOutbox();
    outbox.enqueue(activePayload(1, "2026-08-19T12:00:00.000Z"));
    const inFlight = outbox.peek();
    expect(inFlight).not.toBeNull();

    outbox.enqueue(activePayload(2, "2026-08-19T12:00:30.000Z"));
    outbox.ack(inFlight!);

    expect(outbox.size()).toBe(1);
    expect(outbox.peek()?.payload.activeVisitors3m?.[0]?.uniqueVisitorCount).toBe(2);
  });

  it("prunes pending domain-scoped state when discovery confirms removal", () => {
    const outbox = createTypedIngestOutbox();
    outbox.enqueue(activePayload(4));
    outbox.enqueue({
      ...base("2026-08-19T12:01:00.000Z"),
      discoveries: [],
    });

    expect(outbox.pendingKinds()).toEqual(["discovery"]);
  });
});
