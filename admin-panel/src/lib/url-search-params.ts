export function readEnumParam<T extends string>(
  value: string | string[] | undefined,
  allowed: ReadonlySet<T> | ReadonlyArray<T>,
): T | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;

  const allowedSet = allowed instanceof Set ? allowed : new Set(allowed);
  return allowedSet.has(raw as T) ? (raw as T) : undefined;
}

export function readStringParam(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw.trim() : undefined;
}

/** Same-origin app path only. Rejects protocol-relative and external URLs. */
export function readSafeInternalPath(
  value: string | string[] | undefined,
): string | null {
  const raw = readStringParam(value);
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.includes("://")) return null;
  return raw;
}
