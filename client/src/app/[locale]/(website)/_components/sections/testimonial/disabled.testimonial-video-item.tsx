"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { SlideDirection } from "./active-slide-tracker";

export type TestimonialVideoItemProps = {
  className?: string;
  itemKey: string;
  src: string;
  isStop: boolean;
  direction?: SlideDirection;
  onStartVideo: (itemKey: string) => void;
  onStopVideo: () => void;
};

const videoMotion = {
  initial: (direction: SlideDirection = "next") => ({
    opacity: 0,
    // next: new video comes from top to bottom
    // prev: new video comes from bottom to top
    y: direction === "next" ? 16 : -16,
  }),
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: (direction: SlideDirection = "next") => ({
    opacity: 0,
    // Exit in the opposite direction of the entering video.
    y: direction === "next" ? -16 : 16,
  }),
};

export default function TestimonialVideoItem({
  className,
  src,
  onStartVideo,
  onStopVideo,
  itemKey,
  direction = "next",
}: TestimonialVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    const handlePlay = () => onStartVideo(itemKey);
    const handlePause = () => onStopVideo();

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, [itemKey, onStartVideo, onStopVideo]);

  return (
    <motion.div
      custom={direction}
      variants={videoMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("relative min-w-1/2 opacity-0", className)}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <video
        ref={videoRef}
        src={src}
        className="aspect-video rounded-md"
        muted={false}
        controls
        playsInline
        controlsList="nodownload noplaybackrequest"
        disableRemotePlayback
        // onContextMenu={(e) => e.preventDefault()}
      />
    </motion.div>
  );
}
