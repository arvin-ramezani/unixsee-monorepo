import { resolve, sep } from "node:path";

const FORBIDDEN = [
  "/etc/machine-id",
  "/etc/passwd",
  "/proc",
  "/usr/local/directadmin",
  "/home",
];
const normalize = (path: string) => resolve(path).replaceAll("\\", "/");

export class FilesystemPolicy {
  private readonly stateRoot: string;
  private readonly logRoot: string;
  private readonly routing: Set<string>;

  constructor(input: {
    stateDir: string;
    accessLogDir: string;
    routingFiles: string[];
  }) {
    this.stateRoot = normalize(input.stateDir);
    this.logRoot = normalize(input.accessLogDir);
    this.routing = new Set(input.routingFiles.map(normalize));
  }

  private rejectForbidden(path: string): void {
    const raw = path.replaceAll("\\", "/");
    if (
      FORBIDDEN.some(
        (item) =>
          raw === item ||
          raw.startsWith(`${item}/`) ||
          raw.includes(`/../${item.slice(1)}`),
      )
    )
      throw new Error(`Filesystem policy rejected forbidden path: ${raw}`);
    if (FORBIDDEN.some((item) => path === item || path.startsWith(`${item}/`)))
      throw new Error(`Filesystem policy rejected forbidden path: ${path}`);
  }

  assertStatePath(path: string): string {
    this.rejectForbidden(path);
    const normalized = normalize(path);
    this.rejectForbidden(normalized);
    if (
      normalized !== this.stateRoot &&
      !normalized.startsWith(`${this.stateRoot}/`)
    )
      throw new Error("State path escaped agent state directory.");
    return normalized;
  }

  assertRoutingFile(path: string): string {
    this.rejectForbidden(path);
    const normalized = normalize(path);
    this.rejectForbidden(normalized);
    if (!this.routing.has(normalized))
      throw new Error("Routing file was not selected by the installer.");
    return normalized;
  }

  accessLogPath(domain: string): string {
    const canonical = domain.toLowerCase();
    if (
      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(
        canonical,
      )
    )
      throw new Error("Invalid domain for access-log lookup.");
    const result = normalize(`${this.logRoot}${sep}${canonical}.log`);
    this.rejectForbidden(result);
    if (!result.startsWith(`${this.logRoot}/`))
      throw new Error("Access-log path escaped approved directory.");
    return result;
  }
}
