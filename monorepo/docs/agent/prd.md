# Unixsee Phase 1 VPS Agent — Web-Server-Only Runtime & Traffic PRD

> **Status:** Accepted
> **Version:** 0.2
> **Date:** 2026-08-19
> **Owner:** Product + Platform Engineering
> **Deployable:** `agent/`
> **Companion changes:** `backend/`, `admin-panel/`, agent docs/contracts/install
> **Supersedes:** the current host/DirectAdmin/filesystem-oriented parts of `docs/agent/prd.md`

---

## 1. Purpose

Redesign the Unixsee Phase 1 VPS agent around a strict least-privilege boundary:

- **One agent process per VPS.**
- The runtime agent may access only:
  1. its own application/state files under `/opt/unixsee-agent`,
  2. explicitly allowlisted OpenLiteSpeed routing configuration required for domain discovery,
  3. OpenLiteSpeed access logs required for visitor metrics,
  4. the local OpenLiteSpeed HTTP/PHP runtime through a protected probe endpoint.
- The runtime agent must **not** inspect DirectAdmin files, website document roots, WordPress files, general VPS files, `/home`, `/var/www`, `/etc/passwd`, `/etc/machine-id`, `/proc`, or execute PHP/shell commands for discovery.

The agent must provide:

1. automatic OpenLiteSpeed domain discovery,
2. active visitors in a rolling 3-minute window,
3. unique visitors in the latest 24 hours,
4. exact per-site WordPress, PHP and Imagick extension versions,
5. automatic stack refresh every 6 hours,
6. immediate stack detection when a new domain is discovered,
7. admin-triggered on-demand stack refresh without direct browser-to-agent communication.

DirectAdmin and WordPress admin links become **manual admin-owned metadata** and are no longer discovered by the agent.

---

## 2. Product decisions

| Decision | Requirement |
|---|---|
| Agent cardinality | One `agent/` instance per managed VPS |
| Control plane | Agent initiates outbound HTTPS to NestJS only |
| Browser access | Admin/client never connect directly to agent or VPS |
| Domain source | OpenLiteSpeed active listener/vhost mappings only |
| DirectAdmin discovery | Removed |
| Filesystem site discovery | Removed |
| WordPress file inspection by agent | Removed |
| PHP CLI / shell probes | Removed |
| DirectAdmin URL | Entered manually in admin; backend-owned |
| WordPress admin URL | Entered manually in admin; backend-owned |
| Active visitors | Exact unique visitor keys in rolling 180-second window, sampled every 30 seconds |
| Latest 24h visitors | Computed locally by agent from access-log traffic using bounded time-bucketed cardinality state; NestJS stores the aggregate |
| Stack versions | Protected local OpenLiteSpeed/PHP runtime probe |
| Scheduled stack probe | Startup + new-domain immediately + every 6 hours |
| Manual stack probe | Admin → NestJS command → next agent heartbeat → local probe → signed result |
| Generic remote commands | Forbidden |

---

## 3. Current implementation findings

The current code violates the new boundary in several places and must be changed structurally, not merely configured differently.

### 3.1 `agent/src/discovery.ts`

Current behavior includes:

- default filesystem roots `/var/www` and `/home`,
- `/etc/machine-id` and `/var/lib/dbus/machine-id`,
- `/proc/version`,
- `/etc/passwd`,
- DirectAdmin manifests under `/usr/local/directadmin/data/users`,
- WordPress/WooCommerce/app marker checks inside document roots,
- filesystem fallback scans,
- document-root existence checks even during OLS discovery,
- unconditional DirectAdmin enrichment in `initializeIdentity()`.

**Required:** rewrite discovery as OLS-routing-only discovery.

### 3.2 `agent/src/site-stack.ts`

Current behavior includes:

- reading `/usr/local/directadmin/conf/directadmin.conf`,
- reading `{documentRoot}/wp-includes/version.php`,
- reading WordPress update markers under `wp-content`,
- executing host `php` through `child_process.execFile`,
- reporting host CLI PHP rather than guaranteed per-vhost LSPHP,
- using `Imagick::getVersion()`, which reports the ImageMagick library version rather than the PHP Imagick extension version requested by the product.

**Required:** replace the module with a protected local HTTP runtime probe. No direct site-file reads and no child processes.

### 3.3 `agent/src/engine.ts`

Current `buildIngestPayload()` performs discovery enrichment + site-stack work + traffic collection in one transmit cycle. This makes slow-changing stack fields run as frequently as traffic ingest.

**Required:** independent loops and independently queued payload types.

### 3.4 `agent/src/traffic.ts`

Useful behavior to retain conceptually:

- per-domain log state,
- incremental offset tracking,
- log rotation/truncation detection,
- rolling visitor uniqueness.

Required improvements:

