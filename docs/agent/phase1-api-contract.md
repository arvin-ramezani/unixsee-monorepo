# Phase 1 agent API contract

> **Status:** Accepted  
> **ADR:** [`../architecture/decisions/0008-phase1-agent-typescript-node.md`](../architecture/decisions/0008-phase1-agent-typescript-node.md)  
> **PRD:** [`./prd.md`](./prd.md)  
> **Last verified:** 2026-08-09

Audience: `/api/internal/agent/v1/*` (not browser-facing). Auth: one-time
`x-enrollment-token` for enroll; HMAC headers `x-agent-timestamp` +
`x-agent-signature` for heartbeat/ingest. Signature = HMAC-SHA256 hex over
`{timestamp}.{rawJsonBody}` using the enrolled secret. Nest verifies that
HMAC against the **raw request body bytes** (not a re-serialized parsed
object). Enrollment tokens are single-consume (atomic ACTIVE→USED) and
Enrollment tokens are single-consume (atomic ACTIVE→USED) and may
re-provision only when `machineId` already belongs to the **same** server;
cross-server rebind is rejected with the same generic validation error as an
invalid token (no distinct 409 oracle). Ingest caps `discoveries` and
`activeVisitors3m` at 200 entries each; optional `controlPanelUrl` /
`wordpressAdminUrl` must be HTTPS when present.

Legacy monitor batch ingest (`batch[].metrics` host telemetry) is **not** the
Phase 1 contract. See ADR 0008.

## Enroll

`POST /api/internal/agent/v1/enroll`

Headers: `x-enrollment-token: <one-time>`

```json
{ "machineId": "<from /etc/machine-id>", "agentVersion": "0.1.0" }
```

Response `data`: `{ "vpsNodeId", "serverId", "secretKey" }` — `secretKey` once.

## Heartbeat

`POST /api/internal/agent/v1/heartbeat` (HMAC)

```json
{
  "schemaVersion": "phase1",
  "machineId": "...",
  "agentVersion": "0.1.0",
  "serverBinding": { "hostname": "optional" },
  "sentAt": "2026-08-09T12:00:00.000Z"
}
```

## Ingest

`POST /api/internal/agent/v1/ingest` (HMAC)

```json
{
  "schemaVersion": "phase1",
  "machineId": "...",
  "agentVersion": "0.1.0",
  "sentAt": "2026-08-09T12:00:00.000Z",
  "discoveries": [
    {
      "domain": "farcoland.com",
      "aliases": ["www.farcoland.com"],
      "documentRoot": "/home/user/domains/farcoland.com/public_html",
      "owner": "user",
      "appType": "woocommerce",
      "source": "openlitespeed",
      "backendAddress": null,
      "controlPanelUrl": "https://host:2222",
      "wordpressAdminUrl": "https://farcoland.com/wp-admin/",
      "wordpressVersion": "6.8.1",
      "phpVersion": "8.2.28",
      "phpVersionScope": "host",
      "imagickVersion": "3.7.0",
      "wordpressUpdateStatus": "up_to_date",
      "wordpressUpdateCheckedAt": "2026-08-09T11:55:00.000Z",
      "fieldStatus": {
        "imagickVersion": { "state": "ok" }
      }
    }
  ],
  "activeVisitors3m": [
    {
      "domain": "farcoland.com",
      "uniqueIpCount": 12,
      "windowSeconds": 180,
      "windowStartedAt": "2026-08-09T11:57:00.000Z",
      "measuredAt": "2026-08-09T12:00:00.000Z",
      "status": { "state": "ok" }
    }
  ]
}
```

### Field status

Missing values use `unknown` / `unsupported` with a reason code inside
`fieldStatus` — never fabricated zeros.

When an access log is missing or unreadable, `activeVisitors3m[].uniqueIpCount`
may be `0` but **must** include `status: { "state": "unsupported", "reason": "..." }`
(for example `log_missing` / `log_unreadable`) so Nest/UI do not treat it as
fabricated traffic. A readable empty window uses `uniqueIpCount: 0` with
`status: { "state": "ok" }`. Bare zeros without `status` are rejected.

### Access logs

Agent tails `/var/log/httpd/domains/{domain}.log` for unique client IPs over a
rolling 180-second window.

## Admin sync (read models)

Staff JWT only. Browser never sees `secretKey`. Enrollment plaintext returned
once from `POST /api/v1/admin/servers/:id/enrollment-tokens`. Agent credential
revoke: `POST /api/v1/admin/servers/:id/agent/revoke` with reason.
