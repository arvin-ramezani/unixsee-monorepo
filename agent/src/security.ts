import { createHmac, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { FilesystemPolicy } from "./filesystem-policy.js";
import { atomicWrite } from "./state.js";

export function generatePayloadSignature(
  payload: string,
  secretKey: string,
  timestamp: string,
): string {
  return createHmac("sha256", secretKey)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
}
export function verifyPayloadSignature(
  payload: string,
  secretKey: string,
  timestamp: string,
  signature: string,
): boolean {
  const expected = Buffer.from(
    generatePayloadSignature(payload, secretKey, timestamp),
    "hex",
  );
  const actual = Buffer.from(signature, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
const secretPath = (stateDir: string, policy: FilesystemPolicy) =>
  policy.assertStatePath(join(stateDir, "agent-secret"));
export async function persistAgentSecret(
  secret: string,
  stateDir: string,
  policy: FilesystemPolicy,
): Promise<void> {
  await atomicWrite(secretPath(stateDir, policy), `${secret}\n`, policy);
}
export async function loadAgentSecret(
  stateDir: string,
  policy: FilesystemPolicy,
): Promise<string | null> {
  try {
    return (
      (await fs.readFile(secretPath(stateDir, policy), "utf8")).trim() || null
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function clearPersistedAgentSecret(
  stateDir: string,
  policy: FilesystemPolicy,
): Promise<void> {
  try {
    await fs.unlink(secretPath(stateDir, policy));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
