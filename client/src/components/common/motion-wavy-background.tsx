"use client";

import * as React from "react";
import { useMotionValue, useSpring } from "framer-motion";

type ContourLinesBackgroundProps = {
  className?: string;
  lineCount?: number;
  segments?: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  baseAmplitude?: number;
  mouseAmplitude?: number;
  mouseRadius?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function ContourLinesBackground({
  className,
  lineCount = 110,
  segments = 44,
  stroke = "255,255,255",
  strokeWidth = 0.7,
  opacity = 0.1,
  baseAmplitude = 18,
  mouseAmplitude = 34,
  mouseRadius = 180,
}: ContourLinesBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const rawMouseX = useMotionValue(-9999);
  const rawMouseY = useMotionValue(-9999);

  const mouseX = useSpring(rawMouseX, {
    stiffness: 90,
    damping: 22,
    mass: 0.35,
  });

  const mouseY = useSpring(rawMouseY, {
    stiffness: 90,
    damping: 22,
    mass: 0.35,
  });

  const mouseRef = React.useRef({ x: -9999, y: -9999 });

  React.useEffect(() => {
    const unsubX = mouseX.on("change", (v) => {
      mouseRef.current.x = v;
    });
    const unsubY = mouseY.on("change", (v) => {
      mouseRef.current.y = v;
    });

    return () => {
      unsubX();
      unsubY();
    };
  }, [mouseX, mouseY]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;

    const loop = () => {
      setFrame((v) => v + 1);
      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    rawMouseX.set(event.clientX - rect.left);
    rawMouseY.set(event.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    rawMouseX.set(-9999);
    rawMouseY.set(-9999);
  };

  const lines = React.useMemo(() => {
    const { width, height } = size;
    if (!width || !height) return [];

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    const stepX = width / (lineCount - 1);
    const stepY = height / segments;
    const t = frame * 0.008;

    return Array.from({ length: lineCount }, (_, lineIndex) => {
      const baseX = lineIndex * stepX;

      const points = Array.from({ length: segments + 1 }, (_, segmentIndex) => {
        const y = segmentIndex * stepY;
        const yN = y / height;
        const xN = baseX / width;

        // persistent coherent field
        const fieldA =
          Math.sin(yN * 8.5 + xN * 11.0 + t * 0.8) *
          Math.sin(yN * 2.8 - xN * 5.5);

        const fieldB = Math.sin(yN * 18.0 - xN * 7.0 + 1.3 + t * 0.45) * 0.35;

        const fieldC = Math.sin(yN * 4.2 + xN * 22.0 - 0.7) * 0.5;

        const idleOffset = (fieldA + fieldB + fieldC) * baseAmplitude;

        // mouse distortion field
        const dx = baseX - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const radial = 1 - smoothstep(0, mouseRadius, dist);

        // vertical shaping so the influence feels elongated and elegant
        const verticalWave = Math.sin((dy / mouseRadius) * Math.PI * 0.9) * 0.8;

        // horizontal direction: pull lines around the cursor field
        const direction = dx === 0 ? 0 : dx / Math.abs(dx);

        const mouseOffset =
          direction * mouseAmplitude * radial * (0.55 + verticalWave * 0.45);

        return {
          x: baseX + idleOffset + mouseOffset,
          y,
        };
      });

      let d = `M ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cx = (prev.x + curr.x) / 2;
        const cy = (prev.y + curr.y) / 2;
        d += ` Q ${prev.x} ${prev.y} ${cx} ${cy}`;
      }

      return {
        id: `line-${lineIndex}`,
        d,
      };
    });
  }, [
    size,
    lineCount,
    segments,
    frame,
    baseAmplitude,
    mouseAmplitude,
    mouseRadius,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        fill="none"
        preserveAspectRatio="none"
      >
        {lines.map((line) => (
          <path
            key={line.id}
            d={line.d}
            stroke={`rgba(${stroke},${opacity})`}
            strokeWidth={strokeWidth}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
