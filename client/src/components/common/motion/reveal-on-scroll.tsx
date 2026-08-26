"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

/** Enter offset. Small on purpose: long travel reads as decoration. */
const ENTER_DISTANCE_PX = 24;

/** 400–600ms is the readable range for a content block enter. */
const ENTER_DURATION_S = 0.5;

/**
 * Selector must stay in sync with the `data-reveal` attribute set by
 * {@link RevealOnScroll} below.
 */
const NOSCRIPT_CSS =
  "[data-reveal]{opacity:1!important;transform:none!important}";

/**
 * Cancels the reveal for readers without JavaScript. Render once per page that
 * uses {@link RevealOnScroll}.
 *
 * Framer serializes `initial` as an inline `opacity: 0`, so the server HTML
 * hides the content and nothing ever un-hides it when hydration never runs. A
 * `<noscript>` stylesheet is the one way to express "JavaScript is off" in CSS;
 * its contents are inert whenever scripting is enabled. `!important` is needed
 * to outrank Framer's inline style.
 */
export function RevealOnScrollNoScript() {
  return (
    <noscript>
      <style>{NOSCRIPT_CSS}</style>
    </noscript>
  );
}

export type RevealOnScrollProps = PropsWithChildren<{
  className?: string;
  /** Seconds to hold before entering. Use to stagger sibling blocks. */
  delay?: number;
}>;

/**
 * Fades and lifts a block of static content in as it enters the viewport.
 *
 * Only ever wrap content that starts below the fold. Above-the-fold content
 * would be hidden by the SSR `initial` state until hydration finishes, which is
 * a bad trade on a page whose job is rendering reliably.
 *
 * `translateY` keeps the movement direction-agnostic, so the same component is
 * correct under both Persian RTL and English LTR. Reduced motion collapses the
 * transition to zero rather than removing it, so the content still appears — it
 * just does not travel.
 */
export default function RevealOnScroll({
  children,
  className,
  delay = 0,
}: RevealOnScrollProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: ENTER_DISTANCE_PX }}
      whileInView={{ opacity: 1, y: 0 }}
      /* Fires as soon as the top edge clears the bottom 15% of the viewport, so
         tall card grids do not wait for a fifth of their own height to scroll
         past. `once` releases the observer after the first enter. */
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{
        duration: prefersReducedMotion ? 0 : ENTER_DURATION_S,
        delay: prefersReducedMotion ? 0 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
