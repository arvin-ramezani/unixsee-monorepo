# Unixsee client

Bilingual Next.js surface for Unixsee’s **public website** and **customer
dashboard**. Persian is the primary RTL experience; English is the secondary
LTR experience.

This folder is the monorepo `client/` deployable. Staff UI belongs in
`admin-panel/`, not here.

## Requirements

- Node.js compatible with Next.js 16
- npm
- Environment values through an untracked local `.env` (see `.env.example`)

Never place real credentials in documentation, examples, fixtures, or committed
environment files.

## Local development

```bash
cd client
npm install
npm run dev
```

Usually available at `http://localhost:3000`.

## Scripts

```bash
npm run dev          # Next.js development server
npm run build        # Next.js production build
npm run build:static # Same as build (kept for existing scripts)
npm run start        # production Next.js server
npm run lint
npm run typecheck
npm run docs:check
```

Use `build:static` for frontend-only validation that must not touch a database.

## Application surfaces

- `src/app/[locale]/(website)` — public marketing and service pages
- `src/app/[locale]/(dashboard)` — customer dashboard
- `src/app/api` — Next.js route handlers (keep thin; NestJS owns business APIs)

## Documentation

- App-scoped docs: [`docs/README.md`](docs/README.md)
- Agent instructions: [`AGENTS.md`](AGENTS.md)
- Monorepo product/architecture: [`../docs/README.md`](../docs/README.md)
