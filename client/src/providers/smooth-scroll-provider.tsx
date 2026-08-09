"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { PropsWithChildren, useEffect, useLayoutEffect } from "react";

import { useScrollLockedStore } from "./scroll-lock-store-provider";
import { selectIsScrollLocked } from "@/stores/scroll-lock-store";

import "lenis/dist/lenis.css";

function hasVisibleScrollbar() {
  if (typeof window === "undefined") return false;

  const root = document.documentElement;

  /**
   * On desktop browsers with classic scrollbars:
   * window.innerWidth > root.clientWidth
   */
  const scrollbarWidth = window.innerWidth - root.clientWidth;

  return scrollbarWidth > 0;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function SmoothScrollLockBridge() {
  const lenis = useLenis();
  const isScrollLocked = useScrollLockedStore(selectIsScrollLocked);

  useIsomorphicLayoutEffect(() => {
    if (!lenis) return;

    const root = document.documentElement;

    if (isScrollLocked) {
      if (hasVisibleScrollbar()) {
        root.dataset.scrollLocked = "true";
      } else {
        root.removeAttribute("data-scroll-locked");
      }

      lenis.stop();

      return () => {
        root.removeAttribute("data-scroll-locked");
      };
    }

    lenis.start();
    root.removeAttribute("data-scroll-locked");

    return () => {
      root.removeAttribute("data-scroll-locked");
    };
  }, [lenis, isScrollLocked]);

  return null;
}

export type SmoothScrollProviderType = PropsWithChildren;

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderType) {
  return (
    <>
      <ReactLenis
        root
        options={{
          autoRaf: true,
          wheelMultiplier: 1.7,
          lerp: 0.15,
          smoothWheel: true,
        }}
      />

      <SmoothScrollLockBridge />

      {children}
    </>
  );
}

// "use client";

// import { ReactLenis } from "lenis/react";
// import { PropsWithChildren } from "react";

// import "lenis/dist/lenis.css";

// export type SmoothScrollProviderType = PropsWithChildren;

// export default function SmoothScrollProvider({
//   children,
// }: SmoothScrollProviderType) {
//   return (
//     <>
//       <ReactLenis
//         root
//         options={{
//           autoRaf: true,
//           wheelMultiplier: 1.7,
//           lerp: 0.15,
//           smoothWheel: true,
//         }}
//       />

//       {children}
//     </>
//   );
// }
