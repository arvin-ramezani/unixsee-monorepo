"use client";

import { useEffect, useRef, useState } from "react";

import {
  beatIndexForProgress,
  CAPTION_BEATS,
  SCROLL_HEIGHT_VH,
} from "@/lib/monitoring/beats";
import { useScrollScrub } from "@/hooks/use-scroll-scrub";

const VIDEO_SRC = "/videos/watch-scrub.mp4";
const POSTER_SRC = "/videos/watch-scrub-poster.jpg";

export function ScrollScrubStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const { status, progress } = useScrollScrub(containerRef, videoRef, {
    enabled: !reducedMotion,
  });

  const beatIndex = beatIndexForProgress(progress);
  const beat = CAPTION_BEATS[beatIndex];

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      aria-label="نظارت شبانه‌روزی یونیکسی"
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-[#11161E]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO_SRC}
          autoPlay={false}
          muted
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          {...{ "webkit-playsinline": "true", "x5-playsinline": "true" }}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,22,30,0.55)_0%,rgba(17,22,30,0.12)_38%,rgba(17,22,30,0.62)_100%)]"
          aria-hidden
        />

        <div className="absolute inset-0 flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-12">
          <header className="flex items-start justify-between gap-6">
            <p className="text-[11px] tracking-[0.28em] text-[#9FDCFF]/80 uppercase">
              Unixsee
            </p>
            <p className="max-w-[14rem] text-end text-[11px] leading-5 text-[#F0F2F4]/55">
              نظارت ۲۴/۷
              <span
                className="mt-1 block font-[family-name:var(--font-geist-sans)] tracking-wide"
                dir="ltr"
              >
                24/7 watch
              </span>
            </p>
          </header>

          <div className="flex items-end justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-3xl font-medium leading-snug text-[#F0F2F4] sm:text-5xl">
                {beat.fa}
              </p>
              <p
                className="mt-3 font-[family-name:var(--font-geist-sans)] text-sm tracking-[0.04em] text-[#9FDCFF]/85 sm:text-base"
                dir="ltr"
              >
                {beat.en}
              </p>
            </div>

            <ol className="flex flex-col gap-2" aria-hidden>
              {CAPTION_BEATS.map((item, index) => (
                <li
                  key={item.en}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                    index === beatIndex ? "bg-[#62C37A]" : "bg-[#F0F2F4]/25"
                  }`}
                />
              ))}
            </ol>
          </div>
        </div>

        {status === "loading" ? (
          <p className="absolute inset-x-0 bottom-6 text-center text-xs text-[#F0F2F4]/50">
            در حال آماده‌سازی فیلم
          </p>
        ) : null}

        {status === "error" ? (
          <p className="absolute inset-x-0 bottom-6 text-center text-xs text-[#E6AC3D]">
            فیلم بارگذاری نشد. اسکرول همچنان کار می‌کند؛ پوستر جایگزین است.
          </p>
        ) : null}
      </div>
    </section>
  );
}
