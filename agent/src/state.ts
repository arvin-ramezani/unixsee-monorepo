import { randomUUID } from "node:crypto";
import { constants, promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import type { FilesystemPolicy } from "./filesystem-policy.js";

export async function atomicWrite(
  path: string,
  data: string,
  policy: FilesystemPolicy,
): Promise<void> {
  const target = policy.assertStatePath(path);
  await fs.mkdir(dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  policy.assertStatePath(temporary);
  await fs.writeFile(temporary, data, { mode: 0o600, flag: "wx" });
  await fs.rename(temporary, target);
  await fs.chmod(target, 0o600);
}

export async function readJson<T>(
  path: string,
  policy: FilesystemPolicy,
): Promise<T | null> {
  try {
    return JSON.parse(
      await fs.readFile(policy.assertStatePath(path), "utf8"),
    ) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function writeJson(
  path: string,
  value: unknown,
  policy: FilesystemPolicy,
): Promise<void> {
  await atomicWrite(path, JSON.stringify(value), policy);
}

export async function loadOrCreateAgentInstanceId(
  stateDir: string,
  policy: FilesystemPolicy,
): Promise<string> {
  const path = policy.assertStatePath(join(stateDir, "agent-instance-id"));
  try {
    const value = (await fs.readFile(path, "utf8")).trim();
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      )
    )
      throw new Error("Invalid persisted agent instance UUID.");
    return value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const value = randomUUID();
    await atomicWrite(path, `${value}\n`, policy);
    return value;
  }
}
