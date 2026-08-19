import { readFile } from "node:fs/promises";
import { isIP } from "node:net";

import { getConfig } from "./config/config.js";

/**
 * Phase 1 discovery is intentionally only an OpenLiteSpeed routing inventory.
 * It does not carry document-root, hosting-user, application, stack, or admin
 * metadata. Those concerns are owned by other modules/contracts.
 */
export type DiscoverySource = "openlitespeed";

export interface DiscoveredDomain {
  domain: string;
  aliases: string[];
  virtualHostName: string;
  source: DiscoverySource;
}

/**
 * Transitional engine shape. Identity resolution is intentionally outside this
 * module; initializeIdentity() requires the already-resolved installation ID.
 */
export interface HostIdentity {
  agentInstanceId: string;
  domains: DiscoveredDomain[];
}

export type OpenLiteSpeedDiscoveryFailureReason =
  | "ols_listener_config_unreadable"
  | "ols_vhost_declaration_config_unreadable";

export class OpenLiteSpeedDiscoveryError extends Error {
  readonly reason: OpenLiteSpeedDiscoveryFailureReason;

  constructor(reason: OpenLiteSpeedDiscoveryFailureReason, message: string) {
    super(message);
    this.name = "OpenLiteSpeedDiscoveryError";
    this.reason = reason;
  }
}

interface NamedBlock {
  name: string;
  body: string;
}

interface MappedVirtualHost {
  virtualHostName: string;
  hostnames: string[];
}

export interface OpenLiteSpeedConfigBundle {
  listenerConfigs: readonly string[];
  vhostDeclarationConfigs: readonly string[];
}

const STALE_VHOST_NAME_PATTERN =
  /(?:^|[._-])(?:bak|backup|disabled|old|orig|save|tmp|temp)(?:[._-]|$)/i;

function openLiteSpeedServerRoot(): string {
  return getConfig().openLiteSpeedServerRoot;
}

function defaultListenerPaths(): string[] {
  const root = openLiteSpeedServerRoot();
  return [`${root}/conf/listeners.conf`, `${root}/conf/httpd_config.conf`];
}

function defaultVhostDeclarationPaths(): string[] {
  const root = openLiteSpeedServerRoot();
  return [`${root}/conf/httpd-vhosts.conf`, `${root}/conf/httpd_config.conf`];
}

function splitConfiguredPaths(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
  }

  return unique;
}

function stripComments(content: string): string {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const commentIndex = line.indexOf("#");
      return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
    })
    .join("\n");
}

function extractNamedBlocks(content: string, blockName: string): NamedBlock[] {
  const source = stripComments(content);
  const blocks: NamedBlock[] = [];
  const blockMatcher = new RegExp(`${blockName}\\s+([^\\s{]+)\\s*\\{`, "gi");

  let match: RegExpExecArray | null;
  while ((match = blockMatcher.exec(source)) !== null) {
    let cursor = match.index + match[0].length;
    let depth = 1;

    while (cursor < source.length && depth > 0) {
      const char = source[cursor];
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      cursor += 1;
    }

    if (depth !== 0) {
      // Ignore an incomplete/stale block rather than guessing its contents.
      break;
    }

    blocks.push({
      name: match[1].trim(),
      body: source.slice(match.index + match[0].length, cursor - 1),
    });

    blockMatcher.lastIndex = cursor;
  }

  return blocks;
}

function isStaleVirtualHostName(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    STALE_VHOST_NAME_PATTERN.test(normalized) ||
    normalized.includes(".disabled.") ||
    normalized.includes(".bak.") ||
    normalized.endsWith(".disabled") ||
    normalized.endsWith(".bak") ||
    normalized.endsWith(".old") ||
    normalized.endsWith("~")
  );
}

function canonicalVirtualHostKey(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Normalize an actual Host mapping without collapsing `www.` aliases.
 * Wildcards, IP literals, variables, URL-shaped values, and invalid labels are
 * intentionally rejected because they are not discrete website identities.
 */
export function normalizeMappedHostname(value: string): string | null {
  const normalized = value
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/[,;]+$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();

  if (
    !normalized ||
    normalized === "*" ||
    normalized.includes("*") ||
    normalized.includes("$") ||
    normalized.includes("/") ||
    normalized.includes(":") ||
    normalized.includes("@") ||
    /\s/.test(normalized) ||
    isIP(normalized) !== 0 ||
    normalized.length > 253
  ) {
    return null;
  }

  const labels = normalized.split(".");
  if (labels.length < 2) return null;

  const labelsAreValid = labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );

  return labelsAreValid ? normalized : null;
}

function collectDeclaredVirtualHosts(
  contents: readonly string[],
): Map<string, string> {
  const declarations = new Map<string, string>();

  for (const content of contents) {
    for (const block of extractNamedBlocks(content, "virtualhost")) {
      if (isStaleVirtualHostName(block.name)) continue;

      const key = canonicalVirtualHostKey(block.name);
      if (!key || declarations.has(key)) continue;
      declarations.set(key, block.name.trim());
    }
  }

  return declarations;
}

