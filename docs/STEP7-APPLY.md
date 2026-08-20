# Step 7 — Positive filesystem allowlist

This step introduces a capability-based filesystem boundary for the Phase 1 agent.

## Runtime capabilities

`agent/src/security/filesystem.ts` is the only normal runtime module that directly accesses:

- agent-owned `.env` / state files,
- allowlisted OpenLiteSpeed routing configuration,
- configured OpenLiteSpeed access logs.

Callers do not receive a generic `readFile(path)` API.

## Production OLS rule

Explicit OLS routing files must remain under:

```text
${OPENLITESPEED_SERVER_ROOT}/conf/
```

Test/development mode may point the same capabilities at fixture files.

## Agent state rule

Production state is fixed under:

```text
/opt/unixsee-agent/state/
```

State APIs accept only simple file names, never arbitrary paths.

## Access-log rule

Traffic code supplies only a discovered domain. The security layer derives:

```text
${ACCESS_LOG_DIR}/{domain}.log
```

and rejects path traversal / unsafe domain values. Symlink escape checks are applied to production filesystem targets where applicable.

## Transitional identity exception

`identity-compat.ts` still directly reads the old machine-id paths as a temporary migration fallback. Step 8 removes this exception and provisions the persistent agent-owned `agent-instance-id`.

## Legacy site-stack

The old site-stack filesystem/PHP-CLI implementation is disabled. It will be replaced by the protected local OLS/PHP runtime probe in its dedicated step.
