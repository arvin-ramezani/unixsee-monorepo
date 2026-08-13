# Admin panel deployment runbook

> **Status:** Current  
> **Owner:** Engineering and operations  
> **Last verified:** 2026-08-12  
> **Audience:** Operators deploying `admin-panel/` (e.g. `panel.unixsee.com`)

Staff Next.js UI. NestJS owns auth and data (ADR 0012). This app also **hosts**
Phase 1 agent install assets under `public/agents/` so VPS operators can run the
one-line installer from an admin-issued enrollment token.

Agent install behavior for operators: [`../../../docs/agent/setup.md`](../../../docs/agent/setup.md).

## Principles

- Secrets come from the host environment (`.env.production` / process env), never Git.
- `unixsee-agent.tar.gz` is **not** in Git (see `.gitignore`). Every deploy that
  should support agent install must publish that file onto the live host.
- After replacing agent assets, restart the Next process so a cached HTML 404 is
  not served for `/agents/unixsee-agent.tar.gz`.

## Required environment

At minimum (production hosts):

```env
UNIXSEE_CORE_API_BASE_URL=https://<api-host>/api/v1
NEXT_PUBLIC_UNIXSEE_CORE_API_BASE_URL=https://<api-host>/api/v1
```

Optional cookie name overrides must stay distinct from `client/` (defaults are
fine). See [`../../.env.example`](../../.env.example).

## Deploy checklist

1. **Ship app code** to the panel host (sync from monorepo `admin-panel/` or the
   dedicated admin repo `dev` branch — same tree).
2. **Install and build** on the host (or CI artifact) with the production env
   available to Next:
   ```bash
   cd /var/www/panel.unixsee.com   # host path may differ
   npm ci
   npm run build
   ```
3. **Publish agent install assets** (required for enroll install):
   - On a machine with the **monorepo** (has `agent/`):
     ```bash
     bash agent/scripts/pack-for-panel.sh
     ```
   - Copy into the live app’s public folder (owner = app user, e.g. `arvin`):
     ```text
     <APP_ROOT>/public/agents/install.sh
     <APP_ROOT>/public/agents/unixsee-agent.tar.gz
     ```
   - `install.sh` is also committed under `public/agents/`; always refresh the
     tarball when the agent build changes.
4. **Restart** the panel Node/PM2 process (and clear `.next/cache` if a prior
   404 was cached for the tarball URL).
5. **Verify** (expect HTTP 200; use OLS Basic Auth `-u` only if that gate is on):
   ```bash
   curl -I https://panel.unixsee.com/agents/install.sh
   curl -I https://panel.unixsee.com/agents/unixsee-agent.tar.gz
   ```
6. Smoke staff login against the configured Nest API URL.

## Agent assets detail

| URL | Source | In Git? |
|---|---|---|
| `/agents/install.sh` | `public/agents/install.sh` (from `agent/install.sh` via pack) | Yes (committed copy) |
| `/agents/unixsee-agent.tar.gz` | Built by `agent/scripts/pack-for-panel.sh` | **No** — generate and upload |

Pack script: [`../../../agent/scripts/pack-for-panel.sh`](../../../agent/scripts/pack-for-panel.sh).  
On-disk notes: [`../../public/agents/README.md`](../../public/agents/README.md).

Default Nest install command points at:

```text
https://panel.unixsee.com/agents/install.sh
```

Contract: [`../../../docs/backend/contracts/servers-admin.md`](../../../docs/backend/contracts/servers-admin.md).

## Optional: OpenLiteSpeed static `/agents`

Not required when Next serves `public/agents/` correctly. For large downloads,
operators may map OLS URI `/agents/` as a **static context** to
`<APP_ROOT>/public/agents/` so tarball traffic bypasses Node. Keep the same
public URLs.

## Rollback

1. Restore the previous app artifact/commit on the panel host.
2. Restore the previous `public/agents/unixsee-agent.tar.gz` if agent install
   must match that release.
3. Restart the panel process and re-run the `curl -I` checks above.

## Related

- Agent operator setup: [`../../../docs/agent/setup.md`](../../../docs/agent/setup.md)
- Admin Nest session: [`../../../docs/frontend/admin-data-fetching.md`](../../../docs/frontend/admin-data-fetching.md)
- Servers / enrollment UX: [`../../../docs/product/ux-flows/admin-servers-websites-agents.md`](../../../docs/product/ux-flows/admin-servers-websites-agents.md)
