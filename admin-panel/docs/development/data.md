## Data sources

### Nest-wired (live)

| Surface | Transport | Notes |
|---|---|---|
| Staff login / session | Server Actions + `unixsee_admin_*` cookies + refresh BFF | ADR 0012 Layer 1 |
| `/tickets`, `/tickets/[id]` | RSC `server-fetch` + ticket Server Actions | Nest `status` / `skip` / `take` from URL; contract [`tickets-admin.md`](../../../docs/backend/contracts/tickets-admin.md) |
| `/plan-requests` list | RSC `server-fetch` | Nest list; contract [`plan-requests-admin.md`](../../../docs/backend/contracts/plan-requests-admin.md) |
| `/plan-requests/[id]` | RSC `server-fetch` | Nest GET by id; enable/decline via Server Actions; revalidates list and `[id]` |
| `/servers`, `/servers/[id]` | RSC `server-fetch` + server Server Actions | Create/delete server, issue/revoke enrollment token, revoke agent; contract [`servers-admin.md`](../../../docs/backend/contracts/servers-admin.md). `assign` + `tenantId` search params reopen the assign Dialog after `/users/new`. |

### Fixture-backed (not yet wired)

Surfaces that are **not yet Nest-wired** use static data under:

```text
src/lib/data/
```

Examples still fixture-driven:

```text
overview-data.ts   # ticket attention strip still uses tickets-data fixtures
websites-data.ts
users-data.ts
servers-data.ts    # enums + labels; list/detail pages read Nest
plan-requests-data.ts   # enums + overview fixtures; list/detail pages read Nest
complementary-services-data.ts
```

`tickets-data.ts` remains for overview fixtures and shared status/service enums;
list/detail pages read Nest, not `TICKETS`. `plan-requests-data.ts` keeps UI
status labels and overview fixtures while `/plan-requests` and
`/plan-requests/[id]` load Nest.
`servers-data.ts` keeps agent/enrollment enums and labels while `/servers`
loads Nest; discovery assignment on the detail pane is still local-only.
`/users`, `/users/new`, and `/users/[id]` stay fixture-backed via
`users-runtime.ts`.
`/complementary-services` and `/complementary-services/[id]` stay
fixture-backed; in-session assignment creates use
`complementary-services-runtime.ts`. There is no Nest GET-by-id yet.

Prefer named constants:

```ts
export const WEBSITES = [...]
```

Do not create fake API clients that pretend to be Nest. When a domain is
wired, use the hybrid fetch helpers documented in monorepo
[`docs/frontend/admin-data-fetching.md`](../../../docs/frontend/admin-data-fetching.md)
and
[`docs/frontend/admin-domain-data-fetching.md`](../../../docs/frontend/admin-domain-data-fetching.md)
(ADR 0012). Keep fixtures only for unwired panes and honest empty/error demos.

Dummy data for unwired UI should still cover realistic states such as:

- empty values
- long content
- multiple statuses
- loading states
- error states
- responsive content
