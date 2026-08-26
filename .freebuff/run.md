# Preview Run Doc

## How to reproduce artifacts
- `.env.local` already exists in `client/` (copied during initial setup or created manually)
- No build step needed — Next.js dev server compiles on demand

## How to run the server
From the monorepo root:
```bash
cd client && npm run dev -- -p 3000
```

Or from root using the concurrently script:
```bash
npm run dev
```
This starts backend (4000), client (3000), and admin-panel (3001).

## Current preview
- **URL:** http://localhost:3000
- **PID:** 11300 (node process, already running)
- **Port:** 3000 (client app)