- never read an entire existing production log from byte offset `0` on first initialization,
- bound initialization reads,
- store one latest-seen timestamp per visitor key for the active window rather than retaining every hit,
- add bounded 24h unique-cardinality state,
- persist only agent-owned derived state/cursors, never raw IPs,
- resolve logs only from approved web-server log configuration/templates.

### 3.5 `agent/install.sh`

Current installer:

- adds `unixsee-agent` to `diradmin`,
- reads machine-id during enrollment verification,
- grants DirectAdmin ACL access,
- grants broad OpenLiteSpeed config-directory access.

**Required:** remove all DirectAdmin access and replace machine identity with an agent-generated installation identity. Narrow OLS permissions to only required routing configuration and log paths.

### 3.6 Backend contract

Current `Phase1DiscoveryDto` requires or accepts fields that the new agent must no longer own, including:

- `documentRoot`,
- `owner`,
- `controlPanelUrl`,
- `wordpressAdminUrl`,
- WordPress update state,
- host/site PHP scope inherited from the CLI probe design.

Current NestJS ingest also overwrites manual link fields from agent ingest with null when missing. This ownership conflict must be removed.

---

## 4. Target architecture

```text
                           ┌──────────────────────┐
                           │     Admin Panel      │
                           │                      │
                           │ Manual metadata:     │
                           │ - DirectAdmin URL    │
                           │ - WP Admin URL       │
                           │                      │
                           │ Refresh stack button │
                           └──────────┬───────────┘
                                      │ HTTPS / admin JWT
                                      ▼
                           ┌──────────────────────┐
                           │       NestJS         │
                           │                      │
                           │ - agent auth         │
                           │ - discoveries        │
                           │ - latest snapshots   │
                           │ - AgentCommand queue │
                           └──────────▲───────────┘
                                      │ outbound HTTPS / HMAC
                                      │
┌─────────────────────────────────────┴─────────────────────────────────────┐
│ Managed VPS                                                             │
│                                                                         │
│  ┌─────────────────────┐          local HTTP/S           ┌────────────┐ │
│  │ Unixsee agent       │ ──────────────────────────────► │    OLS     │ │
│  │ non-root            │                                │            │ │
│  │                     │ ◄── read routing config only ─ │ config     │ │
│  │                     │ ◄── read access logs only ──── │ logs       │ │
│  └─────────────────────┘                                │            │ │
│                                                        │ protected  │ │
│                                                        │ runtime    │ │
│                                                        │ probe      │ │
│                                                        └─────┬──────┘ │
│                                                              │ LSPHP   │
│                                                              ▼         │
│                                                        Site PHP runtime │
│                                                        reports WP/PHP/ │
│                                                        Imagick versions │
└─────────────────────────────────────────────────────────────────────────┘
```

The Unixsee agent itself never opens a website document-root file. The normal site PHP process may read WordPress files while servicing the protected local probe, just as it does for a normal WordPress request.

---

## 5. Runtime filesystem boundary

### 5.1 Allowed runtime reads/writes

**Agent-owned files:**

- `/opt/unixsee-agent/**`
  - application bundle,
  - `.env` / secret,
  - generated agent instance ID,
  - bounded queue/state,
  - log cursors,
  - derived 24h cardinality buckets.

**OpenLiteSpeed reads:**

Only files explicitly needed to discover active listener mappings, for example the installed server's actual equivalents of:

- `/usr/local/lsws/conf/httpd_config.conf`,
- `/usr/local/lsws/conf/listeners.conf`,
- `/usr/local/lsws/conf/httpd-vhosts.conf` when used.

**OpenLiteSpeed/access-log reads:**

- configured per-domain/vhost access logs,
- default DirectAdmin+OLS deployment may use `/var/log/httpd/domains/{domain}.log`, but this is treated as a web-server log path, not a DirectAdmin discovery source.

### 5.2 Forbidden runtime access

The agent must not read or enumerate:

- `/usr/local/directadmin/**`,
- `/home/**`,
- `/var/www/**`,
- WordPress document roots,
- `wp-config.php`, `wp-content`, `wp-includes`,
- `/etc/passwd`, `/etc/shadow`,
- `/etc/machine-id`, `/var/lib/dbus/machine-id`,
- `/proc/**` for host discovery/telemetry,
- SSH configuration/keys,
- TLS private-key files,
- arbitrary paths supplied by NestJS/admin commands.

The agent must not use:

- `child_process.exec`,
- `child_process.execFile`,
- `spawn`,
- WP-CLI,
- PHP CLI,
- arbitrary shell commands.

### 5.3 Defense in depth

Implementation must enforce the boundary in both code and service permissions:

1. central path-allowlist wrapper for all agent filesystem reads,
2. service user without `diradmin` membership,
3. narrow read ACLs only for required OLS config files and access logs,
4. `NoNewPrivileges=true`, `PrivateTmp=true`, `ProtectHome=true`, and additional tested systemd hardening,
5. no arbitrary-path input from NestJS,
6. security tests that fail if code attempts forbidden paths or imports `node:child_process` in runtime modules.

