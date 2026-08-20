# Step 19 — Typed, coalescing offline ingest queue

This step replaces the agent engine's generic FIFO `unknown[]` offline queue with
an in-memory typed ingest outbox.

Coalescing policy:

- discovery: keep only the latest complete unsent inventory snapshot;
- stack: keep the latest unsent stack snapshot per domain;
- active 3m: keep the latest unsent active sample per domain;
- visitors 24h: keep the latest unsent 24h sample per domain.

Queue priority during recovery:

1. discovery
2. stack
3. visitors 24h
4. active 3m

A newer value arriving while an older value of the same type is in flight is
protected by revision-aware ACK semantics. ACKing the older request cannot
remove the newer coalesced value.

A discovery snapshot also prunes pending domain-scoped entries for domains that
are no longer present in the effective OLS inventory.

`REFRESH_SITE_STACK` command-result persistence is intentionally not added in
this step because the command contract/lifecycle does not exist yet. Step 20
will add its separate critical/idempotent command-result delivery path rather
than sending command results through `/ingest`.
