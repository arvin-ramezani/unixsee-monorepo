"use client";

import {
  createLightHeaderStore,
  getInitialLightHeaderState,
  getNavigationLightHeaderState,
  LightHeaderStore,
} from "@/stores/light-header-store";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useStore } from "zustand";

export type LightHeaderStoreApi = ReturnType<typeof createLightHeaderStore>;

export const LightHeaderStoreContext = createContext<
  LightHeaderStoreApi | undefined
>(undefined);

export interface LightHeaderStoreProviderProps {
  children: ReactNode;
}

export const LightHeaderStoreProvider = ({
  children,
}: LightHeaderStoreProviderProps) => {
  const pathname = usePathname();
  const [store] = useState(() =>
    createLightHeaderStore(getInitialLightHeaderState(pathname)),
  );
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;
    store.setState(getNavigationLightHeaderState(pathname));
  }, [pathname, store]);

  return (
    <LightHeaderStoreContext.Provider value={store}>
      {children}
    </LightHeaderStoreContext.Provider>
  );
};

export const useLightHeaderStore = <T,>(
  selector: (store: LightHeaderStore) => T,
): T => {
  const lightHeaderStoreContext = useContext(LightHeaderStoreContext);
  if (!lightHeaderStoreContext) {
    throw new Error(
      `useLightHeaderStore must be used within LightHeaderStoreProvider`,
    );
  }

  return useStore(lightHeaderStoreContext, selector);
};
