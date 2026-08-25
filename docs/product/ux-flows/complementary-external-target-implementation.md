# External Website targeting — implementation handoff

> Status: Implemented contract  
> Last verified: 2026-08-24

## Cross-surface state model

| Concern                     | Values                                                                              | Independent from                            |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| Website management coverage | managed, external, unclassified                                                     | Plan, agent, monitoring, complementary work |
| Request decision            | submitted, accepted, quoted, assigned, in progress, completed, withdrawn, cancelled | Website resolution                          |
| Target resolution           | pending acceptance, linked, deferred no tenant                                      | Service activation                          |
| Tenant authorization        | authorized, not authorized, not authorized at activation                            | Management coverage                         |
| Plan activation             | activation timestamp or inactive                                                    | All complementary states                    |

## UI requirements

Customer and admin Website lists expose an independent coverage filter. Managed
rows may show plan, infrastructure, monitoring, backup, and operations.
External rows show **External hosting — complementary services only**, with
managed-infrastructure values hidden or marked not applicable.

Admin complementary queues and details show:

- customer full name;
- every available phone/email;
- domain and coverage snapshot;
- authorization and resolution state;
- request status;
- service activation separately.

External Website detail prioritizes complementary requests and assignments.
Managed-server onboarding may be a secondary CTA and must use the ordinary
plans journey.
