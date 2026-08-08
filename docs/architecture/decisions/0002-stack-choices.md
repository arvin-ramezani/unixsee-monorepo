# 0002. Stack choices

> **Status:** Accepted
>
> **Date:** 2026-08-08

## Context

Phase 1 needs two Next.js UIs, a NestJS control plane, PostgreSQL persistence,
and a VPS edge agent. Frontend engineering notes already assume Next.js 16.3,
React 19, Tailwind CSS v4, and Zustand. Product docs assign NestJS and agent
responsibilities.

## Decision

Adopt this stack for Phase 1 implementation:

| Layer | Choice |
|---|---|
| Admin UI | Next.js 16.3, React 19, App Router (`admin-panel/`) |
| Customer / public UI | Next.js 16.3, React 19, App Router (`client/`) |
| Styling | Tailwind CSS v4, shadcn primitives, Persian RTL-first |
| Client state | Zustand with per-request store pattern; React state for local UI |
| API / control plane | NestJS (`backend/`) |
| Data store | PostgreSQL |
| Edge | VPS agent (`agent/`) communicating outbound HTTPS to NestJS |
| API style | REST, plus selective realtime where product requires it |

Do not introduce Tailwind v3 config patterns, legacy Next.js middleware for new
functionality, or alternative global client-state libraries without a new ADR.

## Consequences

- Frontend conventions live under [`../../frontend/`](../../frontend/).
- Backend and agent ownership docs stay thin until scaffolding starts.
- Version-sensitive APIs must be verified against current framework docs before
  use; do not guess.
- Payment providers, auth providers, and exact DTO/event contracts remain out of
  this ADR and require separate specifications.
