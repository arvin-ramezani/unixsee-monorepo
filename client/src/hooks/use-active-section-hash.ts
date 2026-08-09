"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

type UseActiveSectionHashOptions = {
  /**
   * Where the active detection line should be.
   * 0.35 means 35% from top of viewport.
   */
  activationOffset?: number;

  /**
   * Useful if you have fixed/sticky header.
   */
  scrollOffset?: number;
};

export function useActiveSectionHash(
  navItems: NavItem[],
  options: UseActiveSectionHashOptions = {},
) {
  const { activationOffset = 0.35, scrollOffset = 96 } = options;

  const firstHref = navItems[0]?.href ?? "";

  const [activeHref, setActiveHref] = useState(firstHref);

  const activeHrefRef = useRef(firstHref);
  const tickingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTimerRef = useRef<number | null>(null);

  const hrefs = useMemo(() => {
    return navItems.map((item) => item.href);
  }, [navItems]);

  const getTargets = useCallback(() => {
    return hrefs
      .map((href) => {
        const element = document.getElementById(href);

        if (!element) return null;

        const rect = element.getBoundingClientRect();

        return {
          href,
          element,
          top: rect.top + window.scrollY,
        };
      })
      .filter(Boolean) as Array<{
      href: string;
      element: HTMLElement;
      top: number;
    }>;
  }, [hrefs]);

  const setActiveSection = useCallback((href: string) => {
    if (href === activeHrefRef.current) return;

    activeHrefRef.current = href;
    setActiveHref(href);
  }, []);

  const updateActiveSection = useCallback(() => {
    tickingRef.current = false;

    if (isProgrammaticScrollRef.current) return;

    const targets = getTargets();

    if (!targets.length) return;

    const activationLine =
      window.scrollY + window.innerHeight * activationOffset;

    let current = targets[0];

    for (const target of targets) {
      if (target.top <= activationLine) {
        current = target;
      } else {
        break;
      }
    }

    /**
     * Important:
     * Scroll tracking should only update React state.
     * It must not write the current section into the URL.
     */
    setActiveSection(current.href);
  }, [activationOffset, getTargets, setActiveSection]);

  const requestUpdate = useCallback(() => {
    if (tickingRef.current) return;

    tickingRef.current = true;
    window.requestAnimationFrame(updateActiveSection);
  }, [updateActiveSection]);

  const scrollToSection = useCallback(
    (href: string) => {
      const element = document.getElementById(href);

      if (!element) return;

      isProgrammaticScrollRef.current = true;

      setActiveSection(href);

      /**
       * This is the only place where this hook should write the hash.
       * It represents an intentional user navigation action.
       */
      window.history.pushState(null, "", `#${href}`);

      const targetTop =
        element.getBoundingClientRect().top + window.scrollY - scrollOffset;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });

      if (programmaticTimerRef.current) {
        window.clearTimeout(programmaticTimerRef.current);
      }

      programmaticTimerRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        requestUpdate();
      }, 900);
    },
    [requestUpdate, scrollOffset, setActiveSection],
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");

    if (hash && hrefs.includes(hash)) {
      setActiveSection(hash);
      return;
    }

    requestUpdate();
  }, [hrefs, requestUpdate, setActiveSection]);

  useEffect(() => {
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (programmaticTimerRef.current) {
        window.clearTimeout(programmaticTimerRef.current);
      }
    };
  }, [requestUpdate]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");

      if (!hrefs.includes(hash)) return;

      setActiveSection(hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [hrefs, setActiveSection]);

  return {
    activeHref,
    scrollToSection,
  };
}

// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// type NavItem = {
//   label: string;
//   href: string;
// };

// type UseActiveSectionHashOptions = {
//   /**
//    * Where the active detection line should be.
//    * 0.35 means 35% from top of viewport.
//    */
//   activationOffset?: number;

//   /**
//    * Useful if you have fixed/sticky header.
//    */
//   scrollOffset?: number;
// };