---

## 6. Agent identity and enrollment

The current `/etc/machine-id` dependency is incompatible with the new boundary.

### Required replacement

On installation:

1. generate `agentInstanceId = crypto.randomUUID()`,
2. persist it mode `0600` under `/opt/unixsee-agent/state/agent-instance-id`,
3. enroll using the one-time enrollment token + `agentInstanceId`,
4. bind the returned agent secret to the server record,
5. preserve the instance ID across agent upgrades/restarts,
6. generate a new instance ID only for a deliberate clean re-install/re-provision.

The API contract should migrate from `machineId` terminology to `agentInstanceId` because it is no longer a hardware/OS fingerprint.

The heartbeat should not collect hostname or other host metadata unless a separate approved requirement is introduced.

---

## 7. OpenLiteSpeed domain discovery

### 7.1 Source of truth

Use **active OpenLiteSpeed listener mappings** as the only discovery source.

The agent may parse:

- active listener blocks,
- `map <vhost> <domain,aliases...>` entries,
- active vhost declarations only as needed to validate the mapping.

It must not inspect the mapped document root to decide whether the site exists.

### 7.2 Discovery payload

Minimum agent-owned discovery record:

```json
{
  "domain": "example.com",
  "aliases": ["www.example.com"],
  "virtualHostName": "example.com",
  "source": "openlitespeed",
  "discoveredAt": "2026-08-19T12:00:00.000Z"
}
```

Do not transmit:

- document root,
- home directory,
- DirectAdmin user,
- server filesystem paths,
- DirectAdmin URL,
- WordPress admin URL.

### 7.3 Primary domain selection

For one OLS vhost mapped to multiple names:

- treat it as one discovered site,
- prefer the first valid non-`www` configured domain as primary where deterministic,
- retain other mapped names as aliases,
- deduplicate the same vhost across HTTP/HTTPS listeners.

### 7.4 Schedule

Default:

```text
OLS_DISCOVERY_INTERVAL_MS = 600000  # 10 minutes
```

Supported production range: **5–10 minutes**.

### 7.5 New-domain behavior

When a domain appears that was not present in the prior successful discovery state:

1. add the discovery immediately,
2. initialize its access-log tail state,
3. trigger `REFRESH_SITE_STACK` internally immediately,
4. send discovery + stack result to NestJS without waiting for the normal 6-hour stack cycle.

### 7.6 Removed-domain behavior

Do not delete a domain after one missed scan. Require at least **two consecutive successful discovery scans** where the domain is absent before marking it no longer present. Stop tail/probe work after removal confirmation. NestJS keeps historical records.

---

## 8. WordPress / PHP / Imagick runtime probe

### 8.1 Why a local runtime probe is required

OpenLiteSpeed configuration alone cannot reliably provide all three requested exact values:

- WordPress version,
- exact PHP runtime version serving that vhost,
- PHP Imagick extension version.

The agent therefore probes the **actual site PHP runtime through OpenLiteSpeed** rather than reading site files or invoking CLI PHP.

### 8.2 Protected probe endpoint

Provision a web-server-owned endpoint such as:

```text
/.well-known/unixsee/runtime
```

Requirements:

- served through the target OLS vhost and its configured LSPHP runtime,
- reachable only locally from the VPS agent, preferably loopback-only,
- preserve the target domain as Host/SNI so the correct vhost/PHP handler executes,
- protected by web-server access control and an agent-specific secret/header,
- `Cache-Control: no-store`,
- small JSON response only,
- no phpinfo output,
- no environment dump,
- no filesystem paths,
- no arbitrary query-to-file behavior.

### 8.3 Probe implementation behavior

The web-server-owned PHP probe may use the target vhost's PHP execution context to obtain:

```php
PHP_VERSION
phpversion('imagick')
```

For WordPress it may read/bootstrap the site's WordPress version **inside the PHP request**, for example from the vhost's own document-root context. The agent itself must never open that file.

The response shape:

```json
{
  "wordpressVersion": "6.8.2",
  "phpVersion": "8.3.23",
  "imagickVersion": "3.8.0",
  "checkedAt": "2026-08-19T12:00:00.000Z"
}
```

### 8.4 Imagick meaning

The required value is the **PHP Imagick extension version**, e.g. `3.8.0`.

Use:

```php
phpversion('imagick')
```

Do **not** use `Imagick::getVersion()` for this UI field because that describes the linked ImageMagick library.

### 8.5 Stack probe statuses

Each field must support explicit status:

```text
ok
unknown
unsupported
```

Example reason codes:

- `runtime_probe_unreachable`
- `runtime_probe_timeout`
- `runtime_probe_invalid_response`
- `runtime_probe_forbidden`
- `wordpress_not_detected`
- `imagick_missing`
- `php_version_missing`

Never fabricate a version.

---

## 9. Stack refresh policy

### 9.1 Automatic schedule

