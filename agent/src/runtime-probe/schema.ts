import type { RuntimeProbeResponse } from "./types.js";

const REQUIRED_KEYS = new Set([
  "wordpressVersion",
  "phpVersion",
  "imagickVersion",
  "checkedAt",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isVersionOrNull(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return false;

  // Exact PHP/WordPress/Imagick versions can include prerelease/build suffixes.
  // Keep the accepted alphabet intentionally small so the local endpoint cannot
  // smuggle arbitrary text into agent/backend logs or UI fields.
  return /^[0-9][0-9A-Za-z.+_~:-]*(?:-[0-9A-Za-z.+_~:-]+)*$/.test(trimmed);
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

export function parseRuntimeProbeResponse(
  value: unknown,
): RuntimeProbeResponse | null {
  if (!isRecord(value)) return null;

  const keys = Object.keys(value);
  if (
    keys.length !== REQUIRED_KEYS.size ||
    keys.some((key) => !REQUIRED_KEYS.has(key))
  ) {
    return null;
  }

  if (!isVersionOrNull(value.wordpressVersion)) return null;
  if (!isVersionOrNull(value.phpVersion)) return null;
  if (!isVersionOrNull(value.imagickVersion)) return null;
  if (!isIsoTimestamp(value.checkedAt)) return null;

  return {
    wordpressVersion:
      typeof value.wordpressVersion === "string"
        ? value.wordpressVersion.trim()
        : null,
    phpVersion:
      typeof value.phpVersion === "string" ? value.phpVersion.trim() : null,
    imagickVersion:
      typeof value.imagickVersion === "string"
        ? value.imagickVersion.trim()
        : null,
    checkedAt: value.checkedAt,
  };
}
