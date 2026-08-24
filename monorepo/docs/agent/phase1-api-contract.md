# Phase 1 agent API contract — web-server-only v0.2

> **Status:** Accepted
> **Canonical product requirements:** [`prd.md`](./prd.md)
> **Cutover:** hard cutover; `machineId` is not accepted

All routes are under `/api/internal/agent/v1`. Enrollment uses a one-time
`X-Enrollment-Token`; heartbeat, ingest, and command results use
`X-Agent-Timestamp` and `X-Agent-Signature`. The signature is lowercase
HMAC-SHA256 over `<timestamp>.<exact JSON body>`.

## Identity and enrollment

`POST /enroll`

```json
{ "agentInstanceId": "installation UUID", "agentVersion": "0.2.0" }
```

A successful enrollment binds the generated installation UUID and a newly
issued secret to the server's existing VPS node, preserving its relationships.
The response contains `vpsNodeId`, `serverId`, and the one-time `secretKey`.

## Heartbeat and commands

`POST /heartbeat`

```json
{
  "schemaVersion": "phase1",
  "agentInstanceId": "installation UUID",
  "agentVersion": "0.2.0",
  "sentAt": "2026-08-21T08:00:00.000Z"
}
```

No hostname or host telemetry is collected. The response is:

```json
{
  "agent": { "agentInstanceId": "...", "status": "ONLINE", "lastHeartbeatAt": "..." },
  "commands": [{ "id": "...", "type": "REFRESH_SITE_STACK", "domain": "example.com", "expiresAt": "...", "leaseExpiresAt": "..." }]
}
```

Commands expire after 10 minutes, leases last 2 minutes, and at most three
attempts are permitted.

## Independently optional ingest

`POST /ingest`

The envelope always contains `schemaVersion`, `agentInstanceId`, `agentVersion`,
and `sentAt`. Each section below is independently optional and queued/sent on
its own schedule.

- `discoveries`: complete, post-debounce OLS inventory. Presence of the key,
  including an empty array, triggers reconciliation. Each row owns only
  `domain`, `aliases`, `virtualHostName`, `source: "openlitespeed"`, and
  `discoveredAt`.
- `siteStacks`: per-domain `wordpressVersion`, `phpVersion`, `imagickVersion`,
  `checkedAt`, and explicit `fieldStatus` values (`ok`, `unknown`, or
  `unsupported`). Failed fields do not erase last-good values.
- `activeVisitors3m`: `uniqueVisitorCount`, `windowSeconds: 180`, window start,
  measurement time, and status.
- `visitors24h`: local HLL result with `windowSeconds: 86400`, coverage seconds,
  `algorithm: "hll"`, measurement time, and status.

Agent ingest never owns `Server.controlPanelUrl` or
`Website.wordpressAdminUrl`, and it never appends to the legacy active-visitor
history table.

## Command results

`POST /commands/:id/result`

```json
{
  "agentInstanceId": "installation UUID",
  "status": "SUCCEEDED",
  "finishedAt": "2026-08-21T08:01:00.000Z",
  "stackSnapshot": { "domain": "example.com", "checkedAt": "...", "wordpressVersion": "6.8.2", "phpVersion": "8.3.12", "imagickVersion": "3.7.0", "fieldStatus": {} }
}
```

Only `SUCCEEDED` and `FAILED` are accepted. Nest validates installation,
domain, command, and lease binding. Duplicate terminal results are idempotent;
a successful result stores the stack snapshot atomically.

## Admin routes

- `GET/PATCH /api/v1/admin/servers/:id` — includes admin-owned
  `controlPanelUrl` (HTTPS or null).
- `GET/PATCH /api/v1/admin/websites/:id` — includes admin-owned
  `wordpressAdminUrl` plus latest discovery, stack, traffic, server, and agent
  context.
- `POST /api/v1/admin/discoveries/:id/stack-refresh`
- `POST /api/v1/admin/websites/:id/stack-refresh`
- `GET /api/v1/admin/agent-commands/:id`

Duplicate refresh requests return the active command.
