"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { OverlayScrollbars } from "overlayscrollbars";

import { useLightHeaderStore } from "@/providers/light-header-provider";

function useSyncCssVarFromElementHeight(
  selector: string,
  cssVar: string,
  active: boolean,
  routeKey: string,
) {
  useLayoutEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const write = (height: number) =>
      root.style.setProperty(cssVar, `${height}px`);

    let observedElement: HTMLElement | null = null;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const height =
        entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      write(height);
    });

    const syncObservedElement = () => {
      const nextElement = document.querySelector<HTMLElement>(selector);
      if (nextElement === observedElement) return;

      if (observedElement) {
        resizeObserver.unobserve(observedElement);
      }

      observedElement = nextElement;

      if (!observedElement) {
        root.style.removeProperty(cssVar);
        return;
      }

      write(observedElement.getBoundingClientRect().height);
      resizeObserver.observe(observedElement);
    };

    syncObservedElement();

    const mutationObserver = new MutationObserver(syncObservedElement);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      root.style.removeProperty(cssVar);
    };
  }, [selector, cssVar, active, routeKey]);
}

interface AppScrollbarProps {
  headerSelector?: string;
  footerSelector?: string;
}

export function AppScrollbar({
  headerSelector = "header[data-app-header=true]",
  footerSelector = "footer[data-app-footer=true]",
}: AppScrollbarProps) {
  const [fontsReady, setFontsReady] = useState(false);
  const pathname = usePathname();

  const instanceRef = useRef<ReturnType<typeof OverlayScrollbars> | null>(null);

  const isHeaderLight = useLightHeaderStore((state) => state.isLight);

  useSyncCssVarFromElementHeight(
    headerSelector,
    "--os-header-height",
    fontsReady,
    pathname,
  );
  useSyncCssVarFromElementHeight(
    footerSelector,
    "--os-footer-height",
    fontsReady,
    pathname,
  );

  useEffect(() => {
    if (!instanceRef.current) return;

    const { scrollbarHorizontal, scrollbarVertical } =
      instanceRef.current?.elements();

    if (isHeaderLight) {
      scrollbarVertical.scrollbar.classList.remove("dark");
      scrollbarHorizontal.scrollbar.classList.remove("dark");
    } else {
      scrollbarVertical.scrollbar.classList.add("dark");
      scrollbarHorizontal.scrollbar.classList.add("dark");
    }
  }, [instanceRef, isHeaderLight]);

  useLayoutEffect(() => {
    const isTouchDevice = !matchMedia("(hover: hover) and (pointer: fine)")
      .matches;

    if (isTouchDevice) {
      document.documentElement.removeAttribute(
        "data-overlayscrollbars-initialize",
      );
      document.body.removeAttribute("data-overlayscrollbars-initialize");
      return;
    }

    let cancelled = false;

    let addScrollReadyHandlerTimeout: NodeJS.Timeout;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      setFontsReady(true);
      addScrollReadyHandlerTimeout = setTimeout(() => {
        document.documentElement.setAttribute("data-scrollbar-ready", "true");
      }, 800);
    });

    return () => {
      clearTimeout(addScrollReadyHandlerTimeout);
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const isTouchDevice = !matchMedia("(hover: hover) and (pointer: fine)")
      .matches;
    if (isTouchDevice) {
      document.documentElement.removeAttribute(
        "data-overlayscrollbars-initialize",
      );
      document.body.removeAttribute("data-overlayscrollbars-initialize");
      return;
    }

    document.documentElement.setAttribute(
      "data-overlayscrollbars-initialize",
      "true",
    );
    document.body.setAttribute("data-overlayscrollbars-initialize", "true");

    instanceRef.current = OverlayScrollbars(document.body, {
      scrollbars: {
        theme: "os-theme-app",
        visibility: "auto",
        autoHide: "never",
        autoHideSuspend: true,
        dragScroll: true,
        clickScroll: true,
      },
    });

    const { scrollbarHorizontal, scrollbarVertical } =
      instanceRef.current.elements();

    const addDraggingHandler = () => {
      document.documentElement.classList.add("os-dragging");
    };

    const removeDraggingHandler = () => {
      document.documentElement.classList.remove("os-dragging");
    };

    [scrollbarHorizontal.handle, scrollbarVertical.handle].forEach((handle) => {
      handle.addEventListener("pointerdown", addDraggingHandler);
    });

    window.addEventListener("pointerup", removeDraggingHandler);

    return () => {
      instanceRef.current?.destroy();
      document.documentElement.removeAttribute("data-scrollbar-ready");
      [scrollbarHorizontal.handle, scrollbarVertical.handle].forEach(
        (handle) => {
          handle.removeEventListener("pointerdown", addDraggingHandler);
        },
      );
      window.removeEventListener("pointerup", removeDraggingHandler);
    };
  }, []);

  return null;
}
