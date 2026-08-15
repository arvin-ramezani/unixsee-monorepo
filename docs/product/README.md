# Product documentation

Product behavior and UX specifications for Unixsee Phase 1.

## Reading order (admin work first)

1. [`phase-1-application-features.md`](./phase-1-application-features.md) — shared feature brief
2. Relevant note under [`notes/`](./notes/) for onboarding or data-flow context
3. Matching UX flow under [`ux-flows/`](./ux-flows/)

Customer and public-site UX flows are being added under [`ux-flows/`](./ux-flows/).
Phase 1 remains the behavioral source of truth where a client UX flow does not
yet exist.

## Phase 1

| Doc | Purpose |
|---|---|
| [`phase-1-application-features.md`](./phase-1-application-features.md) | Required outcomes, actors, boundaries, feature areas |

## Notes

Operational clarifications that support Phase 1 and UX flows:

| Doc | Topic |
|---|---|
| [`notes/servers-agent-data-flow.md`](./notes/servers-agent-data-flow.md) | Server → enrollment → agent → NestJS → admin assignment |
| [`notes/customer-authorization-and-tenant.md`](./notes/customer-authorization-and-tenant.md) | احراز هویت: signup ≠ tenant; certifications → staff approve tenant |
| [`notes/onboarding-paths-and-handoffs.md`](./notes/onboarding-paths-and-handoffs.md) | Onboarding path handoffs |
| [`notes/onboarding-plan-request-user-website.md`](./notes/onboarding-plan-request-user-website.md) | Plan request ↔ user ↔ website linking |
| [`notes/phase-1-public-entry-channels.md`](./notes/phase-1-public-entry-channels.md) | Public entry channels |
| [`notes/phase-1-delivery-waves.md`](./notes/phase-1-delivery-waves.md) | First-wave vs later Phase 1 delivery |
| [`notes/ticket-lifecycle-and-auto-close.md`](./notes/ticket-lifecycle-and-auto-close.md) | Submitted default, reopen/close, auto-close grace |
| [`notes/admin-staff-roles-and-capabilities.md`](./notes/admin-staff-roles-and-capabilities.md) | Main ADMIN → sub-admin → specialty OPERATORs (Phase 1 last step FA) |

## Diagrams

| File | Topic |
|---|---|
| [`diagrams/user-flows.drawio`](./diagrams/user-flows.drawio) | Guest consultant, plan/website request, complementary-service request flows |

## Customer / public UX flows

| Doc | Flow |
|---|---|
| [`ux-flows/client-auth.md`](./ux-flows/client-auth.md) | Public customer sign-in, sign-up, verification, password recovery |
| [`ux-flows/client-authorization.md`](./ux-flows/client-authorization.md) | احراز هویت submission → become tenant |
| [`ux-flows/customer-public-plan-request.md`](./ux-flows/customer-public-plan-request.md) | Guest / dashboard plan request intake |
| UI companion: [`../frontend/client-auth-ui.md`](../frontend/client-auth-ui.md) | Auth shell, tokens, inputs, RTL, motion |

## Admin UX flows

| Doc | Flow |
|---|---|
| [`ux-flows/admin-overview.md`](./ux-flows/admin-overview.md) | Administrator home / triage (`نمای‌کلی`) |
| [`ux-flows/admin-users.md`](./ux-flows/admin-users.md) | Users / tenants |
| [`ux-flows/admin-authorization.md`](./ux-flows/admin-authorization.md) | Staff احراز هویت review → approve tenant |
| [`ux-flows/admin-plan-requests.md`](./ux-flows/admin-plan-requests.md) | Plan requests (`درخواست‌های پلن`) |
| [`ux-flows/admin-servers-websites-agents.md`](./ux-flows/admin-servers-websites-agents.md) | Servers, websites, agents |
| [`ux-flows/admin-complementary-services.md`](./ux-flows/admin-complementary-services.md) | Complementary services (request → quote → assignment lifecycle) |
| [`ux-flows/admin-create-complementary-service-assignment.md`](./ux-flows/admin-create-complementary-service-assignment.md) | Staff create assignment and attach to website (client-form-aligned) |

UX flow docs use document-control tables, confidence summaries, and evidence
gaps. Preserve that structure when editing. See
[`../quality/documentation.md`](../quality/documentation.md).

## Related engineering docs

- System overview: [`../architecture/overview.md`](../architecture/overview.md)
- Frontend conventions: [`../frontend/README.md`](../frontend/README.md)
- UI-only phase: [`../architecture/decisions/0003-ui-only-phase-boundaries.md`](../architecture/decisions/0003-ui-only-phase-boundaries.md)
