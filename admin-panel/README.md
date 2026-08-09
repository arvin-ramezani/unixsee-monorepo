# Unixsee admin panel

Staff Next.js UI for Unixsee operations (Persian / RTL first). This folder is
the monorepo `admin-panel/` deployable.

Customer/public UI lives in `client/`. NestJS owns APIs and agent control in
`backend/`.

## Requirements

- Node.js compatible with Next.js 16
- npm

## Local development

```bash
cd admin-panel
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Documentation

- App-scoped docs: [`docs/README.md`](docs/README.md)
- Agent instructions: [`AGENTS.md`](AGENTS.md)
- Monorepo product / architecture: [`../docs/README.md`](../docs/README.md)
- Admin UX flows: [`../docs/product/README.md`](../docs/product/README.md)

## Phase note

Current phase is UI-first with fixture data. Do not add Nest/DB/agent
integration until a superseding ADR allows it.
