import { createStore } from "zustand/vanilla";

type ScrollLockedState = {
  locks: Record<string, true>;
};

export type ScrollLockedActions = {
  lock: (id: string) => void;
  unlock: (id: string) => void;
  clear: () => void;
};

export type ScrollLockedStore = ScrollLockedState & ScrollLockedActions;

export const defaultInitState: ScrollLockedState = {
  locks: {},
};

export const createScrollLockedStore = (
  initState: ScrollLockedState = defaultInitState,
) => {
  return createStore<ScrollLockedStore>()((set) => ({
    ...initState,

    lock: (id) =>
      set((state) => ({
        locks: {
          ...state.locks,
          [id]: true,
        },
      })),

    unlock: (id) =>
      set((state) => {
        const nextLocks = { ...state.locks };
        delete nextLocks[id];

        return {
          locks: nextLocks,
        };
      }),

    clear: () => set({ locks: {} }),
  }));
};

export function selectIsScrollLocked(state: ScrollLockedStore) {
  return Object.keys(state.locks).length > 0;
}
