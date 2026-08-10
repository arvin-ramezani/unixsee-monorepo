import { createHmac } from "node:crypto";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";

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

async function readEnvFile(environmentFilePath: string): Promise<string> {
  return fs.readFile(environmentFilePath, "utf-8").catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return "";
      }
      throw error;
    },
  );
}

async function writeEnvFile(
  environmentFilePath: string,
  nextContent: string,
): Promise<void> {
  await fs.mkdir(dirname(environmentFilePath), { recursive: true });
  const temporaryFilePath = `${environmentFilePath}.tmp-${process.pid}`;
  await fs.writeFile(temporaryFilePath, nextContent, { mode: 0o600 });
  await fs.rename(temporaryFilePath, environmentFilePath);
  await fs.chmod(environmentFilePath, 0o600);
}

export async function persistAgentSecret(
  secretKey: string,
  cwd: string = process.cwd(),
): Promise<void> {
  const environmentFilePath = join(cwd, ".env");
  const existingContent = await readEnvFile(environmentFilePath);
  const nextContent = upsertEnvironmentVariableContent(
    existingContent,
    AGENT_SECRET_ENV_KEY,
    secretKey,
  );
  await writeEnvFile(environmentFilePath, nextContent);
}

export async function clearPersistedAgentSecret(
  cwd: string = process.cwd(),
): Promise<void> {
  const environmentFilePath = join(cwd, ".env");
  const existingContent = await readEnvFile(environmentFilePath);
  if (!existingContent) {
    return;
  }
  const nextContent = removeEnvironmentVariableContent(
    existingContent,
    AGENT_SECRET_ENV_KEY,
  );
  await writeEnvFile(environmentFilePath, nextContent);
}
