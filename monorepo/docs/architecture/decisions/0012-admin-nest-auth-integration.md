# 0012. Admin Nest auth integration

> **Status:** Accepted
>
> **Date:** 2026-08-10
>
> **Related:** Hybrid transport design in [0010](./0010-client-hybrid-auth-data-fetching.md);
> client authorization in [0011](./0011-client-nest-auth-integration.md)
>
> **Amends:** [0011](./0011-client-nest-auth-integration.md) (removes the
> “admin-panel remains UI-only” gate)

## Context

[ADR 0011](./0011-client-nest-auth-integration.md) allowed Nest auth and JWT
fetching in `client/` and left `admin-panel/` UI-only until a separate ADR.
Staff Nest routes under `/api/v1/admin/*` already exist
([`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md)).
The admin UI still loads fixtures only.

`admin-panel/` and `client/` have **different product UX** (staff ops vs
customer dashboard). They should **not** share screens, routes, or domain DTOs.
They **should** share the same Nest session transport pattern: hybrid HTTP-only
cookies + memory access token + runtime-split fetch helpers ([ADR 0010](./0010-client-hybrid-auth-data-fetching.md)).

Staff sign-in for the first slice is username/password against existing Nest
`POST /api/v1/auth/login`, restricted to `ADMIN` / `OPERATOR` roles.

## Decision

1. **`admin-panel/` may** integrate NestJS for:
   - Staff authentication via username/password (`POST /api/v1/auth/login`)
   - Session cookies + hybrid access-token store (same model as ADR 0010)
   - Staff JWT data fetching to `/api/v1/admin/*` (and shared staff-safe reads
     such as `/users/me` when used for the signed-in staff profile)
2. **Reuse ADR 0010 transport**, with **separate cookie names** from `client/`
   (default prefix `unixsee_admin_*`) so customer and staff sessions do not
   collide in one browser.
3. **Staff-only gate after login:** reject sessions whose Nest role is not
   `ADMIN` or `OPERATOR` (clear cookies; do not enter the admin shell).
4. **UX stays admin-owned:** follow [`../../product/`](../../product/) admin
   flows and `admin-panel/` UI. Do not import customer dashboard patterns or
   `client/` ticket forms.
5. **Still forbidden for all Next.js apps:** talking to agents or VPS hosts;
   inventing Nest routes/DTOs that conflict with modules-and-routes; redesigning
   Nest refresh/login contracts.
6. Mock/static UI for surfaces not yet wired must stay honest.

## Consequences

- Agents may implement Nest auth/data-fetch code in `admin-panel/` following
  [`../../frontend/admin-data-fetching.md`](../../frontend/admin-data-fetching.md)
  and
  [`../../frontend/admin-domain-data-fetching.md`](../../frontend/admin-domain-data-fetching.md).
- ADR 0011’s “admin remains UI-only” clause is no longer binding; cite this ADR.
- First recommended implementation slice: staff password login + session +
  refresh BFF + proxy gate. Domain Nest wiring (tickets, overview, users, …)
  follows admin product priority via the Layer 2 checklist—not customer ticket
  UX parity.
- Capability checks beyond coarse `ADMIN` / `OPERATOR` remain Nest-owned when
  product requires them; the UI must not invent capability matrices.
