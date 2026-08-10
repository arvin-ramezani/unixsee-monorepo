# Phase 1 VPS Agent — Product Requirements Document (PRD)

> **Status:** Proposed  
> **Owner:** Product and platform engineering  
> **Deployable:** `agent/` (new; build from scratch this phase)  
> **Not this PRD:** `monitoring-agent/` (existing monitor; develop later)  
> **Audience:** Agent, NestJS, admin-panel, and customer dashboard teams  
> **Last verified:** 2026-08-09

## 1. Purpose

Define what the Unixsee **Phase 1 VPS agent** (`agent/`) must discover, measure,
and push to NestJS so staff and customers can see trustworthy per-website stack
and traffic context for managed DirectAdmin + OpenLiteSpeed WordPress /
WooCommerce hosts.

This agent is built **from scratch** for the current phase. It is **not** the
existing `monitoring-agent/` codebase.

The agent reports **host-local truth** for inventory, site metadata, and
short-window visitors. NestJS owns **public availability** and longer-window
aggregations. Deeper host/LiteSpeed monitoring remains with `monitoring-agent/`
for later development.

## 2. Product outcomes

- Staff can see whether the agent on a registered server is connected and fresh.
- NestJS receives a complete, rediscoverable inventory of websites on that VPS.
- For each discovered WordPress/WooCommerce site, NestJS can store stack and
  control-panel links needed by admin and owner dashboards.
- Customer/admin UIs can show **active visitors (3-minute window)** with a clear
  measurement time.
- NestJS can later compute **24-hour active-visitor** summaries from agent
  samples without the agent retaining 24h of raw logs.

## 3. Non-goals (explicit exclusions)

The agent must **not** be the source of truth for:

| Excluded | Owner instead |
|---|---|
| Public website online / down, response time, TTFB, uptime charts | NestJS uptime / public probe module |
| Server geographic location / region label | Admin server record / NestJS metadata |
| Active visitors over the last 24 hours (computed on the agent) | NestJS aggregation from agent samples (see §7.3) |
| Plan enablement, tenant ownership, customer visibility | Admin + NestJS after discovery assignment |
| Browser-reachable agent APIs, SSH from admin UI | Forbidden by architecture |

UI may still show **agent connected** and **site online** as two separate
signals. They must never be collapsed into one field.

## 4. Actors and trust boundary

```text
agent (Phase 1) ──outbound HTTPS (enroll / heartbeat / ingest)──► NestJS
                                                                   │
                                              admin-panel / client ◄┘
```

Sibling deployable (out of this PRD): `monitoring-agent/` also talks only to
NestJS, but is developed later and must not implement these Phase 1 field
requirements in place of `agent/`.

- One Phase 1 agent process per managed VPS / server record (cardinality may be
  revisited when monitoring-agent coexists on the same host).
- Agent initiates all traffic; no inbound control plane on the VPS for Unixsee.
- NestJS validates enrollment/HMAC, persists accepted payloads, and exposes
  authorized read models.
- Admin and client never talk to agents or VPS hosts.

Related: [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md),
[`README.md`](./README.md),
[`../architecture/decisions/0007-two-vps-agents.md`](../architecture/decisions/0007-two-vps-agents.md).

## 5. Functional requirements

### 5.1 Enrollment and connectivity

| ID | Requirement |
|---|---|
| A-CONN-1 | Exchange a one-time staff enrollment token for a long-lived agent secret (`POST /api/internal/agent/v1/enroll`). |
| A-CONN-2 | Send periodic heartbeats so NestJS can mark the agent connected, stale, or disconnected. |
| A-CONN-3 | Heartbeat / identity payload must include enough fields for ops: agent version, server binding, timestamps. |
| A-CONN-4 | On revoke, require a new enrollment token; do not re-read old secrets from NestJS. |

**UI meaning:** “Agent connected” = NestJS has a fresh heartbeat for that
server’s agent. It does **not** mean every website is publicly online.

### 5.2 Website discovery (inventory)

| ID | Requirement |
|---|---|
| A-DISC-1 | Discover live sites using OpenLiteSpeed listeners/vhosts as the primary route source. |
| A-DISC-2 | Enrich with DirectAdmin manifests (owners, aliases, pointers, subdomains). |
| A-DISC-3 | Allow configured filesystem fallbacks / exact paths for rare custom apps. |
| A-DISC-4 | Classify app type when markers exist (`woocommerce`, `wordpress`, and strong custom markers only when justified). |
| A-DISC-5 | Rediscover on a configurable interval (default ~10 minutes) without agent restart. |
| A-DISC-6 | Every discovered site must include at least: primary domain, aliases, document root, owner (when known), app type, discovery source, optional proxy backend. |

