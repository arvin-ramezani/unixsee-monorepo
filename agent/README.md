# Unixsee Edge Monitoring Agent

> A lightweight, zero-dependency Node.js edge monitoring agent engineered for high-performance Ubuntu Linux environments.

The Unixsee Edge Monitoring Agent tracks system resources (CPU, Memory) and web server metrics (LiteSpeed), discovers WordPress / WooCommerce sites on DirectAdmin + OpenLiteSpeed hosts, aggregates them into a local memory buffer, and securely pushes a cryptographically signed payload to the central Unixsee backend.

Engineered for extreme performance, it avoids spawning heavy shell subprocesses (like `top` or `free`) by reading directly from the native Linux `/proc` filesystem.

---

## Architecture Highlights

- **Enrollment-only auth:** Exchanges a one-time `ENROLLMENT_TOKEN` for a long-lived HMAC `AGENT_SECRET`.
- **Outbound push model:** Heartbeat + ingest over HTTPS; no inbound ports.
- **Cryptographic Security:** HMAC-SHA256 request signing (`X-Agent-Signature`, `X-Agent-Timestamp`).
- **Resilient Networking:** In-memory queue with exponential backoff and jitter.
- **Hybrid Discovery:** OpenLiteSpeed active routes first, DirectAdmin enrichment (owners, aliases, subdomains, pointers), optional filesystem fallbacks, exact-path overrides for rare custom apps.
- **Periodic rediscovery:** Inventory refreshes every 10 minutes without restart.

---

## Prerequisites

- **Node.js**: `v20.6.0` or higher (required for native `--env-file` support).
- **OS**: Ubuntu Linux (production) or Windows 11 / WSL2 (local development).

---

## Installation & Development

### 1. Clone & Install

```bash
cd agent
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```env
NODE_ENV=development
API_BASE_URL=http://127.0.0.1:4000
ENROLLMENT_TOKEN=your_one_time_enrollment_token
AGENT_SECRET=
```

Derived endpoints:

- `POST {API_BASE_URL}/api/internal/agent/v1/enroll`
- `POST {API_BASE_URL}/api/internal/agent/v1/ingest`
- `POST {API_BASE_URL}/api/internal/agent/v1/heartbeat`

### 3. Run the Development Server

```bash
npm run dev
```

> In `development` / `test` mode, network payloads (including enrollment) are mocked locally.

---

## Production Deployment

### 1. Compile

```bash
npm run build
```

### 2. Configure production `.env`

```env
NODE_ENV=production
API_BASE_URL=https://api.unixsee.com
ENROLLMENT_TOKEN=one_time_token_from_admin
AGENT_SECRET=
```

On first successful enrollment the agent persists `AGENT_SECRET` into `.env`. After that, you can remove `ENROLLMENT_TOKEN` from the host. If credentials are revoked, issue a new enrollment token and restart with `ENROLLMENT_TOKEN` set (clear the old `AGENT_SECRET`).

### 3. Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## DirectAdmin Permission Layer Configuration

By default, DirectAdmin locks down user account manifests inside `/usr/local/directadmin/data/users/` using strict permissions assigned to `diradmin`.

Do **not** run the agent as root. Grant the restricted execution user read access:

```bash
sudo usermod -aG diradmin arvin
sudo chmod g+rx /usr/local/directadmin/data/users/
sudo setfacl -m u:arvin:rx /usr/local/directadmin/data/users/
sudo setfacl -d -m u:arvin:rx /usr/local/directadmin/data/users/
pm2 restart unixsee-agent
```

---

## Security & Firewall (CSF)

- **No inbound ports** required.
- Allow outbound TCP `443` to the NestJS API host.

---

## Discovery Strategy

Default hybrid discovery:

1. OpenLiteSpeed active listener maps + vhost declarations (source of truth for live routes).
2. DirectAdmin manifests for owners, aliases, pointers, and subdomains (also enriches OLS matches).
3. Filesystem roots as fallback when OLS is absent or `WEB_DISCOVERY_INCLUDE_FALLBACKS=true`.
4. Exact paths for intentional non-standard apps.

Application typing:

- `woocommerce` when WordPress markers + WooCommerce plugin are present
- `wordpress` for other WordPress sites
- `node` / `custom` only from strong markers or `WEB_DISCOVERY_EXACT_PATHS` (OLS proxy alone does **not** imply node)

OpenLiteSpeed defaults:

```env
OPENLITESPEED_SERVER_ROOT=/usr/local/lsws
OPENLITESPEED_VHOST_DECLARATION_PATHS=/usr/local/lsws/conf/httpd-vhosts.conf,/usr/local/lsws/conf/httpd_config.conf
OPENLITESPEED_LISTENER_PATHS=/usr/local/lsws/conf/listeners.conf,/usr/local/lsws/conf/httpd_config.conf
OPENLITESPEED_VHOSTS_ROOT=/usr/local/lsws/conf/vhosts
WEB_DISCOVERY_ROOTS=/var/www,/home
WEB_DISCOVERY_EXACT_PATHS=
OPENLITESPEED_DISCOVER_ORPHAN_VHOSTS=false
WEB_DISCOVERY_INCLUDE_FALLBACKS=false
```

Use exact paths only for apps outside normal routing:

```env
WEB_DISCOVERY_EXACT_PATHS=/srv/apps/custom-api,/opt/company/private-dashboard
```

Debug discovery:

```bash
npm run build
npm run debug:discovery
```

Each site reports `domain`, `documentRoot`, `appType`, `source`, `aliases`, and `backendAddress` when proxied. Ingest always sends this discovery metadata to NestJS.

---

## Maintenance Commands

- `pm2 logs unixsee-agent`
- `pm2 monit`
- `pm2 restart unixsee-agent`
- `pm2 stop unixsee-agent`
