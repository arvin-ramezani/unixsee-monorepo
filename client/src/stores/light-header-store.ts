import { createStore } from "zustand/vanilla";

export type HeaderTone = "pending" | "theme" | "light" | "dark";

type LightHeaderState = {
  tone: HeaderTone;
  isLight: boolean;
};

export type LightHeaderActions = {
  setLight: (light: boolean) => void;
  setTone: (tone: HeaderTone) => void;
};

export type LightHeaderStore = LightHeaderState & LightHeaderActions;

export const defaultInitState: LightHeaderState = {
  tone: "pending",
  isLight: false,
};

export const getInitialLightHeaderState = (
  pathname?: string | null,
): LightHeaderState => {
  if (isHomePath(pathname)) {
    return defaultInitState;
  }

  return { tone: "theme", isLight: true };
};

export const getNavigationLightHeaderState = (
  pathname?: string | null,
): LightHeaderState => {
  const initState = getInitialLightHeaderState(pathname);

  if (initState.tone === "pending") {
    return { tone: "dark", isLight: false };
  }

  return initState;
};

export const createLightHeaderStore = (
  initState: LightHeaderState = defaultInitState,
) => {
  return createStore<LightHeaderStore>()((set) => ({
    ...initState,
    setLight: (light: boolean) =>
      set({ isLight: light, tone: light ? "light" : "dark" }),
    setTone: (tone: HeaderTone) =>
      set({ tone, isLight: tone === "theme" || tone === "light" }),
  }));
};

function isHomePath(pathname?: string | null) {
  if (!pathname) {
    return false;
  }

  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized === "/" || normalized === "/en" || normalized === "/fa";
}
