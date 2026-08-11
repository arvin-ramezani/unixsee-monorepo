# 0011. Client Nest auth integration

> **Status:** Accepted
>
> **Date:** 2026-08-10
>
> **Supersedes:** [0003](./0003-ui-only-phase-boundaries.md)

## Context

[ADR 0003](./0003-ui-only-phase-boundaries.md) forbade NestJS auth and API wiring
inside Next.js apps so UI could ship without inventing contracts. Nest auth
routes (`/api/v1/auth/*`) and the hybrid client session design
([ADR 0010](./0010-client-hybrid-auth-data-fetching.md)) are now ready enough for
the public `client/` app to integrate a first live slice: phone OTP sign-in and
authenticated JWT fetches.

`admin-panel/` Nest wiring is authorized separately by
[ADR 0012](./0012-admin-nest-auth-integration.md). Agents and VPS hosts remain
Nest-only trust boundaries.

## Decision

1. **Supersede ADR 0003** for phase boundaries with this ADR (for `client/`).
2. **`client/` may** integrate NestJS for:
   - Public authentication (starting with phone OTP against existing
     `/api/v1/auth/otp/*`)
   - Session cookies + hybrid access-token store per ADR 0010
   - Customer JWT data fetching (`server-fetch` / `client-fetch` to Nest)
3. **`admin-panel/` Nest wiring** is not covered here — see
   [ADR 0012](./0012-admin-nest-auth-integration.md).
4. **Still forbidden for all Next.js apps:** talking to agents or VPS hosts;
   inventing Nest routes/DTOs that conflict with
   [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md);
   redesigning OTP/refresh contracts.
5. Mock/static UI for surfaces not yet wired must stay honest (no fake live Nest
   success). Email OTP stays non-live until Nest supports it.

## Consequences

- Agents may implement Nest auth/data-fetch code in `client/` following ADR 0010
  and [`../../frontend/client-data-fetching.md`](../../frontend/client-data-fetching.md).
- ADR 0003 is no longer the binding UI-only gate for `client/`; cite this ADR.
- Update validation and agent read-order docs accordingly.
- Admin Nest auth/data-fetch: [ADR 0012](./0012-admin-nest-auth-integration.md).
