# Deployment remotes (monorepo → server repos)

> **Status:** Accepted
>
> **Owner:** Engineering and operations
>
> **Last verified:** 2026-08-13
>
> **Audience:** Humans and AI agents syncing deployable apps to real servers

The **Unixsee monorepo** (`unixsee-monorepo`) is the development source of truth.
Each production-facing app also has a **single-app Git repository** used for
deployment, staging, and testing on real hosts.

When a task says **“update the main repos”**, **“sync to deploy repos”**, or
**“push to the server repos”**, apply changes to the remote below — not only
to the monorepo.

## Mapping

| Monorepo path | Deploy repository | Branch | Role on server |
|---|---|---|---|
| `backend/` | [`unixsee-api`](https://github.com/unixseemaster-pixel/unixsee-api.git) | `develop` | NestJS control plane (e.g. `core.unixsee.com`) |
| `client/` | [`unixsee-web`](https://github.com/unixseemaster-pixel/unixsee-web.git) | `staging` | Customer / public Next.js UI |
| `admin-panel/` | [`unixsee-admin`](https://github.com/unixseemaster-pixel/unixsee-admin.git) | `dev` | Staff Next.js UI (e.g. `panel.unixsee.com`) |

**Confirmed:** mapping and branch names as specified by project owners (2026-08-13).

### Not in this table

| Monorepo path | Deploy remote |
|---|---|
| `agent/` | Published via admin panel `public/agents/` (see [`../agent/setup.md`](../agent/setup.md), [`../../admin-panel/docs/runbooks/deployment.md`](../../admin-panel/docs/runbooks/deployment.md)) |
| `monitoring-agent/` | No separate deploy repo documented yet |
| `docs/` | Stays in the monorepo; not mirrored to app deploy repos unless explicitly requested |

## AI agent rules

When the user asks to **update / sync / push the main (deploy) repos**:

1. **Scope by changed path** — only touch remotes whose monorepo folder changed
   (unless the user names specific apps).
2. **Use the branch in the table** — do not push to `main` on deploy repos unless
   the user explicitly overrides.
3. **Sync content, not the monorepo root** — each deploy repo contains the
   **contents of one folder** (e.g. push `backend/` tree to `unixsee-api`, not
   the whole monorepo).
4. **Monorepo first** — implement and commit in `unixsee-monorepo` when that is
   the active workspace; then mirror to the deploy remote (or follow the user's
   deploy procedure).
5. **Do not invent** extra remotes, branches, or CI jobs not listed here or in
   surface runbooks.

## Operator workflow (typical)

Exact host commands vary by server layout. Common pattern:

```bash
# Example: backend → unixsee-api (develop)
cd /path/to/unixsee-api
git fetch origin
git checkout develop
git pull origin develop
# merge or copy from monorepo backend/ — team-specific
npm install && npm run build
# restart process manager (pm2/systemd) — see backend host runbook
```

Surface-specific checklists:

- **Admin panel:** [`../../admin-panel/docs/runbooks/deployment.md`](../../admin-panel/docs/runbooks/deployment.md)
- **Backend:** host env and PM2 entry — [`../../backend/ecosystem.config.cjs`](../../backend/ecosystem.config.cjs) (package `unixsee-api`)

## Related

- Monorepo ownership: [`../architecture/monorepo.md`](../architecture/monorepo.md)
- Git / PR workflow (monorepo): [`git-and-pr-workflow.md`](./git-and-pr-workflow.md)
