/** Shared mock latency for UI-only auth submits. */
export const AUTH_MOCK_DELAY_MS = 700;

export function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function translateFormError(
  translate: (key: string) => string,
  message?: string,
) {
  if (!message) return undefined;
  return translate(message);
}