Discovery alone does not create customer-visible websites. Staff assignment in
admin remains the gate.

### 5.3 Per-website product fields (required)

These fields are required for WordPress / WooCommerce discoveries when
technically obtainable on the host. Missing values must be reported as
`unknown` / `unsupported` with a reason code—never as fabricated zeros.

| ID | Field (UI label) | Agent responsibility |
|---|---|---|
| A-SITE-1 | دامنه (domain) | Primary domain + aliases from discovery. |
| A-SITE-2 | کنترل‌پنل link / DirectAdmin URL | Resolve the correct DirectAdmin entry URL for this host. Prefer configured or discovered base URL; do not hardcode a single path forever. If the panel path/host is changeable, rediscover or re-read config so NestJS always gets the current link. |
| A-SITE-3 | باز کردن مدیریت وردپرس | WordPress admin URL for the site (typically `https://{domain}/wp-admin/` when WP markers exist). |
| A-SITE-4 | وردپرس (WordPress version) | Read local WordPress version (e.g. `wp-includes/version.php` or equivalent durable marker). |
| A-SITE-5 | PHP version | Resolve PHP version used by that site/pool when possible; otherwise host default with an explicit scope flag (`site` vs `host`). |
| A-SITE-6 | Imagick version | Report Imagick extension version when installed and readable; otherwise `unsupported` / `missing`. |
| A-SITE-7 | وضعیت به‌روزرسانی وردپرس | Report WordPress core update state when available locally (e.g. up to date / updates available / unknown) and **last local check time**. Do not invent “checked N minutes ago” without a real check timestamp. |

### 5.4 Active visitors (3-minute window)

| ID | Requirement |
|---|---|
| A-TRAFFIC-1 | Derive **active visitors now** per discovered site from OpenLiteSpeed access logs by grouping distinct client IPs over a rolling **3-minute** window. |
| A-TRAFFIC-2 | Every traffic sample must include `measuredAt` (and ideally `windowStartedAt` / `windowSeconds=180`) so UI can show “اندازه‌گیری‌شده N دقیقه پیش”. |
| A-TRAFFIC-3 | Map log lines to the correct discovered vhost/domain; do not merge unrelated sites. |
| A-TRAFFIC-4 | Keep parsing incremental and low-footprint (tail/rotate-aware). Prefer IP uniqueness over full request storage. |
| A-TRAFFIC-5 | Push the 3-minute count in ingest frequently enough that NestJS freshness policy can mark stale samples (target: at least once per collection/transmit cycle already used for host metrics). |

**UI meaning:**

- `فعال در حال حاضر` = last accepted 3-minute unique-IP count for that website.
- Measurement time = NestJS-stored `measuredAt` from the agent sample.

### 5.5 Existing host / LiteSpeed telemetry (retain)

Continue collecting and ingesting host-level signals already in scope for the
edge agent, including CPU, memory, disk I/O, storage capacity, global LiteSpeed
connections, and per-vhost concurrent request pressure when available from OLS
realtime reports. These support ops health and must remain HMAC-signed ingest
payloads validated by NestJS.

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| A-NFR-1 | Low footprint: prefer `/proc` and local files over heavy shell tools (`top`, `free`). |
| A-NFR-2 | Outbound HTTPS only; CSF/firewall needs no new inbound ports. |
| A-NFR-3 | HMAC-sign ingest/heartbeat; reject clock-skewed or unsigned payloads on NestJS. |
| A-NFR-4 | Offline resilience: bounded in-memory queue with exponential backoff + jitter; drop oldest first under pressure. |
| A-NFR-5 | Do not run as root; use least-privilege reads (e.g. DirectAdmin group/ACL patterns; document in `agent/README.md` as implementation lands). |
| A-NFR-6 | Never log secrets, enrollment tokens, or HMAC keys. |
| A-NFR-7 | Partial failure: discovery may succeed while one site’s Imagick/PHP read fails; report per-field status. |

## 7. NestJS contract expectations

Exact DTO names are owned by backend ADRs / route docs. This section states
product-level payload needs.

### 7.1 Connectivity

- Heartbeat → agent liveness + version + server binding.
- NestJS computes `connected` / `stale` / `disconnected` from freshness policy.

### 7.2 Discovery + site stack

Ingest (or dedicated discovery section) must carry, per site:

