# Step 11 — Replace the traffic internal data model

Apply these files over the Unixsee monorepo root.

## Changes

- replaces per-request `IpHit[]` retention with `Map<visitorKey,lastSeenAt>`;
- hashes each parsed visitor IP immediately with HMAC-SHA256;
- creates a random 256-bit `visitor-hash-key` once under agent-owned state;
- persists no raw IPs;
- scopes visitor keys per domain and per VPS installation;
- preserves the current `uniqueIpCount` wire field temporarily for backend compatibility;
- leaves startup cursor bounding and 24h HLL for later traffic steps.

The existing Step 8 installer already preserves `/opt/unixsee-agent/state/**`, so the visitor hash key survives normal upgrades.

Do not apply both the ZIP and the patch.
