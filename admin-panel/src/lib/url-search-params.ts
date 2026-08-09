export function readEnumParam<T extends string>(
  value: string | string[] | undefined,
  allowed: ReadonlySet<T> | ReadonlyArray<T>,
): T | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;

  const allowedSet = allowed instanceof Set ? allowed : new Set(allowed);
  return allowedSet.has(raw as T) ? (raw as T) : undefined;
}
