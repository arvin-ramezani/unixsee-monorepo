# Customer websites contract

> Status: Accepted  
> Last verified: 2026-08-25

## List websites

`GET /api/v1/websites` is authenticated and tenant-scoped. Each item includes
website identity, management coverage, current availability fields, the active
plan summary when present, and `visitors24h`.

`visitors24h` is either `null` or:

| Field             | Type                                    | Meaning                                             |
| ----------------- | --------------------------------------- | --------------------------------------------------- |
| `uniqueVisitors`  | `number \| null`                        | Complete rolling 24-hour estimate when ready        |
| `windowSeconds`   | `number \| null`                        | Agent-declared window; `86400` for this metric      |
| `coverageSeconds` | `number \| null`                        | Amount of the window covered by the local aggregate |
| `measuredAt`      | ISO timestamp or `null`                 | Source measurement time                             |
| `status`          | `READY`, `COLLECTING`, or `UNAVAILABLE` | Customer-safe readiness state                       |

## Visitor rules

- NestJS exposes the persisted Phase 1 agent aggregate; it never derives the
  value by summing or averaging active-visitor samples.
- `READY` requires agent status `ok`, a complete 86,400-second window, complete
  coverage, and a non-null estimate.
- While the local HLL is warming up, the response uses `COLLECTING` and
  `uniqueVisitors: null`; the UI must not label the partial estimate as a
  complete 24-hour value.
- Missing, unsupported, or invalid snapshots use `UNAVAILABLE` or `null`.
- `EXTERNAL_INFRASTRUCTURE` and `UNCLASSIFIED` websites return
  `visitors24h: null`, even if an old snapshot exists. Managed-infrastructure
  telemetry is not applicable to external websites.

## Presentation

Customer UIs must visibly distinguish `UNIXSEE_MANAGED` from
`EXTERNAL_INFRASTRUCTURE`. An external website is labeled as external hosting;
individual managed fields may then use a concise not-applicable value. Unknown,
collecting, unavailable, and zero remain distinct states.