- identity: domain, aliases, documentRoot, owner, appType, source
- links: `controlPanelUrl` (DirectAdmin), `wordpressAdminUrl` (nullable)
- versions: `wordpressVersion`, `phpVersion` (+ scope), `imagickVersion`
- updates: `wordpressUpdateStatus`, `wordpressUpdateCheckedAt`
- field-level `unknown` / `unsupported` reasons when missing

### 7.3 Active visitors — 3 minutes now, 24 hours later on NestJS

**Agent sends (required for current UI):**

```text
activeVisitors3m: {
  domain,
  uniqueIpCount,
  windowSeconds: 180,
  windowStartedAt,
  measuredAt
}
```

**Agent does not compute 24h totals.**

**NestJS 24h path (documented for future / backend work):**

To compute “بازدیدکنندگان فعال — ۲۴ ساعت اخیر” without raw log shipping, NestJS
should aggregate stored agent samples, for example:

1. Persist each accepted `activeVisitors3m` sample (website id, uniqueIpCount,
   window bounds, measuredAt).
2. For a 24h customer view, either:
   - **Approximate:** sum/average of 3-minute counts (cheap, overcounts unique
     visitors across windows), or
   - **Better unique estimate (preferred if needed):** agent additionally sends a
     **privacy-preserving visitor sketch/digest per window** (e.g. hashed IP
     truncated tokens or a HyperLogLog/register sketch—exact algorithm is a
     backend/agent ADR), which NestJS merges across windows for ~24h unique
     visitors without storing raw IPs centrally.

Until that ADR exists, agent must at least send durable `activeVisitors3m`
samples so NestJS can start with a simple rollup and upgrade uniqueness later.

**Do not** have the agent keep 24 hours of access logs in memory to answer the
24h metric locally.

## 8. Acceptance criteria

- [ ] Enrolled agent appears connected in admin while heartbeats are fresh, and
      becomes stale/disconnected when heartbeats stop.
- [ ] Rediscovery updates domains/aliases without requiring agent reinstall.
- [ ] DirectAdmin / control-panel URL remains correct after panel URL/path
      changes on the host (within one rediscovery cycle).
- [ ] WordPress sites expose admin link + WP/PHP/Imagick fields or explicit
      unknown/unsupported states.
- [ ] WordPress update status includes a real last-check timestamp when status
      is known.
- [ ] Active visitors (3m) appear with measurement time; counts are per-site.
- [ ] No agent payload is treated as public uptime / online-down for customers.
- [ ] Server location is never required from the agent.
- [ ] 24h active visitors are not computed on the agent; NestJS can store 3m
      samples for later aggregation.

## 9. Delivery slices

1. **Connectivity + discovery** — enroll, heartbeat freshness, inventory push,
   admin discovery list.
2. **Site stack + links** — DirectAdmin URL, WP admin link, WP/PHP/Imagick,
   update status + checkedAt.
3. **Active visitors 3m** — OLS log unique IPs, ingest sample, UI
   “فعال در حال حاضر”.
4. **NestJS 24h prep** — persist 3m samples; decide approximate vs sketch-based
   unique aggregation (ADR if sketches/hashes are introduced).

## 10. Open decisions

| ID | Decision | Why it matters |
|---|---|---|
| O-1 | Exact Imagick / PHP discovery method per vhost vs host-default | Accuracy vs cost |
| O-2 | WordPress update check method (local files vs WP-CLI vs deferred) | Privilege and freshness |
| O-3 | DirectAdmin URL discovery sources (config files, hostname conventions) | Link correctness |
| O-4 | 24h unique visitors: simple rollup vs privacy-preserving sketches | Storage, privacy, accuracy |
| O-5 | Bot/CDN IP filtering for active-visitor counts | Metric honesty |

## 11. Related documents

- Agent index (both deployables): [`README.md`](./README.md)
- Phase 1 agent package: [`../../agent/README.md`](../../agent/README.md)
- Monitoring agent (later): [`../../monitoring-agent/README.md`](../../monitoring-agent/README.md)
- Two-agent ADR: [`../architecture/decisions/0007-two-vps-agents.md`](../architecture/decisions/0007-two-vps-agents.md)
- Servers / agent data flow: [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md)
- Admin servers/websites UX: [`../product/ux-flows/admin-servers-websites-agents.md`](../product/ux-flows/admin-servers-websites-agents.md)
- Phase 1 features: [`../product/phase-1-application-features.md`](../product/phase-1-application-features.md)
- Backend routes (agent plane): [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
- Architecture overview: [`../architecture/overview.md`](../architecture/overview.md)
