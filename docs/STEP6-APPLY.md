# Step 6 — two-scan domain removal

Replace/add the included `agent/src` files over the current Step 5 agent.

This step adds persisted effective OLS inventory state at:

`/opt/unixsee-agent/state/discovery-inventory.json`

Optional local/test override:

`UNIXSEE_AGENT_STATE_DIR`

Behavior after each **successful** OLS scan:

- present/new vhost: effective immediately, missing counter = 0
- first successful absent scan: retain site, missing counter = 1
- second consecutive successful absent scan: remove site
- reappearance after first miss: reset missing counter to 0
- failed OLS scan: no state transition, so it cannot count toward removal

The persisted file contains only derived inventory metadata; no raw traffic, IPs,
document roots, DirectAdmin data, or website filesystem data.

Per the current workflow, defer build/type-error cleanup until the architecture
steps are finished.
