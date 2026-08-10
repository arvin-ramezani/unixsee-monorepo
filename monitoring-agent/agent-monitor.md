# File Name: `agent-monitor.md`

## 1. Executive Summary & Core Mission

You are an expert systems programmer and AI developer agent. Your mission is to build the initial phase of the **UnixSee Edge Monitoring Agent**. This agent is a lightweight, high-performance telemetry daemon written in Node.js and TypeScript.

### The Target Infrastructure Context

The agent runs natively inside isolated Linux VPS instances on a host machine managed by **DirectAdmin** and powered by **LiteSpeed Enterprise**. There is **no Docker and no Nginx**.

### The Performance Challenge

The agent monitors WordPress WooCommerce websites that frequently experience extreme traffic spikes (thousands of concurrent requests).

- **Critical Constraint:** The agent **must never parse, tail, or read raw text access logs**. Parsing large files during a traffic surge saturates Disk I/O and will crash the client's VPS.
- Instead, it must scrape lightweight, pre-aggregated system files and memory statistics.

---

## 2. Phase 1 Scope & Technical Stack Constraints

The agent must maintain an incredibly small memory and CPU footprint to ensure hosting customers do not even notice it is running.

### Technical Stack Requirements (Strict 2026 Standards)

- **Runtime Environment:** Node.js configured strictly for **ECMAScript Modules (ESM)** to leverage modern native dependency resolution.
- **Language:** TypeScript with compilation target `ES2022` (or later) and `strict: true`.
- **Dependencies:** Near-zero production dependencies. Use the native Node.js `fetch` API for network transmission (no Axios).
- **Security:** The agent runs under a dedicated, low-privilege system user account (e.g., `monitoring-agent`). **Never execute as root**. Use target Linux ACLs if specific system read permissions are required.

---

## 3. Data Collection Strategy & Low-Allocation Metrics

Data must be extracted efficiently. Avoid spawning expensive shell sub-processes (e.g., executing `top`, `free`, or `df` via `child_process.exec`), as spawning processes repeatedly consumes massive CPU cycles. Use asynchronous stream reads on native Linux `/proc` files instead.

### 1. System Metrics (OS Level)

- **CPU Usage:** Parse `/proc/stat` asynchronously across precise interval deltas to compute true CPU utilization percentages.
- **RAM Allocation:** Parse `/proc/meminfo` to calculate active memory pressure. Extract `MemTotal`, `MemAvailable`, `Buffers`, and `Cached`.
- **Disk I/O:** Parse `/proc/diskstats` to measure sector reads/writes and IOPS.
- **Storage Capacity:** Use Node's native `fs.statfs` on target mounts to extract available bytes.

### 2. Live Website Discovery (DirectAdmin Layout)

The agent must dynamically find what websites exist on the VPS.

- Scan the local DirectAdmin manifest directory: `/usr/local/directadmin/data/users/`.
- Asynchronously read each user's `domains.list` and configuration files to extract:
- Primary domains, subdomains, and domain pointers (aliases).
- The mapping of the absolute path to each site's document root (e.g., `/home/username/domains/domain.com/public_html`).

### 3. Application Metrics (LiteSpeed Traffic)

- **The Scraper:** Open and parse the native LiteSpeed real-time reporting data block directly from the local filesystem memory space (usually found at `/tmp/lshttpd/.rtreport` or `/tmp/lshttpd/.rtreport.2`).
- **Global Metrics:** Extract absolute numbers for active HTTP/HTTPS connections, idle workers, and instantaneous global bandwidth load.
- **Per-Website Traffic:** Map virtual-host section data within the report back to the domains discovered through DirectAdmin to pull live concurrent request counters.

---

## 4. Transmission & Firewall Traversal Architecture

The agent acts strictly as a **Push-based worker**. It initiates outbound requests and accepts zero inbound communication.

```
[ Local Sensors Loop ] ──(Every 5-10s)──► [ Rolling Memory Buffer ]
                                                     │
                                                     ▼ (Every 60s: Aggregate)
                                           [ HMAC Signature Signer ]
                                                     │
                                                     ▼ (Outbound HTTPS POST)
                                           [ Host CSF Firewall (Port 443) ]
                                                     │
                                                     ▼
                                           [ Central Core Backend ]

```

### In-Memory Aggregator Pipeline

1. **Ticker Loop:** Run an internal loop collecting raw `/proc` and LiteSpeed metrics every 5 to 10 seconds. Append these values into a local memory array.
2. **Aggregation Window:** Every 60 seconds, flush the buffer and calculate statistical payloads to send:

- **Averages:** Mean calculations for continuous systemic load (e.g., Average CPU, Average RAM).
- **Peaks:** Maximum value reached within that minute for volatile metrics (e.g., Peak Concurrent Requests).

3. **Batch Package:** Construct a compact, single JSON payload structured explicitly to match the core backend ingestion API schema.

### Firewall & Cryptographic Security Rules

- **Firewall (CSF):** The hosting provider utilizes ConfigServer Security & Firewall (CSF). Because the agent relies 100% on a Push model, **do not configure any inbound port listening rules**. Verify out-of-the-box outbound tracking by ensuring standard port `443` is permitted to connect to the core backend's specific IP address.
- **Node Fingerprint:** On startup, read `/etc/machine-id` or `/var/lib/dbus/machine-id` to identify this specific VPS uniquely. Cache this identifier.
- **HMAC Request Signing:** For every outbound transmission, take the stringified JSON payload, combine it with a fresh timestamp string, and sign it using a unique pre-shared cryptographic Secret Key via **HMAC-SHA256**.
- Send the signature and the raw timestamp string directly via custom headers: `X-Agent-Signature` and `X-Agent-Timestamp`.

---

## 5. Step-by-Step Implementation Guide

### Phase 1: Native Filesystem Reader Engine

- Set up standard TypeScript compilation configs targeting native ES modules.
- Create utility methods that open file read-streams asynchronously using `node:fs/promises`.
- Write the data chunk string parsers for `/proc/stat`, `/proc/meminfo`, and `/proc/diskstats`. Ensure low memory allocation patterns (avoid massive string splitting operations where regex or positional indexing is faster).

### Phase 2: Panel & Web Server Discovery Loop

- Build the DirectAdmin parser module. Implement error bounds checking so that missing configurations or deleted system user directories are skipped gracefully without crashing the process lifecycle.
- Build the LiteSpeed reporting parser. Test the logic against standard `.rtreport` formats to successfully differentiate global metrics from virtual-host request allocations.

### Phase 3: Rolling Buffer & Batch Ingestion

- Implement the 5–10s tracking ticker utilizing a clean execution loop. Create memory data queues to act as a rolling array buffer.
- Build the 60s mathematical aggregator module that summarizes the queue data into stable Mean and Max numbers.

### Phase 4: Network Resilience & Exponential Backoff

- Write the outbound HTTP client engine using native `fetch`.
- Attach the custom `X-Agent-Signature` generation pipeline using Node's native `crypto` module.
- Implement an offline retry engine featuring **Exponential Backoff with Jitter**. If the core backend server drops out or returns a `5xx` error code, cache a limited history of aggregates in a fallback memory queue. Safely discard the oldest historical records first if memory thresholds are exceeded to prevent memory exhaustion.
