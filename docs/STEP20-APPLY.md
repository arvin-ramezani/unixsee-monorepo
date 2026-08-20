# Step 20 — REFRESH_SITE_STACK command

Apply this package over the Step 19 monorepo state.

This step adds:

- dedicated `AgentCommand` persistence and lease lifecycle;
- admin queue/read endpoints;
- heartbeat command leasing;
- the only Phase 1 command: `REFRESH_SITE_STACK`;
- exact local OLS-primary-domain validation before execution;
- persistent command-result outbox under agent-owned state;
- signed/idempotent command-result submission;
- atomic stack snapshot + command completion storage.

No admin-panel button is included yet.

After all architecture steps are complete, regenerate Prisma and perform the
planned build/type/test cleanup.
