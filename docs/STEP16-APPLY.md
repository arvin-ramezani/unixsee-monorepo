# Step 16 — Separate 24-hour coverage from cardinality

This step makes the two concepts independent:

- `traffic-hll.json` owns only the rolling 24-hour observed-cardinality sketch.
- `traffic-coverage.json` owns only the latest continuous observation coverage.

A proven cursor/rotation gap resets coverage but does not clear valid HLL
observations from before the gap. The outgoing payload still contains both:
`uniqueVisitors24h` and `coverageSeconds`, with status derived from coverage.

## Files

- `agent/src/traffic-coverage.ts` (new)
- `agent/src/traffic-coverage.test.ts` (new)
- `agent/src/traffic-hll.ts`
- `agent/src/traffic-hll.test.ts`
- `agent/src/traffic.ts`

## Persistence

- `/opt/unixsee-agent/state/traffic-hll.json`: HLL registers/buckets only.
- `/opt/unixsee-agent/state/traffic-coverage.json`: continuous start, last observed timestamp, reason only.

No raw IP, visitor key, raw log line, or log path is stored in either file.

## Gap semantics

Normal restart with an intact cursor:

- HLL survives.
- Coverage survives and extends after bounded catch-up verifies the stream.

Fresh install:

- HLL starts from observed traffic.
- Coverage starts as `unknown/warming_up`.

Unrecoverable cursor/rotation gap:

- HLL is NOT reset.
- Coverage continuous start is reset to the recovered segment.
- Status becomes `unknown/log_cursor_gap` or `unknown/log_rotated_gap`.
- After 24 continuous hours of verified observation, status becomes `ok` again.

Current missing/unreadable log:

- current traffic read error remains `unsupported`.
- coverage does not advance while the log cannot be verified.
