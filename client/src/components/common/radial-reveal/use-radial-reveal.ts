"use client";

import * as React from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";

export type RippleState = {
  id: number;
  x: number;
  y: number;
  diameter: number;
};

type RadialRevealStyle = React.CSSProperties & {
  "--radial-reveal-color": string;
  "--radial-ripple-color": string;
};

type UseRadialRevealOptions<TElement extends HTMLElement> = {
  disabled?: boolean;
  style?: React.CSSProperties;
  revealColor?: string;
  rippleColor?: string;
  onPointerEnter?: React.PointerEventHandler<TElement>;
  onPointerMove?: React.PointerEventHandler<TElement>;
  onPointerLeave?: React.PointerEventHandler<TElement>;
  onPointerDown?: React.PointerEventHandler<TElement>;
  onPointerUp?: React.PointerEventHandler<TElement>;
  onPointerCancel?: React.PointerEventHandler<TElement>;
  onFocus?: React.FocusEventHandler<TElement>;
  onBlur?: React.FocusEventHandler<TElement>;
  onClick?: React.MouseEventHandler<TElement>;
};

function getRevealGeometry(
  element: HTMLElement,
  clientX?: number,
  clientY?: number,
) {
  const rect = element.getBoundingClientRect();

  // Use the untransformed layout size (offsetWidth/offsetHeight) rather than
  // the transformed rect for the reveal dimensions. When the button is measured
  // mid-animation — e.g. autofocused inside a dialog that is still running its
  // zoom-in (scale) transition — getBoundingClientRect() reports a scaled-down
  // size, which would bake a too-small reveal diameter that never covers the
  // settled button. offset* dimensions are immune to ancestor transforms.
  const width = element.offsetWidth || rect.width;
  const height = element.offsetHeight || rect.height;

  const x = clientX == null ? width / 2 : clientX - rect.left;
  const y = clientY == null ? height / 2 : clientY - rect.top;

  const radius = Math.max(
    Math.hypot(x, y),
    Math.hypot(width - x, y),
    Math.hypot(x, height - y),
    Math.hypot(width - x, height - y),
  );

  return {
    x,
    y,
    diameter: Math.max(radius * 2 + 8, 24),
  };
}