function collectMappedVirtualHosts(
  contents: readonly string[],
): MappedVirtualHost[] {
  const byVhost = new Map<string, MappedVirtualHost>();

  for (const content of contents) {
    for (const listenerBlock of extractNamedBlocks(content, "listener")) {
      const mapLines = stripComments(listenerBlock.body).match(
        /^\s*map\s+.+$/gim,
      ) ?? [];

      for (const line of mapLines) {
        const match = line.trim().match(/^map\s+([^\s]+)\s+(.+)$/i);
        if (!match) continue;

        const virtualHostName = match[1].trim();
        if (isStaleVirtualHostName(virtualHostName)) continue;

        const hostnames = match[2]
          .split(",")
          .map(normalizeMappedHostname)
          .filter((hostname): hostname is string => hostname !== null);

        if (hostnames.length === 0) continue;

        const key = canonicalVirtualHostKey(virtualHostName);
        const existing = byVhost.get(key);

        if (existing) {
          existing.hostnames = uniqueValues([
            ...existing.hostnames,
            ...hostnames,
          ]);
          continue;
        }

        byVhost.set(key, {
          virtualHostName,
          hostnames: uniqueValues(hostnames),
        });
      }
    }
  }

  return [...byVhost.values()];
}

function selectPrimaryHostname(hostnames: readonly string[]): string | null {
  return (
    hostnames.find((hostname) => !hostname.startsWith("www.")) ??
    hostnames[0] ??
    null
  );
}

/**
 * Pure parser used by production discovery and unit tests.
 *
 * Only a listener mapping that references an active vhost declaration becomes
 * inventory. Nothing in this function reads a document root or per-vhost
 * website configuration.
 */
export function parseOpenLiteSpeedInventory(
  bundle: OpenLiteSpeedConfigBundle,
): DiscoveredDomain[] {
  const declarations = collectDeclaredVirtualHosts(
    bundle.vhostDeclarationConfigs,
  );
  const mappings = collectMappedVirtualHosts(bundle.listenerConfigs);

  const discovered: DiscoveredDomain[] = [];
  const claimedPrimaryDomains = new Set<string>();

  for (const mapping of mappings) {
    const declarationName = declarations.get(
      canonicalVirtualHostKey(mapping.virtualHostName),
    );
    if (!declarationName) continue;

    const primary = selectPrimaryHostname(mapping.hostnames);
    if (!primary || claimedPrimaryDomains.has(primary)) continue;

    claimedPrimaryDomains.add(primary);

    discovered.push({
      domain: primary,
      aliases: mapping.hostnames.filter((hostname) => hostname !== primary),
      virtualHostName: declarationName,
      source: "openlitespeed",
    });
  }

  return discovered;
}

async function readConfigFiles(
  paths: readonly string[],
  reason: OpenLiteSpeedDiscoveryFailureReason,
  label: string,
): Promise<string[]> {
  const configuredPaths = uniqueValues(paths.map((path) => path.trim()).filter(Boolean));
  const contents: string[] = [];
  const failures: string[] = [];

  for (const path of configuredPaths) {
    try {
      // A readable empty file still counts as a successful configuration read.
      contents.push(await readFile(path, "utf8"));
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code ?? "unknown")
          : "unknown";
      failures.push(`${path} (${code})`);
    }
  }

  if (contents.length > 0) return contents;

  throw new OpenLiteSpeedDiscoveryError(
    reason,
    `No readable OpenLiteSpeed ${label} configuration. Checked: ${
      failures.join(", ") || configuredPaths.join(", ") || "none"
    }`,
  );
}

/**
 * Read only the explicitly configured/default OLS listener and vhost
 * declaration files. No DirectAdmin paths, document roots, /home, /var/www,
 * /etc/passwd, or orphan-vhost directory enumeration is performed here.
 */
export async function discoverOpenLiteSpeedInventory(): Promise<
  DiscoveredDomain[]
> {
  const configuredListenerPaths = splitConfiguredPaths(
    process.env.OPENLITESPEED_LISTENER_PATHS,
  );
  const configuredDeclarationPaths = splitConfiguredPaths(
    process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS,
  );

  const listenerPaths =
    configuredListenerPaths.length > 0
      ? configuredListenerPaths
      : defaultListenerPaths();
  const declarationPaths =
    configuredDeclarationPaths.length > 0
      ? configuredDeclarationPaths
      : defaultVhostDeclarationPaths();

  const [listenerConfigs, vhostDeclarationConfigs] = await Promise.all([
    readConfigFiles(
      listenerPaths,
      "ols_listener_config_unreadable",
      "listener",
    ),
    readConfigFiles(
      declarationPaths,
      "ols_vhost_declaration_config_unreadable",
      "vhost declaration",
    ),
  ]);

  const domains = parseOpenLiteSpeedInventory({
    listenerConfigs,
    vhostDeclarationConfigs,
  });

  console.log(
    `[Discovery] OpenLiteSpeed inventory scan completed. Active mapped sites: ${domains.length}.`,
  );

  return domains;
}

/**
 * Compatibility wrapper for the current engine. Agent identity must already be
 * resolved by the caller; discovery itself owns only OLS inventory.
 */
export async function initializeIdentity(
  agentInstanceId: string,
): Promise<HostIdentity> {
  const normalizedAgentInstanceId = agentInstanceId.trim();
  if (!normalizedAgentInstanceId) {
    throw new Error("agentInstanceId is required before OLS discovery.");
  }

  return {
    agentInstanceId: normalizedAgentInstanceId,
    domains: await discoverOpenLiteSpeedInventory(),
  };
}
