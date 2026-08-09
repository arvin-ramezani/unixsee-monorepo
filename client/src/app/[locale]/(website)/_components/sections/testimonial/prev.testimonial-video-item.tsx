"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type TestimonialVideoItemProps = {
  className?: string;
  itemKey: string;
  src: string;
  isStop: boolean;
  onStartVideo: (itemKey: string) => void;
  onStopVideo: () => void;
};

export default function TestimonialVideoItem({
  className,
  src,
  onStartVideo,
  onStopVideo,
  itemKey,
}: TestimonialVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (!videoRef.current) return;
    const videElement = videoRef.current;
    const handlePlay = () => onStartVideo(itemKey);
    const handlePause = () => onStopVideo();

    videElement?.addEventListener("play", handlePlay);
    videElement?.addEventListener("pause", handlePause);

    return () => {
      videElement?.removeEventListener("play", handlePlay);
      videElement?.removeEventListener("pause", handlePause);
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("relative min-w-1/2 opacity-0", className)}
      transition={{ duration: 0.3 }}
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