```text
STACK_PROBE_INTERVAL_MS = 21600000  # 6 hours
```

Probe stack versions:

1. once after agent startup and initial OLS discovery,
2. immediately when a new domain is discovered,
3. every 6 hours per active domain,
4. immediately when a valid manual refresh command is received.

### 9.2 Scheduling semantics

- Store `lastStackCheckedAt` per domain in agent-owned state.
- A successful manual refresh resets the next scheduled due time to `checkedAt + 6h`.
- Limit concurrent runtime probes (recommended default: **3**) to avoid creating a PHP burst when a VPS hosts many websites.
- Apply small jitter to bulk scheduled checks.
- Timeout each local probe (recommended **5 seconds**).
- Failed scheduled probes may retry with bounded backoff, then remain `unknown/unsupported` until the next retry/manual trigger.

### 9.3 One probe, all fields

Manual/scheduled refresh always uses one command/action:

```text
REFRESH_SITE_STACK
```

One local HTTP request returns WordPress + PHP + Imagick together. Do not create separate remote commands for each version.

---

## 10. Active visitors — current 3-minute window

### 10.1 Definition

`activeVisitors` is the number of distinct visitor keys seen in that domain's OLS access log during the immediately preceding **180 seconds**.

This is an IP-based operational approximation, not a guaranteed human-user count unless bot/CDN normalization is separately configured.

### 10.2 Collection and send cadence

```text
ACTIVE_VISITOR_WINDOW_SECONDS = 180
ACTIVE_VISITOR_SAMPLE_INTERVAL_MS = 30000
```

Every 30 seconds the agent sends:

```json
{
  "domain": "example.com",
  "uniqueVisitorCount": 12,
  "windowSeconds": 180,
  "windowStartedAt": "...",
  "measuredAt": "...",
  "status": { "state": "ok" }
}
```

### 10.3 Privacy and memory

- Raw access-log lines never leave the VPS.
- Raw IPs are never sent to NestJS.
- Do not log visitor IPs in Unixsee agent logs.
- Convert each parsed IP to an in-memory deterministic visitor key/hash immediately.
- Active state should be `visitorKey -> lastSeenAt`, not an array of every request hit.
- Prune entries older than 180 seconds continuously/before sampling.

### 10.4 Tail behavior

The log tailer must be:

- incremental,
- inode/rotation aware,
- truncation aware,
- bounded on startup,
- periodically reconciled even if filesystem watch events are missed.

It must not read an arbitrarily large existing log from byte zero on startup.

If sufficient recent data cannot be recovered at startup, report a warming/partial state until the active window has filled rather than pretending the count is complete.

---

## 11. Unique visitors — latest 24 hours

### 11.1 Ownership decision

**The agent computes the 24-hour unique visitor cardinality. NestJS stores and serves the aggregate.**

Reason:

- the agent already sees the raw IP stream,
- summing 3-minute counts in NestJS overcounts repeat visitors,
- sending raw/pseudonymous IP identifiers to NestJS is unnecessary,
- computing locally keeps visitor identity data on the VPS,
- a bounded cardinality structure prevents agent memory from scaling linearly with all daily visitors.

### 11.2 Algorithm

Maintain time-bucketed **HyperLogLog (HLL)** or an equivalent bounded mergeable cardinality sketch locally.

Recommended design:

```text
bucket size: 5 minutes
rolling buckets: 288 for 24 hours
```

For each request IP:

1. derive the local visitor hash/key,
2. add it to the current 5-minute cardinality bucket,
3. keep only buckets intersecting the latest 24h,
4. merge active buckets to obtain an approximate 24h unique count.

The selected HLL implementation/precision must be deterministic, bounded, tested, and documented. Target cardinality error should be approximately **<= 2%** unless an ADR intentionally selects another tradeoff.

### 11.3 Persistence

Persist only derived bucket state and log cursor metadata under:

```text
/opt/unixsee-agent/state/
```

Do not persist raw IPs.

This allows the 24h estimate to survive normal agent restarts/upgrades.

If an outage/log rotation creates a data gap that cannot be reconstructed, report reduced coverage rather than a false complete 24h value.

### 11.4 Send cadence

The 24h value does not need a 30-second transmit interval.

Recommended:

```text
VISITORS_24H_SAMPLE_INTERVAL_MS = 300000  # 5 minutes
```

Payload:

```json
{
  "domain": "example.com",
  "uniqueVisitors24h": 487,
  "windowSeconds": 86400,
  "coverageSeconds": 86400,
  "measuredAt": "...",
  "algorithm": "hll",
  "status": { "state": "ok" }
}
```

If a newly installed agent has only collected 2 hours of data:

```json
{
  "coverageSeconds": 7200,
  "status": { "state": "unknown", "reason": "warming_up" }
}
```

NestJS must never label partial coverage as a complete 24-hour number.

### 11.5 NestJS rule

NestJS must **not** compute 24h unique visitors by summing or averaging `activeVisitors` samples.

