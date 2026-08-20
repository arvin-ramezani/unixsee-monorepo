# Step 12 — Bounded startup tailing and persistent cursors

This step changes only the Phase 1 agent traffic tailer.

## Behavior

- Initial/restart access-log recovery reads at most `TRAFFIC_INITIAL_READ_MAX_BYTES` from the current log.
- When a persisted cursor is still valid, all unread bytes after that cursor are included when they fit inside the startup budget; remaining budget is used for bounded backfill.
- If offline growth exceeds the startup budget, the newest bounded tail is read and coverage becomes `unknown/log_cursor_gap` until the active window is trustworthy again.
- The first partial line of a bounded tail is discarded safely.
- Durable offsets advance only through complete newline-terminated records.
- Per-domain cursor metadata persists under `/opt/unixsee-agent/state/traffic-cursors.json`.
- Cursor metadata contains only domain, inode, offset, last-read time, and coverage state.
- Same inode + non-truncated file resumes safely after restart.
- Inode replacement or truncation produces `unknown/log_rotated_gap` until the rolling active window is trustworthy again.
- A fresh/bounded startup that cannot prove full 180-second coverage produces `unknown/warming_up`.
- Raw IPs, raw log lines, visitor hashes, and log paths are not persisted in the cursor state.

## Configuration

Default:

```env
TRAFFIC_INITIAL_READ_MAX_BYTES=1048576
```

This bounds startup/recovery reads to 1 MiB per domain. If the bounded read contains timestamps spanning the full active window, the agent may report `ok` immediately; otherwise it warms up conservatively.

## Apply

From the monorepo root in PowerShell, extract the Step 12 ZIP over the repository, or apply the patch. Do not use both.

Build/type/test cleanup can remain deferred until the planned cleanup pass.
