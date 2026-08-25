"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  isVideoStorySource,
  useStoryCarouselSync,
  useWpStory,
} from "./use-wp-story";

export type StoryProps = {
  className?: string;
};

function StoryCarouselSync({
  activeIndex,
  activeProfileIndex,
  enabled,
  onActiveRectChange,
}: {
  activeIndex: number;
  activeProfileIndex: number;
  enabled: boolean;
  onActiveRectChange: (rect: DOMRect) => void;
}) {
  useStoryCarouselSync({
    activeIndex,
    activeProfileIndex,
    enabled,
    onActiveRectChange,
  });

  return null;
}

export default function Story({ className }: StoryProps) {
  const {
    activeProfile,
    activeStory,
    activeVideoKey,
    ambientVideoRef,
    closeStory,
    createCubeFaceTransform,
    cubeDepth,
    desktopDragOffset,
    desktopStoryDirection,
    desktopStoryScale,
    desktopStoryStep,
    finishClosing,
    getProfileSeenState,
    handleCanPlay,
    handleAmbientCanPlay,
    handleDesktopDrag,
    handleDesktopDragEnd,
    handleDialogOpenChange,
    handleEnded,
    handleNextStory,
    handlePrevStory,
    handleTimeUpdate,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    isClosing,
    isActiveStoryVideo,
    isActiveProfileSeen,
    isDesktopDragging,
    isMobileDismissSnappingBack,
    isMobileSwipeSettling,
    isMobileTouchActive,
    initialMotionTarget,
    isMobileViewport,
    isMuted,
    isPaused,
    isRtl,
    mobileActiveRotateY,
    mobileDismissOffset,
    mobilePreviewRotateY,
    mobileSwipeTargetProfile,
    motionTarget,
    open,
    openStory,
    profileIndex,
    profiles,
    progress,
    selectProfile,
    setIsDesktopDragging,
    setIsMuted,
    setIsPaused,
    storyCubeSwipe,
    storyIndex,
    storyPanelHeight,
    storyPanelWidth,
    suppressTapRef,
    triggerLoopMiddleOffset,
    triggerProfiles,
    updateTriggerRect,
    userSlideDirection,
    videoRef,
  } = useWpStory();

  const mobileSwipeTargetStory = mobileSwipeTargetProfile?.stories[0];
  const isMobileSwipeTargetVideo = mobileSwipeTargetStory
    ? isVideoStorySource(mobileSwipeTargetStory.url)
    : false;
  const mobileDismissProgress =
    isMobileViewport && storyPanelHeight > 0
      ? Math.min(mobileDismissOffset / storyPanelHeight, 1)
      : 0;
  const dialogMotionTarget =
    isMobileViewport && !isClosing
      ? {
          ...motionTarget,
          y: mobileDismissOffset,
          scale: 1 - mobileDismissProgress * 0.08,
        }
      : {
          ...motionTarget,
          y: 0,
          scale: 1,
        };

  const storyMetaOverlay = (
    <>
      <div className="absolute inset-s-0 inset-e-0 top-0 z-20 flex gap-1 px-4 pt-2">
        {activeProfile.stories.map((item, idx) => (
          <div
            key={item.url}
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-100 ease-linear",
                idx < storyIndex && isActiveProfileSeen
                  ? "bg-white/45"
                  : "bg-white",
              )}
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

      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          "absolute inset-s-0 inset-e-0 top-8 z-30 flex items-start justify-between gap-3 px-4",
          isMobileViewport && "pe-14",
        )}
      >
        <div className="min-w-0 flex-1 space-y-1 text-start text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <p className="min-w-0 truncate font-semibold text-white">
              {activeProfile.name}
            </p>
            <span className="text-xs font-medium text-white/70">
              {activeStory.createdAt}
            </span>
            {isActiveProfileSeen && (
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-white/16 text-white/86 ring-1 ring-white/18 backdrop-blur-sm">
                <CheckCircle2Icon className="size-3" />
                <span className="sr-only">Seen</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-white transition"
            onClick={(event) => {
              event.stopPropagation();
              setIsPaused((value) => !value);
            }}
          >
            {isPaused ? (
              <PlayIcon className="size-4 fill-current" />
            ) : (
              <PauseIcon className="size-4 fill-current" />
            )}
            <span className="sr-only">
              {isPaused ? "Play story" : "Pause story"}
            </span>
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-white transition"
            onClick={(event) => {
              event.stopPropagation();
              setIsMuted((value) => !value);
            }}
          >
            {isMuted ? (
              <VolumeXIcon className="size-4" />
            ) : (
              <Volume2Icon className="size-4" />
            )}
            <span className="sr-only">
              {isMuted ? "Unmute stories" : "Mute stories"}
            </span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={cn("w-full max-w-full overflow-x-clip", className)}>
      <div className="relative z-10 mx-auto w-full max-w-full items-center justify-center rounded-2xl p-0">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4 text-sm font-semibold text-white sm:text-base">
            <div className="sr-only">Stories</div>
            <div className="sr-only">Tap to open a story</div>
          </div>

          <Carousel
            dir={isRtl ? "rtl" : "ltr"}
            opts={{
              align: "start",
              dragFree: true,
              loop: true,
            }}
            // data-lenis-prevent-wheel="true"
            className="max-w-full min-w-0 overflow-hidden py-2"
          >
            <StoryCarouselSync
              activeIndex={triggerLoopMiddleOffset + profileIndex}
              activeProfileIndex={profileIndex}
              enabled={open}
              onActiveRectChange={updateTriggerRect}
            />
            <CarouselContent className="-ms-3 select-none">
              {triggerProfiles.map(
                ({ isSeen, profile, originalIndex, slideIndex }) => (
                  <CarouselItem
                    key={`${slideIndex}-${profile.name}`}
                    className="basis-auto py-2 ps-3"
                  >
                    <motion.button
                      type="button"
                      data-story-profile={originalIndex}
                      data-story-slide={slideIndex}
                      aria-current={
                        profileIndex === originalIndex ? "true" : undefined
                      }
                      onClick={(event) =>
                        openStory(
                          originalIndex,
                          event.currentTarget as HTMLElement,
                        )
                      }
                      whileHover={{
                        scale: 1.025,
                        transition: {
                          duration: 0.1,
                        },
                      }}
                      whileTap={{
                        y: -1,
                        scale: 0.985,
                        transition: {
                          type: "spring",
                          stiffness: 520,
                          damping: 32,
                          mass: 0.6,
                        },
                      }}
                      className={cn(
                        "group focus-visible:ring-ring/50 border-muted-foreground/20 hover:border-muted-foreground/40 relative inline-flex items-center gap-3 overflow-hidden rounded-full border px-2 py-2 text-start transition focus-visible:ring-2 focus-visible:outline-none",
                        // profileIndex === originalIndex &&
                        //   "border-primary/40 bg-card/25 shadow-[0_16px_40px_-30px_rgba(255,255,255,0.75)]",
                      )}
                    >
                      {/* <Image
                        src={profile.cover.src}
                        alt={profile.cover.alt}
                        fill
                        className="-z-10 object-cover"
                      /> */}
                      {/* <div className="absolute inset-0 -z-10 h-full w-full rounded-lg bg-black/40" /> */}
                      <div
                        className={cn(
                          "relative flex size-14 shrink-0 items-center justify-center rounded-full border p-1",
                          // isSeen ? "bg-primary/30" : "bg-primary",
                          isSeen ? "border-muted" : "border-secondary",
                          // ? "from-primary to-accent"
                          // : "from-primary via-primary/50 to-secondary",
                        )}
                      >
                        <div className="text-foreground relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent bg-clip-text text-base font-semibold">
                          <Image
                            src={profile.image.src}
                            alt={profile.image.alt}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-muted-foreground min-w-0 text-sm leading-tight">
                        <p className="truncate font-semibold">{profile.name}</p>
                        {profile.role ? (
                          <p className="truncate text-xs font-light">
                            {profile.role}
                          </p>
                        ) : (
                          <p className="text-muted-foreground truncate text-xs font-light">
                            {profile.stories.length} story
                          </p>
                        )}
                      </div>
                    </motion.button>
                  </CarouselItem>
                ),
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
      {/* <div className="relative z-10 mx-auto w-full max-w-304 items-center justify-center rounded-2xl p-4 sm:p-2">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4 text-sm font-semibold text-white sm:text-base">
            <div className="sr-only">Stories</div>
            <div className="sr-only">Tap to open a story</div>
          </div>

          <Carousel
            dir={isRtl ? "rtl" : "ltr"}
            opts={{
              align: "start",
              dragFree: true,
              loop: true,
            }}
            // data-lenis-prevent-wheel="true"
            className="max-w-full min-w-0 overflow-hidden p-2"
          >
            <StoryCarouselSync
              activeIndex={triggerLoopMiddleOffset + profileIndex}
              activeProfileIndex={profileIndex}
              enabled={open}
              onActiveRectChange={updateTriggerRect}
            />
            <CarouselContent className="-ms-3 select-none">
              {triggerProfiles.map(
                ({ isSeen, profile, originalIndex, slideIndex }) => (
                  <CarouselItem
                    key={`${slideIndex}-${profile.name}`}
                    className="basis-auto py-2 ps-3"
                  >
                    <motion.button
                      type="button"
                      data-story-profile={originalIndex}
                      data-story-slide={slideIndex}
                      aria-current={
                        profileIndex === originalIndex ? "true" : undefined
                      }
                      onClick={(event) =>
                        openStory(
                          originalIndex,
                          event.currentTarget as HTMLElement,
                        )
                      }
                      whileHover={{
                        scale: 1.025,
                        transition: {
                          duration: 0.1,
                        },
                      }}
                      whileTap={{
                        y: -1,
                        scale: 0.985,
                        transition: {
                          type: "spring",
                          stiffness: 520,
                          damping: 32,
                          mass: 0.6,
                        },
                      }}
                      className={cn(
                        "group focus-visible:ring-ring/50 border-border/10 hover:border-border/20 relative inline-flex aspect-[1.8/2] w-37 flex-col items-start gap-3 overflow-hidden rounded-lg border px-2 py-2 text-start transition focus-visible:ring-2 focus-visible:outline-none",
                        // profileIndex === originalIndex &&
                        //   "border-primary/40 bg-card/25 shadow-[0_16px_40px_-30px_rgba(255,255,255,0.75)]",
                      )}
                    >
                      <Image
                        src={profile.cover.src}
                        alt={profile.cover.alt}
                        fill
                        className="-z-10 object-cover"
                      />
                      <div className="absolute inset-0 -z-10 h-full w-full rounded-lg bg-black/40" />
                      <div
                        className={cn(
                          "relative flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br p-1 rtl:bg-linear-to-bl",
                          // isSeen ? "bg-primary/30" : "bg-primary",
                          isSeen
                            ? "from-primary to-accent"
                            : "from-primary via-primary/50 to-secondary",
                        )}
                      >
                        <div className="bg-card text-foreground relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-clip-text text-base font-semibold shadow-inner shadow-black/30">
                          <Image
                            src={profile.image.src}
                            alt={profile.image.alt}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-background mt-auto min-w-0 text-sm leading-tight">
                        <p className="truncate font-semibold">{profile.name}</p>
                        {profile.role ? (
                          <p className="text-muted truncate text-xs">
                            {profile.role}
                          </p>
                        ) : (
                          <p className="text-muted-foreground truncate text-xs">
                            {profile.stories.length} story
                          </p>
                        )}
                      </div>
                    </motion.button>
                  </CarouselItem>
                ),
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </div> */}

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogPortal>
          <DialogOverlay className="bg-black/40" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 m-0 h-full max-h-dvh w-full max-w-dvw overflow-hidden p-0 outline-none"
            onInteractOutside={(event) => event.preventDefault()}
          >
            <DialogPrimitive.Title className="sr-only">
              Story
            </DialogPrimitive.Title>
            <motion.div
              initial={initialMotionTarget}
              animate={dialogMotionTarget}
              onAnimationComplete={() => {
                if (isClosing) {
                  finishClosing();
                }
              }}
              transition={
                isClosing
                  ? { duration: 0.2, ease: "easeOut" }
                  : mobileDismissOffset > 0
                    ? { duration: 0.08, ease: "linear" }
                    : isMobileDismissSnappingBack
                      ? { duration: 0.12, ease: "easeOut" }
                      : { duration: 0.35, ease: "easeIn" }
              }
              style={{
                transformOrigin: "center top",
              }}
              className={cn(
                "bg-card/95 text-foreground ring-border/10 fixed z-50 overflow-hidden shadow-2xl ring-1 shadow-black/50",
                isMobileViewport
                  ? "h-dvh max-h-dvh w-dvw max-w-dvw rounded-none"
                  : "rounded-none bg-black/90",
              )}
            >
              {isMobileViewport && !isMobileTouchActive && storyMetaOverlay}

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "absolute inset-e-2 top-7.5 z-30 size-9 rounded-full bg-black/45 p-0.5 text-white shadow-lg ring-1 shadow-black/30 ring-white/20 backdrop-blur-sm transition-opacity hover:bg-black/60 hover:text-white lg:top-4",
                  isMobileViewport &&
                    isMobileTouchActive &&
                    "pointer-events-none opacity-0",
                )}
                onClick={closeStory}
              >
                <XIcon className="size-5" />
                <span className="sr-only">Close story</span>
              </Button>

              <div
                className={cn(
                  "absolute inset-0 z-10 overflow-hidden",
                  isMobileViewport ? "touch-pan-y" : "",
                )}
                style={{
                  perspective: 1100,
                  perspectiveOrigin: "50% 50%",
                  transformStyle: "preserve-3d",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {isMobileViewport ? (
                  <>
                    <AnimatePresence
                      initial={false}
                      custom={userSlideDirection}
                      mode="sync"
                    >
                      <motion.div
                        key={`${profileIndex}-${activeProfile.name}`}
                        custom={userSlideDirection}
                        variants={storyCubeSwipe}
                        initial={isMobileSwipeSettling ? false : "enter"}
                        animate={
                          mobileSwipeTargetProfile
                            ? {
                                filter: "brightness(0.76)",
                                opacity: 1,
                                rotateY: mobileActiveRotateY,
                                zIndex: 2,
                              }
                            : "center"
                        }
                        exit="exit"
                        transition={{
                          duration: mobileSwipeTargetProfile ? 0.18 : 0.46,
                          ease: [0.32, 0.72, 0, 1],
                        }}
                        transformTemplate={createCubeFaceTransform(cubeDepth)}
                        style={{
                          backfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                          transformOrigin: "center center",
                        }}
                        className="absolute inset-0 h-full w-full overflow-hidden bg-black will-change-transform"
                      >
                        {isActiveStoryVideo ? (
                          <video
                            key={activeVideoKey}
                            ref={videoRef}
                            data-wp-story-video-key={activeVideoKey}
                            src={activeStory.url}
                            className="h-full w-full object-cover"
                            playsInline
                            muted={isMuted}
                            autoPlay={!isPaused}
                            onLoadedMetadata={(event) =>
                              handleTimeUpdate(
                                event.currentTarget,
                                activeVideoKey,
                              )
                            }
                            onTimeUpdate={(event) =>
                              handleTimeUpdate(
                                event.currentTarget,
                                activeVideoKey,
                              )
                            }
                            onCanPlay={(event) =>
                              handleCanPlay(event.currentTarget, activeVideoKey)
                            }
                            onEnded={() => handleEnded(activeVideoKey)}
                          />
                        ) : (
                          <Image
                            src={activeStory.url}
                            alt=""
                            fill
                            className="object-cover"
                            priority
                          />
                        )}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 via-black/35 to-transparent" />
                      </motion.div>
                    </AnimatePresence>

                    {mobileSwipeTargetProfile && mobileSwipeTargetStory && (
                      <motion.div
                        key={`mobile-preview-${mobileSwipeTargetProfile.name}`}
                        animate={{
                          filter: "brightness(0.9)",
                          opacity: 1,
                          rotateY: mobilePreviewRotateY,
                          zIndex: 1,
                        }}
                        transition={{
                          duration: 0.18,
                          ease: [0.32, 0.72, 0, 1],
                        }}
                        transformTemplate={createCubeFaceTransform(cubeDepth)}
                        style={{
                          backfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                          transformOrigin: "center center",
                        }}
                        className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden bg-black will-change-transform"
                      >
                        {isMobileSwipeTargetVideo ? (
                          <video
                            data-wp-story-video-key={`preview-${mobileSwipeTargetProfile.name}-${mobileSwipeTargetStory.url}`}
                            src={mobileSwipeTargetStory.url}
                            className="h-full w-full object-cover"
                            playsInline
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <Image
                            src={mobileSwipeTargetStory.url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 via-black/35 to-transparent" />
                      </motion.div>
                    )}

                    <button
                      type="button"
                      className="absolute inset-s-0 top-0 bottom-0 z-20 w-1/2 cursor-default"
                      onClick={() => {
                        if (suppressTapRef.current) {
                          return;
                        }

                        handlePrevStory();
                      }}
                    >
                      <span className="sr-only">Previous story</span>
                    </button>
                    <button
                      type="button"
                      className="absolute inset-e-0 top-0 bottom-0 z-20 w-1/2 cursor-default"
                      onClick={() => {
                        if (suppressTapRef.current) {
                          return;
                        }

                        handleNextStory();
                      }}
                    >
                      <span className="sr-only">Next story</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black">
                      {isActiveStoryVideo ? (
                        <video
                          key={`ambient-${activeVideoKey}`}
                          ref={ambientVideoRef}
                          src={activeStory.url}
                          className="h-full w-full scale-110 object-cover opacity-65 blur-3xl"
                          playsInline
                          muted
                          autoPlay={!isPaused}
                          loop
                          onCanPlay={(event) =>
                            handleAmbientCanPlay(event.currentTarget)
                          }
                        />
                      ) : (
                        <Image
                          src={activeStory.url}
                          alt=""
                          fill
                          className="scale-110 object-cover opacity-65 blur-3xl"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/45" />
                    </div>

                    <motion.div
                      className="absolute inset-0 z-10"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0}
                      dragMomentum={false}
                      onDragStart={() => setIsDesktopDragging(true)}
                      onDrag={handleDesktopDrag}
                      onDragEnd={handleDesktopDragEnd}
                    >
                      {profiles.map((profile, index) => {
                        const isActiveProfile = index === profileIndex;
                        const isSeenPreview =
                          !isActiveProfile && getProfileSeenState(profile);
                        const visibleStory = isActiveProfile
                          ? activeStory
                          : profile.stories[0];
                        const visibleStoryIsVideo = isVideoStorySource(
                          visibleStory.url,
                        );
                        const videoKey = `${index}-${isActiveProfile ? storyIndex : 0}-${visibleStory.url}`;
                        const storyOffset =
                          (index - profileIndex) *
                          desktopStoryStep *
                          desktopStoryDirection;

                        return (
                          <motion.div
                            key={profile.name}
                            role="button"
                            tabIndex={0}
                            className={cn(
                              "group/story absolute top-1/2 left-1/2 rounded-2xl shadow-md focus-visible:outline-none",
                              isActiveProfile
                                ? "cursor-default"
                                : "cursor-pointer",
                            )}
                            style={{
                              width: storyPanelWidth,
                              height: storyPanelHeight,
                            }}
                            animate={{
                              opacity: isActiveProfile ? 1 : 0.72,
                              scale: isActiveProfile ? 1 : desktopStoryScale,
                              x:
                                storyOffset -
                                storyPanelWidth / 2 +
                                desktopDragOffset,
                              y: "-50%",
                              zIndex: isActiveProfile ? 2 : 1,
                            }}
                            transition={{
                              duration: 0.42,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            onClick={() => {
                              if (isActiveProfile || isDesktopDragging) {
                                return;
                              }

                              selectProfile(index);
                            }}
                            onKeyDown={(event) => {
                              if (
                                isActiveProfile ||
                                event.defaultPrevented ||
                                (event.key !== "Enter" && event.key !== " ")
                              ) {
                                return;
                              }

                              event.preventDefault();
                              selectProfile(index);
                            }}
                          >
                            <div className="peer/media absolute inset-0 overflow-hidden rounded-2xl bg-black">
                              {visibleStoryIsVideo ? (
                                <video
                                  key={videoKey}
                                  ref={isActiveProfile ? videoRef : undefined}
                                  data-wp-story-video-key={videoKey}
                                  src={visibleStory.url}
                                  className={cn(
                                    "h-full w-full object-cover",
                                    isSeenPreview &&
                                      "scale-[1.01] brightness-75 saturate-0",
                                  )}
                                  playsInline
                                  muted={isMuted}
                                  autoPlay={isActiveProfile && !isPaused}
                                  preload={
                                    isActiveProfile ? "auto" : "metadata"
                                  }
                                  onLoadedMetadata={(event) => {
                                    if (isActiveProfile) {
                                      handleTimeUpdate(
                                        event.currentTarget,
                                        activeVideoKey,
                                      );
                                    }
                                  }}
                                  onTimeUpdate={(event) => {
                                    if (isActiveProfile) {
                                      handleTimeUpdate(
                                        event.currentTarget,
                                        activeVideoKey,
                                      );
                                    }
                                  }}
                                  onCanPlay={(event) => {
                                    if (isActiveProfile) {
                                      handleCanPlay(
                                        event.currentTarget,
                                        activeVideoKey,
                                      );
                                    }
                                  }}
                                  onEnded={() => {
                                    if (isActiveProfile) {
                                      handleEnded(activeVideoKey);
                                    }
                                  }}
                                />
                              ) : (
                                <Image
                                  src={visibleStory.url}
                                  alt=""
                                  fill
                                  className={cn(
                                    "object-cover",
                                    isSeenPreview &&
                                      "scale-[1.01] brightness-75 saturate-0",
                                  )}
                                />
                              )}
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 via-black/35 to-transparent" />
                              {isSeenPreview && (
                                <>
                                  <div className="pointer-events-none absolute inset-0 bg-black/38" />
                                  <div className="absolute inset-s-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-black/42 text-white/88 ring-1 ring-white/16 backdrop-blur-sm">
                                    <CheckCircle2Icon className="size-4" />
                                    <span className="sr-only">Seen</span>
                                  </div>
                                </>
                              )}
                              {isActiveProfile && (
                                <>
                                  <button
                                    type="button"
                                    className="absolute inset-s-0 top-0 bottom-0 z-20 w-1/2 cursor-default"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handlePrevStory();
                                    }}
                                  >
                                    <span className="sr-only">
                                      Previous story
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    className="absolute inset-e-0 top-0 bottom-0 z-20 w-1/2 cursor-default"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleNextStory();
                                    }}
                                  >
                                    <span className="sr-only">Next story</span>
                                  </button>
                                </>
                              )}
                              {isActiveProfile && storyMetaOverlay}
                            </div>
                            {isActiveProfile && (
                              <>
                                <button
                                  type="button"
                                  className="absolute inset-s-0 top-1/2 z-30 -ms-14 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-30 shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition duration-200 peer-hover/media:opacity-100 hover:bg-black/50 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handlePrevStory();
                                  }}
                                >
                                  {isRtl ? (
                                    <ChevronRightIcon className="size-5" />
                                  ) : (
                                    <ChevronLeftIcon className="size-5" />
                                  )}
                                  <span className="sr-only">
                                    Previous story
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className="absolute inset-e-0 top-1/2 z-30 -me-14 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-30 shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition duration-200 peer-hover/media:opacity-100 hover:bg-black/50 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleNextStory();
                                  }}
                                >
                                  {isRtl ? (
                                    <ChevronLeftIcon className="size-5" />
                                  ) : (
                                    <ChevronRightIcon className="size-5" />
                                  )}
                                  <span className="sr-only">Next story</span>
                                </button>
                              </>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </>
                )}

                {/* <div className="pointer-events-none absolute inset-0 -z-10 bg-black" /> */}
                {/* <div className="from-card/95 via-card/30 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent" /> */}
              </div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
