import { access, readFile, readdir, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, normalize } from "node:path";
import { platform, release } from "node:os";
import { getConfig } from "./config/config.js";

export type WebsiteAppType =
  | "wordpress"
  | "woocommerce"
  | "node"
  | "php"
  | "static"
  | "custom"
  | "unknown";

export type DiscoverySource = "openlitespeed" | "directadmin" | "filesystem";

export interface DiscoveredDomain {
  domain: string;
  documentRoot: string;
  owner: string;
  appType: WebsiteAppType;
  source: DiscoverySource;
  aliases: string[];
  backendAddress?: string;
  configFile?: string;
  virtualHostName?: string;
}

export interface HostIdentity {
  machineId: string;
  domains: DiscoveredDomain[];
}

interface NamedBlock {
  name: string;
  body: string;
}

interface OpenLiteSpeedVirtualHostDeclaration {
  name: string;
  vhRoot: string;
  configFile: string | null;
}

function openLiteSpeedServerRoot(): string {
  return getConfig().openLiteSpeedServerRoot;
}

function defaultOpenLiteSpeedVhostDeclarationPaths(): string[] {
  const root = openLiteSpeedServerRoot();
  return [
    `${root}/conf/httpd-vhosts.conf`,
    `${root}/conf/httpd_config.conf`,
  ];
}

function defaultOpenLiteSpeedListenerPaths(): string[] {
  const root = openLiteSpeedServerRoot();
  return [`${root}/conf/listeners.conf`, `${root}/conf/httpd_config.conf`];
}

function defaultOpenLiteSpeedVhostsRoot(): string {
  return `${openLiteSpeedServerRoot()}/conf/vhosts`;
}

