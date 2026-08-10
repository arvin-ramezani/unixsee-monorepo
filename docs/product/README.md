# Product documentation

Product behavior and UX specifications for Unixsee Phase 1.

## Reading order (admin work first)

1. [`phase-1-application-features.md`](./phase-1-application-features.md) — shared feature brief
2. Relevant note under [`notes/`](./notes/) for onboarding or data-flow context
3. Matching UX flow under [`ux-flows/`](./ux-flows/)

Customer and public-site UX flows are not fully specified in this tree yet.
Until they are, Phase 1 remains the behavioral source of truth for `client/`.

## Phase 1

| Doc | Purpose |
|---|---|
| [`phase-1-application-features.md`](./phase-1-application-features.md) | Required outcomes, actors, boundaries, feature areas |

## Notes

Operational clarifications that support Phase 1 and UX flows:

| Doc | Topic |
|---|---|
| [`notes/servers-agent-data-flow.md`](./notes/servers-agent-data-flow.md) | Server → enrollment → agent → NestJS → admin assignment |
| [`notes/onboarding-paths-and-handoffs.md`](./notes/onboarding-paths-and-handoffs.md) | Onboarding path handoffs |
| [`notes/onboarding-plan-request-user-website.md`](./notes/onboarding-plan-request-user-website.md) | Plan request ↔ user ↔ website linking |
| [`notes/phase-1-public-entry-channels.md`](./notes/phase-1-public-entry-channels.md) | Public entry channels |
| [`notes/phase-1-delivery-waves.md`](./notes/phase-1-delivery-waves.md) | First-wave vs later Phase 1 delivery |

## Diagrams

| File | Topic |
|---|---|
| [`diagrams/user-flows.drawio`](./diagrams/user-flows.drawio) | Guest consultant, plan/website request, complementary-service request flows |

## Admin UX flows

| Doc | Flow |
|---|---|
| [`ux-flows/admin-overview.md`](./ux-flows/admin-overview.md) | Administrator home / triage (`نمای‌کلی`) |
| [`ux-flows/admin-users.md`](./ux-flows/admin-users.md) | Users / tenants |
| [`ux-flows/admin-plan-requests.md`](./ux-flows/admin-plan-requests.md) | Plan requests (`درخواست‌های پلن`) |
| [`ux-flows/admin-servers-websites-agents.md`](./ux-flows/admin-servers-websites-agents.md) | Servers, websites, agents |
| [`ux-flows/admin-complementary-services.md`](./ux-flows/admin-complementary-services.md) | Complementary services |

UX flow docs use document-control tables, confidence summaries, and evidence
gaps. Preserve that structure when editing. See
[`../quality/documentation.md`](../quality/documentation.md).

## Related engineering docs

- System overview: [`../architecture/overview.md`](../architecture/overview.md)
- Frontend conventions: [`../frontend/README.md`](../frontend/README.md)
- UI-only phase: [`../architecture/decisions/0003-ui-only-phase-boundaries.md`](../architecture/decisions/0003-ui-only-phase-boundaries.md)