NestJS may retain 24h snapshots for chart/history purposes, but the cardinality for the current 24h window comes from the agent's privacy-preserving local aggregation.

---

## 12. Log resolution

Access-log paths must be resolved only from approved web-server sources:

1. explicit OpenLiteSpeed access-log configuration, or
2. an administrator-installed web-server log template such as:

```text
/var/log/httpd/domains/{domain}.log
```

Do not consult DirectAdmin user/domain files to locate logs.

Per-domain failures must be explicit:

- `log_missing`
- `log_unreadable`
- `log_rotated_gap`
- `log_format_unsupported`

One broken site's log must not block other domains.

---

## 13. Manual refresh from admin panel

### 13.1 Trust boundary

Keep the existing architecture:

```text
Admin Panel → NestJS → queued command
                         ▲
                         │ next heartbeat (agent initiated)
                         │
                       Agent
                         │ local OLS runtime probe
                         ▼
                       NestJS → Admin Panel
```

There is still **no inbound agent API** and no browser-to-agent connection.

### 13.2 Command type

Only add the allowlisted command required by this feature:

```text
REFRESH_SITE_STACK
```

A command contains identifiers, never executable text:

```json
{
  "id": "uuid",
  "type": "REFRESH_SITE_STACK",
  "domain": "example.com",
  "expiresAt": "..."
}
```

### 13.3 Delivery

Recommended production flow:

1. Admin clicks **Refresh technical info**.
2. Admin panel POSTs to NestJS.
3. NestJS creates an `AgentCommand` in `QUEUED` state.
4. The next 30-second heartbeat leases queued commands for that agent.
5. Agent validates the requested domain exists in its current OLS discovery set.
6. Agent marks/acknowledges execution and runs the local `REFRESH_SITE_STACK` probe.
7. Agent POSTs a signed command result to NestJS.
8. NestJS stores the new stack snapshot and marks command `SUCCEEDED` or `FAILED`.
9. Admin UI updates status and `lastCheckedAt`.

Maximum normal dispatch delay is one heartbeat interval (~30 seconds), plus probe/network time.

### 13.4 Command safety

The command subsystem must never support:

- arbitrary URLs,
- arbitrary file paths,
- arbitrary shell commands,
- arbitrary PHP code,
- arbitrary OLS config writes.

Agent validates `domain` against its local OLS inventory and always probes via the fixed local runtime-probe path.

### 13.5 Idempotency and duplicate control

- allow only one in-flight `REFRESH_SITE_STACK` command per agent+domain,
- command IDs are idempotent,
- commands have a lease/expiry,
- a crashed agent may receive an expired lease again,
- duplicate result submission must not duplicate state changes,
- admin UI shows `queued`, `running`, `succeeded`, `failed`.

A dedicated `AgentCommand` model is preferred over reusing the current customer-oriented `OperationalAction`, because refresh commands must also work for newly discovered/unassigned domains.

---

## 14. Manual metadata ownership

The agent no longer discovers or sends:

- DirectAdmin/control-panel URL,
- WordPress admin URL.

Recommended ownership:

### DirectAdmin URL

Store once on the **Server** record because it is normally a VPS/control-panel property:

```text
Server.controlPanelUrl
```

### WordPress admin URL

Store on the managed **Website** record:

```text
Website.wordpressAdminUrl
```

If admin needs to enter the WP admin URL before assignment, a discovery-level draft field may be supported and copied on assignment, but agent ingest must never overwrite it.

---

## 15. Agent loop architecture

The current single transmit/enrichment loop must become independent work loops.

| Loop | Default | Responsibility |
|---|---:|---|
| Heartbeat / command poll | 30 sec | liveness + receive leased commands |
| Access-log tail | continuous/incremental | consume new OLS log lines |
| Active visitor sample | 30 sec | rolling 180s unique count |
| 24h visitor snapshot | 5 min | rolling 24h unique cardinality + coverage |
| OLS discovery | 10 min | active domains/aliases |
| Stack versions | 6 hours | WordPress/PHP/Imagick |
| Initial stack | immediate | all domains after initial discovery |
| New-domain stack | immediate | newly discovered domain |
| Manual stack | immediate after command receipt | target domain |

Do not run stack probing every 30 or 60 seconds.

---

## 16. Recommended configuration

Remove:

```text
DIRECTADMIN_BASE_URL
DIRECTADMIN_USERS_ROOT
WEB_DISCOVERY_INCLUDE_FALLBACKS
WEB_DISCOVERY_ROOTS
WEB_DISCOVERY_EXACT_PATHS
OPENLITESPEED_DISCOVER_ORPHAN_VHOSTS   # unless a future explicit OLS-only need is approved
TRANSMIT_INTERVAL_MS                   # replace with typed schedules
```

Keep/rename:

