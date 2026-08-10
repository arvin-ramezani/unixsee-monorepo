import { access, readFile } from "node:fs/promises";
import { hostname } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { getConfig } from "./config/config.js";
import type { DiscoveredDomain } from "./discovery.js";

const execFileAsync = promisify(execFile);

export type FieldState = "ok" | "unknown" | "unsupported";

export interface FieldStatus {
  state: FieldState;
  reason?: string;
}

export interface SiteStackPayload {
  domain: string;
  aliases: string[];
  documentRoot: string;
  owner: string;
  appType: string;
  source: string;
  backendAddress?: string | null;
  controlPanelUrl: string | null;
  wordpressAdminUrl: string | null;
  wordpressVersion: string | null;
  phpVersion: string | null;
  phpVersionScope: "site" | "host" | "unknown";
  imagickVersion: string | null;
  wordpressUpdateStatus: string | null;
  wordpressUpdateCheckedAt: string | null;
  fieldStatus: Record<string, FieldStatus>;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readOptionalFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}

function fieldOk(): FieldStatus {
  return { state: "ok" };
}

function fieldUnknown(reason: string): FieldStatus {
  return { state: "unknown", reason };
}

function fieldUnsupported(reason: string): FieldStatus {
  return { state: "unsupported", reason };
}

async function resolveDirectAdminBaseUrl(): Promise<{
  url: string | null;
  status: FieldStatus;
}> {
  if (getConfig().directAdminBaseUrl) {
    return {
      url: getConfig().directAdminBaseUrl!.replace(/\/$/, ""),
      status: fieldOk(),
    };
  }

  const confPath = "/usr/local/directadmin/conf/directadmin.conf";
  const content = await readOptionalFile(confPath);
  if (!content) {
    const fallback = `https://${hostname()}:2222`;
    return {
      url: fallback,
      status: fieldUnknown("directadmin_conf_missing_used_hostname"),
    };
  }

  const portMatch = content.match(/^port=(\d+)/m);
  const sslMatch = content.match(/^ssl=(\w+)/m);
  const serverNameMatch =
    content.match(/^servername=(.+)$/m) ?? content.match(/^hostname=(.+)$/m);
  const port = portMatch?.[1] ?? "2222";
  const useSsl = (sslMatch?.[1] ?? "1") !== "0";
  const host = (serverNameMatch?.[1] ?? hostname()).trim();
  const scheme = useSsl ? "https" : "http";
  return { url: `${scheme}://${host}:${port}`, status: fieldOk() };
}

async function readWordPressVersion(
  documentRoot: string,
): Promise<{ version: string | null; status: FieldStatus }> {
  const versionPath = join(documentRoot, "wp-includes", "version.php");
  const content = await readOptionalFile(versionPath);
  if (!content) {
    return {
      version: null,
      status: fieldUnknown("wp_includes_version_php_unreadable"),
    };
  }

  const match = content.match(/\$wp_version\s*=\s*'([^']+)'/);
  if (!match?.[1]) {
    return {
      version: null,
      status: fieldUnknown("wp_version_not_found"),
    };
  }

  return { version: match[1], status: fieldOk() };
}

async function readWordPressUpdateStatus(documentRoot: string): Promise<{
  status: string | null;
  checkedAt: string | null;
  fieldStatus: FieldStatus;
}> {
  const updatePath = join(
    documentRoot,
    "wp-content",
    "upgrade",
    "update_core",
  );
  const optionCandidates = [
    join(documentRoot, "wp-content", "uploads", ".unixsee-wp-update-check"),
  ];

  for (const candidate of optionCandidates) {
    const content = await readOptionalFile(candidate);
    if (!content) continue;
    try {
      const parsed = JSON.parse(content) as {
        status?: string;
        checkedAt?: string;
      };
      if (parsed.status && parsed.checkedAt) {
        return {
          status: parsed.status,
          checkedAt: parsed.checkedAt,
          fieldStatus: fieldOk(),
        };
      }
    } catch {
      // continue
    }
  }

  if (await pathExists(updatePath)) {
    return {
      status: "updates_available",
      checkedAt: new Date().toISOString(),
      fieldStatus: fieldUnknown("inferred_from_upgrade_path"),
    };
  }

  return {
    status: "unknown",
    checkedAt: null,
    fieldStatus: fieldUnknown("no_local_update_marker"),
  };
}

