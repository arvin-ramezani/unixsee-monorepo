# 0013. Customer assistant in Nest with pgvector RAG

> **Status:** Proposed
>
> **Date:** 2026-08-14
>
> **Product authority:** [`../../product/customer-assistant-prd.md`](../../product/customer-assistant-prd.md)

## Context

Unixsee wants a customer-dashboard chat assistant that answers questions about
a tenant’s websites, support history, and related dashboard data, and later
performs confirmed actions (for example create a ticket). Phase 1 product scope
does not include this feature; work is deferred beyond Phase 1.

Existing constraints:

- NestJS owns auth, persistence, business rules, and orchestration
  ([`../overview.md`](../overview.md)).
- `client/` may call Nest with customer JWT but must not invent control-plane
  policy ([0011](./0011-client-nest-auth-integration.md)).
- Backend organizes by domain modules with audience-specific controllers
  ([0005](./0005-domain-modules-multi-audience-controllers.md)).
- Persistence is PostgreSQL ([0002](./0002-stack-choices.md)).
- VPS **agents** are separate edge deployables; that name must not collide with
  this product feature.

We need a durable decision on ownership, retrieval shape, and whether to add a
new deployable or vector product.

## Decision

1. **Own the assistant in NestJS** as a domain module named `assistant` inside
   the existing modular monolith (`backend/`). Do **not** create a separate AI
   microservice for this feature.
2. **Hybrid retrieval:**
   - **Live tools** call existing Nest application services (`dashboard`,
     `websites`, `tickets`, `activities`, and peers) under the same tenant
     membership checks as customer REST.
   - **RAG** stores embeddings in PostgreSQL using the **pgvector** extension
     for durable knowledge (help/FAQ/policies and optional tenant-scoped
     historical summaries). RAG does not replace live tools for current
     operational state.
3. **`client/` is presentation only** for chat and confirmation UI. LLM API
   keys, prompts, tool execution, embedding, and similarity search stay on Nest.
4. **Wave 1 is read-only.** Wave 2 write tools (e.g. create ticket) must reuse
   existing domain services with explicit user confirmation, idempotency, and
   audit—never a parallel mutation path invented by the model.
5. **Naming:** product and module use **assistant**; reserve **agent** for
   `agent/` and `monitoring-agent/`.

## Consequences

- Positive: One trust boundary, one database, reuse of domain authz, incremental
  delivery without new ops surface.
- Positive: pgvector keeps vectors next to relational data and supports
  tenant-filtered queries in the same transactional store.
- Negative: Nest must operate LLM timeouts, rate limits, embedding jobs, and
  prompt safety; Prisma may need raw SQL or supporting extensions for vector
  search until first-class support is adequate.
- Forbidden: Browser-side LLM keys; dumping cross-tenant rows into prompts;
  treating RAG hits as authorization; shipping this as Phase 1 without
  accepting the PRD and implementing contracts.
- Follow-up at implement time: enable `vector` on PostgreSQL, document customer
  routes under [`../../backend/modules-and-routes.md`](../../backend/modules-and-routes.md),
  add contracts under [`../../backend/contracts/`](../../backend/contracts/),
  choose LLM/embedding providers (still open in the PRD).

## Alternatives considered

- **Next.js calls the LLM directly** — Rejected: leaks secrets, skips Nest
  tenant policy, conflicts with control-plane ownership.
- **Separate AI service + managed vector DB** — Rejected for current scale:
  extra deployable and data sync without a demonstrated requirement Nest cannot
  meet.
- **Prompt-stuffing only (no tools, no vectors)** — Rejected as the long-term
  design: brittle for live data and actions; may appear only as a throwaway
  prototype, not the Accepted architecture.