const defaultDiscoveryRoots = ["/var/www", "/home"];
const staleNamePattern =
  /(?:^|[._-])(?:bak|backup|disabled|old|orig|save|tmp|temp)(?:[._-]|$)/i;

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function isReadableFile(path: string): Promise<boolean> {
  try {
    await access(path);
    const fileStats = await stat(path);
    return fileStats.isFile();
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

function splitConfiguredPaths(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function isStaleName(value: string): boolean {
  const normalizedValue = value.trim().toLowerCase();

  return (
    staleNamePattern.test(normalizedValue) ||
    normalizedValue.includes(".disabled.") ||
    normalizedValue.includes(".bak.") ||
    normalizedValue.endsWith(".disabled") ||
    normalizedValue.endsWith(".bak") ||
    normalizedValue.endsWith(".old") ||
    normalizedValue.endsWith("~")
  );
}

function normalizeDomain(value: string): string | null {
  const normalizedValue = value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[,;]+$/g, "")
    .split("/")[0]
    .toLowerCase();

  if (
    !normalizedValue ||
    normalizedValue === "*" ||
    normalizedValue.includes("$") ||
    isStaleName(normalizedValue)
  ) {
    return null;
  }

  if (!normalizedValue.includes(".")) return null;

  return normalizedValue;
}

async function isWslEnvironment(): Promise<boolean> {
  if (platform() !== "linux") return false;
  try {
    const osRelease = release().toLowerCase();
    const procVersion = await readFile("/proc/version", "utf-8");
    return (
      osRelease.includes("microsoft") ||
      procVersion.toLowerCase().includes("microsoft")
    );
  } catch {
    return false;
  }
}

async function getMachineId(): Promise<string> {
  const paths = ["/etc/machine-id", "/var/lib/dbus/machine-id"];

  for (const path of paths) {
    try {
      const content = await readFile(path, "utf-8");
      return content.trim();
    } catch {
      // Fallback chain intentionally continues.
    }
  }

  const isWsl = await isWslEnvironment();
  if (isWsl || platform() === "win32") {
    console.log(
      `[INFO] Non-production environment detected. Yielding local development machine-id fingerprint.`,
    );
    return "dev-local-machine-id";
  }

  throw new Error(
    "[FATAL] Unable to resolve system machine-id fingerprint. Ensure the target node is a supported Linux environment.",
  );
}

function removeCommentLines(content: string): string {
  return content
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");
}

function extractNamedBlocks(content: string, blockName: string): NamedBlock[] {
  const source = removeCommentLines(content);
  const blocks: NamedBlock[] = [];
  const blockMatcher = new RegExp(`${blockName}\\s+([^\\s{]+)\\s*\\{`, "gi");

  let match: RegExpExecArray | null;
  while ((match = blockMatcher.exec(source)) !== null) {
    let cursor = match.index + match[0].length;
    let depth = 1;

    while (cursor < source.length && depth > 0) {
      const char = source[cursor];
      if (char === "{") depth++;
      if (char === "}") depth--;
      cursor++;
    }

    if (depth === 0) {
      const body = source.slice(match.index + match[0].length, cursor - 1);
      blocks.push({ name: match[1].trim(), body });
    }

    blockMatcher.lastIndex = cursor;
  }

  return blocks;
}

function getDirectiveValue(content: string, directive: string): string | null {
  const source = removeCommentLines(content);
  const matcher = new RegExp(`^\\s*${directive}\\s+(.+?)\\s*$`, "im");
  const match = source.match(matcher);

  return match?.[1]?.trim() ?? null;
}

function resolveOpenLiteSpeedPath(
  rawPath: string,
  variables: Record<string, string>,
): string {
  const expandedPath = Object.entries(variables).reduce(
    (currentValue, [key, value]) => currentValue.replaceAll(key, value),
    rawPath.trim().replace(/^['"]|['"]$/g, ""),
  );

  if (isAbsolute(expandedPath)) return normalize(expandedPath);

  return normalize(join(variables.$SERVER_ROOT, expandedPath));
}

function collectListenerMappedDomains(
  contents: string[],
): Map<string, string[]> {
  const mappedDomains = new Map<string, string[]>();

  for (const content of contents) {
    const listenerBlocks = extractNamedBlocks(content, "listener");

    for (const listenerBlock of listenerBlocks) {
      const mapLines = listenerBlock.body.match(/^\s*map\s+.+$/gim) ?? [];

      for (const line of mapLines) {
        const match = line.trim().match(/^map\s+([^\s]+)\s+(.+)$/i);
        if (!match) continue;

        const virtualHostName = match[1].trim();
        if (isStaleName(virtualHostName)) continue;

        const domains = match[2]
          .split(",")
          .map((domain) => normalizeDomain(domain))
          .filter((domain): domain is string => Boolean(domain));

        if (domains.length === 0) continue;

        const existingDomains = mappedDomains.get(virtualHostName) ?? [];
        mappedDomains.set(
          virtualHostName,
          uniqueValues([...existingDomains, ...domains]),
        );
      }
    }
  }

  return mappedDomains;
}

function getBackendAddress(configContent: string | null): string | undefined {
  if (!configContent) return undefined;

  const proxyBlocks = extractNamedBlocks(configContent, "extprocessor").filter(
    (block) => /^\s*type\s+proxy\s*$/im.test(block.body),
  );

  for (const block of proxyBlocks) {
    const address = getDirectiveValue(block.body, "address");
    if (address) return address;
  }

  return undefined;
}

async function hasStrongNodeMarkers(path: string): Promise<boolean> {
  const nodeMarkers = [
    join(path, "package.json"),
    join(dirname(path), "package.json"),
    join(path, ".next"),
    join(dirname(path), ".next"),
    join(path, "server.js"),
    join(dirname(path), "server.js"),
    join(path, "ecosystem.config.cjs"),
    join(dirname(path), "ecosystem.config.cjs"),
    join(path, "ecosystem.config.js"),
    join(dirname(path), "ecosystem.config.js"),
  ];

  const nodeMarkerResults = await Promise.all(
    nodeMarkers.map((marker) => pathExists(marker)),
  );

  return nodeMarkerResults.some(Boolean);
}

async function detectApplicationType(
  path: string,
  options?: { forceCustom?: boolean },
): Promise<WebsiteAppType> {
  if (options?.forceCustom) {
    if (await hasStrongNodeMarkers(path)) return "node";
    return "custom";
  }

  const wordpressMarkers = [
    join(path, "wp-config.php"),
    join(path, "wp-content"),
    join(path, "wp-includes"),
  ];

  const wordpressMarkerResults = await Promise.all(
    wordpressMarkers.map((marker) => pathExists(marker)),
  );

  if (wordpressMarkerResults.filter(Boolean).length >= 2) {
    const woocommerceMarkers = [
      join(path, "wp-content", "plugins", "woocommerce"),
      join(path, "wp-content", "plugins", "woocommerce", "woocommerce.php"),
    ];
    const hasWooCommerce = (
      await Promise.all(woocommerceMarkers.map((marker) => pathExists(marker)))
    ).some(Boolean);

    return hasWooCommerce ? "woocommerce" : "wordpress";
  }

  if (await hasStrongNodeMarkers(path)) return "node";
  if (await pathExists(join(path, "index.php"))) return "php";
  if (await pathExists(join(path, "index.html"))) return "static";

  return "unknown";
}

async function resolveApplicationRoot(
  path: string,
  options?: { forceCustom?: boolean },
): Promise<string> {
  const candidates = [
    path,
    join(path, "public_html"),
    join(path, "public"),
    join(path, "html"),
    dirname(path),
  ];

  for (const candidate of candidates) {
    const type = await detectApplicationType(candidate, options);
    if (type !== "unknown") return candidate;
  }

  return path;
}

async function getOwnerFromPath(path: string): Promise<string> {
  const homeMatch = path.match(/^\/home\/([^/]+)/);
  if (homeMatch) return homeMatch[1];

  try {
    const fileStats = await stat(path);
    const passwd = await readOptionalFile("/etc/passwd");
    const ownerLine = passwd
      ?.split("\n")
      .find((line) => line.split(":")[2] === String(fileStats.uid));

    return ownerLine?.split(":")[0] ?? `uid:${fileStats.uid}`;
  } catch {
    return "system";
  }
}

async function buildDiscoveredDomain({
  domain,
  documentRoot,
  owner,
  source,
  aliases = [],
  backendAddress,
  configFile,
  virtualHostName,
  forceCustom = false,
}: {
  domain: string;
  documentRoot: string;
  owner?: string;
  source: DiscoverySource;
  aliases?: string[];
  backendAddress?: string;
  configFile?: string;
  virtualHostName?: string;
  forceCustom?: boolean;
}): Promise<DiscoveredDomain | null> {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) return null;

  const resolvedDocumentRoot = await resolveApplicationRoot(documentRoot, {
    forceCustom,
  });
  const normalizedAliases = uniqueValues([
    normalizedDomain,
    ...aliases
      .map((alias) => normalizeDomain(alias))
      .filter((alias): alias is string => Boolean(alias)),
  ]);

  return {
    domain: normalizedDomain,
    documentRoot: resolvedDocumentRoot,
    owner: owner ?? (await getOwnerFromPath(resolvedDocumentRoot)),
    appType: await detectApplicationType(resolvedDocumentRoot, { forceCustom }),
    source,
    aliases: normalizedAliases,
    backendAddress,
    configFile,
    virtualHostName,
  };
}

function parseDirectAdminList(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function parseDirectAdminConfValue(
  content: string,
  key: string,
): string | null {
  const matcher = new RegExp(`^${key}=(.*)$`, "im");
  const match = content.match(matcher);
  return match?.[1]?.trim() || null;
}

async function isDirectAdminUserSuspended(userDir: string): Promise<boolean> {
  const userConf = await readOptionalFile(join(userDir, "user.conf"));
  if (!userConf) return false;

  const suspended = parseDirectAdminConfValue(userConf, "suspended");
  return suspended === "yes" || suspended === "YES" || suspended === "1";
}

async function collectDirectAdminPointers(
  userDir: string,
  domain: string,
): Promise<string[]> {
  const pointers: string[] = [];
  const pointersFile = await readOptionalFile(
    join(userDir, "domains", `${domain}.pointers`),
  );
  if (pointersFile) {
    pointers.push(...parseDirectAdminList(pointersFile));
  }

  const domainConf = await readOptionalFile(
    join(userDir, "domains", `${domain}.conf`),
  );
  if (domainConf) {
    const pointerValue = parseDirectAdminConfValue(domainConf, "pointers");
    if (pointerValue) {
      pointers.push(
        ...pointerValue
          .split(/[,\s]+/)
          .map((item) => item.trim())
          .filter(Boolean),
      );
    }
  }

  return uniqueValues(pointers);
}

async function collectDirectAdminSubdomains(
  userDir: string,
  user: string,
  domain: string,
): Promise<DiscoveredDomain[]> {
  const discovered: DiscoveredDomain[] = [];
  const subdomainNames = new Set<string>();

  const subdomainListFile = await readOptionalFile(
    join(userDir, "domains", `${domain}.subdomains`),
  );
  if (subdomainListFile) {
    for (const entry of parseDirectAdminList(subdomainListFile)) {
      if (!isStaleName(entry)) subdomainNames.add(entry);
    }
  }

  for (const subdomain of subdomainNames) {
    const fqdn = `${subdomain}.${domain}`;
    const nestedDocRoot = join(
      "/home",
      user,
      "domains",
      domain,
      "public_html",
      subdomain,
    );
    const standaloneDocRoot = join(
      "/home",
      user,
      "domains",
      fqdn,
      "public_html",
    );
    const documentRoot = (await pathExists(standaloneDocRoot))
      ? standaloneDocRoot
      : nestedDocRoot;

    if (!(await pathExists(documentRoot))) continue;

    const discoveredDomain = await buildDiscoveredDomain({
      domain: fqdn,
      owner: user,
      documentRoot,
      source: "directadmin",
      aliases: [fqdn, `www.${fqdn}`],
    });

    if (discoveredDomain) discovered.push(discoveredDomain);
  }

  return discovered;
}

async function scanDirectAdminManifests(): Promise<DiscoveredDomain[]> {
  const daUsersPath = "/usr/local/directadmin/data/users/";
  const discovered: DiscoveredDomain[] = [];

  try {
    const users = await readdir(daUsersPath);

    for (const user of users) {
      if (isStaleName(user)) continue;

      const userDir = join(daUsersPath, user);
      if (await isDirectAdminUserSuspended(userDir)) {
        console.log(
          `[INFO] Skipping suspended DirectAdmin account: ${user}`,
        );
        continue;
      }

      const domainsPath = join(userDir, "domains.list");

      try {
        const domainsContent = await readFile(domainsPath, "utf-8");
        const domains = domainsContent
          .split("\n")
          .map((domain) => normalizeDomain(domain))
          .filter((domain): domain is string => Boolean(domain));

        for (const domain of domains) {
          const pointers = await collectDirectAdminPointers(userDir, domain);
          const discoveredDomain = await buildDiscoveredDomain({
            domain,
            owner: user,
            documentRoot: `/home/${user}/domains/${domain}/public_html`,
            source: "directadmin",
            aliases: [domain, `www.${domain}`, ...pointers],
          });

          if (discoveredDomain) discovered.push(discoveredDomain);

          for (const pointer of pointers) {
            const pointerDomain = await buildDiscoveredDomain({
              domain: pointer,
              owner: user,
              documentRoot: `/home/${user}/domains/${domain}/public_html`,
              source: "directadmin",
              aliases: [pointer, `www.${pointer}`, domain],
            });
            if (pointerDomain) discovered.push(pointerDomain);
          }

          discovered.push(
            ...(await collectDirectAdminSubdomains(userDir, user, domain)),
          );
        }
      } catch (error: any) {
        if (error.code !== "ENOENT" && error.code !== "EACCES") {
          console.warn(
            `[WARNING] Could not read manifest files for hosting account [${user}]: ${error.message}`,
          );
        }
      }
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(
        `[INFO] DirectAdmin ecosystem footprint missing at ${daUsersPath}. Skipping DirectAdmin discovery layer.`,
      );
    } else if (error.code === "EACCES") {
      console.log(
        `[INFO] Access to DirectAdmin paths denied. Skipping DirectAdmin discovery layer.`,
      );
    } else {
      console.error(
        `[ERROR] DirectAdmin tracking matrix encountered an unexpected error:`,
        error.message,
      );
    }
  }

  return discovered;
}

async function readConfiguredFiles(
  paths: string[],
): Promise<Array<{ path: string; content: string }>> {
  const contents: Array<{ path: string; content: string }> = [];

  for (const path of paths) {
    const content = await readOptionalFile(path);
    if (content) contents.push({ path, content });
  }

  return contents;
}

async function collectOpenLiteSpeedDeclarations(
  contents: Array<{ path: string; content: string }>,
  serverRoot: string,
): Promise<Map<string, OpenLiteSpeedVirtualHostDeclaration>> {
  const declarations = new Map<string, OpenLiteSpeedVirtualHostDeclaration>();

  for (const { content } of contents) {
    const virtualHostBlocks = extractNamedBlocks(content, "virtualhost");

    for (const virtualHostBlock of virtualHostBlocks) {
      const virtualHostName = virtualHostBlock.name;
      if (isStaleName(virtualHostName)) continue;

      const vhRootRaw = getDirectiveValue(virtualHostBlock.body, "vhRoot");
      const configFileRaw = getDirectiveValue(
        virtualHostBlock.body,
        "configFile",
      );
      const inferredVarWwwRoot = `/var/www/${virtualHostName}`;
      const vhRoot = vhRootRaw
        ? resolveOpenLiteSpeedPath(vhRootRaw, { $SERVER_ROOT: serverRoot })
        : (await pathExists(inferredVarWwwRoot))
          ? inferredVarWwwRoot
          : join(serverRoot, "conf", "vhosts", virtualHostName);

      const configFile = configFileRaw
        ? resolveOpenLiteSpeedPath(configFileRaw, {
            $SERVER_ROOT: serverRoot,
            $VH_ROOT: vhRoot,
          })
        : join(serverRoot, "conf", "vhosts", virtualHostName, "vhconf.conf");

      declarations.set(virtualHostName, {
        name: virtualHostName,
        vhRoot,
        configFile,
      });
    }
  }

  return declarations;
}

async function scanOpenLiteSpeedDeclarations(): Promise<DiscoveredDomain[]> {
  const declarationPaths = splitConfiguredPaths(
    process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS,
  );
  const listenerPaths = splitConfiguredPaths(
    process.env.OPENLITESPEED_LISTENER_PATHS,
  );
  const vhostDeclarationPaths =
    declarationPaths.length > 0
      ? declarationPaths
      : defaultOpenLiteSpeedVhostDeclarationPaths();
  const openLiteSpeedListenerPaths =
    listenerPaths.length > 0 ? listenerPaths : defaultOpenLiteSpeedListenerPaths();

  const [declarationFiles, listenerFiles] = await Promise.all([
    readConfiguredFiles(vhostDeclarationPaths),
    readConfiguredFiles(openLiteSpeedListenerPaths),
  ]);

  if (declarationFiles.length === 0 && listenerFiles.length === 0) {
    console.log(
      `[INFO] OpenLiteSpeed active config files were not readable. Skipping config discovery layer.`,
    );
    return [];
  }

  if (listenerFiles.length === 0) {
    console.log(
      `[INFO] OpenLiteSpeed listener files were not readable. Active listener discovery skipped.`,
    );
    return [];
  }

  if (declarationFiles.length === 0) {
    console.log(
      `[INFO] OpenLiteSpeed vhost declaration files were not readable. Active vhost discovery skipped.`,
    );
    return [];
  }

  const mappedDomains = collectListenerMappedDomains(
    listenerFiles.map((file) => file.content),
  );
  if (mappedDomains.size === 0) {
    console.log(
      `[INFO] OpenLiteSpeed listener maps are empty or only contain stale entries.`,
    );
    return [];
  }

  const serverRoot = openLiteSpeedServerRoot();
  const declarations = await collectOpenLiteSpeedDeclarations(
    declarationFiles,
    serverRoot,
  );
  const discovered: DiscoveredDomain[] = [];

  for (const [virtualHostName, domains] of mappedDomains.entries()) {
    const declaration = declarations.get(virtualHostName);

    if (!declaration) {
      console.log(
        `[INFO] Skipping mapped OpenLiteSpeed vhost without active declaration: ${virtualHostName}`,
      );
      continue;
    }

    if (
      !declaration.configFile ||
      !(await isReadableFile(declaration.configFile))
    ) {
      console.log(
        `[INFO] Skipping OpenLiteSpeed vhost with unreadable config: ${virtualHostName}`,
      );
      continue;
    }

    const virtualHostConfig = await readOptionalFile(declaration.configFile);
    const docRootRaw = virtualHostConfig
      ? getDirectiveValue(virtualHostConfig, "docRoot")
      : null;
    const backendAddress = getBackendAddress(virtualHostConfig);
    const documentRoot = docRootRaw
      ? resolveOpenLiteSpeedPath(docRootRaw, {
          $SERVER_ROOT: serverRoot,
          $VH_ROOT: declaration.vhRoot,
        })
      : declaration.vhRoot;

    const hasDocumentRoot = await pathExists(documentRoot);
    if (!hasDocumentRoot && !backendAddress) {
      console.log(
        `[INFO] Skipping OpenLiteSpeed vhost without docRoot or proxy backend: ${virtualHostName}`,
      );
      continue;
    }

    const primaryDomain = domains[0];
    const discoveredDomain = await buildDiscoveredDomain({
      domain: primaryDomain,
      documentRoot,
      source: "openlitespeed",
      aliases: [virtualHostName, ...domains],
      backendAddress,
      configFile: declaration.configFile,
      virtualHostName: declaration.name,
    });

    if (discoveredDomain) discovered.push(discoveredDomain);
  }

  return discovered;
}

async function scanOpenLiteSpeedOrphanVhostDirectory(): Promise<
  DiscoveredDomain[]
> {
  if (!getConfig().openLiteSpeedDiscoverOrphanVhosts) return [];

  const configuredVhostsRoot =
    process.env.OPENLITESPEED_VHOSTS_ROOT || defaultOpenLiteSpeedVhostsRoot();
  const discovered: DiscoveredDomain[] = [];

  try {
    const entries = await readdir(configuredVhostsRoot, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory() || isStaleName(entry.name)) continue;

      const virtualHostName = entry.name;
      const configFile = join(
        configuredVhostsRoot,
        virtualHostName,
        "vhconf.conf",
      );
      const configContent = await readOptionalFile(configFile);
      if (!configContent) continue;

      const vhRootRaw = getDirectiveValue(configContent, "vhRoot");
      const docRootRaw = getDirectiveValue(configContent, "docRoot");
      const inferredVarWwwRoot = `/var/www/${virtualHostName}`;
      const vhRoot = vhRootRaw
        ? resolveOpenLiteSpeedPath(vhRootRaw, {
            $SERVER_ROOT: openLiteSpeedServerRoot(),
          })
        : (await pathExists(inferredVarWwwRoot))
          ? inferredVarWwwRoot
          : join(configuredVhostsRoot, virtualHostName);
      const backendAddress = getBackendAddress(configContent);
      const documentRoot = docRootRaw
        ? resolveOpenLiteSpeedPath(docRootRaw, {
            $SERVER_ROOT: openLiteSpeedServerRoot(),
            $VH_ROOT: vhRoot,
          })
        : vhRoot;
      const domain =
        normalizeDomain(virtualHostName) ??
        normalizeDomain(basename(documentRoot));

      if (!domain) continue;

      const discoveredDomain = await buildDiscoveredDomain({
        domain,
        documentRoot,
        source: "openlitespeed",
        aliases: [virtualHostName, domain],
        backendAddress,
        configFile,
        virtualHostName,
      });

      if (discoveredDomain) discovered.push(discoveredDomain);
    }
  } catch (error: any) {
    if (error.code !== "ENOENT" && error.code !== "EACCES") {
      console.warn(
        `[WARNING] OpenLiteSpeed orphan vhost directory scan failed: ${error.message}`,
      );
    }
  }

  return discovered;
}

async function scanOpenLiteSpeed(): Promise<DiscoveredDomain[]> {
  const [declaredDomains, orphanDomains] = await Promise.all([
    scanOpenLiteSpeedDeclarations(),
    scanOpenLiteSpeedOrphanVhostDirectory(),
  ]);

  return [...declaredDomains, ...orphanDomains];
}

async function scanVarWwwStyleRoot(rootPath: string): Promise<DiscoveredDomain[]> {
  const discovered: DiscoveredDomain[] = [];

  try {
    const entries = await readdir(rootPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || isStaleName(entry.name)) continue;

      const domain = normalizeDomain(entry.name);
      if (!domain) continue;

      const documentRoot = join(rootPath, entry.name);
      const discoveredDomain = await buildDiscoveredDomain({
        domain,
        documentRoot,
        source: "filesystem",
        aliases: [domain, `www.${domain}`],
      });

      if (discoveredDomain) discovered.push(discoveredDomain);
    }
  } catch (error: any) {
    if (error.code !== "ENOENT" && error.code !== "EACCES") {
      console.warn(
        `[WARNING] Filesystem discovery failed for ${rootPath}: ${error.message}`,
      );
    }
  }

  return discovered;
}

async function scanHomeDomainsRoot(rootPath: string): Promise<DiscoveredDomain[]> {
  const discovered: DiscoveredDomain[] = [];

  try {
    const users = await readdir(rootPath, { withFileTypes: true });

    for (const user of users) {
      if (!user.isDirectory()) continue;

      const domainsRoot = join(rootPath, user.name, "domains");
      const domains = await readdir(domainsRoot, { withFileTypes: true }).catch(
        () => [],
      );

      for (const domainEntry of domains) {
        if (!domainEntry.isDirectory() || isStaleName(domainEntry.name)) continue;

        const domain = normalizeDomain(domainEntry.name);
        if (!domain) continue;

        const discoveredDomain = await buildDiscoveredDomain({
          domain,
          owner: user.name,
          documentRoot: join(domainsRoot, domainEntry.name, "public_html"),
          source: "filesystem",
          aliases: [domain, `www.${domain}`],
        });

        if (discoveredDomain) discovered.push(discoveredDomain);
      }
    }
  } catch (error: any) {
    if (error.code !== "ENOENT" && error.code !== "EACCES") {
      console.warn(
        `[WARNING] Home directory discovery failed for ${rootPath}: ${error.message}`,
      );
    }
  }

  return discovered;
}

async function scanManualExactPaths(): Promise<DiscoveredDomain[]> {
  const exactPaths = splitConfiguredPaths(process.env.WEB_DISCOVERY_EXACT_PATHS);
  const discovered: DiscoveredDomain[] = [];

  for (const exactPath of exactPaths) {
    const domain = normalizeDomain(basename(exactPath));
    if (!domain) continue;

    const discoveredDomain = await buildDiscoveredDomain({
      domain,
      documentRoot: exactPath,
      source: "filesystem",
      aliases: [domain, `www.${domain}`],
      forceCustom: true,
    });

    if (discoveredDomain) discovered.push(discoveredDomain);
  }

  return discovered;
}

async function scanFilesystemRoots(): Promise<DiscoveredDomain[]> {
  const roots = splitConfiguredPaths(process.env.WEB_DISCOVERY_ROOTS);
  const targetRoots = roots.length > 0 ? roots : defaultDiscoveryRoots;
  const discovered: DiscoveredDomain[] = [];

  discovered.push(...(await scanManualExactPaths()));

  for (const root of targetRoots) {
    if (root === "/home") {
      discovered.push(...(await scanHomeDomainsRoot(root)));
      continue;
    }

    discovered.push(...(await scanVarWwwStyleRoot(root)));
  }

  return discovered;
}

function preferDirectAdminOwner(owner: string | undefined): boolean {
  return Boolean(owner && owner !== "system" && !owner.startsWith("uid:"));
}

function deduplicateDomains(domains: DiscoveredDomain[]): DiscoveredDomain[] {
  const sourcePriority: Record<DiscoverySource, number> = {
    openlitespeed: 3,
    directadmin: 2,
    filesystem: 1,
  };
  const domainMap = new Map<string, DiscoveredDomain>();

  for (const domain of domains) {
    const previous = domainMap.get(domain.domain);

    if (!previous) {
      domainMap.set(domain.domain, { ...domain });
      continue;
    }

    const previousPriority = sourcePriority[previous.source];
    const nextPriority = sourcePriority[domain.source];

    if (nextPriority > previousPriority) {
      domainMap.set(domain.domain, {
        ...domain,
        aliases: uniqueValues([...previous.aliases, ...domain.aliases]),
        owner: preferDirectAdminOwner(previous.owner)
          ? previous.owner
          : domain.owner,
      });
      continue;
    }

    if (nextPriority < previousPriority) {
      previous.aliases = uniqueValues([...previous.aliases, ...domain.aliases]);
      if (
        !preferDirectAdminOwner(previous.owner) &&
        preferDirectAdminOwner(domain.owner)
      ) {
        previous.owner = domain.owner;
      }
      continue;
    }

    previous.aliases = uniqueValues([...previous.aliases, ...domain.aliases]);
    if (
      !preferDirectAdminOwner(previous.owner) &&
      preferDirectAdminOwner(domain.owner)
    ) {
      previous.owner = domain.owner;
    }
  }

  return [...domainMap.values()].sort((first, second) =>
    first.domain.localeCompare(second.domain),
  );
}

function enrichOpenLiteSpeedWithDirectAdmin(
  openLiteSpeedDomains: DiscoveredDomain[],
  directAdminDomains: DiscoveredDomain[],
): DiscoveredDomain[] {
  const daByDomain = new Map(
    directAdminDomains.map((domain) => [domain.domain, domain]),
  );

  return openLiteSpeedDomains.map((olsDomain) => {
    const daDomain = daByDomain.get(olsDomain.domain);
    if (!daDomain) return olsDomain;

    return {
      ...olsDomain,
      owner: preferDirectAdminOwner(daDomain.owner)
        ? daDomain.owner
        : olsDomain.owner,
      aliases: uniqueValues([...olsDomain.aliases, ...daDomain.aliases]),
    };
  });
}

export async function initializeIdentity(): Promise<HostIdentity> {
  console.log(`[Discovery] Initiating host identity resolution...`);

  const machineId = await getMachineId();
  console.log(`[Discovery] Node Fingerprint: ${machineId}`);

  console.log(`[Discovery] Scanning OpenLiteSpeed active routing first...`);
  const openLiteSpeedDomains = await scanOpenLiteSpeed();
  const directAdminDomains = await scanDirectAdminManifests();
  const manualDomains = await scanManualExactPaths();

  if (
    openLiteSpeedDomains.length > 0 &&
    !getConfig().webDiscoveryIncludeFallbacks
  ) {
    const enrichedOpenLiteSpeed = enrichOpenLiteSpeedWithDirectAdmin(
      openLiteSpeedDomains,
      directAdminDomains,
    );
    const domains = deduplicateDomains([
      ...enrichedOpenLiteSpeed,
      ...manualDomains,
    ]);

    console.log(
      `[Discovery] Mapped ${domains.length} active web properties: ${domains
        .map((domain) => `${domain.domain}:${domain.appType}:${domain.source}`)
        .join(", ")}`,
    );

    return { machineId, domains };
  }

  console.log(
    `[Discovery] Scanning DirectAdmin and filesystem fallback footprints...`,
  );
  const filesystemDomains = await scanFilesystemRoots();

  const domains = deduplicateDomains([
    ...enrichOpenLiteSpeedWithDirectAdmin(
      openLiteSpeedDomains,
      directAdminDomains,
    ),
    ...directAdminDomains,
    ...filesystemDomains,
  ]);

  console.log(
    `[Discovery] Mapped ${domains.length} active web properties: ${domains
      .map((domain) => `${domain.domain}:${domain.appType}:${domain.source}`)
      .join(", ")}`,
  );

  return { machineId, domains };
}
