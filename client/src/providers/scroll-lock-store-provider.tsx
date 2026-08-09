"use client";

import {
  createScrollLockedStore,
  ScrollLockedStore,
} from "@/stores/scroll-lock-store";
import { type ReactNode, createContext, useState, useContext } from "react";
import { useStore } from "zustand";

export type ScrollLockedStoreApi = ReturnType<typeof createScrollLockedStore>;

export const ScrollLockedStoreContext = createContext<
  ScrollLockedStoreApi | undefined
>(undefined);

export interface ScrollLockedStoreProviderProps {
  children: ReactNode;
}

export const ScrollLockedStoreProvider = ({
  children,
}: ScrollLockedStoreProviderProps) => {
  const [store] = useState(() => createScrollLockedStore());
  return (
    <ScrollLockedStoreContext.Provider value={store}>
      {children}
    </ScrollLockedStoreContext.Provider>
  );
};

export const useScrollLockedStore = <T,>(
  selector: (store: ScrollLockedStore) => T,
): T => {
  const scrollLockedStoreContext = useContext(ScrollLockedStoreContext);
  if (!scrollLockedStoreContext) {
    throw new Error(
      `useScrollLockedStore must be used within ScrollLockedStoreProvider`,
    );
  }

  return useStore(scrollLockedStoreContext, selector);
};
