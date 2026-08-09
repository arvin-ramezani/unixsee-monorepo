"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { SlideDirection } from "./active-slide-tracker";

export type TestimonialVideoItemProps = {
  className?: string;
  itemKey: string;
  src: string;
  direction?: SlideDirection;
  onStartVideo: (itemKey: string) => void;
  onStopVideo: () => void;
  onVideoElementChange: (videoElement: HTMLVideoElement | null) => void;
};

const videoMotion = {
  initial: (direction: SlideDirection = "next") => ({
    opacity: 0,
    y: direction === "next" ? 16 : -16,
  }),
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: (direction: SlideDirection = "next") => ({
    opacity: 0,
    y: direction === "next" ? -16 : 16,
  }),
};

export default function TestimonialVideoItem({
  className,
  src,
  onStartVideo,
  onStopVideo,
  onVideoElementChange,
  itemKey,
  direction = "next",
}: TestimonialVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const setVideoRef = useCallback(
    (videoElement: HTMLVideoElement | null) => {
      videoRef.current = videoElement;
      onVideoElementChange(videoElement);
    },
    [onVideoElementChange],
  );

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => onStartVideo(itemKey);
    const handleStop = () => onStopVideo();

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handleStop);
    videoElement.addEventListener("ended", handleStop);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handleStop);
      videoElement.removeEventListener("ended", handleStop);
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
        ref={setVideoRef}
        src={src}
        className="aspect-video rounded-md"
        muted={false}
        controls
        playsInline
        controlsList="nodownload noplaybackrequest"
        disableRemotePlayback
      />
    </motion.div>
  );
}
