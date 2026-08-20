import type { DiscoveredDomain } from "../discovery.js";
import type { FieldStatus, SiteStackPayload } from "../site-stack.js";
import type { ActiveVisitorsSample } from "../traffic.js";

export type Phase1FieldState = "ok" | "unknown" | "unsupported";

export interface Phase1FieldStatus {
  state: Phase1FieldState;
  reason?: string;
}

export interface Phase1DiscoveryPayload {
  domain: string;
  aliases: string[];
  virtualHostName: string;
  source: "openlitespeed";
  discoveredAt: string;
}

export interface Phase1StackFieldStatus {
  wordpressVersion: Phase1FieldStatus;
  phpVersion: Phase1FieldStatus;
  imagickVersion: Phase1FieldStatus;
}

export interface Phase1StackSnapshotPayload {
  domain: string;
  wordpressVersion: string | null;
  phpVersion: string | null;
  imagickVersion: string | null;
  checkedAt: string;
  fieldStatus: Phase1StackFieldStatus;
}

export interface Phase1Visitors24hPayload {
  domain: string;
  uniqueVisitors24h: number;
  windowSeconds: 86400;
  coverageSeconds: number;
  measuredAt: string;
  algorithm: "hll";
  status: Phase1FieldStatus;
}

export interface Phase1IngestPayload {
  schemaVersion: "phase1";
  agentInstanceId: string;
  agentVersion?: string;
  sentAt: string;
  discoveries?: Phase1DiscoveryPayload[];
  stackSnapshots?: Phase1StackSnapshotPayload[];
  activeVisitors3m?: ActiveVisitorsSample[];
  visitors24h?: Phase1Visitors24hPayload[];
}

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

function looksLikeHostname(value: string): boolean {
  if (!value || value.length > 253 || value.includes(" ")) return false;
  const labels = value.split(".");
  if (labels.length < 2) return false;

  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );
}

/**
 * Transitional adapter for Step 3.
 *
 * The current discovery implementation still contains legacy fallback sources.
 * Only OLS discoveries are allowed onto the new Phase 1 wire contract. Step 5
 * will replace discovery itself with an OLS-only parser.
 */
export function toPhase1DiscoveryPayload(
  discovered: DiscoveredDomain,
  discoveredAt: string,
): Phase1DiscoveryPayload | null {
  if (discovered.source !== "openlitespeed") return null;

  const domain = normalizeHostname(discovered.domain);
  if (!looksLikeHostname(domain)) return null;

  const aliases = Array.from(
    new Set(
      (discovered.aliases ?? [])
        .map(normalizeHostname)
        .filter((alias) => alias !== domain && looksLikeHostname(alias)),
    ),
  );

  return {
    domain,
    aliases,
    virtualHostName: discovered.virtualHostName?.trim() || domain,
    source: "openlitespeed",
    discoveredAt,
  };
}

function normalizeFieldStatus(
  status: FieldStatus | undefined,
  fallbackReason: string,
): Phase1FieldStatus {
  if (
    status?.state === "ok" ||
    status?.state === "unknown" ||
    status?.state === "unsupported"
  ) {
    return status.reason
      ? { state: status.state, reason: status.reason }
      : { state: status.state };
  }

  return { state: "unknown", reason: fallbackReason };
}

function normalizeStackField(
  value: string | null,
  status: FieldStatus | undefined,
  fallbackReason: string,
): { value: string | null; status: Phase1FieldStatus } {
  const normalizedStatus = normalizeFieldStatus(status, fallbackReason);

  if (
    normalizedStatus.state === "ok" &&
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return {
      value: value.trim(),
      status: normalizedStatus,
    };
  }

  if (normalizedStatus.state === "ok") {
    return {
      value: null,
      status: { state: "unknown", reason: fallbackReason },
    };
  }

  return {
    value: null,
    status: normalizedStatus,
  };
}

/**
 * Converts the legacy internal stack-enrichment shape into the new dedicated
 * stack snapshot wire contract. Discovery metadata and admin-owned URLs are
 * intentionally discarded here.
 */
export function toPhase1StackSnapshotPayload(
  stack: SiteStackPayload,
  checkedAt: string,
): Phase1StackSnapshotPayload {
  const wordpress = normalizeStackField(
    stack.wordpressVersion,
    stack.fieldStatus.wordpressVersion,
    "wordpress_version_missing",
  );
  const php = normalizeStackField(
    stack.phpVersion,
    stack.fieldStatus.phpVersion,
    "php_version_missing",
  );
  const imagick = normalizeStackField(
    stack.imagickVersion,
    stack.fieldStatus.imagickVersion,
    "imagick_version_missing",
  );

  return {
    domain: normalizeHostname(stack.domain),
    wordpressVersion: wordpress.value,
    phpVersion: php.value,
    imagickVersion: imagick.value,
    checkedAt,
    fieldStatus: {
      wordpressVersion: wordpress.status,
      phpVersion: php.status,
      imagickVersion: imagick.status,
    },
  };
}