function isPointerInsideElement(
  element: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const rect = element.getBoundingClientRect();

  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

export function useRadialReveal<TElement extends HTMLElement>({
  disabled,
  style,
  revealColor = "var(--button-radial-reveal, var(--primary))",
  rippleColor = "var(--button-radial-ripple, rgb(255 255 255 / 0.28))",
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  onClick,
}: UseRadialRevealOptions<TElement>) {
  const shouldReduceMotion = useReducedMotion();

  const [isHoverRevealActive, setIsHoverRevealActive] = React.useState(false);
  const [ripples, setRipples] = React.useState<RippleState[]>([]);

  const revealIdRef = React.useRef(0);
  const pointerClickPendingRef = React.useRef(false);
  const pointerInsideRef = React.useRef(false);
  const pointerClickResetTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const revealX = useMotionValue(0);
  const revealY = useMotionValue(0);
  const revealDiameter = useMotionValue(24);

  React.useEffect(() => {
    if (disabled) {
      setIsHoverRevealActive(false);
      setRipples([]);
    }
  }, [disabled]);

  React.useEffect(() => {
    return () => {
      if (pointerClickResetTimerRef.current) {
        clearTimeout(pointerClickResetTimerRef.current);
      }
    };
  }, []);

  const updateHoverReveal = React.useCallback(
    (element: HTMLElement, clientX?: number, clientY?: number) => {
      const geometry = getRevealGeometry(element, clientX, clientY);

      revealX.set(geometry.x);
      revealY.set(geometry.y);
      revealDiameter.set(geometry.diameter);
    },
    [revealDiameter, revealX, revealY],
  );

  const addRipple = React.useCallback(
    (element: HTMLElement, clientX?: number, clientY?: number) => {
      const geometry = getRevealGeometry(element, clientX, clientY);

      revealIdRef.current += 1;

      setRipples((currentRipples) => [
        ...currentRipples,
        {
          id: revealIdRef.current,
          ...geometry,
        },
      ]);
    },
    [],
  );

  const removeRipple = React.useCallback((id: number) => {
    setRipples((currentRipples) =>
      currentRipples.filter((ripple) => ripple.id !== id),
    );
  }, []);

  const handlePointerEnter = React.useCallback(
    (event: React.PointerEvent<TElement>) => {
      pointerInsideRef.current = true;

      if (!disabled) {
        updateHoverReveal(event.currentTarget, event.clientX, event.clientY);
        setIsHoverRevealActive(true);
      }

      onPointerEnter?.(event);
    },
    [disabled, onPointerEnter, updateHoverReveal],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<TElement>) => {
      if (!disabled) {
        updateHoverReveal(event.currentTarget, event.clientX, event.clientY);
      }

      onPointerMove?.(event);
    },
    [disabled, onPointerMove, updateHoverReveal],
  );

  const handlePointerLeave = React.useCallback(
    (event: React.PointerEvent<TElement>) => {
      pointerInsideRef.current = false;

      if (!disabled) {
        setIsHoverRevealActive(false);
      }

      onPointerLeave?.(event);
    },
    [disabled, onPointerLeave],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<TElement>) => {
      if (!disabled) {
        pointerInsideRef.current = true;
        pointerClickPendingRef.current = true;

        if (pointerClickResetTimerRef.current) {
          clearTimeout(pointerClickResetTimerRef.current);
        }

        pointerClickResetTimerRef.current = setTimeout(() => {
          pointerClickPendingRef.current = false;
        }, 1000);

        updateHoverReveal(event.currentTarget, event.clientX, event.clientY);
        setIsHoverRevealActive(true);
        addRipple(event.currentTarget, event.clientX, event.clientY);
      }

      onPointerDown?.(event);
    },
    [addRipple, disabled, onPointerDown, updateHoverReveal],
  );

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<TElement>) => {
      if (!disabled) {
        const isInside = isPointerInsideElement(
          event.currentTarget,
          event.clientX,
          event.clientY,
        );

        pointerInsideRef.current = isInside;

        if (isInside) {
          updateHoverReveal(event.currentTarget, event.clientX, event.clientY);
          setIsHoverRevealActive(true);
        } else {
          setIsHoverRevealActive(false);
        }
      }

      onPointerUp?.(event);
    },
    [disabled, onPointerUp, updateHoverReveal],
  );

  const handlePointerCancel = React.useCallback(
    (event: React.PointerEvent<TElement>) => {
      pointerInsideRef.current = false;

      if (!disabled) {
        setIsHoverRevealActive(false);
      }

      onPointerCancel?.(event);
    },
    [disabled, onPointerCancel],
  );

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<TElement>) => {
      if (!disabled && !pointerClickPendingRef.current) {
        updateHoverReveal(event.currentTarget);
        setIsHoverRevealActive(true);
      }

      onFocus?.(event);
    },
    [disabled, onFocus, updateHoverReveal],
  );

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<TElement>) => {
      if (!disabled && !pointerInsideRef.current) {
        setIsHoverRevealActive(false);
      }

      onBlur?.(event);
    },
    [disabled, onBlur],
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<TElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (pointerClickPendingRef.current) {
        pointerClickPendingRef.current = false;

        if (pointerClickResetTimerRef.current) {
          clearTimeout(pointerClickResetTimerRef.current);
        }
      } else {
        addRipple(event.currentTarget);
      }

      onClick?.(event);
    },
    [addRipple, disabled, onClick],
  );

  const radialStyle = React.useMemo(
    () =>
      ({
        ...style,
        "--radial-reveal-color": revealColor,
        "--radial-ripple-color": rippleColor,
      }) as RadialRevealStyle,
    [revealColor, rippleColor, style],
  );

  return {
    shouldReduceMotion,
    isHoverRevealActive,
    isActive: isHoverRevealActive || ripples.length > 0,
    ripples,
    revealX,
    revealY,
    revealDiameter,
    removeRipple,
    style: radialStyle,
    handlers: {
      onPointerEnter: handlePointerEnter,
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onClick: handleClick,
    },
  };
}