```text
API_BASE_URL
ENROLLMENT_TOKEN
AGENT_SECRET
OPENLITESPEED_SERVER_ROOT
ACCESS_LOG_DIR or ACCESS_LOG_PATH_TEMPLATE
HEARTBEAT_INTERVAL_MS=30000
OLS_DISCOVERY_INTERVAL_MS=600000
ACTIVE_VISITOR_WINDOW_SECONDS=180
ACTIVE_VISITOR_SAMPLE_INTERVAL_MS=30000
STACK_PROBE_INTERVAL_MS=21600000
VISITORS_24H_SAMPLE_INTERVAL_MS=300000
RUNTIME_PROBE_TIMEOUT_MS=5000
STACK_PROBE_CONCURRENCY=3
```

Probe endpoint/path and authentication should be installer-owned configuration, not remotely supplied per command.

---

## 17. API contract changes

### 17.1 Enrollment / heartbeat

Replace `machineId` with `agentInstanceId`.

Heartbeat response may include leased commands:

```json
{
  "agent": {
    "agentInstanceId": "...",
    "status": "ONLINE"
  },
  "commands": []
}
```

### 17.2 Discovery ingest

Discovery fields become OLS inventory only:

```json
{
  "domain": "example.com",
  "aliases": ["www.example.com"],
  "virtualHostName": "example.com",
  "source": "openlitespeed",
  "discoveredAt": "..."
}
```

Remove agent ownership of `documentRoot`, `owner`, `controlPanelUrl`, `wordpressAdminUrl`, WordPress update status and host PHP scope.

### 17.3 Stack snapshot

```json
{
  "domain": "example.com",
  "wordpressVersion": "6.8.2",
  "phpVersion": "8.3.23",
  "imagickVersion": "3.8.0",
  "checkedAt": "...",
  "fieldStatus": {
    "wordpressVersion": { "state": "ok" },
    "phpVersion": { "state": "ok" },
    "imagickVersion": { "state": "ok" }
  }
}
```

PHP scope is now always the actual target vhost runtime when probe succeeds; a `host` fallback must not be silently substituted.

### 17.4 Traffic

Current sample:

```json
{
  "domain": "example.com",
  "uniqueVisitorCount": 12,
  "windowSeconds": 180,
  "measuredAt": "...",
  "status": { "state": "ok" }
}
```

24h sample:

```json
{
  "domain": "example.com",
  "uniqueVisitors24h": 487,
  "windowSeconds": 86400,
  "coverageSeconds": 86400,
  "measuredAt": "...",
  "algorithm": "hll",
  "status": { "state": "ok" }
}
```

### 17.5 Typed ingest

Do not require every 30-second payload to contain discovery + stack fields.

Either:

- keep `/api/internal/agent/v1/ingest` with optional typed sections, or
- introduce dedicated HMAC endpoints for discovery, stack and traffic.

For migration cost, the preferred Phase 1 implementation is to retain the signed `/ingest` endpoint but make sections optional and independently scheduled.

---

## 18. NestJS storage responsibilities

### 18.1 Discovery

`WebsiteDiscovery` may continue as the latest OLS discovery record keyed by `serverId + domain`.

Legacy fields such as `documentRoot`, `homeDirectory`, `directAdminUser` may remain nullable during migration but must no longer be required or updated by the new agent.

### 18.2 Stack

Store latest:

- `wordpressVersion`,
- `phpVersion`,
- `imagickVersion`,
- `stackCheckedAt`,
- field status/reasons.

Do not allow agent ingest to overwrite admin-owned URLs.

### 18.3 Active visitors

Persist the latest active sample and optionally append time-series samples according to retention policy.

At 30-second cadence, retention must be explicit to avoid unbounded growth.

### 18.4 Latest 24h visitors

Persist the latest 24h aggregate:

- `uniqueVisitors24h`,
- `coverageSeconds`,
- `measuredAt`,
- `status`.

Historical 5-minute snapshots may be retained if UI charts require them.

NestJS does not receive raw IPs and does not reconstruct uniqueness by summing active samples.

### 18.5 Agent commands

Add `AgentCommand` or equivalent with at least:

```text
id
vpsNodeId / serverId
domain
type = REFRESH_SITE_STACK
status = QUEUED | RUNNING | SUCCEEDED | FAILED | EXPIRED
requestedBy
requestedAt
leasedAt
leaseExpiresAt
attemptCount
finishedAt
errorCode / result metadata
```

---

## 19. Admin-panel requirements

### 19.1 Manual fields

Admin server form/details:

- editable **DirectAdmin URL**.

Admin website form/details:

- editable **WordPress admin URL**.

### 19.2 Technical stack

Show:

```text
WordPress  6.8.2
PHP        8.3.23
Imagick    3.8.0
Last checked: ...
```

Add **Refresh technical info**.

During refresh:

- show queued/running state,
- prevent duplicate clicks while one command is active,
- update all three values from one completed result,
- show failure without erasing the last successful values.

### 19.3 Traffic

