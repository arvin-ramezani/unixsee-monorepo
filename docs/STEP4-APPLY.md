# Step 4 — Manual URL ownership

This step moves canonical manual URL ownership out of `WebsiteDiscovery`:

- `Server.controlPanelUrl` — DirectAdmin/control-panel URL.
- `Website.wordpressAdminUrl` — WordPress admin URL.

The Phase 1 agent does not own or write either value.

## Apply

Extract this archive over the Unixsee monorepo root and replace the included files.
Do not copy generated Prisma client files manually; regenerate them after applying the schema migration.

## PowerShell validation

From the monorepo root:

```powershell
Set-Location .\backend
pnpm prisma:generate:dev
pnpm prisma:migrate:dev
pnpm build
pnpm test
pnpm test:e2e
```

Check the new canonical fields:

```powershell
Get-ChildItem .\src -Recurse -File |
    Select-String -Pattern 'controlPanelUrl|wordpressAdminUrl' |
    Format-Table Path, LineNumber, Line -AutoSize
```

Expected ownership:

- `controlPanelUrl` writes only in the servers/admin metadata path.
- `wordpressAdminUrl` writes only in the websites/admin metadata path.
- Agent DTO/service references should only be negative tests proving those fields are rejected/not written.

## New/changed admin API

```text
POST  /api/v1/admin/servers
PATCH /api/v1/admin/servers/:id
  controlPanelUrl?: string | null

POST  /api/v1/admin/websites
GET   /api/v1/admin/websites/:id
PATCH /api/v1/admin/websites/:id
  wordpressAdminUrl?: string | null
```

`PATCH` accepts `null` to clear the manually managed URL.

## Migration safety

The migration keeps the legacy `WebsiteDiscovery.controlPanelUrl` and
`WebsiteDiscovery.wordpressAdminUrl` columns. Existing values are copied to the
new canonical fields only when the legacy values are unambiguous. Conflicting
values remain unset for manual review.
