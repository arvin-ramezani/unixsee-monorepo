"use client";

/* eslint-disable no-restricted-syntax -- Legacy component superseded by ./wp-story.tsx (the only story imported, via problem-section.tsx); retained temporarily and slated for deletion. Not localized because it is unreferenced dead code. */

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";

const PROFILES = [
  {
    name: "خشایار نخستین‌فر",
    role: "دیزاینر",
    stories: [
      {
        url: "/videos/hero-section/hero-section.mp4",
        createdAt: "2h",
        duration: 10,
      },
      {
        url: "/videos/testimonials/testimonial-1.mp4",
        createdAt: "2h",
        duration: 10,
      },
    ],
  },
  {
    name: "آروین رمضانی",
    role: "برنامه‌نویس",
    stories: [
      {
        url: "/videos/testimonials/testimonial-1.mp4",
        createdAt: "4h",
        duration: 10,
      },
    ],
  },
  {
    name: "علی ابراهیم‌زاده",
    role: "",
    stories: [
      {
        url: "/videos/hero-section/hero-section.mp4",
        createdAt: "1d",
        duration: 10,
      },
    ],
  },
  {
    name: "مرتضی ندیمی",
    role: "مانیتورینگ",
    stories: [
      {
        url: "/videos/hero-section/hero-section.mp4",
        createdAt: "1d",
        duration: 10,
      },
    ],
  },
  {
    name: "امیرحسین جلالیان",
    role: "دیزاینر",
    stories: [
      {
        url: "/videos/hero-section/hero-section.mp4",
        createdAt: "1d",
        duration: 10,
      },
    ],
  },
];

export type StoryProps = {
  className?: string;
};