Show separately:

- `Active now` — latest 180-second sample, with measurement freshness,
- `Visitors — latest 24h` — latest 24h unique estimate, with coverage/freshness.

If 24h coverage is incomplete, show a warming/partial state rather than presenting it as a full 24h metric.

---

## 20. File-by-file implementation plan

### `agent/src/discovery.ts`

**Remove:**

- DirectAdmin parsing,
- filesystem roots/fallbacks,
- site marker detection,
- owner lookup,
- document-root probing,
- machine-id logic,
- `/proc` logic.

**Replace with:**

- small OLS listener/vhost parser,
- stable `domain + aliases + virtualHostName` inventory,
- new-domain/removal comparison.

### `agent/src/site-stack.ts`

**Remove entirely:**

- `node:child_process`,
- DirectAdmin URL resolver,
- direct WP file reads,
- WP update-state code,
- host PHP CLI,
- `Imagick::getVersion()` probe.

**Replace with:**

- local runtime probe client,
- schema validation,
- timeout/status mapping,
- per-domain checked timestamp.

### `agent/src/traffic.ts`

**Refactor:**

- OLS-log-only path resolver,
- bounded incremental tail,
- visitor hash keys,
- `Map<visitorKey,lastSeenAt>` active state,
- rotation reconciliation,
- 5-minute HLL buckets for 24h,
- derived-state persistence,
- coverage tracking.

### `agent/src/engine.ts`

**Replace single ingest loop with:**

- heartbeat/command loop,
- discovery loop,
- active-traffic publish loop,
- 24h publish loop,
- 6h stack scheduler,
- immediate new-domain stack scheduler,
- command executor allowlist.

### `agent/src/api/client.ts`

**Add:**

- heartbeat command parsing,
- typed/optional ingest sections,
- command-result submission.

### `agent/src/config/config.ts`

**Remove:** DirectAdmin/fallback config.
**Add:** independent schedule/probe/concurrency settings.

### `agent/src/index.ts`

**Remove:** machine-id dependency.
**Add:** generated/persisted `agentInstanceId`.

### `agent/install.sh`

**Remove:**

- `diradmin` group membership,
- DirectAdmin ACLs,
- machine-id read,
- broad unnecessary host discovery permissions.

**Add:**

- generated agent instance ID,
- narrow OLS routing-config ACLs,
- read-only OLS log ACLs,
- runtime-probe bridge installation/config validation,
- writable agent state directory only.

### `agent/systemd/unixsee-agent.service`

Retain non-root execution and add tested hardening, including at minimum:

```text
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
```

Add explicit path restrictions where compatible with Node/TLS/DNS requirements.

### Agent tests

Rewrite tests so normal production behavior succeeds without `/home`, DirectAdmin, machine-id, `/etc/passwd`, PHP CLI or `child_process`.

---

## 21. Security acceptance criteria

- [ ] Agent runtime user is not in `diradmin`.
- [ ] No runtime code reads `/usr/local/directadmin/**`.
- [ ] No runtime code reads `/home/**` or `/var/www/**`.
- [ ] No runtime code reads `/etc/machine-id`, `/etc/passwd`, or `/proc` for product functionality.
- [ ] No runtime module imports `node:child_process`.
- [ ] Agent has read access only to explicitly required OLS routing config and access logs plus its own state.
- [ ] Agent never receives arbitrary file paths or shell commands from NestJS.
- [ ] Runtime probe is not publicly usable and returns only allowlisted fields.
- [ ] Raw visitor IPs never leave the VPS and are not written to Unixsee agent logs/state.
- [ ] Admin/client browsers never receive agent credentials.
- [ ] All agent→Nest data and command results remain HMAC authenticated.

---

## 22. Functional acceptance criteria

### Discovery

- [ ] Existing OLS-mapped domains appear after startup.
- [ ] Domain added to OLS is discovered within 10 minutes by default.
- [ ] New domain's WP/PHP/Imagick probe runs immediately after discovery.
- [ ] Alias mappings do not create duplicate websites.
- [ ] One transient missing discovery scan does not remove a site.

### Stack

- [ ] On startup, every discovered domain gets one stack probe.
- [ ] Stack values refresh every 6 hours.
- [ ] PHP value is the actual vhost-serving PHP runtime, not host CLI fallback.
- [ ] Imagick value is the PHP extension version (`phpversion('imagick')`).
- [ ] Admin-triggered refresh completes through NestJS without browser→agent traffic.
- [ ] Manual refresh updates all three fields with one probe.
- [ ] Failed refresh preserves previous successful values and records failure/freshness.

### Active visitors

- [ ] Active visitor value is sampled every 30 seconds over a 180-second rolling window.
- [ ] Same visitor IP appearing multiple times in the window counts once.
- [ ] Missing/unreadable logs return explicit unsupported state, not a silent real zero.
- [ ] Log rotation does not permanently stop collection.

### Latest 24h visitors

