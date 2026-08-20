import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SOURCE_DIR = dirname(fileURLToPath(import.meta.url));

async function collectRuntimeTypeScriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRuntimeTypeScriptFiles(path)));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".spec.ts")) {
      continue;
    }
    files.push(path);
  }

  return files;
}

describe("runtime filesystem boundary", () => {
  it("keeps all direct filesystem imports inside the positive allowlist layer", async () => {
    const files = await collectRuntimeTypeScriptFiles(join(SOURCE_DIR, ".."));
    const violations: string[] = [];

    for (const path of files) {
      const normalized = path.replace(/\\/g, "/");
      if (normalized.endsWith("/security/filesystem.ts")) continue;

      const source = await readFile(path, "utf8");
      if (/from\s+["']node:fs(?:\/promises)?["']/.test(source)) {
        violations.push(normalized);
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not allow runtime child_process imports", async () => {
    const files = await collectRuntimeTypeScriptFiles(join(SOURCE_DIR, ".."));
    const violations: string[] = [];

    for (const path of files) {
      const source = await readFile(path, "utf8");
      if (/from\s+["']node:child_process["']/.test(source)) {
        violations.push(path.replace(/\\/g, "/"));
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not reintroduce host machine-id paths anywhere in runtime source", async () => {
    const files = await collectRuntimeTypeScriptFiles(join(SOURCE_DIR, ".."));
    const violations: string[] = [];

    for (const path of files) {
      const source = await readFile(path, "utf8");
      if (/\/etc\/machine-id|\/var\/lib\/dbus\/machine-id/.test(source)) {
        violations.push(path.replace(/\\/g, "/"));
      }
    }

    expect(violations).toEqual([]);
  });
});
