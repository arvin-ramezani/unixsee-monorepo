# Customer Dashboard Assistant — Product Requirements Document (PRD)

> **Status:** Proposed  
> **Owner:** Product and platform engineering  
> **Surfaces:** NestJS `assistant` module (`backend/`) + customer chat UI (`client/`)  
> **Phase:** Deferred beyond Phase 1 — **not implemented**  
> **Not this PRD:** VPS edge `agent/`, `monitoring-agent/`, or admin-panel staff chatbot  
> **Audience:** Product, NestJS, and customer dashboard teams  
> **Last verified:** 2026-08-14

## 1. Purpose

Define what Unixsee’s **customer dashboard assistant** must do so authorized
tenant users can ask natural-language questions about their own websites,
services, tickets, and related dashboard history—and later (wave 2) request
safe, confirmed actions such as creating a support ticket.

The assistant is a **NestJS modular-monolith capability**, not a separate
deployable. Retrieval combines **live domain tools** (tenant-scoped Nest
services) with **RAG over PostgreSQL pgvector** for durable knowledge. The
browser never holds LLM keys or embeds vectors.

Product naming: call this feature the **assistant**. Do not call it an “agent”
in product or module names—that term is reserved for VPS edge agents.

## 2. Product outcomes

- An authenticated customer can open a chat surface in the customer dashboard
  and ask about **their tenant’s** operational and support data.
- Answers that need current facts (overview counts, website status, ticket
  state) come from **authorized Nest domain reads**, not from guessed text.
- Answers that need durable help/policy/history context can use **RAG** chunks
  retrieved from PostgreSQL with **pgvector**, always filtered by tenancy rules.
- The customer can continue a conversation across turns within a saved thread.
- Wave 2: the customer can ask the assistant to **propose** an action (for
  example create a ticket); Nest performs the mutation only after explicit
  confirmation, using the same domain services as normal REST APIs.
- Persian RTL and English LTR remain supported for the same workflows.

## 3. Non-goals (explicit exclusions)

| Excluded | Owner instead |
|---|---|
| Shipping inside Phase 1 first-wave or later Phase 1 | Phase 1 stays as defined in [`phase-1-application-features.md`](./phase-1-application-features.md) |
| Separate AI microservice or dedicated vector database product | Nest modular monolith + PostgreSQL pgvector ([`../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md`](../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md)) |
| LLM calls, prompts, or embeddings from `client/` or `admin-panel/` | Nest `assistant` module only |
| Direct browser access to agents, VPS hosts, or raw PostgreSQL | Forbidden by architecture |
| Admin/staff chatbot in this PRD | Future product decision if needed |
| Unconfirmed write actions in wave 1 | Wave 2 only |
| Replacing tickets, dashboard, or websites REST APIs | Assistant **uses** those domains; does not replace them |
| Inventing final OpenAPI DTOs in this PRD | Backend contracts at implementation time |

## 4. Actors and trust boundary

```text
client (dashboard chat UI) ──customer JWT──► NestJS assistant
                                              │
                         LLM provider ◄───────┤ (Nest-only secrets)
                                              │
                         domain services ◄────┤ (tools: dashboard, websites, tickets, …)
                                              │
                         PostgreSQL ◄─────────┘ (threads, messages, pgvector chunks)
```

- NestJS is the authority for authorization, persistence, tool execution,
  embedding, retrieval, and LLM orchestration.
- Customer JWT + **tenant membership** scope every tool call and every vector
  query that carries tenant data.
- Admin and client never talk to VPS agents; the assistant never bypasses that
  boundary.
- Retrieved RAG chunks are **untrusted context** for the model; they do not
  grant extra privileges.

Related: [`../architecture/overview.md`](../architecture/overview.md),
[`../architecture/decisions/0011-client-nest-auth-integration.md`](../architecture/decisions/0011-client-nest-auth-integration.md),
[`notes/customer-assistant.md`](./notes/customer-assistant.md).

## 5. Functional requirements

### 5.1 Access and tenancy

| ID | Requirement |
|---|---|
| CA-AUTH-1 | Only authenticated customer sessions may use the assistant. |
| CA-AUTH-2 | Every read and write is scoped to the caller’s tenant membership; other tenants’ data must never appear in prompts, tool results, or RAG hits. |
| CA-AUTH-3 | Guests and staff JWTs are out of scope for this customer assistant surface. |

### 5.2 Conversation

| ID | Requirement |
|---|---|
| CA-CHAT-1 | Customer can create or continue a conversation thread. |
| CA-CHAT-2 | Nest persists messages (user and assistant) with tenant and user ownership. |
| CA-CHAT-3 | Assistant replies stream or return progressively when the transport supports it; REST remains the source of truth for stored messages after reconnect. |
| CA-CHAT-4 | Rate limits and abuse controls apply per user/tenant (exact limits **Unknown** until implementation). |

### 5.3 Live tools (operational truth)

| ID | Requirement |
|---|---|
| CA-TOOL-1 | For current dashboard facts, Nest invokes **exported domain application services** (same authz rules as customer REST), not ad-hoc SQL from the LLM. |
| CA-TOOL-2 | Wave 1 tool catalog includes at least: dashboard overview-style reads, websites list/detail, tickets list/detail (exact tool names at implement time). |
| CA-TOOL-3 | Tool inputs from the model are never treated as authorization; Nest re-checks tenant ownership using the session. |
| CA-TOOL-4 | If a tool fails or returns empty, the assistant must not invent matching operational data. |

