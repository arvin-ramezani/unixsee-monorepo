"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export function MouseParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      background: { color: "transparent" },
      fpsLimit: 60,
      detectRetina: true,

      interactivity: {
        detectsOn: "window",
        events: {
          onHover: {
            enable: true,
            mode: ["grab"],
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 180,
            links: {
              opacity: 0.65,
            },
          },
        },
      },

      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            width: 800,
            height: 800,
          },
        },
        color: {
          value: "#ffffff",
        },
        links: {
          enable: true,
          color: "#ffffff",
          distance: 150,
          opacity: 0.35,
          width: 1.4,
        },
        move: {
          enable: true,
          speed: 0.35,
          direction: "none",
          straight: false,
          outModes: {
            default: "out",
          },
        },
        opacity: {
          value: 0.9,
        },
        size: {
          value: { min: 1, max: 2.2 },
        },
        shape: {
          type: "circle",
        },
      },
    }),
    [],
  );

  if (!init) return null;

  return (
    <Particles
      id="mouse-particles"
      className="absolute inset-0 -z-10"
      options={options}
    />
  );
}
