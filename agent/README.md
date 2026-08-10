# Unixsee Phase 1 VPS Agent

> **Status:** Scaffold — build from scratch for Phase 1.  
> **PRD:** [`../docs/agent/prd.md`](../docs/agent/prd.md)  
> **Not this package:** [`../monitoring-agent/`](../monitoring-agent/) (monitoring; develop later)

Outbound-only edge agent for managed DirectAdmin + OpenLiteSpeed WordPress /
WooCommerce hosts. Reports discovery, site stack/links, and 3-minute active
visitors to NestJS. Does **not** own public website uptime probes.

## Scope (from PRD)

- Enroll + heartbeat
- Website discovery (OLS + DirectAdmin)
- DirectAdmin / control-panel URL, WordPress admin link
- WordPress / PHP / Imagick versions and WP update status
- Active visitors (3-minute unique IPs)
- Explicit non-goals: public online/down, server location, 24h visitors on-box

## Setup

```bash
cd agent
npm install
```

Implementation starts after NestJS enrollment/ingest contracts for this agent
are confirmed against `docs/backend/modules-and-routes.md` and the PRD.
