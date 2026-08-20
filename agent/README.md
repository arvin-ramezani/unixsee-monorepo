# Unixsee Phase 1 VPS Agent

> **Status:** Implemented (Phase 1 slices)  
> **PRD:** [`../docs/agent/prd.md`](../docs/agent/prd.md)  
> **Contract:** [`../docs/agent/phase1-api-contract.md`](../docs/agent/phase1-api-contract.md)  
> **ADR:** [`../docs/architecture/decisions/0008-phase1-agent-typescript-node.md`](../docs/architecture/decisions/0008-phase1-agent-typescript-node.md)  
> **Not this package:** [`../monitoring-agent/`](../monitoring-agent/)

Outbound-only edge agent for managed DirectAdmin + OpenLiteSpeed WordPress /
WooCommerce hosts. Reports discovery, site stack/links, and 3-minute active
visitors to NestJS.

## Setup the agent on a VPS

**Start here:** [`../docs/agent/setup.md`](../docs/agent/setup.md)

One-line install (Ubuntu, after admin issues a token):

```bash
curl -fsSL https://panel.unixsee.com/agents/install.sh | sudo bash -s -- --token YOUR_ENROLLMENT_TOKEN
```

Publish install assets to the admin panel static host:

```bash
bash agent/scripts/pack-for-panel.sh
```

## Local development

```bash
cd agent
npm install
cp .env.example .env
npm run build
npm test
```

## Runtime env

| Variable | Purpose |
|---|---|
| `API_BASE_URL` | NestJS base URL |
| `ENROLLMENT_TOKEN` | One-time token from admin reveal |
| `AGENT_SECRET` | Persisted after enroll (`0600` `.env`) |
| `ACCESS_LOG_DIR` | Default `/var/log/httpd/domains` |
| `OPENLITESPEED_SERVER_ROOT` | Default `/usr/local/lsws` |
| `DIRECTADMIN_BASE_URL` | Optional override for control-panel URL |

## Access logs

Per-site logs: `/var/log/httpd/domains/{domain}.log`  
Example: `tail -f /var/log/httpd/domains/farcoland.com.log`

## Non-root ACL (Server — Ubuntu)

Do not run as root. Typical pattern:

```bash
sudo useradd --system --home /opt/unixsee-agent --shell /usr/sbin/nologin unixsee-agent
sudo usermod -aG diradmin unixsee-agent
sudo setfacl -m g:unixsee-agent:rx /usr/local/directadmin/data/users
sudo setfacl -R -m g:unixsee-agent:r-x /var/log/httpd/domains
sudo setfacl -m g:unixsee-agent:rx /usr/local/lsws/conf
```

Install unit: [`systemd/unixsee-agent.service`](./systemd/unixsee-agent.service).

## Security

- Outbound HTTPS only (enroll / heartbeat / ingest).
- HMAC-SHA256 over `{timestamp}.{body}`; never log tokens or secrets.
- On admin revoke (or ingest/heartbeat HTTP 401), the agent clears in-memory and
  persisted `AGENT_SECRET`. Set a new `ENROLLMENT_TOKEN` and restart to re-enroll.
- Unreadable access logs report `activeVisitors3m.status.unsupported`, not a
  silent zero count.
