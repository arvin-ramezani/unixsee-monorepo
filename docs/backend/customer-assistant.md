---
title: "Customer assistant"
purpose: "Engineering design for Nest assistant + pgvector RAG (later implement)"
scope: "unixsee-monorepo / backend assistant module + client chat UI"
audience: "engineers and coding agents"
read_frequency: "low until implementation"
authority: "draft-specification"
status: "planned"
owner: "platform engineering"
last_verified: "2026-08-14"
---

# Feature Analysis: Customer assistant

## Outcome

Provide a NestJS-owned customer chat assistant that answers tenant-scoped
dashboard questions using live domain tools plus PostgreSQL pgvector RAG, with
a later wave for confirmed mutations (for example create ticket). Runtime code
is **not** in scope for this document pass.

## Scope

- In: Nest `assistant` module design, hybrid tools + RAG, conversation
  persistence sketch, client UI responsibility boundary, implementation slices.
- Out: Final OpenAPI DTOs, provider selection, production corpus curation,
  admin chatbot, Phase 1 delivery.
- Dependencies: Existing customer auth/JWT, domain modules (`dashboard`,
  `websites`, `tickets`, …), PostgreSQL with pgvector extension at implement
  time.
- Repository scope: `backend/` (orchestration) + `client/` (chat UI only).

## Intended contract

Aligned with [`../product/customer-assistant-prd.md`](../product/customer-assistant-prd.md)
and Proposed ADR
[`../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md`](../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md):

1. Customer JWT + tenant membership on every request and tool call.
2. LLM, embeddings, and retrieval run only inside Nest.
3. Live facts → tools over exported domain services; durable knowledge →
   pgvector similarity search with tenancy filters.
4. Wave 1 read-only; wave 2 writes require confirm + domain service reuse.
5. Contracts under `docs/backend/contracts/` appear **only at implementation**.

## Actors and access

| Actor | Capability/scope | Restrictions |
|---|---|---|
| Tenant customer (owner/admin/member as product allows) | Chat; read tools; later confirmed actions | Other tenants; staff-only data; agent secrets |
| Nest `assistant` module | Orchestrate LLM, tools, RAG, persistence | Must not bypass domain authz |
| LLM provider | Generate replies / tool calls | Untrusted; no direct DB |
| `client/` chat UI | Render thread, stream, confirm actions | No keys, no embeddings, no policy |

## Primary flows

1. **Ask (wave 1)** — Given an authenticated tenant session, when the user
   sends a message, Nest loads the thread, may retrieve RAG chunks and/or call
   tools, calls the LLM adapter, persists messages, and returns/streams the
   reply.
2. **Retrieve** — Given a user question, when Nest runs RAG, it embeds the
   query, searches pgvector with tenant (or global-help) filters, and passes
   top chunks as untrusted context.
3. **Tool read** — Given a model tool call (e.g. list websites), Nest ignores
   model-claimed ownership, re-authorizes from the session, invokes the domain
   service, and returns a DTO-shaped result to the model.
4. **Confirmed action (wave 2)** — Given a proposed mutation, when the user
   confirms in UI, Nest executes the domain service with idempotency and audit;
   chat never claims success if the domain call failed.

## States, failures, and recovery

| State/failure | User-visible result | System behavior | Recovery |
|---|---|---|---|
| LLM timeout/error | Safe error + retry | Persist user message; mark assistant turn failed | Retry; degrade without inventing data |
| Tool authz deny | Refusal / no data | No cross-tenant leak; log deny | User asks about owned resources only |
| Empty RAG | Answer from tools/general safe copy | Do not fabricate citations | Improve corpus later |
| Rate limit | Throttle message | Reject or delay new turns | Backoff |
| Wave 2 confirm cancelled | No mutation | No domain write | User can re-ask |

## Data and integration boundaries

- UI/surfaces: Customer dashboard chat in `client/` only for this feature.
- APIs/services: Future customer `/api/v1/...` assistant routes (names TBD at
  implement); tools → existing domain services; LLM via Nest adapter interface.