async function resolvePhpVersion(): Promise<{
  version: string | null;
  scope: "site" | "host" | "unknown";
  status: FieldStatus;
}> {
  try {
    const { stdout } = await execFileAsync("php", ["-r", "echo PHP_VERSION;"], {
      timeout: 5_000,
    });
    const version = stdout.trim();
    if (!version) {
      return {
        version: null,
        scope: "unknown",
        status: fieldUnknown("php_empty_output"),
      };
    }
    return { version, scope: "host", status: fieldOk() };
  } catch {
    return {
      version: null,
      scope: "unknown",
      status: fieldUnsupported("php_cli_unavailable"),
    };
  }
}

async function resolveImagickVersion(): Promise<{
  version: string | null;
  status: FieldStatus;
}> {
  try {
    const { stdout } = await execFileAsync(
      "php",
      [
        "-r",
        "echo extension_loaded('imagick') ? (new Imagick())->getVersion()['versionString'] : '';",
      ],
      { timeout: 5_000 },
    );
    const version = stdout.trim();
    if (!version) {
      return {
        version: null,
        status: fieldUnsupported("imagick_missing"),
      };
    }
    const match = version.match(/ImageMagick\s+([^\s]+)/i);
    return {
      version: match?.[1] ?? version,
      status: fieldOk(),
    };
  } catch {
    return {
      version: null,
      status: fieldUnsupported("imagick_probe_failed"),
    };
  }
}

export async function enrichSiteStack(
  domains: DiscoveredDomain[],
): Promise<SiteStackPayload[]> {
  const controlPanel = await resolveDirectAdminBaseUrl();
  const php = await resolvePhpVersion();
  const imagick = await resolveImagickVersion();

  return Promise.all(
    domains.map(async (domain) => {
      try {
        const isWordPress =
          domain.appType === "wordpress" || domain.appType === "woocommerce";

        let wordpressAdminUrl: string | null = null;
        let wordpressVersion: string | null = null;
        let wordpressUpdateStatus: string | null = null;
        let wordpressUpdateCheckedAt: string | null = null;
        const fieldStatus: Record<string, FieldStatus> = {
          controlPanelUrl: controlPanel.status,
          phpVersion: php.status,
          imagickVersion: imagick.status,
        };

        if (isWordPress) {
          wordpressAdminUrl = `https://${domain.domain}/wp-admin/`;
          fieldStatus.wordpressAdminUrl = fieldOk();

          const wpVersion = await readWordPressVersion(domain.documentRoot);
          wordpressVersion = wpVersion.version;
          fieldStatus.wordpressVersion = wpVersion.status;

          const update = await readWordPressUpdateStatus(domain.documentRoot);
          wordpressUpdateStatus = update.status;
          wordpressUpdateCheckedAt = update.checkedAt;
          fieldStatus.wordpressUpdateStatus = update.fieldStatus;
        } else {
          fieldStatus.wordpressAdminUrl = fieldUnsupported("not_wordpress");
          fieldStatus.wordpressVersion = fieldUnsupported("not_wordpress");
          fieldStatus.wordpressUpdateStatus = fieldUnsupported("not_wordpress");
        }

        return {
          domain: domain.domain,
          aliases: domain.aliases,
          documentRoot: domain.documentRoot,
          owner: domain.owner,
          appType: domain.appType,
          source: domain.source,
          backendAddress: domain.backendAddress ?? null,
          controlPanelUrl: controlPanel.url,
          wordpressAdminUrl,
          wordpressVersion,
          phpVersion: php.version,
          phpVersionScope: php.scope,
          imagickVersion: imagick.version,
          wordpressUpdateStatus,
          wordpressUpdateCheckedAt,
          fieldStatus,
        };
      } catch {
        return {
          domain: domain.domain,
          aliases: domain.aliases ?? [],
          documentRoot: domain.documentRoot,
          owner: domain.owner ?? "",
          appType: domain.appType,
          source: domain.source,
          backendAddress: domain.backendAddress ?? null,
          controlPanelUrl: null,
          wordpressAdminUrl: null,
          wordpressVersion: null,
          phpVersion: null,
          phpVersionScope: "unknown" as const,
          imagickVersion: null,
          wordpressUpdateStatus: null,
          wordpressUpdateCheckedAt: null,
          fieldStatus: {
            enrichment: fieldUnknown("enrichment_failed"),
            controlPanelUrl: fieldUnknown("enrichment_failed"),
            phpVersion: fieldUnknown("enrichment_failed"),
            imagickVersion: fieldUnknown("enrichment_failed"),
            wordpressAdminUrl: fieldUnknown("enrichment_failed"),
            wordpressVersion: fieldUnknown("enrichment_failed"),
            wordpressUpdateStatus: fieldUnknown("enrichment_failed"),
          },
        };
      }
    }),
  );
}
