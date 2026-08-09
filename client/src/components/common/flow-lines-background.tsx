"use client";

import React, { useEffect, useState, useRef } from "react";

export default function WaveBackground() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [paths, setPaths] = useState<string[]>([]);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const timeRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- Silk Animation Config ---
    const lineSpacing = 6; // Very narrow gaps to get that dense "silk fabric" texture

    const animate = () => {
      timeRef.current += 0.002; // Slow, luxurious fluid motion

      const mouse = mouseRef.current;
      // Smooth easing/lerp for the cursor position
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const newPaths: string[] = [];
      const totalLines = Math.ceil(window.innerWidth / lineSpacing) + 10;

      // Generate VERTICAL lines instead of horizontal
      for (let i = -5; i < totalLines; i++) {
        const baseWidth = i * lineSpacing;
        let pathString = "";

        // Calculate points going from top to bottom (Y-axis)
        // Step size of 15px gives smooth curves without hurting React performance
        for (let y = 0; y <= window.innerHeight + 20; y += 15) {
          // 1. Primary fabric wave (combining frequencies for an organic drapery fold look)
          const wave1 = Math.sin(y * 0.004 + timeRef.current + i * 0.04);
          const wave2 = Math.cos(y * 0.002 - timeRef.current * 0.5 + i * 0.01);

          // The combination gives that multi-layered silk fold depth
          let waveOffset = wave1 * 25 + wave2 * 15;

          // 2. Interactive Mouse Warp
          const dx = baseWidth - mouse.x;
          const dy = y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = 400; // Radius of fabric displacement around cursor

          if (distance < maxRadius) {
            const force = (maxRadius - distance) / maxRadius;
            // Push the fabric strands sideways as the cursor passes through them
            waveOffset += Math.sin(y * 0.006 + dx * 0.01) * force * 55;
          }

          const finalX = baseWidth + waveOffset;

          if (y === 0) {
            pathString += `M ${finalX} ${y}`;
          } else {
            pathString += ` L ${finalX} ${y}`;
          }
        }
        newPaths.push(pathString);
      }

      setPaths(newPaths);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden bg-[#09090b]"
      aria-hidden="true"
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="h-full w-full opacity-35"
      >
        {paths.map((d, index) => (
          <path
            key={index}
            d={d}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.85"
          />
        ))}
      </svg>
    </div>
  );
}
