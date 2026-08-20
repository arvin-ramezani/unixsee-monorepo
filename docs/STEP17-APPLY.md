# Step 17 — Independent engine schedulers

This step replaces the remaining mixed engine transmit loop with independent
Phase 1 schedulers.

## Runtime cadence

- Heartbeat: `HEARTBEAT_INTERVAL_MS` (default 30 seconds)
- OLS discovery: `OLS_DISCOVERY_INTERVAL_MS` (default 10 minutes; supported 5–10 minutes)
- Active visitors: `ACTIVE_VISITOR_SAMPLE_INTERVAL_MS` (30 seconds)
- 24h visitors: `VISITORS_24H_SAMPLE_INTERVAL_MS` (5 minutes)
- Site stack: `STACK_PROBE_INTERVAL_MS` (6 hours)
- Access-log tail/reconciliation remains owned by `traffic.ts`

## Startup

The startup OLS scan has already happened before `createEngine()` is called.
The engine therefore immediately:

1. reconciles traffic tails for the current effective inventory,
2. sends heartbeat,
3. publishes the current discovery snapshot,
4. probes stack for all current domains,
5. publishes active visitors,
6. publishes latest-24h visitors.

It does not perform a duplicate OLS scan at startup.

## New domains

A successful scheduled discovery scan updates the effective inventory and sends
an independent discovery payload. Domains reported in `discoveryChanges.added`
receive an immediate stack probe without waiting for the 6-hour stack interval.

## Non-overlap

Each periodic responsibility has its own scheduler. The same scheduler cannot
overlap itself; an overlapping tick is skipped. A slow stack probe does not
block heartbeat, discovery, or traffic schedulers.

## Configuration migration

Remove:

```text
TRANSMIT_INTERVAL_MS
REDISCOVERY_INTERVAL_MS
```

Use:

```text
HEARTBEAT_INTERVAL_MS=30000
OLS_DISCOVERY_INTERVAL_MS=600000
STACK_PROBE_INTERVAL_MS=21600000
ACTIVE_VISITOR_SAMPLE_INTERVAL_MS=30000
VISITORS_24H_SAMPLE_INTERVAL_MS=300000
```

## Deferred

This step intentionally does not add:

- per-domain stack due timestamps / jitter / concurrency queue,
- manual stack commands,
- typed/coalescing offline outbox,
- command-result persistence.

Those remain later steps.