### 5.4 RAG and pgvector

| ID | Requirement |
|---|---|
| CA-RAG-1 | Durable knowledge (help/FAQ/policies and optional tenant-scoped historical summaries) is embedded and stored in PostgreSQL using the **pgvector** extension. |
| CA-RAG-2 | Nest owns chunking, embedding, upsert, and similarity search; the browser does not embed. |
| CA-RAG-3 | Tenant-scoped chunks must filter by `tenantId` (and stricter scopes when applicable) on every retrieve. Global help content may be shared only when explicitly marked non-tenant. |
| CA-RAG-4 | RAG supplements tools; it does not replace live tools for current operational state. |
| CA-RAG-5 | Exact corpus list and embedding model remain **Unknown** until product/ops decide (see §10). |

### 5.5 Wave 2 actions (later)

| ID | Requirement |
|---|---|
| CA-ACT-1 | Write tools (e.g. create ticket) call the **same** Nest domain services used by customer REST. |
| CA-ACT-2 | Mutations require explicit customer confirmation in the UI before Nest commits. |
| CA-ACT-3 | Mutations use idempotency keys and produce auditable records consistent with domain contracts. |
| CA-ACT-4 | Wave 1 must ship without write tools; UI must not imply actions are available before wave 2. |

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| CA-NFR-1 | Stay inside the Nest modular monolith; no new AI deployable for this feature. |
| CA-NFR-2 | LLM provider credentials exist only in Nest server configuration. |
| CA-NFR-3 | Do not log full prompts that contain unnecessary PII; never log provider API keys. |
| CA-NFR-4 | Provider timeouts and errors surface a safe customer message with retry guidance. |
| CA-NFR-5 | Localization: assistant UX and system prompts must support FA and EN product locales (content quality **Unknown** until evaluated). |
| CA-NFR-6 | Data egress to a third-party LLM provider is a compliance decision (**Unknown** until chosen). |

## 7. NestJS and client expectations

Exact routes and DTOs are **not** defined here. At implementation time:

- Add customer audience routes under the Nest `assistant` module and document
  them in [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
  plus [`../backend/contracts/`](../backend/contracts/).
- `client/` renders chat and confirmation UI only; uses existing hybrid JWT
  fetch patterns ([`../frontend/client-data-fetching.md`](../frontend/client-data-fetching.md)).
- Engineering design sketch:
  [`../backend/customer-assistant.md`](../backend/customer-assistant.md).

## 8. Acceptance criteria

### Wave 1 (read-only)

- [ ] Tenant user can chat about own dashboard/websites/tickets without seeing
      another tenant’s data.
- [ ] Current operational answers are backed by Nest tool results when tools
      apply.
- [ ] RAG retrieval uses pgvector in PostgreSQL with correct tenancy filters.
- [ ] No LLM keys or embedding calls run in the browser.
- [ ] Feature is absent or honestly “coming later” until this PRD is Accepted
      and implemented—Phase 1 must not fake live assistant success.

### Wave 2 (actions)

- [ ] Create-ticket (or equivalent) runs only after explicit confirm.
- [ ] Created records match normal customer API behavior and appear in existing
      ticket surfaces.
- [ ] Failed mutations do not claim success in chat.

## 9. Delivery waves

1. **Docs and ADR (this pass)** — Proposed PRD, architecture ADR, engineering
   feature analysis; no runtime code.
2. **Wave 1 — Read-only MVP** — Nest `assistant` module, threads/messages,
   LLM adapter, live tools, pgvector RAG for agreed corpus, customer chat UI.
3. **Wave 1 hardening** — Rate limits, retention, observability, prompt/PII
   minimization.
4. **Wave 2 — Confirmed actions** — Write tools + confirm UX + audit /
   idempotency (start with create ticket).

## 10. Open decisions

| ID | Decision | Why it matters | Level |
|---|---|---|---|
| O-1 | LLM provider and data-residency/compliance constraints | Legal, cost, latency | Unknown |
| O-2 | Embedding model and vector dimensions | Schema and re-index cost | Unknown |
| O-3 | Initial RAG corpus (global help vs tenant history summaries) | Privacy and usefulness | Unknown |
| O-4 | Streaming transport (SSE vs other) vs monitoring Socket.io reuse | Ops and auth model | Unknown |
| O-5 | Message retention and deletion policy | Storage and privacy | Unknown |
| O-6 | Exact per-tenant rate limits | Abuse vs UX | Unknown |

## 11. Related documents

- Thin product pointer: [`notes/customer-assistant.md`](./notes/customer-assistant.md)
- Architecture ADR: [`../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md`](../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md)
- Backend feature analysis: [`../backend/customer-assistant.md`](../backend/customer-assistant.md)
- Phase 1 features (deferred list): [`phase-1-application-features.md`](./phase-1-application-features.md)
- Backend modules map: [`../backend/modules-and-routes.md`](../backend/modules-and-routes.md)
- Client Nest auth: [`../architecture/decisions/0011-client-nest-auth-integration.md`](../architecture/decisions/0011-client-nest-auth-integration.md)
- Domain modules ADR: [`../architecture/decisions/0005-domain-modules-multi-audience-controllers.md`](../architecture/decisions/0005-domain-modules-multi-audience-controllers.md)
- Naming contrast (edge agents): [`../agent/prd.md`](../agent/prd.md)
