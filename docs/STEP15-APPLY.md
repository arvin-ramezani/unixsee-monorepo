# Step 15 — rolling 24-hour HLL ring

This step adds privacy-preserving local 24-hour unique-visitor cardinality.

## Files

- `agent/src/traffic-hll.ts` — persisted 5-minute HLL ring (`p=12`, 288 buckets)
- `agent/src/traffic-hll.test.ts` — deterministic estimator/persistence/expiry tests
- `agent/src/traffic.ts` — feeds local visitor keys into HLL and exposes 24h samples
- `agent/src/engine.ts` — independent 5-minute `visitors24h` ingest tick
- `agent/src/engine.integration.test.ts` — 24h typed-section coverage
- `agent/src/config/config.ts` — `VISITORS_24H_SAMPLE_INTERVAL_MS=300000`
- `agent/.env.example` — new schedule setting

## Persistent state

`/opt/unixsee-agent/state/traffic-hll.json`

The file contains only derived HLL registers and coverage metadata. It never
contains raw IP addresses, raw access-log lines, or pseudonymous visitor keys.

## Coverage semantics

- normal restart + intact cursor: persisted HLL/coverage survives;
- fresh install: partial/warming coverage begins from the bounded recovered tail;
- cursor gap / rotation / truncation: that domain's HLL window is reset and
  reports partial coverage until 24 hours of continuous observable traffic is
  rebuilt;
- a missing/unreadable current log is surfaced as unsupported by `traffic.ts`.

## Schedule

`VISITORS_24H_SAMPLE_INTERVAL_MS=300000` (exactly 5 minutes for Phase 1).

The backend typed ingest/storage already accepts `visitors24h`, so this step
requires no new Prisma migration.
