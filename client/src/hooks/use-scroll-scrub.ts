"use client";

import { useEffect, useRef, useState } from "react";

import { beatIndexForProgress } from "@/lib/monitoring/beats";

type ScrubOptions = {
  enabled: boolean;
};

export type ScrubStatus = "loading" | "ready" | "error";

/**
 * Binds a paused <video> to scroll. The clip never plays.
 * scroll progress (0–1) through the sticky parent → video.currentTime.
 *
 * The <video> must already have a same-origin src in JSX. We do not swap in a
 * blob URL: empty blob MIME types never fire loadedmetadata in some Chromium
 * builds, which left the stage stuck on “preparing film”.
 */
export function useScrollScrub(
  containerRef: React.RefObject<HTMLElement | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { enabled }: ScrubOptions,
) {
  const [status, setStatus] = useState<ScrubStatus>("loading");
  const [progress, setProgress] = useState(0);
  const targetTimeRef = useRef(0);
  const rafRef = useRef(0);
  const primedRef = useRef(false);
  const lastBeatRef = useRef(-1);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = true;
    video.defaultMuted = true;
    video.pause();

    const readProgress = () => {
      const scrollable = container.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      const scrolled = -container.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, scrolled / scrollable));
    };

    const apply = () => {
      rafRef.current = 0;
      const node = videoRef.current;
      if (!node || !Number.isFinite(node.duration) || node.duration === 0) return;
      if (node.seeking) return;

      const next = targetTimeRef.current;
      if (Math.abs(node.currentTime - next) < 0.001) return;
      node.currentTime = next;
    };

    const schedule = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(apply);
    };

    const onScrollOrResize = () => {
      const nextProgress = readProgress();
      const beat = beatIndexForProgress(nextProgress);
      if (beat !== lastBeatRef.current) {
        lastBeatRef.current = beat;
        setProgress(nextProgress);
      }

      if (!enabled) return;
      if (!Number.isFinite(video.duration) || video.duration === 0) return;

      targetTimeRef.current = nextProgress * video.duration;
      schedule();
    };

    const onReady = () => {
      if (!Number.isFinite(video.duration) || video.duration === 0) return;
      video.pause();
      setStatus("ready");
      onScrollOrResize();
    };

    const onError = () => {
      setStatus("error");
    };

    const onSeeked = () => {
      const node = videoRef.current;
      if (!node || node.seeking) return;
      if (Math.abs(node.currentTime - targetTimeRef.current) >= 0.001) {
        schedule();
      }
    };

    const primeForIOS = () => {
      if (primedRef.current) return;
      primedRef.current = true;
      const playAttempt = video.play();
      if (playAttempt) {
        playAttempt
          .then(() => {
            video.pause();
          })
          .catch(() => {
            primedRef.current = false;
          });
      } else {
        video.pause();
      }
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("durationchange", onReady);
    video.addEventListener("error", onError);
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("touchstart", primeForIOS, { once: true, passive: true });
    window.addEventListener("click", primeForIOS, { once: true });

    if (video.readyState >= 1) onReady();

    return () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("durationchange", onReady);
      video.removeEventListener("error", onError);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("touchstart", primeForIOS);
      window.removeEventListener("click", primeForIOS);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, enabled, videoRef]);

  return { status, progress };
}
