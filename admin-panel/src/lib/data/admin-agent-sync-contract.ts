/**
 * Secure admin ↔ Nest sync contract (UI-only phase).
 *
 * Browser never talks to agents or VPS hosts. When ADR 0003 is superseded,
 * replace fixture calls with these staff-JWT endpoints only.
 *
 * @see docs/agent/phase1-api-contract.md
 * @see docs/product/ux-flows/admin-servers-websites-agents.md
 */
export const ADMIN_AGENT_SYNC_CONTRACT = {
  createServer: "POST /api/v1/admin/servers",
  listServers: "GET /api/v1/admin/servers",
  getServer: "GET /api/v1/admin/servers/:id",
  issueEnrollmentToken: "POST /api/v1/admin/servers/:id/enrollment-tokens",
  revokeEnrollmentToken:
    "POST /api/v1/admin/servers/:id/enrollment-tokens/:tokenId/revoke",
  revokeAgentCredentials: "POST /api/v1/admin/servers/:id/agent/revoke",
  listDiscoveries: "GET /api/v1/admin/discoveries",
  assignDiscovery: "POST /api/v1/admin/discoveries/:id/assign",
  /** Never requested by admin UI — agent-only after enroll. */
  forbiddenInBrowser: [
    "secretKey",
    "AGENT_SECRET",
    "/api/internal/agent/v1/*",
  ],
} as const;

export type AdminAgentSyncEndpoint =
  (typeof ADMIN_AGENT_SYNC_CONTRACT)[Exclude<
    keyof typeof ADMIN_AGENT_SYNC_CONTRACT,
    "forbiddenInBrowser"
  >];
