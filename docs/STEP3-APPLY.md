# Step 3 — Separate discovery from stack

Prerequisite: Step 2 is already applied and the repository has completed the
`machineId` -> `agentInstanceId` rename in the agent auth/enrollment path.

Copy the files in this archive over the same repository-relative paths.

This step intentionally does not delete legacy nullable Prisma columns such as
`document_root`, `direct_admin_user`, `control_panel_url`, etc. The new ingest
contract cannot send them and `AgentService.upsertDiscovery()` no longer updates
them. This avoids a destructive migration while ownership is being moved.

After copying:

Backend:

```bash
cd backend
pnpm prisma:generate:dev
pnpm prisma:migrate:dev
pnpm build
pnpm test
pnpm test:e2e
```

Agent:

```bash
cd agent
pnpm typecheck
pnpm test
pnpm build
```

Expected Step 3 wire shape:

```json
{
  "schemaVersion": "phase1",
  "agentInstanceId": "...",
  "sentAt": "...",
  "discoveries": [
    {
      "domain": "example.com",
      "aliases": ["www.example.com"],
      "virtualHostName": "example-vhost",
      "source": "openlitespeed",
      "discoveredAt": "..."
    }
  ],
  "stackSnapshots": [
    {
      "domain": "example.com",
      "wordpressVersion": "6.8.2",
      "phpVersion": "8.3.23",
      "imagickVersion": "3.8.0",
      "checkedAt": "...",
      "fieldStatus": {
        "wordpressVersion": { "state": "ok" },
        "phpVersion": { "state": "ok" },
        "imagickVersion": { "state": "ok" }
      }
    }
  ]
}
```

The current legacy `site-stack.ts` is still used internally in this step, but
its discovery/manual metadata is stripped by `agent/src/contracts/phase1-ingest.ts`.
The later runtime-probe step replaces `site-stack.ts` entirely.
