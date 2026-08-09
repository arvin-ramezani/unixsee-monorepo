"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { useTheme } from "next-themes";

let particlesEngineInitialized = false;

async function initStarsEngineOnce() {
  if (particlesEngineInitialized) return;

  await initParticlesEngine(async (engine) => {
    const [{ loadSlim }, { loadStarsPreset }] = await Promise.all([
      import("@tsparticles/slim"),
      import("@tsparticles/preset-stars"),
    ]);

    await Promise.all([loadSlim(engine), loadStarsPreset(engine)]);
  });

  particlesEngineInitialized = true;
}

type StarsBackgroundProps = {
  id?: string;
  particlesCount?: number;
};

export default function StarsBackground({
  id,
  particlesCount = 70,
}: StarsBackgroundProps) {
  const reactId = useId();
  const particlesId = id ?? `stars-${reactId.replace(/:/g, "")}`;

  const [ready, setReady] = useState(particlesEngineInitialized);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let mounted = true;

    initStarsEngineOnce().then(() => {
      if (mounted) setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo<ISourceOptions>(
    () => ({
      preset: "stars",
      fullScreen: {
        enable: false,
      },
      background: {
        color: "transparent",
      },
      fpsLimit: 60,
      detectRetina: true,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
        },
      },
      particles: {
        number: {
          value: particlesCount,
        },
        move: {
          enable: true,
          speed: 2,
        },
        color: {
          value:
            resolvedTheme === "light"
              ? {
                  h: 215,
                  s: 45,
                  l: 34,
                }
              : "#ffffff",
        },
        opacity: {
          value:
            resolvedTheme === "light"
              ? {
                  min: 0.7,
                  max: 1,
                }
              : {
                  min: 0.15,
                  max: 0.5,
                },
          animation: {
            enable: true,
            speed: 0,
          },
        },
        size: {
          value: {
            min: 1,
            max: 2.2,
          },
        },
      },
    }),
    [particlesCount, resolvedTheme],
  );

  if (!ready) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 size-full overflow-hidden">
      <Particles
        id={particlesId}
        className="absolute inset-0 size-full"
        options={options}
      />
    </div>
  );
}