// export function useActiveSectionHash(
//   navItems: NavItem[],
//   options: UseActiveSectionHashOptions = {},
// ) {
//   const { activationOffset = 0.35, scrollOffset = 96 } = options;

//   const firstHref = navItems[0]?.href ?? "";

//   const [activeHref, setActiveHref] = useState(firstHref);

//   const activeHrefRef = useRef(firstHref);
//   const tickingRef = useRef(false);
//   const isProgrammaticScrollRef = useRef(false);
//   const programmaticTimerRef = useRef<number | null>(null);

//   const hrefs = useMemo(() => {
//     return navItems.map((item) => item.href);
//   }, [navItems]);

//   const getTargets = useCallback(() => {
//     return hrefs
//       .map((href) => {
//         const element = document.getElementById(href);

//         if (!element) return null;

//         const rect = element.getBoundingClientRect();

//         return {
//           href,
//           element,
//           top: rect.top + window.scrollY,
//         };
//       })
//       .filter(Boolean) as Array<{
//       href: string;
//       element: HTMLElement;
//       top: number;
//     }>;
//   }, [hrefs]);

//   const updateActiveSection = useCallback(() => {
//     tickingRef.current = false;

//     if (isProgrammaticScrollRef.current) return;

//     const targets = getTargets();

//     if (!targets.length) return;

//     const activationLine =
//       window.scrollY + window.innerHeight * activationOffset;

//     let current = targets[0];

//     for (const target of targets) {
//       if (target.top <= activationLine) {
//         current = target;
//       } else {
//         break;
//       }
//     }

//     if (current.href === activeHrefRef.current) return;

//     activeHrefRef.current = current.href;
//     setActiveHref(current.href);

//     window.history.replaceState(null, "", `#${current.href}`);
//   }, [activationOffset, getTargets]);

//   const requestUpdate = useCallback(() => {
//     if (tickingRef.current) return;

//     tickingRef.current = true;
//     window.requestAnimationFrame(updateActiveSection);
//   }, [updateActiveSection]);

//   const scrollToSection = useCallback(
//     (href: string) => {
//       const element = document.getElementById(href);

//       if (!element) return;

//       isProgrammaticScrollRef.current = true;

//       activeHrefRef.current = href;
//       setActiveHref(href);

//       window.history.pushState(null, "", `#${href}`);

//       const targetTop =
//         element.getBoundingClientRect().top + window.scrollY - scrollOffset;

//       window.scrollTo({
//         top: targetTop,
//         behavior: "smooth",
//       });

//       if (programmaticTimerRef.current) {
//         window.clearTimeout(programmaticTimerRef.current);
//       }

//       programmaticTimerRef.current = window.setTimeout(() => {
//         isProgrammaticScrollRef.current = false;
//         requestUpdate();
//       }, 900);
//     },
//     [requestUpdate, scrollOffset],
//   );

//   useEffect(() => {
//     const hash = window.location.hash.replace("#", "");

//     if (hash && hrefs.includes(hash)) {
//       activeHrefRef.current = hash;
//       setActiveHref(hash);
//     } else {
//       requestUpdate();
//     }
//   }, [hrefs, requestUpdate]);

//   useEffect(() => {
//     window.addEventListener("scroll", requestUpdate, { passive: true });
//     window.addEventListener("resize", requestUpdate);

//     requestUpdate();

//     return () => {
//       window.removeEventListener("scroll", requestUpdate);
//       window.removeEventListener("resize", requestUpdate);

//       if (programmaticTimerRef.current) {
//         window.clearTimeout(programmaticTimerRef.current);
//       }
//     };
//   }, [requestUpdate]);

//   useEffect(() => {
//     const handleHashChange = () => {
//       const hash = window.location.hash.replace("#", "");

//       if (!hrefs.includes(hash)) return;

//       activeHrefRef.current = hash;
//       setActiveHref(hash);
//     };

//     window.addEventListener("hashchange", handleHashChange);

//     return () => {
//       window.removeEventListener("hashchange", handleHashChange);
//     };
//   }, [hrefs]);

//   return {
//     activeHref,
//     scrollToSection,
//   };
// }
