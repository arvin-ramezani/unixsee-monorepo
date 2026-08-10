# Phase 1 agent setup (token + run)

> **Status:** Active  
> **Audience:** Operator installing the Phase 1 VPS agent on Ubuntu  
> **Last verified:** 2026-08-09  
> **Related:** [`prd.md`](./prd.md), [`phase1-api-contract.md`](./phase1-api-contract.md),
> [`../product/notes/servers-agent-data-flow.md`](../product/notes/servers-agent-data-flow.md)

This is the **single setup guide** for applying an admin-issued enrollment token
and running the agent on a VPS.

**Trust rule:** the admin panel never talks to the VPS. Staff issue a one-time
token in admin; you apply that token on the server and start the agent. The
agent enrolls outbound to NestJS over HTTPS.

## Before you start

1. In the Unixsee admin panel, create the **server** record for this VPS.
2. Issue an enrollment token (**صدور توکن اتصال**) and copy it from the one-time
   reveal sheet. You cannot view the plaintext again after dismiss.
3. Have:
   - Ubuntu shell access on the VPS
   - Access to the private GitHub agent repository
   - A GitHub **personal access token (PAT)** with permission to clone that repo
   - NestJS API base URL (example: `https://api.unixsee.com`)

Replace placeholders below:

| Placeholder | Meaning |
|---|---|
| `YOUR_GITHUB_USER` | GitHub username |
| `YOUR_GITHUB_PAT` | GitHub personal access token |
| `OWNER/unixsee-agent` | Agent repo (`owner/name`) |
| `YOUR_ENROLLMENT_TOKEN` | One-time token from admin reveal |
| `https://api.unixsee.com` | NestJS `API_BASE_URL` |

All commands below are **Server — Ubuntu**.

## 1. Install Git and Node.js

```bash
sudo apt update
sudo apt install -y git curl ca-certificates

# Node.js 20+ (needed for --env-file)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # expect v20.6+ 
```

## 2. Connect to GitHub and clone the agent

Use HTTPS + PAT (fine for a private agent-only repo you already have access to).

```bash
# Optional: store credentials for this session
git config --global credential.helper store

# Clone (PAT as password when prompted, or embed once in the URL)
git clone https://YOUR_GITHUB_USER:YOUR_GITHUB_PAT@github.com/OWNER/unixsee-agent.git
cd unixsee-agent
```

Safer interactive form (avoids putting the PAT in shell history):

```bash
git clone https://github.com/OWNER/unixsee-agent.git
cd unixsee-agent
# Username: YOUR_GITHUB_USER
# Password: YOUR_GITHUB_PAT
```

Do **not** commit the PAT, enrollment token, or `.env` to git.

## 3. Install dependencies and build

```bash
npm install
npm run build
```

## 4. Apply the enrollment token (`.env`)

```bash
cp .env.example .env
chmod 600 .env
nano .env   # or: vi .env
```

Set at least:

```env
NODE_ENV=production
API_BASE_URL=https://api.unixsee.com
ENROLLMENT_TOKEN=YOUR_ENROLLMENT_TOKEN

OPENLITESPEED_SERVER_ROOT=/usr/local/lsws
ACCESS_LOG_DIR=/var/log/httpd/domains
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

## 5. Run the agent

### Option A — foreground (quick check)

```bash
npm start
```

On success you should see enrollment complete (or reuse of an existing
`AGENT_SECRET`), then heartbeat/transmit loops. In admin, the server agent
state should move to **connected** after fresh heartbeats.

### Option B — systemd (recommended on VPS)

```bash
sudo useradd --system --home /opt/unixsee-agent --shell /usr/sbin/nologin unixsee-agent || true
sudo mkdir -p /opt/unixsee-agent
sudo rsync -a --delete ./ /opt/unixsee-agent/
sudo chown -R unixsee-agent:unixsee-agent /opt/unixsee-agent
sudo cp /opt/unixsee-agent/systemd/unixsee-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now unixsee-agent
sudo systemctl status unixsee-agent
```

Adjust `WorkingDirectory` / `EnvironmentFile` in the unit if your install path
differs from `/opt/unixsee-agent`.

## 6. After first enroll

1. Confirm admin shows the agent as connected.
2. Edit `.env` and **remove** `ENROLLMENT_TOKEN` (keep `AGENT_SECRET`).
3. Restart if using systemd: `sudo systemctl restart unixsee-agent`.

The agent exchanges the enrollment token once for a long-lived HMAC secret
(`POST /api/internal/agent/v1/enroll`). Later traffic uses that secret only.

## Revoke / re-enroll

If admin revokes the agent:

1. Issue a **new** enrollment token in admin (one-time reveal again).
2. On the VPS, clear the old secret and set the new token:

```bash
# In the agent directory /opt/unixsee-agent
sudo -u unixsee-agent nano .env
# Remove AGENT_SECRET lines
# Set ENROLLMENT_TOKEN=<new token>
sudo systemctl restart unixsee-agent
```

## Permissions (non-root)

Do not run as root long-term. Grant read access for DirectAdmin manifests and
access logs as needed (see package README ACLs). Outbound HTTPS to NestJS only;
no inbound agent ports.

## Related

- Package README: [`../../agent/README.md`](../../agent/README.md)
- API contract: [`phase1-api-contract.md`](./phase1-api-contract.md)
- Admin UX (token reveal): [`../product/ux-flows/admin-servers-websites-agents.md`](../product/ux-flows/admin-servers-websites-agents.md)
