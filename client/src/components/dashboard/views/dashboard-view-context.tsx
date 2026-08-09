"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DashboardView = "table" | "grid";

interface DashboardViewContextValue {
  view: DashboardView;
  setView: (view: DashboardView) => void;
  toggleView: () => void;
}

const DashboardViewContext = createContext<DashboardViewContextValue | null>(
  null,
);

/**
 * Remembers the user's last chosen list presentation across shell re-mounts,
 * mirroring the sidebar-collapsed preference pattern. Module-level so it is not
 * lost between client navigations within the dashboard.
 */
let viewPreference: DashboardView = "table";

/**
 * Shares the table/grid preference between the global header toggle and the
 * list content rendered in the page body. Only the presentation flips — each
 * list keeps its own data, filters, and pagination.
 */
export function DashboardViewProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<DashboardView>(() => viewPreference);

  const setView = useCallback((next: DashboardView) => {
    viewPreference = next;
    setViewState(next);
  }, []);

  const toggleView = useCallback(() => {
    setViewState((current) => {
      const next = current === "table" ? "grid" : "table";
      viewPreference = next;
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ view, setView, toggleView }),
    [view, setView, toggleView],
  );

  return (
    <DashboardViewContext.Provider value={value}>
      {children}
    </DashboardViewContext.Provider>
  );
}

/**
 * Reads the shared dashboard view. Returns a safe fallback ("table", no-op
 * setters) when used outside a provider so isolated component previews and
 * tests still render.
 */
export function useDashboardView(): DashboardViewContextValue {
  const context = useContext(DashboardViewContext);
  if (context) return context;
  return {
    view: "table",
    setView: () => {},
    toggleView: () => {},
  };
}