- Data/entities (sketch, not schema):
  - `AssistantThread` — `id`, `tenantId`, `userId`, timestamps, status
  - `AssistantMessage` — `threadId`, role, content, tool/trace metadata, timestamps
  - `AssistantChunk` (or equivalent) — source id, text, metadata, `tenantId`
    nullable for global help, `embedding vector`, content hash, timestamps
- Security/privacy: Tenant filters on vector search; minimize PII in prompts;
  provider egress **Unknown** until chosen.
- Localization/accessibility: FA/EN product locales; chat UI must remain
  keyboard-accessible like other dashboard surfaces.

### Module sketch

```text
backend/src/modules/assistant/
  assistant.module.ts
  controllers/
    assistant.controller.ts          # customer audience only (wave 1)
  services/
    assistant-chat.service.ts        # orchestration
    assistant-tools.service.ts       # tool registry → domain services
    assistant-rag.service.ts         # chunk upsert + similarity search
    llm-gateway.ts                   # DIP: provider adapter
  dto/                               # at implement time
```

### RAG pipeline (Nest-owned)

1. **Ingest** — Authorized job or admin/ops path chunks approved corpus →
   embed → upsert into pgvector-backed table.
2. **Query** — Embed user question → similarity search with filters → attach
   top-k chunks to the model context.
3. **Answer** — Model may also request tools; Nest merges tool results + chunks;
   persist final assistant message.

### Tool catalog principles

- Prefer few high-value read tools in wave 1 (overview, websites, tickets).
- Session identity is the only auth source.
- Tool schemas are Nest-defined; model arguments are validated.
- Wave 2 tools map 1:1 onto existing domain mutations (e.g. tickets create).

## Evidence ledger

| Claim | Level | Source | Notes |
|---|---|---|---|
| Nest is control plane; client never talks to agents | Confirmed | [`../architecture/overview.md`](../architecture/overview.md) | Trust boundary |
| Client may use Nest JWT fetch | Confirmed | ADR 0011 | Chat UI transport |
| Domain modules + multi-audience controllers | Confirmed | ADR 0005 | `assistant` fits pattern |
| PostgreSQL is primary store | Confirmed | ADR 0002 | pgvector extends same DB |
| Assistant deferred beyond Phase 1 | Confirmed | PRD + this plan | Not shipping now |
| Hybrid tools + pgvector RAG in Nest module | Inferred | ADR 0013 Proposed + user direction | Binding when ADR Accepted |
| Exact LLM/embedding providers | Unknown | PRD §10 | Choose before production |
| Exact routes/DTOs | Unknown | Not invented | Contracts at implement |

## Acceptance and validation

- Matches PRD wave 1/2 acceptance lists when implemented.
- Tests/checks: Not Tested — no runtime yet. Plan: tenant isolation tests for
  tools and vector filters; contract tests when routes exist.

## Open decisions

- LLM provider and residency — Why: compliance and cost — Owner: product/security
- Embedding model / dimensions — Why: migration cost — Owner: platform
- Initial corpus — Why: privacy vs usefulness — Owner: product
- Streaming transport — Why: ops overlap with `/realtime` — Owner: backend
- Retention — Why: storage/privacy — Owner: product

## Implementation slices (later coding)

1. Enable PostgreSQL `vector` extension; Prisma models + raw SQL search helper.
2. Nest `assistant` module: threads/messages CRUD + customer controller.
3. LLM gateway adapter + read-only tools wired to exported domain services.
4. RAG ingest/retrieve path; tenant filters; customer chat UI in `client/`.
5. Hardening: rate limits, metrics, retention.
6. Wave 2: confirm UX + write tools (start with create ticket).

## Traceability

- Product/domain: [`../product/customer-assistant-prd.md`](../product/customer-assistant-prd.md),
  [`../product/notes/customer-assistant.md`](../product/notes/customer-assistant.md)
- Decisions: [`../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md`](../architecture/decisions/0013-customer-assistant-nest-pgvector-rag.md)
- Implementation: TBD (`backend/src/modules/assistant/`, `client/` chat UI)
- Tests/enforcement: TBD
- Operations: TBD (provider keys, embedding jobs, pgvector ops)
- Modules map deferred pointer: [`modules-and-routes.md`](./modules-and-routes.md)
