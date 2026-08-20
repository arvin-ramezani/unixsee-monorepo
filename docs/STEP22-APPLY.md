# Step 22 — Lease commands from heartbeat

This step hardens the heartbeat leasing behavior introduced with Step 20.

## Changes

- Heartbeat leases only `REFRESH_SITE_STACK` commands for the authenticated VPS node.
- `QUEUED` commands are claimable.
- `RUNNING` commands are claimable again only after `leaseExpiresAt <= now`.
- Expired commands are marked `EXPIRED` before leasing.
- Atomic `updateMany` claims prevent two concurrent heartbeats from leasing the same command.
- Every successful lease increments `attemptCount`.
- Lease expiry is capped by the command's own `expiresAt`.
- The agent dispatches leased commands without blocking heartbeat completion.
- Durable command-result state still prevents an already-completed probe from running again after lease re-delivery.

No Prisma migration is added by Step 22; the `AgentCommand` model from Step 20 is reused.
