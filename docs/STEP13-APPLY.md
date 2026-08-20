# Step 13 — fs.watch as optimization + periodic reconciliation

This step keeps `fs.watch` for low-latency access-log changes but makes traffic
correctness independent from watcher delivery.

## Changes

- Adds `TRAFFIC_RECONCILE_INTERVAL_MS` (default `15000`).
- Starts one agent-wide periodic traffic reconciliation loop whenever at least
  one domain tail is active.
- Every reconciliation tick stats/reads every active domain independently.
- Serializes watch-triggered and polling reads per domain so cursor writes do
  not race.
- Coalesces a watch event received during an active read into one extra read.
- Detects inode replacement/truncation through polling and reattaches the
  watcher to the current log path.
- Closes stale watchers while a log is missing/unreadable and retries through
  polling until it returns.
- Prevents an in-flight read from reopening a watcher after discovery removes
  the domain.
- `EngineHandle.stop()` now also stops traffic watchers/reconciliation.

## PowerShell application

Use either the ZIP or patch, not both.

```powershell
Set-Location D:\_workplace\unixsee-monorepo
Expand-Archive .\step13-watch-plus-reconciliation.zip -DestinationPath . -Force
```

or:

```powershell
Set-Location D:\_workplace\unixsee-monorepo
git apply --check .\step13-watch-plus-reconciliation.patch
git apply .\step13-watch-plus-reconciliation.patch
```

Project-wide build/type cleanup remains deferred until the planned architecture
steps are complete.
