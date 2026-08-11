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

## Agent skills

Framework skills live under [`.agents/skills/`](.agents/skills/) (shared with `client/` for Next/React):

| Skill | Use for |
| --- | --- |
| [`nextjs-app-router`](.agents/skills/nextjs-app-router/SKILL.md) | App Router, RSC/client boundaries, Route Handlers, Proxy, Cache Components awareness |
| [`react-19`](.agents/skills/react-19/SKILL.md) | React 19 APIs with React Compiler enabled |
| [`ui-ux-pro-max`](.agents/skills/ui-ux-pro-max/SKILL.md) | UI/UX research against the local design database |
| [`clean-code`](.agents/skills/clean-code/SKILL.md) | Readability and maintainability without drive-by refactors |
| [`ux-flow-designer`](.agents/skills/ux-flow-designer/SKILL.md) | End-to-end UX flow design and review |

Repo docs, NestJS ownership, and installed `node_modules/next/dist/docs/` remain authoritative over skill defaults.

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

## Next.js version-matched documentation

For Next.js-specific implementation, do not rely on model memory.

Before implementing or modifying version-sensitive behavior such as data
fetching, caching, revalidation, Server Components, Server Actions / Server
Functions, Route Handlers, Cache Components, or Suspense / streaming:

1. Inspect the installed Next.js version and cache configuration in this app.
2. Read the relevant guides in `node_modules/next/dist/docs/` (resolved from
   this directory; the package may not be visible from the monorepo root).

The installed Next.js documentation is authoritative over model knowledge.
App conventions: [Next.js](docs/frontend/nextjs.md). Shared monorepo rules:
[`../docs/frontend/nextjs.md`](../docs/frontend/nextjs.md).

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
