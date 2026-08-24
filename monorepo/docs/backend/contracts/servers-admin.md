# Admin servers API contract

> **Status:** Accepted
>
> **Audience:** `/api/v1/admin/servers/*` (staff JWT + ADMIN/OPERATOR)
>
> **Product:** [`../../product/phase-1-application-features.md`](../../product/phase-1-application-features.md)
> · UX [`../../product/ux-flows/admin-servers-websites-agents.md`](../../product/ux-flows/admin-servers-websites-agents.md)
>
> **Last verified:** 2026-08-12

Staff server registry, one-time agent enrollment tokens, agent credential
revoke, and server delete. The admin panel never receives long-lived agent
secrets and never calls agent-plane enroll endpoints.

## Auth

- Global JWT (`AtGuard`)
- `@Roles(ADMIN, OPERATOR)` on the controller

## Trust boundary

| Allowed in admin UI | Forbidden in browser |
|---|---|
| Server CRUD metadata | `secretKey` / `AGENT_SECRET` |
| One-time enrollment `token` + `installCommand` on **create only** | `GET` plaintext token reload |
| Token / agent revoke | `/api/internal/agent/v1/*` |

Agent enroll is outbound: `POST /api/internal/agent/v1/enroll` with
`x-enrollment-token` (see [`../../agent/phase1-api-contract.md`](../../agent/phase1-api-contract.md)).

## Status vocabulary

### Agent state (derived on read)

| Value | Meaning |
|---|---|
| `PENDING_AGENT` | No usable node heartbeat; no ACTIVE enrollment token |
| `ENROLLMENT_ISSUED` | Latest token `ACTIVE`; waiting for first enroll/heartbeat |
| `CONNECTED` | Heartbeat within 2 minutes |
| `STALE` | Heartbeat within 2–10 minutes |
| `DISCONNECTED` | Heartbeat older than 10 minutes, or credentials revoked |

### Enrollment summary (derived; latest token)

| API `enrollment.status` | Prisma token status |
|---|---|
| `NONE` | No tokens |
| `UNUSED` | `ACTIVE` |
| `USED` | `USED` |
| `EXPIRED` | `EXPIRED` |
| `REVOKED` | `REVOKED` |

`enrollmentTokens[].status` on the wire uses Prisma values
(`ACTIVE` \| `USED` \| `REVOKED` \| `EXPIRED`).

## Resources

### List servers

`GET /api/v1/admin/servers?skip&take`

Response `200` data:

```ts
{
  items: AdminServerReadModel[];
  total: number;
}
```

List includes at most one latest `enrollmentTokens` row and one latest `vpsNodes`
row per server (for badges). Discoveries are capped (latest 20).

### Get server

`GET /api/v1/admin/servers/:id`

Same `AdminServerReadModel` with full `enrollmentTokens` and `vpsNodes` lists
(newest first). **Never** includes plaintext enrollment tokens or agent secrets.

### Create server

`POST /api/v1/admin/servers` → `201`

Body:

```ts
{ name: string; ipAddress: string; notes?: string }
```

Response `data` is the persisted `Server` row (`id`, `name`, `ipAddress`,
`notes`, timestamps). It is **not** the enriched read model; clients should
`GET /:id` after create when they need `agent` / `enrollment`.

### Update server

`PATCH /api/v1/admin/servers/:id`

Body (all optional): `{ name?, ipAddress?, notes? }`.

### Delete server

`DELETE /api/v1/admin/servers/:id` → `200`

Disables the agent plane **before** removing the row, in one transaction:

1. Revoke every `ACTIVE` enrollment token (`REVOKED` + `revokedAt`).
2. Blank `secretKey` on all `vpsNodes` for this server, set `OFFLINE`, and
   stamp `credentialsRevokedAt` / reason `server.deleted`.
3. Delete the `Server` row (tokens, nodes, discoveries, and alerts cascade).

`409 CONFLICT` when any `Website` is still bound to a node on this server
(website `vpsNodeId` is required; cascade would wipe customer websites). Staff
must reassign or remove those websites first.

A running agent cannot enroll or HMAC after this call even if the VPS process
is still up.

Response `data`:

```ts
{
  id: string;
  revokedTokenCount: number;
  disabledNodeCount: number;
}
```

### Issue enrollment token (one-time reveal)

`POST /api/v1/admin/servers/:id/enrollment-tokens` → `201`

Body (optional):

```ts
{ expiresAt?: string } // ISO datetime; omit → null (no expiry)
```

Response `data`:

```ts
{
  id: string;          // tokenId for revoke
  serverId: string;
  status: "ACTIVE";
  expiresAt: string | null;
  createdAt: string;
  token: string;       // plaintext once
  installCommand: string; // curl panel.unixsee.com/agents/install.sh … --token <token>
}
```

Plaintext is returned only here. Hash is stored server-side.

Default `installCommand` shape:

```bash
curl -fsSL https://panel.unixsee.com/agents/install.sh | sudo bash -s -- --token <plaintext> --api-base-url https://core.unixsee.com
```

`--api-base-url` is derived from Nest `AGENT_API_BASE_URL` (origin only, no
`/api/v1`). The installer validates the token, enrolls once, persists
`AGENT_SECRET`, then starts systemd.

### Revoke unused enrollment token

`POST /api/v1/admin/servers/:id/enrollment-tokens/:tokenId/revoke` → `200`

Only `ACTIVE` tokens. Response is the updated token row (includes `tokenHash`;
do not surface hash in UI).

### Revoke agent credentials

`POST /api/v1/admin/servers/:id/agent/revoke` → `200`

Body: `{ reason: string }` (required, min length 3).

Invalidates enrolled agent secrets for nodes on that server. Reconnect requires
a new enrollment token.

## AdminServerReadModel (list/get)

```ts
{
  id: string;
  name: string;
  label: string;       // same as name (UI convenience)
  ipAddress: string;
  notes: string | null;
  controlPanelUrl: string | null; // admin-owned HTTPS URL
  createdAt: string;   // ISO
  updatedAt: string;
  agent: {
    state: "PENDING_AGENT" | "ENROLLMENT_ISSUED" | "CONNECTED" | "STALE" | "DISCONNECTED";
    version?: string;
    lastSeenAt?: string;
    dataFreshness?: "UP_TO_DATE" | "STALE";
  };
  enrollment: {
    status: "NONE" | "UNUSED" | "USED" | "EXPIRED" | "REVOKED";
    issuedAt?: string;
    expiresAt?: string;
  };
  enrollmentTokens: Array<{
    id: string;
    status: "ACTIVE" | "USED" | "REVOKED" | "EXPIRED";
    createdAt: string;
    expiresAt: string | null;
    usedAt: string | null;
    revokedAt: string | null;
  }>;
  vpsNodes: Array<{
    id: string;
    agentInstanceId: string;
    agentVersion: string | null;
    lastHeartbeatAt: string | null;
    lastSeenAt: string | null;
    status: string;
    credentialsRevokedAt: string | null;
  }>;
  discoveries: WebsiteDiscovery[]; // OLS inventory + latest stack/traffic snapshot; assign via discoveries API
}
```

## Related

- Routes: [`../modules-and-routes.md`](../modules-and-routes.md)
- Agent enroll/HMAC: [`../../agent/phase1-api-contract.md`](../../agent/phase1-api-contract.md)
- Errors: [`api-errors.md`](./api-errors.md)
