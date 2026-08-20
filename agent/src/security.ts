import { createHmac } from "node:crypto";

import {
  readAgentEnvironmentFile,
  writeAgentEnvironmentFileAtomic,
} from "./security/filesystem.js";

export const AGENT_SECRET_ENV_KEY = "AGENT_SECRET";

export function generatePayloadSignature(
  payloadString: string,
  secretKey: string,
  timestamp: string,
): string {
  return createHmac("sha256", secretKey)
    .update(`${timestamp}.${payloadString}`)
    .digest("hex");
}

function escapeEnvironmentValue(value: string): string {
  if (/^[A-Za-z0-9_./:@+=-]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}

function upsertEnvironmentVariableContent(
  content: string,
  key: string,
  value: string,
): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");
  const escapedValue = escapeEnvironmentValue(value);
  const variablePattern = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`);
  let wasUpdated = false;

  const nextLines = lines.map((line) => {
    if (!variablePattern.test(line)) {
      return line;
    }
    wasUpdated = true;
    return `${key}=${escapedValue}`;
  });

  if (!wasUpdated) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== "") {
      nextLines.push("");
    }
    nextLines.push(`${key}=${escapedValue}`);
  }

  return `${nextLines.join("\n").replace(/\n+$/, "")}\n`;
}

function removeEnvironmentVariableContent(content: string, key: string): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const variablePattern = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`);
  const nextLines = normalizedContent
    .split("\n")
    .filter((line) => !variablePattern.test(line));
  return `${nextLines.join("\n").replace(/\n+$/, "")}\n`;
}

export async function persistAgentSecret(secretKey: string): Promise<void> {
  const existingContent = await readAgentEnvironmentFile();
  const nextContent = upsertEnvironmentVariableContent(
    existingContent,
    AGENT_SECRET_ENV_KEY,
    secretKey,
  );
  await writeAgentEnvironmentFileAtomic(nextContent);
}

export async function clearPersistedAgentSecret(): Promise<void> {
  const existingContent = await readAgentEnvironmentFile();
  if (!existingContent) {
    return;
  }
  const nextContent = removeEnvironmentVariableContent(
    existingContent,
    AGENT_SECRET_ENV_KEY,
  );
  await writeAgentEnvironmentFileAtomic(nextContent);
}
