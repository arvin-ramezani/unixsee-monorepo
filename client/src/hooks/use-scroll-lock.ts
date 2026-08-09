"use client";

import * as React from "react";

import { useScrollLockedStore } from "@/providers/scroll-lock-store-provider";

export function useScrollLock(active: boolean, id?: string) {
  const reactId = React.useId();
  const lockId = id ?? reactId;

  const lock = useScrollLockedStore((state) => state.lock);
  const unlock = useScrollLockedStore((state) => state.unlock);

  React.useEffect(() => {
    if (!active) {
      unlock(lockId);
      return;
    }

    lock(lockId);

    return () => {
      unlock(lockId);
    };
  }, [active, lockId, lock, unlock]);
}
