import { createHmac } from "node:crypto";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";

export const AGENT_SECRET_ENV_KEY = "AGENT_SECRET";

export function generatePayloadSignature(
  payloadString: string,
  secretKey: string,
  timestamp: string,
): string {
  const dataToSign = `${timestamp}.${payloadString}`;

  return createHmac("sha256", secretKey).update(dataToSign).digest("hex");
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
    const shouldAppendLeadingNewLine =
      nextLines.length > 0 && nextLines[nextLines.length - 1] !== "";

    if (shouldAppendLeadingNewLine) {
      nextLines.push("");
    }

    nextLines.push(`${key}=${escapedValue}`);
  }

  return `${nextLines.join("\n").replace(/\n+$/, "")}\n`;
}

export async function persistAgentSecret(secretKey: string): Promise<void> {
  const environmentFilePath = join(process.cwd(), ".env");
  await fs.mkdir(dirname(environmentFilePath), { recursive: true });

  const existingContent = await fs
    .readFile(environmentFilePath, "utf-8")
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return "";
      }

      throw error;
    });

  const nextContent = upsertEnvironmentVariableContent(
    existingContent,
    AGENT_SECRET_ENV_KEY,
    secretKey,
  );

  const temporaryFilePath = `${environmentFilePath}.tmp-${process.pid}`;

  await fs.writeFile(temporaryFilePath, nextContent, { mode: 0o600 });
  await fs.rename(temporaryFilePath, environmentFilePath);
  await fs.chmod(environmentFilePath, 0o600);
}
