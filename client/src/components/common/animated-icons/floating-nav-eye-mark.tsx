"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type FloatingNavEyeMarkProps = {
  className?: string;
};

type GazeTarget = {
  x: number;
  y: number;
};

const OPEN_UPPER_LID =
  "M2.15 12 C4.75 7.55 8.15 5.65 12 5.65 C15.85 5.65 19.25 7.55 21.85 12";
const OPEN_LOWER_LID =
  "M2.15 12 C4.75 16.45 8.15 18.35 12 18.35 C15.85 18.35 19.25 16.45 21.85 12";

const CLOSED_UPPER_LID =
  "M2.15 12 C4.75 11.72 8.15 11.58 12 11.58 C15.85 11.58 19.25 11.72 21.85 12";
const CLOSED_LOWER_LID =
  "M2.15 12 C4.75 12.28 8.15 12.42 12 12.42 C15.85 12.42 19.25 12.28 21.85 12";

const GAZE_TARGETS: readonly GazeTarget[] = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0.95, y: -0.2 },
  { x: -1.05, y: 0.1 },
  { x: 0.72, y: 0.52 },
  { x: -0.78, y: -0.42 },
  { x: 0.28, y: -0.68 },
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickNextGaze(current: GazeTarget): GazeTarget {
  const candidates = GAZE_TARGETS.filter(
    (target) => target.x !== current.x || target.y !== current.y,
  );

  return (
    candidates[Math.floor(Math.random() * candidates.length)] ?? { x: 0, y: 0 }
  );
}

/**
 * Animated brand eye for the bottom floating navigation.
 *
 * Motion principles:
 * - the lids actually close instead of scaling the pupil alone;
 * - iris, pupil, and highlight move as one optical unit;
 * - gaze timing is intentionally irregular to avoid a mechanical loop;
 * - animation pauses while the tab is hidden and is disabled for reduced motion.
 */
