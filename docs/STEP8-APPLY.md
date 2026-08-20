# Step 8 — Persistent installation identity

This step removes host machine identity from the Phase 1 agent and replaces it
with an agent-owned UUID v4 stored at:

`/opt/unixsee-agent/state/agent-instance-id`

## Behavior

- First clean install/start: create UUID v4 and persist it mode 0600.
- Normal restart: load the same UUID.
- Normal bundle upgrade: preserve the entire `/opt/unixsee-agent/state/` tree.
- Corrupt/invalid persisted ID: fail closed; do not silently replace it.
- Existing legacy install with AGENT_SECRET but no persisted UUID: create the
  new UUID, then require one-time re-enrollment with a fresh enrollment token
  rather than reusing credentials bound to the old identity.
- Enrollment payload uses `agentInstanceId`.
- Runtime code no longer reads OS machine-id files.

## PowerShell application

From the monorepo root, extract the ZIP with `Expand-Archive -Force`, or apply
the patch with `git apply`. Use one method only.

Project-wide type/build/test cleanup is intentionally deferred until the
architectural migration steps are complete, per the current implementation
workflow.
