# Phase 1 agent setup (token + run)

> **Status:** Active  
> **Audience:** Operator installing the Phase 1 VPS agent on Ubuntu  
> **Last verified:** 2026-08-12  
> **Related:** [`prd.md`](./prd.md), [`phase1-api-contract.md`](./phase1-api-contract.md),
> [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md)

This is the **single setup guide** for applying an admin-issued enrollment token
and running the agent on a VPS.

**Trust rule:** the admin panel never talks to the VPS. Staff issue a one-time
token in admin; you apply that token on the server and start the agent. The
agent enrolls outbound to NestJS over HTTPS.

## Recommended: one-line install

1. In the Unixsee admin panel, create the **server** record for this VPS.
2. Issue an enrollment token (**صدور توکن اتصال**) and copy the install command
   (or the token) from the one-time reveal sheet.
3. On the VPS (Ubuntu, root/sudo), run:

```bash
curl -fsSL https://panel.unixsee.com/agents/install.sh | sudo bash -s -- --token YOUR_ENROLLMENT_TOKEN
```

The script installs Node.js 20+ if needed, downloads the agent bundle from
`https://panel.unixsee.com/agents/unixsee-agent.tar.gz`, writes a mode-600
`.env`, installs the systemd unit, and starts `unixsee-agent`.

Optional flags:

| Flag | Default |
|---|---|
| `--api-base-url` | `https://api.unixsee.com` |
| `--bundle-url` | `https://panel.unixsee.com/agents/unixsee-agent.tar.gz` |

Then confirm the server shows **connected** in admin after the first heartbeat.

**Publish note (Unixsee deployers):** panel deploy must publish
`unixsee-agent.tar.gz` under the live app’s `public/agents/` (file is gitignored).
Canonical steps: [`../../admin-panel/docs/runbooks/deployment.md`](../../admin-panel/docs/runbooks/deployment.md)
(`bash agent/scripts/pack-for-panel.sh`, upload, restart Next, `curl -I` both
`/agents/install.sh` and `/agents/unixsee-agent.tar.gz`).

---

## Manual setup (developers)

Use this path only when debugging without the published bundle.

### Before you start

1. Admin server record + one-time enrollment token (same as above).
2. Ubuntu shell access on the VPS.
3. NestJS API base URL (default `https://api.unixsee.com`).
4. For clone-based installs: GitHub access to the agent sources.

### 1. Install Git and Node.js

```bash
sudo apt update
sudo apt install -y git curl ca-certificates

# Node.js 20+ (needed for --env-file)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # expect v20.6+
```

### 2. Get the agent sources

Prefer the packed bundle:

```bash
curl -fsSL https://panel.unixsee.com/agents/unixsee-agent.tar.gz -o unixsee-agent.tar.gz
sudo mkdir -p /opt/unixsee-agent
sudo tar -xzf unixsee-agent.tar.gz -C /opt/unixsee-agent --strip-components=1
```

Or clone from git when developing (do **not** commit PAT / tokens).

### 3. Apply the enrollment token (`.env`)

```bash
sudo install -d -o unixsee-agent -g unixsee-agent /opt/unixsee-agent
sudo -u unixsee-agent tee /opt/unixsee-agent/.env >/dev/null <<EOF
NODE_ENV=production
API_BASE_URL=https://api.unixsee.com
ENROLLMENT_TOKEN=YOUR_ENROLLMENT_TOKEN
ACCESS_LOG_DIR=/var/log/httpd/domains
OPENLITESPEED_SERVER_ROOT=/usr/local/lsws
EOF
sudo chmod 600 /opt/unixsee-agent/.env
```

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | Yes | Must be `production` for real enroll/heartbeat/ingest |
| `API_BASE_URL` | Yes | NestJS origin, no trailing slash required |
| `ENROLLMENT_TOKEN` | Yes (first start) | One-time token from admin; used only to enroll |
| `AGENT_SECRET` | No at first start | Written automatically after successful enroll |
| `ACCESS_LOG_DIR` | Recommended | Default `/var/log/httpd/domains` |
| `OPENLITESPEED_SERVER_ROOT` | Recommended | Default `/usr/local/lsws` |
| `DIRECTADMIN_BASE_URL` | Optional | Override control-panel link if discovery is wrong |

### 4. Run with systemd

```bash
sudo useradd --system --home /opt/unixsee-agent --shell /usr/sbin/nologin unixsee-agent || true
sudo chown -R unixsee-agent:unixsee-agent /opt/unixsee-agent
sudo cp /opt/unixsee-agent/systemd/unixsee-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now unixsee-agent
sudo systemctl status unixsee-agent
```

Foreground check (dev): `cd /opt/unixsee-agent && sudo -u unixsee-agent node --env-file=.env dist/index.js`

### 5. After first enroll

1. Confirm admin shows the agent as connected.
2. `ENROLLMENT_TOKEN` can be removed from `.env` after `AGENT_SECRET` is present.
3. Restart if needed: `sudo systemctl restart unixsee-agent`.

The agent exchanges the enrollment token once for a long-lived HMAC secret
(`POST /api/internal/agent/v1/enroll`). Later traffic uses that secret only.

## Revoke / re-enroll

If admin revokes the agent:

1. Issue a **new** enrollment token in admin (one-time reveal again).
2. Re-run the one-line installer with the new token, **or** clear `AGENT_SECRET`,
   set `ENROLLMENT_TOKEN`, and `sudo systemctl restart unixsee-agent`.

## Permissions (non-root)

Do **not** run the agent as root. It needs **read-only** access to discovery
paths (DirectAdmin user data, OpenLiteSpeed conf, access logs), not root.

Easiest path: the one-line installer creates system user `unixsee-agent`, installs
under `/opt/unixsee-agent`, and applies best-effort ACLs (`setfacl`) plus
`diradmin` group membership when present.

If discovery or traffic looks empty after install, apply the ACL block in
[`../../agent/README.md`](../../agent/README.md) (Non-root ACL) and restart
`unixsee-agent`.

## Related

- Package README: [`../../agent/README.md`](../../agent/README.md)
- Installer source: [`../../agent/install.sh`](../../agent/install.sh)
- Pack for panel: [`../../agent/scripts/pack-for-panel.sh`](../../agent/scripts/pack-for-panel.sh)
- API contract: [`phase1-api-contract.md`](./phase1-api-contract.md)
- Admin UX (token reveal): [`../product/ux-flows/admin-servers-websites-agents.md`](../product/ux-flows/admin-servers-websites-agents.md)
