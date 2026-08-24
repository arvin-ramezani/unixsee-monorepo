# 0004. API audience namespaces

> **Status:** Accepted
>
> **Date:** 2026-08-08

## Context

Unixsee serves four callers from one NestJS deployable: public website intake,
customer dashboard, administrator panel, and the VPS agent. Mixing those
surfaces on undifferentiated routes makes authorization mistakes easy and
hides which contracts browsers may call.

Authentication stays as implemented today (access/refresh JWT, OTP login,
monitoring-access OTP/JWT, global `AtGuard`, `@Public()`). The decision is
about URL namespaces and trust, not a new login system.

## Decision

Use one global HTTP prefix `api`, version `v1` for browser-facing APIs, and
audience namespaces:

```text
/api/v1/public/...          # unauthenticated intake + published catalogs
/api/v1/...                 # customer (tenant JWT) — existing dashboard style
/api/v1/admin/...           # staff JWT + role/capability checks
/api/internal/agent/v1/...  # agent plane (HMAC / enrollment; not browser-facing)
```

Rules:

- Public routes use `@Public()` plus rate limiting and non-enumerating errors.
- Customer routes require access JWT and tenant membership scoping.
- Admin routes require access JWT and staff role/capability (coarse roles first).
- Agent routes stay under `/api/internal/agent` and must not be called from
  `client/` or `admin-panel/`.
- Socket.io namespace `/realtime` remains customer monitoring; admin queues are
  REST-first until a later ADR adds admin realtime.

## Consequences

- Frontends can target a clear base path per surface.
- New modules add controllers under the correct audience prefix.
- Splitting into separate API deployables is deferred; reconsider only when
  isolation or scale evidence requires it.
- Detail map: [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md).
