# Repository Structure

> **Status:** Current
>
> **Owner:** Frontend team
>
> **Last verified:** 2026-08-04

Use existing boundaries before creating a new architectural layer. This repository is a single Next.js application, not a monorepo.

## Application Routes

- `src/app/[locale]/(website)`: public website routes and route-specific components
- `src/app/[locale]/(auth)`: public authentication shell (sign-in, sign-up, OTP, recovery)
- `src/app/[locale]/(dashboard)`: customer-dashboard routes and route-specific composition
- `src/app/api`: Next.js route handlers
- Planned `src/app/[locale]/(admin)/admin`: administrator routes

Place route-specific sections and helpers next to their owning route. Do not move reusable components into a route directory merely because one route first used them.

## Shared Source Areas

- `src/components/ui`: low-level shadcn/Radix-style primitives
- `src/components/common`: reusable brand and presentation components
- `src/components/common/radial-reveal`: branded `RadialRevealButton` /
  `RadialRevealLink` for `default` / `outline` / `secondary` /
  `destructive` CTAs (not ghost, link, plain, or text links)
- `src/components/layout`: public application layout components
- `src/components/dashboard`: reusable customer-dashboard components and shell UI
- `src/components/<feature>`: feature-oriented reusable components such as tickets, websites, plans, profile, and auth
- `src/hooks`: reusable hooks
- `src/stores`: Zustand UI stores
- `src/providers`: React providers and provider composition
- `src/lib`: utilities, schemas, data adapters, constants, and non-React helpers
- `src/messages`: localized message catalogs
- `src/types`: shared TypeScript declarations and contracts

## Placement Rules

- Keep page composition and single-route UI colocated with the route.
- Put a component in shared scope only after it has multiple real consumers or represents a stable cross-page primitive.
- Keep business data and content mapping out of `src/components/ui`.
- Prefer feature directories over generic `helpers`, `misc`, or `shared` directories.
- Do not add new barrel files unless the local directory already uses a maintained public entrypoint.
- Name files in lowercase kebab-case. Do not commit `copy`, `prev`, `disabled`, or backup variants; use Git history.
- Keep generated output and local archives outside searchable source directories.

## Data and API Code

- New dashboard and admin integration code targets the NestJS boundary.
- Keep server-only clients separate from browser-safe helpers.
- Validate external payloads and keep response types close to the integration boundary.
- Do not add new modules to the legacy WordPress client, contract, or fixture areas.
- Consolidating or deleting legacy integrations is a separate migration task with reference and behavior checks.

## When to Add Local Instructions

Do not create nested `AGENTS.md`, `.claude/rules`, or repository skills for ordinary feature directories. Add scoped instructions only when a subtree has genuinely different commands, safety constraints, or ownership rules that cannot be expressed clearly in the root contract.
