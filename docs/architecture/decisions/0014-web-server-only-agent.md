# ADR 0014: Web-server-only Phase 1 VPS agent

- Status: Accepted
- Date: 2026-08-21
- Owners: Agent, Backend, Admin

## Context

The original Phase 1 agent mixed OLS inventory with DirectAdmin enrichment,
website-root inspection, OS identity, and unbounded traffic history. That trust
boundary conflicts with the restricted server-access requirement and made
admin-owned links vulnerable to agent overwrite.

## Decision

Version 0.2.0 is a hard cutover to an installation UUID (`agentInstanceId`).
The runtime may read only agent-owned state, installer-selected OLS routing
files, and approved access logs. It parses active OLS mappings, calls one
loopback-only secret-protected PHP probe per site, immediately HMACs visitor
addresses, keeps exact three-minute state and 288 packed p=12 HLL buckets, and
uses outbound heartbeat leasing for the single allowlisted stack-refresh
command.

Nest stores latest-only stack and traffic read models. DirectAdmin and
WordPress admin URLs are nullable admin-owned metadata. Browsers continue to
communicate only with Nest.

The privileged installer may use DirectAdmin's supported global custom OLS
template mechanism to provision and validate the local probe, but the installed
Node service receives no DirectAdmin or website-root access.

## Consequences

- 0.1 agents disconnect when the backend/schema cutover deploys.
- Every VPS must receive one fresh enrollment token and rerun the installer.
- Legacy filesystem/update/history columns remain nullable for migration safety
  but are no longer live ingest owners.
- Host monitoring remains the separate deferred `monitoring-agent/` concern.

## Rollout

Deploy backend and migration in a maintenance window, then admin assets, then
publish the regenerated 0.2.0 bundle (not committed), reissue tokens, and rerun
the installer on every managed VPS.