- [ ] 24h value represents unique visitor cardinality, not a sum of short-window samples.
- [ ] Raw IPs are not sent to NestJS.
- [ ] Normal restart preserves derived 24h bucket state.
- [ ] Coverage gaps are surfaced explicitly.
- [ ] 24h snapshot is refreshed at least every 5 minutes.

---

## 23. Test requirements

### Unit tests

- OLS listener map parsing/dedupe,
- stale config filtering,
- new/removed domain detection,
- runtime-probe response validation,
- exact Imagick-extension semantics,
- active visitor dedupe/pruning,
- HLL bucket rotation/merge,
- 24h coverage calculation,
- log rotation/truncation,
- forbidden-path guard,
- manual command allowlist/idempotency.

### Integration tests

Use fixtures/temp directories only:

1. OLS config fixture → discover domain.
2. Access-log fixture → active visitor sample.
3. 24h bucket fixture → unique visitor aggregate.
4. Local HTTP runtime-probe fixture → WP/PHP/Imagick stack.
5. Heartbeat returns `REFRESH_SITE_STACK` → agent probes → signed result submitted.
6. New OLS domain → immediate stack probe.
7. DirectAdmin and website filesystem inaccessible → all required features still work.

### Security regression tests

CI should fail if runtime source reintroduces:

```text
/usr/local/directadmin
/home/
/var/www/
/etc/machine-id
/etc/passwd
node:child_process
```

except explicit test/docs fixtures.

---

## 24. Migration sequence

1. **Backend ownership preparation**
   - make old discovery filesystem fields optional,
   - stop agent ingest from overwriting manual URLs,
   - add admin-owned DirectAdmin/WP admin fields,
   - add stack checked timestamp + 24h visitor storage,
   - add `AgentCommand` lifecycle.

2. **Runtime probe bridge**
   - implement/provision protected OLS/PHP endpoint,
   - validate per-vhost PHP and Imagick results.

3. **Agent identity/security rewrite**
   - generated instance ID,
   - remove DirectAdmin/filesystem/machine-id access,
   - update installer/systemd.

4. **OLS-only discovery**
   - listener map parser only,
   - domain state diff,
   - immediate new-domain event.

5. **Stack scheduler + manual command**
   - initial/new-domain/6h/manual flows.

6. **Traffic rewrite**
   - 30s active metric,
   - bounded tailer,
   - local 24h HLL + persistence.

7. **Admin UI**
   - manual links,
   - technical refresh button/status,
   - active + 24h metrics/freshness.

8. **Remove legacy contract/docs/config**
   - DirectAdmin enrichment,
   - WordPress update status,
   - document-root ownership,
   - old machine-id and broad ACL guidance.

---

## 25. Explicit removals from the current PRD

The following current Phase 1 requirements are no longer valid for `agent/` under this PRD:

- DirectAdmin manifest enrichment.
- Filesystem discovery fallbacks.
- Agent-reported document root/home directory/hosting owner.
- Agent-resolved DirectAdmin/control-panel URL.
- Agent-generated WordPress admin URL.
- Direct WordPress version file reads by the agent.
- WordPress update-state detection by the agent.
- Host PHP CLI fallback.
- ImageMagick-library-version reporting in place of Imagick extension version.
- General host CPU/memory/disk `/proc` telemetry in this restricted agent.
- `/etc/machine-id` as agent identity.
- NestJS 24h visitor estimation by summing short active-window counts.

Any future host-level monitoring that requires broader VPS access must be a separately approved trust-boundary decision, not silently reintroduced into this agent.

---

## 26. Non-goals

This PRD does not add:

- SSH execution,
- remote shell,
- DirectAdmin API/file access,
- WordPress file management,
- WordPress updates,
- plugin/theme inventory,
- server CPU/RAM/storage metrics,
- public uptime/response-time probing,
- customer-visible agent control,
- generic operational command execution.

---

## 27. Final target behavior

For each VPS:

```text
Unixsee agent starts
  ↓
generated agent identity + outbound enrollment
  ↓
read OLS active mappings
  ↓
discover domains
  ├─ start OLS log tail
  ├─ immediately probe WP/PHP/Imagick via local OLS runtime endpoint
  └─ send discovery + stack to NestJS

Every 30 sec
  ├─ heartbeat / receive allowlisted commands
  └─ send active visitors (rolling 3m)

Every 5 min
  └─ send locally computed unique visitors (latest 24h + coverage)

Every 10 min
  └─ rediscover OLS domains
       └─ new domain → immediate stack probe

Every 6 hours
  └─ refresh WP/PHP/Imagick for active domains

Admin clicks Refresh technical info
  ↓
NestJS queues REFRESH_SITE_STACK
  ↓
agent receives on next heartbeat
  ↓
local OLS/PHP probe
  ↓
NestJS stores result
  ↓
admin UI refreshes
```

This is the required Phase 1 agent architecture after the server-access restriction.
