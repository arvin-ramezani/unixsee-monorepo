# Phase 1 agent 0.2 setup

> **Audience:** operators installing on Ubuntu + DirectAdmin + OpenLiteSpeed
> **Contract:** [`phase1-api-contract.md`](./phase1-api-contract.md)

## Maintenance-window rollout

1. Deploy the backend migration and v0.2 API first. This intentionally rejects
   every 0.1 `machineId` request.
2. Deploy the admin assets and upload a freshly generated 0.2 bundle.
3. Reissue one enrollment token for each VPS.
4. Rerun the installer on each VPS and verify the service and first ingest.

## Publish the bundle

From the monorepo root:

```bash
bash agent/scripts/pack-for-panel.sh
```

Upload the generated (gitignored) `admin-panel/public/agents/unixsee-agent.tar.gz`
and deploy the updated public `install.sh`. Do not commit the archive.

## Install or re-provision

Use the one-time command revealed by the admin panel:

```bash
curl -fsSL https://panel.unixsee.com/agents/install.sh | sudo bash -s -- \
  --token YOUR_ENROLLMENT_TOKEN \
  --api-base-url https://core.unixsee.com
```

The installer:

- installs Node.js 20+, creates the restricted service user, and preserves the
  agent state directory;
- atomically creates `/opt/unixsee-agent/state/agent-instance-id` mode `0600`;
- backs up and idempotently updates the DirectAdmin global OLS template fragment;
- regenerates configs, checks OLS syntax, validates a representative local probe,
  and rolls back the fragment on failure;
- grants the Node service read access only to the selected routing file and
  approved access logs;
- enrolls with `agentInstanceId`, stores the secret mode `0600`, installs the
  hardened systemd unit, and starts it.

## Verify

```bash
sudo systemctl status unixsee-agent
sudo journalctl -u unixsee-agent -n 100 --no-pager
sudo stat -c '%a %U:%G %n' /opt/unixsee-agent/state/agent-instance-id
```

In admin, confirm agent version `0.2.0`, OLS inventory, an immediate stack
snapshot, active traffic after 30 seconds, and the warming 24-hour coverage after
five minutes. Test a manual refresh and confirm it progresses queued → running →
succeeded (or failed without erasing last-good values).

## Re-enrollment

Revocation removes the usable secret. Issue a fresh token and rerun the same
installer. The installation UUID remains stable across normal upgrades; a new
UUID is created only when its state file is intentionally removed.
