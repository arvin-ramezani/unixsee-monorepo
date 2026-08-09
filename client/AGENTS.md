# Unixsee client agent instructions

This folder is the **client** deployable in the Unixsee monorepo: bilingual
Next.js public website and customer dashboard. Persian is the primary RTL
experience; English is the secondary LTR experience.

## Before editing

1. Read monorepo orientation: [`../AGENTS.md`](../AGENTS.md) and
   [`../docs/architecture/overview.md`](../docs/architecture/overview.md).
2. Read the narrowest app docs listed below.
3. Inspect the existing implementation and use the smallest safe change.
4. Clarify conflicts with monorepo architecture before implementing.

## Current stack

- Package manager: npm
- Framework: Next.js App Router with React 19
- Language: strict TypeScript
- Styling: Tailwind CSS v4
- UI: shadcn-style components on Radix primitives
- Motion: Framer Motion
- Forms: React Hook Form and Zod
- UI state: Zustand
- Internationalization: next-intl (Persian RTL / English LTR)
- Application data: NestJS APIs (not Prisma/DB ownership in this app long-term)

Use the existing stack unless the user explicitly approves a change.

## Architecture boundaries

- This app is presentation-only for managed-service data: NestJS owns auth,
  persistence, orchestration, and agent control.
- Do not talk to VPS agents or infrastructure hosts from the browser.
- Follow UI-only phase boundaries until a superseding ADR allows Nest
  integration: [`../docs/architecture/decisions/0003-ui-only-phase-boundaries.md`](../docs/architecture/decisions/0003-ui-only-phase-boundaries.md).
- WordPress and WooCommerce are customer workloads, not Unixsee CMS/control-plane dependencies.
- Do not implement Nest modules, edge agents, or staff admin shell here.
  Staff UI belongs in `admin-panel/`.

## Required context

| Task | Read first |
| --- | --- |
| Product behavior | [`../docs/product/phase-1-application-features.md`](../docs/product/phase-1-application-features.md) |
| Monorepo ownership | [`../docs/architecture/monorepo.md`](../docs/architecture/monorepo.md) |
| Shared frontend conventions | [`../docs/frontend/README.md`](../docs/frontend/README.md) |
| File placement in this app | [`docs/engineering/repository-structure.md`](docs/engineering/repository-structure.md) |
| App Router / data / i18n | [`docs/engineering/nextjs.md`](docs/engineering/nextjs.md) |
| UI / RTL / a11y | [`docs/engineering/ui.md`](docs/engineering/ui.md) |
| Review / validation | [`docs/engineering/quality-and-review.md`](docs/engineering/quality-and-review.md) |
| Local ops | [`docs/runbooks/`](docs/runbooks/) |

## Engineering rules

- Default to Server Components. Add `"use client"` only when required.
- Preserve strict TypeScript; avoid `any` and silent error handling.
- Keep user-facing content translatable; preserve RTL and LTR.
- Preserve Radix semantics, keyboard behavior, focus, and ARIA.
- Keep business mapping out of low-level UI primitives.
- Avoid unrelated refactors and premature abstractions.
- Keep code, comments, file names, and technical docs in English.

## Security

- Never hardcode or commit credentials, tokens, or real passwords.
- Keep server-only environment variables out of client bundles.
- Treat external payloads as untrusted.
- Avoid `dangerouslySetInnerHTML` unless explicitly approved and sanitized.

## Validation

Use scripts that exist in this package:

```bash
npm run docs:check
npm run typecheck
npm run lint
npm run build:static
```

Do not invent unavailable root monorepo scripts.
