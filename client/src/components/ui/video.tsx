"use client";

import { useEffect, useRef } from "react";

type VideoProps = {
  className?: string;
  poster: string;
  desktopWebm: string;
  desktopMp4: string;
  mobileWebm: string;
  mobileMp4: string;
};

export function Video({
  className,
  poster,
  desktopWebm,
  desktopMp4,
  mobileWebm,
  mobileMp4,
}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
        };
      }
    ).connection;

    // Respect data saver users
    if (connection?.saveData) {
      return;
    }

    // Respect reduced motion users
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.load();

          video.play().catch(() => {
            // Autoplay can be blocked by browser policy
          });

          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    >
      <source src={mobileWebm} type="video/webm" media="(max-width: 767px)" />

      <source src={mobileMp4} type="video/mp4" media="(max-width: 767px)" />

      <source src={desktopWebm} type="video/webm" media="(min-width: 768px)" />

      <source src={desktopMp4} type="video/mp4" media="(min-width: 768px)" />
    </video>
  );
}
