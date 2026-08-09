import { useEffect, useRef } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useTransform,
  type UseInViewOptions,
} from "framer-motion";
import { useLocale } from "next-intl";

interface UseAnimatedCounterOptions {
  duration?: number;
  once?: boolean;
  delay?: number;
  start?: boolean;
  /**
   * Optional final string string value override to show exactly when the animation finishes.
   */
  finalValue?: string;

  /**
   * Syntax: "top right bottom left"
   */
  margin?: UseInViewOptions["margin"];
}

export function useAnimatedCounter(
  targetValue: number,
  options: UseAnimatedCounterOptions = {},
) {
  const {
    duration = 2,
    once = true,
    delay = 0,
    margin,
    start = true,
    finalValue,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const animationRef = useRef<{ stop: () => void } | null>(null);

  const isInView = useInView(ref, { once, amount: 0.3, margin });

  const locale = useLocale();
  const languageTag = locale === "fa" ? "fa-IR" : "en-US";

  const formatter = new Intl.NumberFormat(languageTag, {
    useGrouping: false,
  });

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (finalValue && latest >= targetValue) {
      return finalValue;
    }

    const wholeNumber = Math.floor(latest);
    return formatter.format(wholeNumber);
  });

  useEffect(() => {
    if (!isInView || !start) {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      if (!once) {
        count.set(0);
      }
      return;
    }

    animationRef.current = animate(count, targetValue, {
      duration,
      delay,
      ease: "easeOut",
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [isInView, targetValue, duration, delay, once, count, start]);

  return { ref, animatedValue: rounded };
}
