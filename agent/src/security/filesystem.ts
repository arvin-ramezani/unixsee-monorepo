import { realpathSync, watch, type FSWatcher } from "node:fs";
import {
  chmod,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";

import { getConfig } from "../config/config.js";

const PRODUCTION_AGENT_ROOT = "/opt/unixsee-agent";
const PRODUCTION_AGENT_STATE_DIR = `${PRODUCTION_AGENT_ROOT}/state`;
const AGENT_ENV_FILE_NAME = ".env";

export type OpenLiteSpeedRoutingConfigKind = "listener" | "vhost-declaration";

export interface OpenLiteSpeedRoutingConfigReadResult {
  contents: string[];
  checkedPaths: string[];
  failures: string[];
}

export interface AccessLogStat {
  size: number;
  inode: number;
}

export interface AccessLogWatchHandle {
  close(): void;
}

export class FilesystemBoundaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FilesystemBoundaryError";
  }
}

function isProduction(): boolean {
  try {
    return getConfig().nodeEnv === "production";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

function assertSimpleFileName(fileName: string): void {
  if (
    !fileName ||
    basename(fileName) !== fileName ||
    fileName === "." ||
    fileName === ".." ||
    fileName.includes("/") ||
    fileName.includes("\\")
  ) {
    throw new FilesystemBoundaryError(
      `Agent state file name is not allowlisted: ${fileName}`,
    );
  }
}

function isWithin(basePath: string, targetPath: string): boolean {
  const rel = relative(resolve(basePath), resolve(targetPath));
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function assertWithin(basePath: string, targetPath: string, label: string): void {
  if (!isWithin(basePath, targetPath)) {
    throw new FilesystemBoundaryError(
      `${label} path escapes its allowlisted root: ${targetPath}`,
    );
  }
}

async function assertNoSymlinkEscape(
  basePath: string,
  targetPath: string,
  label: string,
): Promise<void> {
  try {
    const [realBase, realTarget] = await Promise.all([
      realpath(basePath),
      realpath(targetPath),
    ]);
    assertWithin(realBase, realTarget, label);
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";

    // Missing/unreadable files are reported by the actual read operation.
    // Boundary errors must still propagate.
    if (error instanceof FilesystemBoundaryError) throw error;
    if (code === "ENOENT" || code === "EACCES" || code === "EPERM") return;
    throw error;
  }
}


function assertNoSymlinkEscapeSync(
  basePath: string,
  targetPath: string,
  label: string,
): void {
  const realBase = realpathSync(basePath);
  const realTarget = realpathSync(targetPath);
  assertWithin(realBase, realTarget, label);
}

function splitConfiguredPaths(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniquePaths(paths: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const path of paths) {
    const normalized = resolve(path);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function getAgentRoot(): string {
  if (isProduction()) return PRODUCTION_AGENT_ROOT;

  const override = process.env.UNIXSEE_AGENT_ROOT?.trim();
  return resolve(override || process.cwd());
}

function getAgentStateDir(): string {
  if (isProduction()) return PRODUCTION_AGENT_STATE_DIR;

  const override = process.env.UNIXSEE_AGENT_STATE_DIR?.trim();
  return resolve(override || join(getAgentRoot(), "state"));
}

export function getAgentStateFilePath(fileName: string): string {
  assertSimpleFileName(fileName);
  const stateDir = getAgentStateDir();
  const path = resolve(stateDir, fileName);
  assertWithin(stateDir, path, "Agent state");
  return path;
}

export async function readAgentStateFile(
  fileName: string,
): Promise<string | null> {
  const path = getAgentStateFilePath(fileName);

  try {
    return await readFile(path, "utf8");
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    if (code === "ENOENT") return null;
    throw error;
  }
}

export async function writeAgentStateFileAtomic(
  fileName: string,
  content: string,
): Promise<void> {
  const targetPath = getAgentStateFilePath(fileName);
  const stateDir = dirname(targetPath);
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  const tempFileName = `${fileName}.${process.pid}.${Date.now()}.tmp`;
  const tempPath = getAgentStateFilePath(tempFileName);

  try {
    await writeFile(tempPath, content, {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(tempPath, targetPath);
    await chmod(targetPath, 0o600).catch(() => undefined);
  } catch (error) {
    await unlink(tempPath).catch(() => undefined);
    throw error;
  }
}

/**
 * Create an agent-owned state file exactly once. Returns false when another
 * process already created the file. The target path is still constrained to a
 * simple filename inside the agent state directory.
 */
export async function createAgentStateFileIfAbsent(
  fileName: string,
  content: string,
): Promise<boolean> {
  const targetPath = getAgentStateFilePath(fileName);
  const stateDir = dirname(targetPath);
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(targetPath, "wx", 0o600);
    await handle.writeFile(content, { encoding: "utf8" });
    await handle.sync();
    await handle.close();
    handle = undefined;
    await chmod(targetPath, 0o600).catch(() => undefined);
    return true;
  } catch (error: unknown) {
    if (handle) {
      await handle.close().catch(() => undefined);
    }

    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";

    if (code === "EEXIST") return false;
    throw error;
  }
}

function getAgentEnvironmentPath(): string {
  const root = getAgentRoot();
  const path = resolve(root, AGENT_ENV_FILE_NAME);
  assertWithin(root, path, "Agent environment");
  return path;
}

export async function readAgentEnvironmentFile(): Promise<string> {
  const path = getAgentEnvironmentPath();
  try {
    return await readFile(path, "utf8");
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    if (code === "ENOENT") return "";
    throw error;
  }
}

export async function writeAgentEnvironmentFileAtomic(
  content: string,
): Promise<void> {
  const targetPath = getAgentEnvironmentPath();
  const root = dirname(targetPath);
  await mkdir(root, { recursive: true, mode: 0o700 });

  const tempPath = resolve(root, `.env.tmp-${process.pid}`);
  assertWithin(root, tempPath, "Agent environment");

  try {
    await writeFile(tempPath, content, { encoding: "utf8", mode: 0o600 });
    await rename(tempPath, targetPath);
    await chmod(targetPath, 0o600).catch(() => undefined);
  } catch (error) {
    await unlink(tempPath).catch(() => undefined);
    throw error;
  }
}

function getOlsRoutingPaths(kind: OpenLiteSpeedRoutingConfigKind): {
  confRoot: string;
  paths: string[];
} {
  const serverRoot = resolve(getConfig().openLiteSpeedServerRoot);
  const confRoot = resolve(serverRoot, "conf");

  const configured = splitConfiguredPaths(
    kind === "listener"
      ? process.env.OPENLITESPEED_LISTENER_PATHS
      : process.env.OPENLITESPEED_VHOST_DECLARATION_PATHS,
  );

  const defaults =
    kind === "listener"
      ? [join(confRoot, "listeners.conf"), join(confRoot, "httpd_config.conf")]
      : [join(confRoot, "httpd-vhosts.conf"), join(confRoot, "httpd_config.conf")];

  const paths = uniquePaths(configured.length > 0 ? configured : defaults);

  // Production may only read explicit files inside the configured OLS conf/
  // tree. Tests/development may point to fixtures outside that tree.
  if (isProduction()) {
    for (const path of paths) {
      assertWithin(confRoot, path, "OpenLiteSpeed routing config");
    }
  }

  return { confRoot, paths };
}

export async function readOpenLiteSpeedRoutingConfigs(
  kind: OpenLiteSpeedRoutingConfigKind,
): Promise<OpenLiteSpeedRoutingConfigReadResult> {
  const { confRoot, paths } = getOlsRoutingPaths(kind);
  const contents: string[] = [];
  const failures: string[] = [];

  for (const path of paths) {
    try {
      if (isProduction()) {
        await assertNoSymlinkEscape(confRoot, path, "OpenLiteSpeed routing config");
      }
      contents.push(await readFile(path, "utf8"));
    } catch (error: unknown) {
      if (error instanceof FilesystemBoundaryError) throw error;
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code ?? "unknown")
          : "unknown";
      failures.push(`${path} (${code})`);
    }
  }

  return {
    contents,
    checkedPaths: paths,
    failures,
  };
}

function normalizeLogDomain(domain: string): string {
  const normalized = domain.trim().toLowerCase().replace(/\.$/, "");
  if (
    !normalized ||
    normalized.includes("/") ||
    normalized.includes("\\") ||
    normalized.includes("..") ||
    normalized.includes(":") ||
    !/^[a-z0-9.-]+$/i.test(normalized)
  ) {
    throw new FilesystemBoundaryError(
      `Access-log domain is not a safe mapped hostname: ${domain}`,
    );
  }
  return normalized;
}

function getAccessLogPath(domain: string): string {
  const safeDomain = normalizeLogDomain(domain);
  const logDir = resolve(getConfig().accessLogDir);
  const path = resolve(logDir, `${safeDomain}.log`);
  assertWithin(logDir, path, "OpenLiteSpeed access log");
  return path;
}

export async function statAccessLog(domain: string): Promise<AccessLogStat> {
  const path = getAccessLogPath(domain);
  const logDir = resolve(getConfig().accessLogDir);
  await assertNoSymlinkEscape(logDir, path, "OpenLiteSpeed access log");
  const fileStats = await stat(path);
  return {
    size: fileStats.size,
    inode: Number(fileStats.ino),
  };
}

export async function readAccessLogRange(
  domain: string,
  start: number,
  endExclusive: number,
): Promise<string> {
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(endExclusive) ||
    start < 0 ||
    endExclusive < start
  ) {
    throw new FilesystemBoundaryError("Invalid access-log byte range.");
  }

  const length = endExclusive - start;
  if (length === 0) return "";

  const path = getAccessLogPath(domain);
  const logDir = resolve(getConfig().accessLogDir);
  await assertNoSymlinkEscape(logDir, path, "OpenLiteSpeed access log");
  const handle = await open(path, "r");
  try {
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buffer, 0, length, start);
    return buffer.subarray(0, bytesRead).toString("utf8");
  } finally {
    await handle.close();
  }
}

export function watchAccessLog(
  domain: string,
  onChange: () => void,
): AccessLogWatchHandle {
  const path = getAccessLogPath(domain);
  const logDir = resolve(getConfig().accessLogDir);
  assertNoSymlinkEscapeSync(logDir, path, "OpenLiteSpeed access log");
  const watcher: FSWatcher = watch(path, onChange);
  return {
    close() {
      watcher.close();
    },
  };
}
