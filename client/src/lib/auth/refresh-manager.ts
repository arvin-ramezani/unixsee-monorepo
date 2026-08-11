let refreshPromise: Promise<string | null> | null = null;

export async function executeRefreshOperation(
  refreshCallback: () => Promise<string | null>,
) {
  if (!refreshPromise) {
    refreshPromise = refreshCallback().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
