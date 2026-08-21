# Unixsee agent 0.2

The Phase 1 agent is a web-server-only, outbound-only service for managed
Ubuntu VPS hosts running DirectAdmin and OpenLiteSpeed. The accepted contract is
[`../docs/agent/prd.md`](../docs/agent/prd.md).

## Runtime boundary

The Node service runs as `unixsee-agent` and may read only:

- `/opt/unixsee-agent` application/state files;
- exact installer-selected OLS routing configuration;
- approved OLS access logs.

It does not read DirectAdmin data, site roots, machine identity, `/home`,
`/etc/passwd`, or `/proc`, and it does not spawn child processes. The privileged
installer separately provisions a loopback-only, secret-header PHP probe through
DirectAdmin's global custom OLS template mechanism.

## Collected data

- deterministic active OLS vhost inventory with two-successful-scan removal;
- WordPress/PHP/Imagick versions through the protected local request;
- exact HMAC-pseudonymized unique visitors over 180 seconds;
- 24-hour local p=12 HLL estimate with 288 five-minute buckets and coverage.

Raw visitor IP addresses are never logged, transmitted, or persisted.

## Schedules

| Work | Interval |
|---|---:|
| Heartbeat and command leases | 30 seconds |
| Access-log polling | 1 second default |
| Active visitors | 30 seconds |
| 24-hour HLL snapshot | 5 minutes |
| OLS inventory | 10 minutes |
| Stack probe | startup/new/manual and 6 hours with jitter |

Typed payloads use a bounded 30-item offline queue. The only executable command
is `REFRESH_SITE_STACK`; duplicate leases resend the persisted terminal result.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Required production variables are documented in [`.env.example`](./.env.example).
The installation UUID and secret live in the mode-0600 state directory.

## Packaging

```bash
bash agent/scripts/pack-for-panel.sh
```

This builds and copies `install.sh`, the service unit, and probe assets to the
admin public assets. `unixsee-agent.tar.gz` is generated for deployment and must
not be committed.
