# Phase 1 agent API contract

> **Status:** Accepted — migration in progress to web-server-only PRD v0.2  
> **ADR:** [`../architecture/decisions/0008-phase1-agent-typescript-node.md`](../architecture/decisions/0008-phase1-agent-typescript-node.md)  
> **PRD:** [`./prd.md`](./prd.md)  
> **Last verified:** 2026-08-19

Audience: `/api/internal/agent/v1/*` (not browser-facing). Auth: one-time
`x-enrollment-token` for enroll; HMAC headers `x-agent-timestamp` +
`x-agent-signature` for heartbeat/ingest. Signature = HMAC-SHA256 hex over
`{timestamp}.{rawJsonBody}` using the enrolled secret. Nest verifies the HMAC
against the raw request body bytes.

The installation identity is `agentInstanceId`. It is generated and persisted
by the Unixsee agent and is not an OS/hardware fingerprint.

## Enroll

`POST /api/internal/agent/v1/enroll`

Headers: `x-enrollment-token: <one-time>`

```json
{
  "agentInstanceId": "<persisted agent UUID>",
  "agentVersion": "0.2.0"
}
```

Response `data`:

```json
{
  "vpsNodeId": "uuid",
  "serverId": "uuid",
  "secretKey": "returned-once"
}
```

## Heartbeat

`POST /api/internal/agent/v1/heartbeat` (HMAC)

```json
{
  "schemaVersion": "phase1",
  "agentInstanceId": "...",
  "agentVersion": "0.2.0",
  "serverBinding": { "hostname": "transitional-optional" },
  "sentAt": "2026-08-19T12:00:00.000Z"
}
```

`serverBinding.hostname` remains transitional until the later identity/security
cleanup removes host metadata collection from the Phase 1 agent.

## Ingest

`POST /api/internal/agent/v1/ingest` (HMAC)

The envelope contains at least one typed section. Every section is independently
optional and independently scheduled.

```json
{
  "schemaVersion": "phase1",
  "agentInstanceId": "...",
  "agentVersion": "0.2.0",
  "sentAt": "2026-08-19T12:00:00.000Z",

  "discoveries": [],
  "stackSnapshots": [],
  "activeVisitors3m": [],
  "visitors24h": []
}
```

Omission and an empty discovery array are intentionally different:

- omitted `discoveries` = no discovery scan happened in this ingest;
- `discoveries: []` = a discovery scan completed and its effective inventory was empty.

### Discovery section

Discovery is OLS inventory only.

```json
{
  "domain": "example.com",
  "aliases": ["www.example.com"],
  "virtualHostName": "example.com",
  "source": "openlitespeed",
  "discoveredAt": "2026-08-19T12:00:00.000Z"
}
```

The agent must not send discovery-owned values for:

- document root / home directory,
- DirectAdmin user,
- app type,
- backend address,
- DirectAdmin/control-panel URL,
- WordPress admin URL,
- WordPress/PHP/Imagick versions,
- PHP scope,
- WordPress update state,
- generic discovery field-status maps.

Unknown fields are rejected by Nest validation.

### Stack snapshot section

WordPress/PHP/Imagick belong only to `stackSnapshots`.

```json
{
  "domain": "example.com",
  "wordpressVersion": "6.8.2",
  "phpVersion": "8.3.23",
  "imagickVersion": "3.8.0",
  "checkedAt": "2026-08-19T12:00:00.000Z",
  "fieldStatus": {
    "wordpressVersion": { "state": "ok" },
    "phpVersion": { "state": "ok" },
    "imagickVersion": { "state": "ok" }
  }
}
```

A failed/unsupported field must be `null` with an explicit state/reason. Nest
preserves the last successful version and records the newer check status/time.

### Active visitors section

```json
{
  "domain": "example.com",
  "uniqueIpCount": 12,
  "windowSeconds": 180,
  "windowStartedAt": "2026-08-19T11:57:00.000Z",
  "measuredAt": "2026-08-19T12:00:00.000Z",
  "status": { "state": "ok" }
}
```

`uniqueIpCount` is transitional terminology and will be renamed when the traffic
implementation is rewritten around local visitor keys.

### Latest 24h visitors section

```json
{
  "domain": "example.com",
  "uniqueVisitors24h": 487,
  "windowSeconds": 86400,
  "coverageSeconds": 86400,
  "measuredAt": "2026-08-19T12:00:00.000Z",
  "algorithm": "hll",
  "status": { "state": "ok" }
}
```

Partial coverage cannot use `status.state = ok`.

## Ownership rules

- discovery creates/updates OLS inventory only;
- stack snapshots update technical versions/status only;
- traffic sections update traffic storage only;
- agent ingest never updates manual DirectAdmin/control-panel or WordPress admin URLs;
- stack/traffic records do not implicitly create discoveries for unknown domains.

### Manual URL ownership

Manual links are canonical backend/admin metadata, not agent/discovery data:

- `Server.controlPanelUrl` owns the DirectAdmin/control-panel URL for the VPS;
- `Website.wordpressAdminUrl` owns the WordPress admin URL for the managed site.

Admin API write paths:

- `POST /api/v1/admin/servers` may set `controlPanelUrl`;
- `PATCH /api/v1/admin/servers/:id` may set or clear `controlPanelUrl`;
- `POST /api/v1/admin/websites` may set `wordpressAdminUrl`;
- `PATCH /api/v1/admin/websites/:id` may set or clear `wordpressAdminUrl`.

Legacy `WebsiteDiscovery.controlPanelUrl` and
`WebsiteDiscovery.wordpressAdminUrl` columns may remain nullable during the
migration window, but they are not canonical and new agent ingest must never
write them.
