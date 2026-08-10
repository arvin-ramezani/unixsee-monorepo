# AGENTS.md

## Purpose

Unixsee Admin Panel built with Next.js App Router. Current phase focuses on reusable UI components and pages with dummy data.

The repository, specifications, architecture documents, and existing implementation are the source of truth. Do not invent requirements or architecture.

## Stack

- Next.js 16.3 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI)
- Zustand
- Zod
- React Hook Form
- npm
- Persian / RTL

Source code is under `src/`.

## Current Scope

Build UI with static data only. Do not introduce API calls, authentication, authorization, database access, or backend integration unless explicitly requested.

## Project Rules

The following documents are part of the repository's development rules. Read the relevant documents before implementation:

- [Project Architecture](docs/architecture/project.md)
- [Next.js](docs/frontend/nextjs.md)
- [Components](docs/development/components.md)
- [Data](docs/development/data.md)
- [Styling](docs/frontend/styling.md)
- [State](docs/frontend/state.md)
- [Workflow](docs/development/workflow.md)
- [Validation](docs/quality/validation.md)

## Before Coding

1. Read relevant instructions and documentation.
2. Inspect existing implementation and dependencies.
3. Reuse existing components and patterns.
4. Make the smallest appropriate change.

## Core Rules

- Prefer reuse over duplication.
- Do not over-engineer.
- Keep components focused and composable.
- Follow Single Responsibility Principle.
- Do not make unrelated changes.
- Do not use outdated framework patterns.
- Do not add unnecessary dependencies.

## Completion

A task is complete when requirements are implemented, existing patterns are preserved, relevant validation passes, and the final diff contains no unrelated changes.

## Final Report

Report:

- Changes made
- Important decisions
- Validation performed
- Manual actions required
- Remaining limitations

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
