"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

export type SlidingPillToggleOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

export type SlidingPillToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly SlidingPillToggleOption<T>[];
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
};

/**
 * Two-or-more segment control with rAF-eased CSS `translate` pill.
 * Shared by auth identifier mode and public contact-channel pickers.
 */
export function SlidingPillToggle<T extends string>({
  value,
  onChange,
  options,
  disabled,
  className,
  ariaLabel,
}: SlidingPillToggleProps<T>) {
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const isRtl = locale === "fa";

  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [displayX, setDisplayX] = useState(0);
  const displayXRef = useRef(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || options.length < 2) return;

    const measure = () => {
      const inner = track.querySelector(
        "[data-sliding-pill-grid]",
      ) as HTMLElement | null;
      const styles = getComputedStyle(inner ?? track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 4;
      const width = inner?.clientWidth ?? track.clientWidth;
      const segment = (width - gap * (options.length - 1)) / options.length;
      setTravel(segment + gap);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [isRtl, options.length]);

  const targetX =
    selectedIndex === 0
      ? 0
      : isRtl
        ? -travel * selectedIndex
        : travel * selectedIndex;

  useLayoutEffect(() => {
    const from = displayXRef.current;
    const to = targetX;

    if (shouldReduceMotion || from === to) {
      displayXRef.current = to;
      setDisplayX(to);
      return;
    }

    let raf = 0;
    const durationMs = 320;
    const start = performance.now();
    const easeOut = (t: number) => 1 - (1 - t) ** 3;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const next = from + (to - from) * easeOut(progress);
      displayXRef.current = next;
      setDisplayX(next);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        displayXRef.current = to;
        setDisplayX(to);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetX, shouldReduceMotion]);

  const segmentWidth =
    options.length === 2 ? "w-[calc(50%-0.375rem)]" : undefined;

  return (
    <div
      ref={trackRef}
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "bg-muted/70 border-border relative rounded-lg border p-1",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-background pointer-events-none absolute top-1 bottom-1 z-0 rounded-md shadow-sm",
          segmentWidth ?? "w-[calc((100%-0.5rem)/2)]",
          isRtl ? "right-1" : "left-1",
        )}
        style={{ translate: `${displayX}px` }}
      />
      <div
        data-sliding-pill-grid
        className={cn(
          "relative z-10 grid gap-1",
          options.length === 2 && "grid-cols-2",
          options.length === 3 && "grid-cols-3",
          options.length >= 4 && "grid-cols-4",
        )}
        style={
          options.length > 4
            ? {
                gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
              }
            : undefined
        }
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-10 min-h-11 rounded-md text-sm font-medium transition-colors outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
                "disabled:pointer-events-none disabled:opacity-60",
                selected
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