export function FloatingNavEyeMark({ className }: FloatingNavEyeMarkProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isBlinking, setIsBlinking] = useState(false);
  const [gaze, setGaze] = useState<GazeTarget>({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsBlinking(false);
      return;
    }

    let blinkTimer: number | undefined;
    let reopenTimer: number | undefined;
    let secondBlinkTimer: number | undefined;
    let secondReopenTimer: number | undefined;

    const clearTimers = () => {
      if (blinkTimer !== undefined) window.clearTimeout(blinkTimer);
      if (reopenTimer !== undefined) window.clearTimeout(reopenTimer);
      if (secondBlinkTimer !== undefined) window.clearTimeout(secondBlinkTimer);
      if (secondReopenTimer !== undefined)
        window.clearTimeout(secondReopenTimer);
    };

    const scheduleBlink = () => {
      if (document.visibilityState !== "visible") return;

      blinkTimer = window.setTimeout(
        () => {
          setIsBlinking(true);

          reopenTimer = window.setTimeout(() => {
            setIsBlinking(false);

            // Humans occasionally double-blink. Keep it uncommon so it feels incidental.
            if (Math.random() < 0.18) {
              secondBlinkTimer = window.setTimeout(() => {
                setIsBlinking(true);
                secondReopenTimer = window.setTimeout(() => {
                  setIsBlinking(false);
                  scheduleBlink();
                }, 68);
              }, 145);

              return;
            }

            scheduleBlink();
          }, 76);
        },
        randomBetween(2800, 6100),
      );
    };

    const handleVisibilityChange = () => {
      clearTimers();
      setIsBlinking(false);

      if (document.visibilityState === "visible") {
        scheduleBlink();
      }
    };

    scheduleBlink();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimers();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setGaze({ x: 0, y: 0 });
      return;
    }

    let gazeTimer: number | undefined;

    const clearTimer = () => {
      if (gazeTimer !== undefined) window.clearTimeout(gazeTimer);
    };

    const scheduleGaze = () => {
      if (document.visibilityState !== "visible") return;

      gazeTimer = window.setTimeout(
        () => {
          setGaze((current) => pickNextGaze(current));
          scheduleGaze();
        },
        randomBetween(900, 2300),
      );
    };

    const handleVisibilityChange = () => {
      clearTimer();

      if (document.visibilityState === "visible") {
        scheduleGaze();
      }
    };

    scheduleGaze();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shouldReduceMotion]);

  const lidTransition = shouldReduceMotion
    ? { duration: 0 }
    : isBlinking
      ? { duration: 0.065, ease: [0.4, 0, 1, 1] as const }
      : { duration: 0.115, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none size-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.35)] lg:size-8",
        className,
      )}
    >
      <motion.g
        animate={
          shouldReduceMotion
            ? { x: 0, y: 0 }
            : {
                x: gaze.x,
                y: gaze.y,
              }
        }
        transition={{
          type: "spring",
          stiffness: 245,
          damping: 27,
          mass: 0.52,
        }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <motion.circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth={1.45}
          fill="rgba(255,255,255,0.10)"
          animate={
            shouldReduceMotion
              ? { scaleY: 1, opacity: 1 }
              : isBlinking
                ? { scaleY: 0.18, opacity: 0.32 }
                : { scaleY: 1, opacity: 1 }
          }
          transition={lidTransition}
          style={{ transformOrigin: "12px 12px" }}
        />

        <motion.g
          animate={
            shouldReduceMotion
              ? { scaleY: 1, opacity: 1 }
              : isBlinking
                ? { scaleY: 0.12, opacity: 0.18 }
                : { scaleY: 1, opacity: 1 }
          }
          transition={lidTransition}
          style={{ transformOrigin: "12px 12px" }}
        >
          <circle cx="12" cy="12" r="1.42" fill="currentColor" />
          <circle
            cx="12.9"
            cy="11.08"
            r="0.43"
            fill="white"
            fillOpacity={0.92}
          />
        </motion.g>
      </motion.g>

      <motion.path
        d={OPEN_UPPER_LID}
        animate={{
          d:
            isBlinking && !shouldReduceMotion
              ? CLOSED_UPPER_LID
              : OPEN_UPPER_LID,
        }}
        transition={lidTransition}
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d={OPEN_LOWER_LID}
        animate={{
          d:
            isBlinking && !shouldReduceMotion
              ? CLOSED_LOWER_LID
              : OPEN_LOWER_LID,
        }}
        transition={lidTransition}
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// "use client";

// import { motion, useReducedMotion } from "framer-motion";

// import { cn } from "@/lib/utils";

// type FloatingNavEyeMarkProps = {
//   className?: string;
// };

// /**
//  * Brand mark for the bottom floating navigation.
//  * Simple occasional blink + soft pupil drift; static when reduced motion is on.
//  */
// export function FloatingNavEyeMark({ className }: FloatingNavEyeMarkProps) {
//   const shouldReduceMotion = useReducedMotion();

//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       aria-hidden="true"
//       focusable="false"
//       className={cn(
//         "pointer-events-none size-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.35)] lg:size-8",
//         className,
//       )}
//     >
//       <path
//         d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
//         stroke="currentColor"
//         strokeWidth={1.75}
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />

//       <motion.g
//         style={{ transformOrigin: "12px 12px" }}
//         animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [1, 0.08, 1] }}
//         transition={
//           shouldReduceMotion
//             ? { duration: 0 }
//             : {
//                 duration: 0.16,
//                 times: [0, 0.4, 1],
//                 ease: ["easeIn", "easeOut"],
//                 repeat: Infinity,
//                 repeatDelay: 3.8,
//               }
//         }
//       >
//         <circle
//           cx="12"
//           cy="12"
//           r="3"
//           stroke="currentColor"
//           strokeWidth={1.5}
//           fill="rgba(255,255,255,0.12)"
//         />
//         <motion.g
//           animate={
//             shouldReduceMotion
//               ? { x: 0 }
//               : {
//                   // Glance right → rest center → glance left → rest center
//                   x: [0, 1.35, 1.35, 0, -1.35, -1.35, 0],
//                 }
//           }
//           transition={
//             shouldReduceMotion
//               ? { duration: 0 }
//               : {
//                   duration: 5.6,
//                   times: [0, 0.18, 0.32, 0.45, 0.63, 0.77, 1],
//                   ease: "easeInOut",
//                   repeat: Infinity,
//                 }
//           }
//         >
//           <circle cx="12" cy="12" r="1.4" fill="currentColor" />
//           <circle cx="13" cy="11.1" r="0.45" fill="white" fillOpacity={0.9} />
//         </motion.g>
//       </motion.g>
//     </svg>
//   );
// }