export default function Story({ className }: StoryProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [open, setOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [userSlideDirection, setUserSlideDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState(() => ({
    width:
      typeof window !== "undefined"
        ? (window.visualViewport?.width ?? window.innerWidth)
        : 0,
    height:
      typeof window !== "undefined"
        ? (window.visualViewport?.height ?? window.innerHeight)
        : 0,
  }));

  const activeProfile = PROFILES[profileIndex];
  const activeStory = activeProfile.stories[storyIndex];
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    video.load();
    void video.play().catch(() => {
      // Ignore autoplay prevention; video is already muted and should play on most browsers.
    });
  }, [open, profileIndex, storyIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const button = document.querySelector<HTMLElement>(
      `[data-story-profile="${profileIndex}"]`,
    );

    if (button) {
      setTriggerRect(button.getBoundingClientRect());
    }
  }, [open, profileIndex]);

  function openStory(index: number, target: HTMLElement) {
    setIsClosing(false);
    setProfileIndex(index);
    setStoryIndex(0);
    setProgress(0);
    setTriggerRect(target.getBoundingClientRect());
    setOpen(true);
  }

  function closeStory() {
    if (!open || isClosing) {
      return;
    }

    setIsClosing(true);
  }

  function handleDialogOpenChange(value: boolean) {
    if (!value && open && !isClosing) {
      setIsClosing(true);
      return;
    }

    if (value) {
      setIsClosing(false);
      setOpen(true);
      return;
    }

    setOpen(false);
  }

  function handleNextStory() {
    setProgress(0);

    if (storyIndex + 1 < activeProfile.stories.length) {
      setStoryIndex(storyIndex + 1);
      return;
    }

    const nextProfile = profileIndex + 1;

    if (nextProfile < PROFILES.length) {
      setUserSlideDirection(isRtl ? -1 : 1);
      setProfileIndex(nextProfile);
      setStoryIndex(0);
      return;
    }

    closeStory();
  }

  function handlePrevStory() {
    setProgress(0);

    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      return;
    }

    if (profileIndex > 0) {
      setUserSlideDirection(isRtl ? 1 : -1);
      const previousProfile = PROFILES[profileIndex - 1];
      setProfileIndex(profileIndex - 1);
      setStoryIndex(previousProfile.stories.length - 1);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const duration = video.duration || activeStory.duration || 10;
    setProgress((video.currentTime / duration) * 100);
  }

  function handleEnded() {
    handleNextStory();
  }

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.visualViewport?.width ?? window.innerWidth,
        height: window.visualViewport?.height ?? window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);

  // 9/16 aspect ratio (vertical mobile format)
  const maxWidth = Math.min(427, viewport.width - 48);
  const contentWidth = maxWidth;
  const contentHeight = contentWidth * (16 / 9);
  const centeredLeft = Math.max(24, (viewport.width - contentWidth) / 2);
  const centeredTop = Math.max(24, (viewport.height - contentHeight) / 2);
  const collapsedLeft = triggerRect ? triggerRect.left : centeredLeft;
  const collapsedTop = triggerRect ? triggerRect.top : centeredTop;
  const collapsedWidth = triggerRect ? triggerRect.width : 0;
  const collapsedHeight = triggerRect ? triggerRect.height : 0;
  const motionTarget = isClosing
    ? {
        opacity: 1,
        left: collapsedLeft,
        top: collapsedTop,
        width: collapsedWidth,
        height: collapsedHeight,
        borderRadius: 12,
      }
    : {
        opacity: 1,
        left: centeredLeft,
        top: centeredTop,
        width: contentWidth,
        height: contentHeight,
        borderRadius: 16,
      };

  const storyPanelVariants = {
    enter: (direction: number) => ({
      x: direction * 100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction * -100,
      opacity: 0,
    }),
  };

  return (
    <div className={className}>
      <div className="border-border/10 bg-card/80 relative z-10 mx-auto w-full max-w-304 rounded-2xl border p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4 text-sm font-semibold text-white sm:text-base">
            <div className="sr-only">Stories</div>
            <div className="sr-only">Tap to open a story</div>
          </div>

          <div
            className={
              "no-scrollbar flex min-w-0 items-center gap-3 overflow-x-auto p-2"
            }
          >
            {PROFILES.map((profile, index) => {
              const initials = profile.name
                .split(" ")
                .map((segment) => segment.charAt(0))
                .join("")
                .slice(0, 2);

              return (
                <motion.button
                  key={profile.name}
                  type="button"
                  data-story-profile={index}
                  onClick={(event) =>
                    openStory(index, event.currentTarget as HTMLElement)
                  }
                  whileHover={{ scale: 1.02 }}
                  className="group focus-visible:ring-ring/50 border-border/10 bg-card/10 hover:border-border/20 hover:bg-card/20 relative inline-flex min-w-44 items-center gap-3 overflow-hidden rounded-lg border px-3 py-4 text-start transition focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div className="from-primary via-accent to-accent relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br p-0.5 shadow-[0_6px_25px_-15px_rgba(255,255,255,0.55)]">
                    <div className="bg-card text-foreground flex h-full w-full items-center justify-center rounded-full text-base font-semibold shadow-inner shadow-black/30">
                      {initials}
                    </div>
                  </div>
                  <div className="text-foreground min-w-0 text-sm leading-tight">
                    <p className="truncate font-semibold">{profile.name}</p>
                    {profile.role ? (
                      <p className="text-muted-foreground truncate text-xs">
                        {profile.role}
                      </p>
                    ) : (
                      <p className="text-muted-foreground truncate text-xs">
                        {profile.stories.length} story
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogPortal>
          <DialogOverlay className="bg-black/40" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 m-0 h-full w-full p-0 outline-none"
            onInteractOutside={(event) => event.preventDefault()}
          >
            <motion.div
              initial={{
                opacity: 0,
                left: collapsedLeft,
                top: collapsedTop,
                width: collapsedWidth,
                height: collapsedHeight,
                borderRadius: 28,
              }}
              animate={motionTarget}
              onAnimationComplete={() => {
                if (isClosing) {
                  setIsClosing(false);
                  setOpen(false);
                }
              }}
              transition={
                isClosing
                  ? { duration: 0.25, ease: "easeOut" }
                  : { duration: 0.35, ease: "easeIn" }
              }
              className="bg-card/95 text-foreground ring-border/10 fixed z-50 overflow-hidden rounded-4xl shadow-2xl ring-1 shadow-black/50"
            >
              <div className="absolute inset-s-0 inset-e-0 top-0 z-20 flex gap-1 px-4 pt-4">
                {activeProfile.stories.map((story, idx) => (
                  <div
                    key={story.url}
                    className="bg-muted-foreground/20 h-0.5 flex-1 overflow-hidden rounded-full"
                  >
                    <div
                      className="bg-foreground h-full rounded-full transition-all duration-300"
                      style={{
                        width:
                          idx < storyIndex
                            ? "100%"
                            : idx === storyIndex
                              ? `${progress}%`
                              : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute inset-s-0 top-8 z-30 flex px-4">
                <div className="space-y-1 text-sm">
                  <p className="text-foreground font-semibold">
                    {activeProfile.name}
                  </p>
                  <p className="text-muted-foreground text-xs font-medium">
                    {activeStory.createdAt}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="text-foreground absolute inset-e-2 top-4 z-30 size-9 rounded-full p-0.5 shadow-lg shadow-black/20"
                onClick={closeStory}
              >
                <XIcon className="size-5" />
                <span className="sr-only">Close story</span>
              </Button>

              <div
                className="absolute inset-x-0 bottom-18 z-10 overflow-hidden"
                style={{ top: "80px" }}
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                  custom={userSlideDirection}
                >
                  <motion.video
                    key={`${activeProfile.name}-${activeStory.url}`}
                    custom={userSlideDirection}
                    variants={storyPanelVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    ref={videoRef}
                    src={activeStory.url}
                    className="h-full w-full bg-black object-cover"
                    playsInline
                    muted
                    autoPlay
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                  />
                </AnimatePresence>
                <div className="from-card/95 via-card/30 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent" />
              </div>

              {/* Timeline */}
              <div className="absolute inset-s-0 inset-e-0 top-4 z-30 flex w-full items-center justify-center gap-2 px-4">
                {/* <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div> */}
                {/* {activeProfile.stories.length > 1 ? (
                  // Multi-story timeline with navigation dots
                  activeProfile.stories.map((story, idx) => (
                    <motion.button
                      key={`story-${idx}`}
                      type="button"
                      onClick={() => {
                        setStoryIndex(idx);
                        setProgress(0);
                      }}
                      whileHover={{ scale: 1.1 }}
                      className="group relative h-8 w-8 rounded-full border-2 transition-colors"
                      style={{
                        borderColor:
                          idx === storyIndex
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(255, 255, 255, 0.3)",
                        backgroundColor:
                          idx < storyIndex
                            ? "rgba(255, 255, 255, 0.6)"
                            : idx === storyIndex
                              ? "rgba(255, 255, 255, 0.1)"
                              : "transparent",
                      }}
                    >
                      <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                        {idx + 1}
                      </span>
                      {idx === storyIndex && (
                        <motion.div
                          layoutId="storyIndicator"
                          className="absolute inset-0 rounded-full border-2 border-white"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  ))
                ) : (
                  // Single story timeline - progress bar based on duration
                  <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )} */}
              </div>

              <div className="border-border/10 bg-card/70 absolute inset-s-0 inset-e-0 bottom-0 z-30 flex items-center justify-center gap-4 border-t px-4 py-3 backdrop-blur-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handlePrevStory}
                  title={isRtl ? "داستان بعدی" : "Previous story"}
                >
                  <PrevIcon className="size-5" />
                  <span className="sr-only">
                    {isRtl ? "داستان بعدی" : "Previous story"}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handleNextStory}
                  title={isRtl ? "داستان قبلی" : "Next story"}
                >
                  <NextIcon className="size-5" />
                  <span className="sr-only">
                    {isRtl ? "داستان قبلی" : "Next story"}
                  </span>
                </Button>
              </div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
