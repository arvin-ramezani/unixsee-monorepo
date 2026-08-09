"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlayCircle, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import useActiveSlide from "./active-slide-context";
import { MotionButton } from "@/components/common/motion/motion-button";

export type TestimonialVideoCarouselProps = {
  itemKey: string;
  src: string;
  onStartVideo: (itemKey: string) => void;
  isStop?: boolean;
  activeKey?: string;
  onStopVideo: () => void;
  index?: number;
  sliderMode?: boolean;
};

export default function TestimonialVideoCarouselItem({
  itemKey,
  src,
  onStartVideo,
  onStopVideo,
  isStop = true,
  index,
}: TestimonialVideoCarouselProps) {
  const { activeIndex } = useActiveSlide();
  const [videoUrl, setVideoUrl] = useState("");

  const isActive = index === activeIndex;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  // http://localhost:3000/videos/testimonials/testimonial-1.mp4
  // console.log(src);

  const overlayClickHandler = () => {
    if (!videoRef.current) return;

    if (isStop) {
      videoRef.current.pause();
      onStopVideo();
    } else {
      videoRef.current.play().catch(() => {});
      videoRef.current.controls = true;
      onStartVideo(itemKey);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      setVideoUrl(src);
    };

    fetchData();
  }, [src]);

  return (
    <motion.div
      animate={{
        scale: isActive && !isStop ? 1.3 : isStop ? 1 : 0.9,
        opacity: isActive ? 1 : 0.3,
        transition: {
          duration: isActive && !isStop ? 0.5 : 0.3,
        },
      }}
      className="relative w-full"
    >
      <MotionButton
        onClick={overlayClickHandler}
        className="bg-background/10 absolute inset-e-0 -inset-bs-8 z-10 size-8 rounded-full"
        initial={{ scale: 0 }}
        animate={
          isStop
            ? { scale: 1, transition: { delay: 0.5, duration: 0.2 } }
            : { scale: 0, transition: { delay: 0, duration: 0.1 } }
        }
      >
        <FaTimes className="size-4" />
      </MotionButton>

      <video
        ref={videoRef}
        src={videoUrl}
        className="aspect-video h-full overflow-hidden rounded-md"
        muted
        preload="none"
        playsInline
      />

      <motion.div
        onClick={overlayClickHandler}
        animate={isStop ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        className="bg-primary/40 absolute inset-0 flex items-center justify-center overflow-hidden rounded-md"
      >
        <Button size="icon" className="rounded-full">
          <FaPlayCircle className="size-6" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
