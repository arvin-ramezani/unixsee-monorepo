export interface PeriodicSchedulerOptions {
  name: string;
  intervalMs: number;
  task: () => Promise<void>;
  onSkippedOverlap?: (name: string) => void;
}

export interface PeriodicSchedulerHandle {
  start: () => void;
  trigger: () => Promise<void>;
  stop: () => void;
  isRunning: () => boolean;
  isStarted: () => boolean;
}

/**
 * Small non-overlapping interval scheduler.
 *
 * Each Phase 1 responsibility owns its own instance so a slow task in one loop
 * cannot serialize heartbeat, discovery, traffic, or stack work. If one task
 * takes longer than its own interval, only that scheduler skips the overlapping
 * tick.
 */
export function createPeriodicScheduler(
  options: PeriodicSchedulerOptions,
): PeriodicSchedulerHandle {
  if (!Number.isFinite(options.intervalMs) || options.intervalMs <= 0) {
    throw new Error(
      `Invalid interval for scheduler ${options.name}: ${options.intervalMs}`,
    );
  }

  let timer: ReturnType<typeof setInterval> | null = null;
  let running: Promise<void> | null = null;
  let stopped = false;

  async function trigger(): Promise<void> {
    if (stopped) return;

    if (running) {
      options.onSkippedOverlap?.(options.name);
      return;
    }

    running = (async () => {
      try {
        await options.task();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Scheduler:${options.name}] Task failed: ${message}`);
      }
    })();

    try {
      await running;
    } finally {
      running = null;
    }
  }

  function start(): void {
    if (stopped || timer) return;

    timer = setInterval(() => {
      void trigger();
    }, options.intervalMs);
  }

  function stop(): void {
    stopped = true;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  return {
    start,
    trigger,
    stop,
    isRunning: () => running !== null,
    isStarted: () => timer !== null,
  };
}
