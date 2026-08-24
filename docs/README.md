# Unixsee shared documentation

Root `docs/` contains facts that affect more than one deployable: product
behavior, system architecture, accepted decisions, API/agent contracts, and
monorepo operations. Implementation conventions owned by one deployable live
under that deployable's `docs/` directory.

## Start here

| You want to…                                | Read                                                                                                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Understand the system                       | [`architecture/overview.md`](./architecture/overview.md)                                                                                                          |
| Know which folder owns a change or document | [`architecture/monorepo.md`](./architecture/monorepo.md)                                                                                                          |
| Change shared product behavior              | [`product/README.md`](./product/README.md)                                                                                                                        |
| Change a shared Next.js convention          | [`frontend/README.md`](./frontend/README.md)                                                                                                                      |
| Change client Nest auth/data                | [`frontend/client-data-fetching.md`](./frontend/client-data-fetching.md) + [`frontend/client-domain-data-fetching.md`](./frontend/client-domain-data-fetching.md) |
| Change admin Nest auth/data                 | [`frontend/admin-data-fetching.md`](./frontend/admin-data-fetching.md) + [`frontend/admin-domain-data-fetching.md`](./frontend/admin-domain-data-fetching.md)     |
| Change Nest routes or wire contracts        | [`backend/README.md`](./backend/README.md) → [`backend/modules-and-routes.md`](./backend/modules-and-routes.md) → [`backend/contracts/`](./backend/contracts/)    |
| Change VPS agent/backend integration        | [`agent/README.md`](./agent/README.md)                                                                                                                            |
| Sync an app to its deploy repository        | [`quality/deployment-remotes.md`](./quality/deployment-remotes.md)                                                                                                |
| Maintain the documentation system           | [`quality/documentation.md`](./quality/documentation.md)                                                                                                          |

## App-local documentation

Start inside the target app for implementation rules:

| Deployable       | Agent route                                                      | Documentation index                                              |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| Admin panel      | [`../admin-panel/AGENTS.md`](../admin-panel/AGENTS.md)           | [`../admin-panel/docs/README.md`](../admin-panel/docs/README.md) |
| Client           | [`../client/AGENTS.md`](../client/AGENTS.md)                     | [`../client/docs/README.md`](../client/docs/README.md)           |
| Backend          | [`../backend/AGENTS.md`](../backend/AGENTS.md)                   | [`../backend/docs/README.md`](../backend/docs/README.md)         |
| VPS agent        | [`../agent/README.md`](../agent/README.md)                       | Shared integration docs: [`agent/README.md`](./agent/README.md)  |
| Monitoring agent | [`../monitoring-agent/README.md`](../monitoring-agent/README.md) | [`../monitoring-agent/docs/`](../monitoring-agent/docs/)         |

App-local docs must be sufficient for ordinary work in a single-app checkout.
When work changes a cross-app contract, perform it in the monorepo and load the
shared root document that owns that contract.

## Map

```text
docs/
├── architecture/  system boundaries and ADRs
├── product/       shared product behavior and cross-surface UX flows
├── frontend/      conventions/contracts shared by both Next.js apps
├── backend/       API route maps and wire contracts consumed across apps
├── agent/         agent/control-plane integration contracts
└── quality/       monorepo validation, deployment, and docs policy
```

## Authority rules

- Store each fact once at the narrowest scope that owns it.
- Root `AGENTS.md`, app `AGENTS.md`, and `.cursor/rules` are routing surfaces,
  not replacement manuals.
- A local app convention overrides a shared default only for that app.
- Accepted ADRs and contracts override explanatory or historical notes.
- Where a standalone app carries a copied shared product document, treat it as
  a mirror: update the monorepo owner first and sync the copy deliberately.
