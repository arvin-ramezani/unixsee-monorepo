# Step 14 — exact rolling active visitors

Scope:

- exact rolling 180-second active visitor state,
- dedicated 30-second active visitor ingest tick,
- wire field rename `uniqueIpCount` -> `uniqueVisitorCount`,
- required traffic status (`ok`, `unknown`, `unsupported`),
- backend validation that `windowStartedAt` is exactly 180 seconds before `measuredAt`,
- Prisma client field rename to `uniqueVisitorCount` while retaining the existing physical `unique_ip_count` column for migration safety.

No database migration is required for this step because Prisma still maps the renamed logical field to the existing `unique_ip_count` database column.

Apply either the ZIP or patch, not both.

PowerShell from monorepo root:

```powershell
Expand-Archive .\step14-active-visitors-exact-rolling.zip -DestinationPath . -Force
```

or:

```powershell
git apply --check .\step14-active-visitors-exact-rolling.patch
git apply .\step14-active-visitors-exact-rolling.patch
```

Project-wide build/type/test cleanup remains intentionally deferred until the architecture steps are complete.
