# Step 18 — Per-domain stack scheduler

This step replaces the global 6-hour “probe every site” tick with persisted per-domain scheduling.

## Behavior

- Every active domain owns:
  - `lastStackCheckedAt`
  - `lastAttemptAt`
  - `nextDueAt`
  - bounded `retryAttempt`
- State is persisted in `/opt/unixsee-agent/state/stack-schedule.json`.
- Startup forces all currently discovered domains due immediately.
- A newly discovered domain is due immediately and is probed immediately by the engine.
- A successful refresh sets `nextDueAt = checkedAt + 6h`.
- A successful future manual refresh uses the same rule.
- A failed manual refresh does not move an existing automatic due time.
- Scheduled/startup/new-domain failures retry after 1 minute and then 5 minutes; after bounded retries are exhausted the domain returns to the normal 6-hour cycle.
- Default concurrency is `3` via `STACK_PROBE_CONCURRENCY=3`.
- Bulk scheduled due runs use up to 30 seconds of jitter; startup/new-domain/manual runs do not.
- Confirmed removed domains are removed from stack schedule state during discovery reconciliation.
- A 60-second lightweight scheduler checks which individual domains are due; it does not itself mean sites are probed every minute.

## PowerShell apply

From the monorepo root, use either the ZIP replacement files or the patch, not both.

```powershell
Set-Location D:\_workplace\unixsee-monorepo
Expand-Archive .\step18-per-domain-stack-scheduler.zip -DestinationPath . -Force
```

Or:

```powershell
Set-Location D:\_workplace\unixsee-monorepo
git apply --check .\step18-per-domain-stack-scheduler.patch
git apply .\step18-per-domain-stack-scheduler.patch
```
