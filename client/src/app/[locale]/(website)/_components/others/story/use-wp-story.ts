"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { useLocale } from "next-intl";
import {
  type PanInfo,
  type TransformProperties,
  type TransformTemplate,
} from "framer-motion";

import { useCarousel } from "@/components/ui/carousel";

export function isVideoStorySource(src: string) {
  return /\.(mp4|webm|ogg|mov)(?:$|\?)/i.test(src);
}

/* eslint-disable no-restricted-syntax -- Team member names (proper nouns) and placeholder role labels for the WP-driven story rail; replaced by WordPress API content, not localizable UI copy. */
export const PROFILES = [
  {
    order: 10,
    name: "خشایار نخستین‌فر",
    role: "دیزاینر",
    image: {
      src: "/images/unixsee-team/kh.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-1.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "2h",
        duration: 10,
      },
      {
        order: 20,
        url: "/videos/testimonials/testimonial-1.mp4",
        createdAt: "2h",
        duration: 10,
      },
    ],
  },
  {
    order: 20,
    name: "مهدی شالیکار",
    role: "ادمین سرور",
    image: {
      src: "/images/unixsee-team/mehdi.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-2.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "2h",
        duration: 5,
      },
    ],
  },
  {
    order: 30,
    name: "هدا اسمائیل‌پور",
    role: "متخصص هوش مصنوعی",
    image: {
      src: "/images/unixsee-team/hoda.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-3.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "2h",
        duration: 5,
      },
    ],
  },
  {
    order: 40,
    name: "علی منیری",
    role: "ادمین سرور",
    image: {
      src: "/images/unixsee-team/moniri.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-3.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "2h",
        duration: 5,
      },
    ],
  },
  {
    order: 50,
    name: "فریبرز عشوری",
    role: "برنامه‌نویس وردپرس",
    image: {
      src: "/images/unixsee-team/fariborz.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-4.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "2h",
        duration: 5,
      },
      {
        order: 20,
        url: "/images/unixsee-team/fariborz-story-1.jpg",
        createdAt: "2h",
        duration: 5,
      },
    ],
  },
  {
    order: 60,
    name: "آروین رمضانی",
    role: "برنامه‌نویس",
    image: {
      src: "/images/unixsee-team/arvin.png",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-3.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/testimonials/testimonial-1.mp4",
        createdAt: "4h",
        duration: 10,
      },
    ],
  },
  {
    order: 70,
    name: "علی ابراهیم‌زاده",
    role: "مدیر سئو",
    image: {
      src: "/images/unixsee-team/ali.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-4.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "1d",
        duration: 10,
      },
    ],
  },
  {
    order: 80,
    name: "مرتضی ندیمی",
    role: "مانیتورینگ",
    image: {
      src: "/images/unixsee-team/morteza.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-5.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "1d",
        duration: 10,
      },
    ],
  },
  {
    order: 90,
    name: "امیرحسین جلیلیان",
    role: "دیزاینر",
    image: {
      src: "/images/unixsee-team/amir.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-6.png",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "1d",
        duration: 10,
      },
    ],
  },
  {
    order: 100,
    name: "بهنیا معصومی",
    role: "برنامه‌نویس",
    image: {
      src: "/images/unixsee-team/behnia.jpg",
      alt: "",
    },
    cover: {
      src: "/images/unixsee-team/cover-7.jpg",
      alt: "",
    },
    stories: [
      {
        order: 10,
        url: "/videos/hero-section/hero-section-improved.mp4",
        createdAt: "1d",
        duration: 10,
      },
    ],
  },
];
/* eslint-enable no-restricted-syntax */

const STORY_SEEN_STORAGE_KEY = "unixsee:wp-story-seen:v1";
const STORY_HOLD_THRESHOLD_MS = 500;

type StoryProfile = (typeof PROFILES)[number] & {
  id?: number | string;
  order?: number;
};

type StoryItem = StoryProfile["stories"][number] & {
  order?: number;
};

type SeenProfileStorage = Record<
  string,
  {
    completedAt: number;
    signature: string;
  }
>;

function getProfileKey(profile: StoryProfile, fallbackIndex: number) {
  return String(profile.id ?? profile.name ?? fallbackIndex);
}

function getProfileOrder(profile: StoryProfile, fallbackIndex: number) {
  return typeof profile.order === "number" ? profile.order : fallbackIndex;
}

function getStoryOrder(story: StoryItem, fallbackIndex: number) {
  return typeof story.order === "number" ? story.order : fallbackIndex;
}

function sortStoriesByOrder(stories: StoryItem[]) {
  return stories
    .map((story, index) => ({ index, story }))
    .sort(
      (first, second) =>
        getStoryOrder(first.story, first.index) -
          getStoryOrder(second.story, second.index) ||
        first.index - second.index,
    )
    .map(({ story }) => story);
}

function normalizeProfiles(profiles: StoryProfile[]) {
  return profiles.map((profile) => ({
    ...profile,
    stories: sortStoriesByOrder(profile.stories),
  }));
}

function getProfileStorySignature(profile: StoryProfile) {
  return profile.stories
    .map((story) => `${story.url}:${story.createdAt}:${story.duration}`)
    .join("|");
}

function readSeenProfileStorage(profiles: StoryProfile[]) {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(STORY_SEEN_STORAGE_KEY);
    const parsedValue = rawValue
      ? (JSON.parse(rawValue) as SeenProfileStorage)
      : {};
    const seenProfiles = profiles.reduce<SeenProfileStorage>(
      (seenProfiles, profile, index) => {
        const profileKey = getProfileKey(profile, index);
        const storedProfile = parsedValue[profileKey];

        if (
          storedProfile?.signature === getProfileStorySignature(profile) &&
          typeof storedProfile.completedAt === "number"
        ) {
          seenProfiles[profileKey] = storedProfile;
        }

        return seenProfiles;
      },
      {},
    );

    if (
      rawValue &&
      JSON.stringify(parsedValue) !== JSON.stringify(seenProfiles)
    ) {
      window.localStorage.setItem(
        STORY_SEEN_STORAGE_KEY,
        JSON.stringify(seenProfiles),
      );
    }

    return seenProfiles;
  } catch {
    return {};
  }
}

function writeSeenProfileStorage(seenProfiles: SeenProfileStorage) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORY_SEEN_STORAGE_KEY,
      JSON.stringify(seenProfiles),
    );
  } catch {
    // Storage can be unavailable in private browsing; story playback should continue.
  }
}

function sortProfilesBySeenState(
  profiles: StoryProfile[],
  seenProfiles: SeenProfileStorage,
) {
  return profiles
    .map((profile, index) => ({
      index,
      isSeen: Boolean(seenProfiles[getProfileKey(profile, index)]),
      order: getProfileOrder(profile, index),
      profile,
    }))
    .sort((first, second) => {
      if (first.isSeen !== second.isSeen) {
        return first.isSeen ? 1 : -1;
      }

      return first.order - second.order || first.index - second.index;
    })
    .map(({ profile }) => profile);
}

type StoryCarouselSyncOptions = {
  activeIndex: number;
  activeProfileIndex: number;
  enabled: boolean;
  onActiveRectChange: (rect: DOMRect) => void;
};

export function useStoryCarouselSync({
  activeIndex,
  activeProfileIndex,
  enabled,
  onActiveRectChange,
}: StoryCarouselSyncOptions) {
  const { api } = useCarousel();

  useEffect(() => {
    if (!enabled || !api) {
      return;
    }

    const getViewportNode = () => api.containerNode().parentElement;

    const isButtonFullyVisible = (
      button: HTMLElement,
      viewportNode: HTMLElement,
    ) => {
      const activeRect = button.getBoundingClientRect();
      const viewportRect = viewportNode.getBoundingClientRect();
      const tolerance = 1;

      return (
        activeRect.left >= viewportRect.left - tolerance &&
        activeRect.right <= viewportRect.right + tolerance
      );
    };

    const getTargetActiveButton = () => {
      const activeSlide = api.slideNodes()[activeIndex];
      return activeSlide?.querySelector<HTMLElement>(
        `[data-story-profile="${activeProfileIndex}"]`,
      );
    };

    const getVisibleActiveButton = () => {
      const viewportNode = getViewportNode();

      if (!viewportNode) {
        return null;
      }

      return (
        Array.from(
          api
            .rootNode()
            .querySelectorAll<HTMLElement>(
              `[data-story-profile="${activeProfileIndex}"]`,
            ),
        ).find((button) => isButtonFullyVisible(button, viewportNode)) ?? null
      );
    };

    const updateActiveRect = () => {
      const activeButton = getVisibleActiveButton() ?? getTargetActiveButton();
      if (activeButton) {
        onActiveRectChange(activeButton.getBoundingClientRect());
      }
    };

    const isActiveButtonFullyVisible = () => {
      const activeButton = getVisibleActiveButton() ?? getTargetActiveButton();
      const viewportNode = getViewportNode();

      if (!activeButton || !viewportNode) {
        return false;
      }

      return isButtonFullyVisible(activeButton, viewportNode);
    };

    let firstFrame = 0;
    let secondFrame = 0;
    let thirdFrame = 0;

    const syncAfterPaint = () => {
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (isActiveButtonFullyVisible()) {
            updateActiveRect();
            return;
          }

          api.scrollTo(activeIndex);
          thirdFrame = window.requestAnimationFrame(updateActiveRect);
        });
      });
    };

    syncAfterPaint();
    api.on("settle", updateActiveRect);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.cancelAnimationFrame(thirdFrame);
      api.off("settle", updateActiveRect);
    };
  }, [activeIndex, activeProfileIndex, api, enabled, onActiveRectChange]);
}

export function useWpStory() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const sourceProfiles = useMemo(
    () => normalizeProfiles(PROFILES as StoryProfile[]),
    [],
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ambientVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeVideoKeyRef = useRef("");
  const handleNextStoryRef = useRef<(() => void) | null>(null);
  const isMutedRef = useRef(true);
  const isPausedRef = useRef(false);
  const imageStoryRemainingRef = useRef(0);
  const imageStoryStartedAtRef = useRef(0);
  const pendingSeenProfilesRef = useRef<SeenProfileStorage | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mobileSwipeCompletionTimeoutRef = useRef(0);
  const mobileDismissSnapBackTimeoutRef = useRef(0);
  const mobileHoldTimeoutRef = useRef(0);
  const isMobileHoldActiveRef = useRef(false);
  const wasPausedBeforeTouchRef = useRef(false);
  const suppressTapRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [userSlideDirection, setUserSlideDirection] = useState(1);
  const [mobileSwipeOffset, setMobileSwipeOffset] = useState(0);
  const [mobileDismissOffset, setMobileDismissOffset] = useState(0);
  const [isMobileDismissSnappingBack, setIsMobileDismissSnappingBack] =
    useState(false);
  const [isMobileSwipeSettling, setIsMobileSwipeSettling] = useState(false);
  const [isMobileTouchActive, setIsMobileTouchActive] = useState(false);
  const [desktopDragOffset, setDesktopDragOffset] = useState(0);
  const [isDesktopDragging, setIsDesktopDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seenProfiles, setSeenProfiles] = useState<SeenProfileStorage>({});
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const profiles = useMemo(
    () => sortProfilesBySeenState(sourceProfiles, seenProfiles),
    [seenProfiles, sourceProfiles],
  );
  const activeProfile = profiles[profileIndex] ?? profiles[0];
  const activeStory = activeProfile.stories[storyIndex];
  const activeVideoKey = `${profileIndex}-${storyIndex}-${activeStory.url}`;
  const isActiveStoryVideo = isVideoStorySource(activeStory.url);
  const triggerLoopCopies = 2;
  const triggerLoopMiddleOffset =
    Math.floor(triggerLoopCopies / 2) * profiles.length;
  const getProfileSeenState = (profile: StoryProfile) => {
    const sourceIndex = sourceProfiles.indexOf(profile);
    const profileKey = getProfileKey(
      profile,
      sourceIndex >= 0 ? sourceIndex : profiles.indexOf(profile),
    );

    return Boolean(seenProfiles[profileKey]);
  };
  const isActiveProfileSeen = getProfileSeenState(activeProfile);
  const triggerProfiles = Array.from(
    { length: triggerLoopCopies * profiles.length },
    (_, index) => ({
      isSeen: getProfileSeenState(profiles[index % profiles.length]),
      profile: profiles[index % profiles.length],
      originalIndex: index % profiles.length,
      slideIndex: index,
    }),
  );
  const [isClosing, setIsClosing] = useState(false);

  useLayoutEffect(() => {
    activeVideoKeyRef.current = activeVideoKey;
    imageStoryRemainingRef.current = (activeStory.duration || 5) * 1000;
    imageStoryStartedAtRef.current = 0;
  }, [activeStory.duration, activeVideoKey]);

  useLayoutEffect(() => {
    isMutedRef.current = isMuted;
    isPausedRef.current = isPaused;
  }, [isMuted, isPaused]);

  useLayoutEffect(() => {
    handleNextStoryRef.current = handleNextStory;
  });

  const updateTriggerRect = useCallback((rect: DOMRect) => {
    setTriggerRect(rect);
  }, []);

  const updateTriggerRectFromActiveButton = useCallback(() => {
    const activeButtons = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-story-profile="${profileIndex}"]`,
      ),
    );
    const viewportCenter = window.innerWidth / 2;
    const activeButton = activeButtons
      .map((button) => ({
        button,
        rect: button.getBoundingClientRect(),
      }))
      .filter(({ rect }) => rect.right > 0 && rect.left < window.innerWidth)
      .sort(
        (first, second) =>
          Math.abs(first.rect.left + first.rect.width / 2 - viewportCenter) -
          Math.abs(second.rect.left + second.rect.width / 2 - viewportCenter),
      )[0]?.button;

    if (activeButton) {
      setTriggerRect(activeButton.getBoundingClientRect());
    }
  }, [profileIndex]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setSeenProfiles(readSeenProfileStorage(sourceProfiles));
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [sourceProfiles]);

  useEffect(() => {
    document
      .querySelectorAll<HTMLVideoElement>("[data-wp-story-video-key]")
      .forEach((storyVideo) => {
        if (storyVideo.dataset.wpStoryVideoKey !== activeVideoKey) {
          storyVideo.pause();
        }
      });
  }, [activeVideoKey]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const video = videoRef.current;
    const ambientVideo = ambientVideoRef.current;

    if (video) {
      video.muted = isMutedRef.current;
      video.currentTime = 0;
      video.load();

      if (isPausedRef.current) {
        video.pause();
      } else {
        void video.play().catch(() => {
          // Ignore autoplay prevention; video is already muted and should play on most browsers.
        });
      }
    }

    if (ambientVideo && isActiveStoryVideo) {
      ambientVideo.currentTime = 0;
      ambientVideo.load();

      if (isPausedRef.current) {
        ambientVideo.pause();
        return;
      }

      void ambientVideo.play().catch(() => {
        // Ambient video is decorative; playback failure should not affect the story.
      });
    }
  }, [open, activeVideoKey, isActiveStoryVideo]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const video = videoRef.current;
    const ambientVideo = ambientVideoRef.current;

    if (!video) {
      return;
    }

    video.muted = isMuted;

    if (isPaused) {
      video.pause();
      ambientVideo?.pause();
      return;
    }

    void video.play().catch(() => {
      // Ignore autoplay prevention; the story remains visible and can still be advanced.
    });

    if (ambientVideo && isActiveStoryVideo) {
      void ambientVideo.play().catch(() => {
        // Ambient video is decorative; playback failure should not affect the story.
      });
    }
  }, [isMuted, isPaused, isActiveStoryVideo, open]);

  useEffect(() => {
    if (!open || isActiveStoryVideo || isPaused) {
      return;
    }

    const duration = (activeStory.duration || 5) * 1000;
    const remainingTime =
      imageStoryRemainingRef.current > 0
        ? Math.min(imageStoryRemainingRef.current, duration)
        : duration;
    const elapsedBeforeStart = duration - remainingTime;
    const startedAt = performance.now() - elapsedBeforeStart;
    let timeoutId = 0;

    imageStoryStartedAtRef.current = startedAt;

    const updateImageStoryProgress = () => {
      const elapsed = performance.now() - startedAt;
      imageStoryRemainingRef.current = Math.max(duration - elapsed, 0);

      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        handleNextStoryRef.current?.();
        return;
      }

      timeoutId = window.setTimeout(updateImageStoryProgress, 80);
    };

    updateImageStoryProgress();

    return () => {
      window.clearTimeout(timeoutId);

      if (imageStoryStartedAtRef.current === startedAt) {
        const elapsed = performance.now() - startedAt;
        imageStoryRemainingRef.current = Math.max(duration - elapsed, 0);
      }
    };
  }, [
    activeStory.duration,
    activeVideoKey,
    isActiveStoryVideo,
    isPaused,
    open,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const button = document.querySelector<HTMLElement>(
      `[data-story-profile="${profileIndex}"]`,
    );

    const animationFrame = window.requestAnimationFrame(() => {
      if (button) {
        updateTriggerRect(button.getBoundingClientRect());
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [open, profileIndex, updateTriggerRect]);

  function openStory(index: number, target: HTMLElement) {
    setIsClosing(false);
    setIsPaused(false);
    setProfileIndex(index);
    setStoryIndex(0);
    setProgress(0);
    setTriggerRect(target.getBoundingClientRect());
    setOpen(true);
  }

  function markActiveProfileCompletedOnFinalStory() {
    if (storyIndex === activeProfile.stories.length - 1) {
      markActiveProfileCompleted();
    }
  }

  function closeStory() {
    if (!open || isClosing) {
      return;
    }

    markActiveProfileCompletedOnFinalStory();
    updateTriggerRectFromActiveButton();
    setIsClosing(true);
  }

  function finishClosing() {
    if (pendingSeenProfilesRef.current) {
      setSeenProfiles(pendingSeenProfilesRef.current);
      pendingSeenProfilesRef.current = null;
    }

    setIsClosing(false);
    setMobileDismissOffset(0);
    setOpen(false);
  }

  function handleDialogOpenChange(value: boolean) {
    if (!value && open && !isClosing) {
      markActiveProfileCompletedOnFinalStory();
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

  function markActiveProfileCompleted() {
    const sourceIndex = sourceProfiles.indexOf(activeProfile);
    const profileKey = getProfileKey(
      activeProfile,
      sourceIndex >= 0 ? sourceIndex : profileIndex,
    );

    setSeenProfiles((currentSeenProfiles) => {
      const baseSeenProfiles =
        pendingSeenProfilesRef.current ?? currentSeenProfiles;
      const nextSeenProfiles = {
        ...baseSeenProfiles,
        [profileKey]: {
          completedAt: Date.now(),
          signature: getProfileStorySignature(activeProfile),
        },
      };

      writeSeenProfileStorage(nextSeenProfiles);

      if (open) {
        pendingSeenProfilesRef.current = nextSeenProfiles;
        return currentSeenProfiles;
      }

      return nextSeenProfiles;
    });
  }

  function handleNextStory() {
    setProgress(0);
    setUserSlideDirection(isRtl ? -1 : 1);

    if (storyIndex + 1 < activeProfile.stories.length) {
      setStoryIndex(storyIndex + 1);
      return;
    }

    const nextProfile = profileIndex + 1;
    markActiveProfileCompleted();

    if (nextProfile < profiles.length) {
      setProfileIndex(nextProfile);
      setStoryIndex(0);
      return;
    }

    closeStory();
  }

  function handlePrevStory() {
    setProgress(0);
    setUserSlideDirection(isRtl ? 1 : -1);

    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      return;
    }

    if (profileIndex > 0) {
      const previousProfile = profiles[profileIndex - 1];

      setProfileIndex(profileIndex - 1);
      setStoryIndex(previousProfile.stories.length - 1);
    }
  }

  function selectProfile(index: number) {
    if (index === profileIndex) {
      return;
    }

    setProgress(0);
    setUserSlideDirection(
      index > profileIndex ? (isRtl ? -1 : 1) : isRtl ? 1 : -1,
    );
    setProfileIndex(index);
    setStoryIndex(0);
  }

  function handleTimeUpdate(video: HTMLVideoElement, videoKey: string) {
    if (videoKey !== activeVideoKeyRef.current) {
      return;
    }

    const duration = video.duration || activeStory.duration || 10;
    setProgress((video.currentTime / duration) * 100);

    const ambientVideo = ambientVideoRef.current;

    if (
      ambientVideo &&
      isActiveStoryVideo &&
      Math.abs(ambientVideo.currentTime - video.currentTime) > 0.25
    ) {
      ambientVideo.currentTime = video.currentTime;
    }
  }

  function handleEnded(videoKey: string) {
    if (videoKey !== activeVideoKeyRef.current) {
      return;
    }

    handleNextStory();
  }

  function handleCanPlay(video: HTMLVideoElement, videoKey: string) {
    if (videoKey !== activeVideoKeyRef.current) {
      return;
    }

    video.muted = isMutedRef.current;

    if (isPausedRef.current) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      // Ignore autoplay prevention; the story remains visible and can still be advanced.
    });
  }

  function handleAmbientCanPlay(video: HTMLVideoElement) {
    video.muted = true;

    const activeVideo = videoRef.current;

    if (
      activeVideo &&
      Math.abs(video.currentTime - activeVideo.currentTime) > 0.25
    ) {
      video.currentTime = activeVideo.currentTime;
    }

    if (isPausedRef.current) {
      video.pause();
      return;
    }

    void video.play().catch(() => {
      // Ambient video is decorative; playback failure should not affect the story.
    });
  }

  function pauseActiveStoryPlayback() {
    const video = videoRef.current;
    const ambientVideo = ambientVideoRef.current;

    if (video) {
      video.pause();
    }

    if (ambientVideo) {
      ambientVideo.pause();
    }

    if (!isActiveStoryVideo && imageStoryStartedAtRef.current > 0) {
      const duration = (activeStory.duration || 5) * 1000;
      const elapsed = performance.now() - imageStoryStartedAtRef.current;

      imageStoryRemainingRef.current = Math.max(duration - elapsed, 0);
    }

    isPausedRef.current = true;
    setIsPaused(true);
  }

  function restoreStoryPlayback() {
    setIsPaused(wasPausedBeforeTouchRef.current);
    isPausedRef.current = wasPausedBeforeTouchRef.current;

    if (wasPausedBeforeTouchRef.current) {
      return;
    }

    const video = videoRef.current;
    const ambientVideo = ambientVideoRef.current;

    void video?.play().catch(() => {
      // Ignore autoplay prevention; the visible story remains controllable.
    });

    if (ambientVideo && isActiveStoryVideo) {
      void ambientVideo.play().catch(() => {
        // Ambient video is decorative; playback failure should not affect the story.
      });
    }
  }

  function clearMobileHoldTimeout() {
    window.clearTimeout(mobileHoldTimeoutRef.current);
    mobileHoldTimeoutRef.current = 0;
  }

  function suppressNextTap() {
    suppressTapRef.current = true;
    window.setTimeout(() => {
      suppressTapRef.current = false;
    }, 350);
  }

  function snapBackMobileDismissOffset() {
    window.clearTimeout(mobileDismissSnapBackTimeoutRef.current);
    setIsMobileDismissSnappingBack(true);
    setMobileDismissOffset(0);

    mobileDismissSnapBackTimeoutRef.current = window.setTimeout(() => {
      setIsMobileDismissSnappingBack(false);
    }, 140);
  }

  function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (!isMobileViewport) {
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    wasPausedBeforeTouchRef.current = isPausedRef.current;
    isMobileHoldActiveRef.current = false;
    setIsMobileSwipeSettling(false);
    setIsMobileDismissSnappingBack(false);
    setMobileSwipeOffset(0);
    setMobileDismissOffset(0);
    clearMobileHoldTimeout();
    mobileHoldTimeoutRef.current = window.setTimeout(() => {
      if (!touchStartRef.current) {
        return;
      }

      isMobileHoldActiveRef.current = true;
      setIsMobileTouchActive(true);
      pauseActiveStoryPlayback();
    }, STORY_HOLD_THRESHOLD_MS);
  }

  function handleTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
    if (!isMobileViewport || !touchStartRef.current) {
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const isVerticalGesture =
      Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX) * 1.15;
    const isHorizontalGesture =
      Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15;

    if (isVerticalGesture) {
      if (!isMobileHoldActiveRef.current) {
        clearMobileHoldTimeout();
      }

      setMobileSwipeOffset(0);
      setMobileDismissOffset(
        deltaY > 0 ? Math.min(deltaY, viewportHeight * 0.5) : 0,
      );
      event.preventDefault();
      return;
    }

    if (!isHorizontalGesture) {
      return;
    }

    if (!isMobileHoldActiveRef.current) {
      clearMobileHoldTimeout();
    }

    const isNextProfileSwipe = isRtl ? deltaX > 0 : deltaX < 0;
    const hasTargetProfile = isNextProfileSwipe
      ? profileIndex + 1 < profiles.length
      : profileIndex > 0;

    event.preventDefault();
    setMobileDismissOffset(0);
    setMobileSwipeOffset(hasTargetProfile ? deltaX : deltaX * 0.18);
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    if (!isMobileViewport || !touchStartRef.current) {
      return;
    }

    clearMobileHoldTimeout();
    const touch = event.changedTouches[0];
    const shouldRestoreHoldPlayback = isMobileHoldActiveRef.current;

    if (!touch) {
      touchStartRef.current = null;
      isMobileHoldActiveRef.current = false;
      setIsMobileTouchActive(false);
      setMobileSwipeOffset(0);
      setMobileDismissOffset(0);
      if (shouldRestoreHoldPlayback) {
        restoreStoryPlayback();
      }
      return;
    }

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const isDownwardDismissSwipe =
      deltaY > 72 && deltaY > Math.abs(deltaX) * 1.25;
    const hasVerticalScrollMovement =
      Math.abs(deltaY) > 16 && Math.abs(deltaY) > Math.abs(deltaX);
    const isHorizontalSwipe =
      Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

    touchStartRef.current = null;
    isMobileHoldActiveRef.current = false;
    setIsMobileTouchActive(false);

    if (isDownwardDismissSwipe) {
      suppressNextTap();
      setMobileSwipeOffset(0);
      closeStory();
      return;
    }

    if (!isHorizontalSwipe) {
      if (shouldRestoreHoldPlayback || hasVerticalScrollMovement) {
        suppressNextTap();
      }

      if (shouldRestoreHoldPlayback) {
        restoreStoryPlayback();
      }

      setMobileSwipeOffset(0);
      if (hasVerticalScrollMovement) {
        snapBackMobileDismissOffset();
      } else {
        setMobileDismissOffset(0);
      }
      return;
    }

    suppressNextTap();
    setMobileDismissOffset(0);

    const isNextProfileSwipe = isRtl ? deltaX > 0 : deltaX < 0;
    const targetProfileIndex = isNextProfileSwipe
      ? profileIndex + 1
      : profileIndex - 1;
    const hasTargetProfile =
      targetProfileIndex >= 0 && targetProfileIndex < profiles.length;

    if (!hasTargetProfile) {
      setMobileSwipeOffset(0);
      setMobileDismissOffset(0);
      if (shouldRestoreHoldPlayback) {
        restoreStoryPlayback();
      }
      return;
    }

    setIsMobileSwipeSettling(true);
    setMobileSwipeOffset(
      isNextProfileSwipe === isRtl ? storyPanelWidth : -storyPanelWidth,
    );

    window.clearTimeout(mobileSwipeCompletionTimeoutRef.current);
    mobileSwipeCompletionTimeoutRef.current = window.setTimeout(() => {
      selectProfile(targetProfileIndex);
      setMobileSwipeOffset(0);
      setMobileDismissOffset(0);

      window.requestAnimationFrame(() => {
        setIsMobileSwipeSettling(false);
        if (shouldRestoreHoldPlayback) {
          restoreStoryPlayback();
        }
      });
    }, 180);
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

  useEffect(() => {
    return () => {
      window.clearTimeout(mobileDismissSnapBackTimeoutRef.current);
      window.clearTimeout(mobileHoldTimeoutRef.current);
      window.clearTimeout(mobileSwipeCompletionTimeoutRef.current);
    };
  }, []);

  const viewportWidth = viewport.width || 390;
  const viewportHeight = viewport.height || 844;
  const isMobileViewport = viewportWidth < 640;
  const desktopMaxStoryWidth = Math.min(
    433,
    Math.max(320, viewportWidth * 0.6),
  );
  const desktopMaxStoryHeight = Math.min(
    Math.max(420, viewportHeight - 96),
    desktopMaxStoryWidth * (16 / 9),
  );
  const desktopStoryWidth = desktopMaxStoryHeight * (9 / 16);
  const storyPanelWidth = isMobileViewport ? viewportWidth : desktopStoryWidth;
  const storyPanelHeight = isMobileViewport
    ? viewportHeight
    : desktopMaxStoryHeight;
  const contentWidth = viewportWidth;
  const contentHeight = viewportHeight;
  const centeredLeft = 0;
  const centeredTop = 0;
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
        borderRadius: 0,
      };
  const initialMotionTarget = {
    opacity: 0,
    left: collapsedLeft,
    top: collapsedTop,
    width: collapsedWidth,
    height: collapsedHeight,
    borderRadius: 28,
  };

  const cubeDepth = storyPanelWidth / 2;
  const mobileSwipeProgress =
    storyPanelWidth > 0
      ? Math.max(-1, Math.min(1, mobileSwipeOffset / storyPanelWidth))
      : 0;
  const mobileSwipeTargetProfileIndex =
    mobileSwipeOffset === 0
      ? null
      : isRtl
        ? mobileSwipeOffset > 0
          ? profileIndex + 1
          : profileIndex - 1
        : mobileSwipeOffset < 0
          ? profileIndex + 1
          : profileIndex - 1;
  const mobileSwipeTargetProfile =
    mobileSwipeTargetProfileIndex !== null &&
    mobileSwipeTargetProfileIndex >= 0 &&
    mobileSwipeTargetProfileIndex < profiles.length
      ? profiles[mobileSwipeTargetProfileIndex]
      : null;
  const mobileActiveRotateY = mobileSwipeProgress * 90;
  const mobilePreviewRotateY =
    mobileSwipeProgress < 0
      ? 90 + mobileSwipeProgress * 90
      : -90 + mobileSwipeProgress * 90;
  const desktopStoryScale = 0.7;
  const desktopStoryGap =
    viewportWidth < 768
      ? storyPanelWidth * -0.15
      : viewportWidth < 1024
        ? storyPanelWidth * -0.15 +
          ((viewportWidth - 768) / 256) * (24 + storyPanelWidth * 0.15)
        : 24;
  const desktopStoryStep = storyPanelWidth + desktopStoryGap;
  const desktopStoryDirection = isRtl ? -1 : 1;

  function handleDesktopDrag(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    setDesktopDragOffset(info.offset.x);
  }

  function handleDesktopDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const nearestProfileIndex = profiles.reduce(
      (nearestIndex, _profile, index) => {
        const nearestDistance = Math.abs(
          (nearestIndex - profileIndex) *
            desktopStoryStep *
            desktopStoryDirection +
            info.offset.x,
        );
        const currentDistance = Math.abs(
          (index - profileIndex) * desktopStoryStep * desktopStoryDirection +
            info.offset.x,
        );

        return currentDistance < nearestDistance ? index : nearestIndex;
      },
      profileIndex,
    );

    setDesktopDragOffset(0);
    selectProfile(nearestProfileIndex);
    window.setTimeout(() => setIsDesktopDragging(false), 0);
  }

  function createCubeFaceTransform(depth: number): TransformTemplate {
    // SRP: cube transform math is isolated from story navigation state.
    return (transform: TransformProperties) => {
      const rotateY = transform.rotateY;
      const rotation =
        typeof rotateY === "number" ? `${rotateY}deg` : (rotateY ?? "0deg");

      return `translateZ(-${depth}px) rotateY(${rotation}) translateZ(${depth}px)`;
    };
  }

  const storyCubeSwipe = {
    enter: (direction: number) => ({
      filter: "brightness(0.76)",
      opacity: 1,
      rotateY: direction > 0 ? 90 : -90,
      zIndex: 1,
    }),
    center: {
      filter: "brightness(1)",
      opacity: 1,
      rotateY: 0,
      zIndex: 2,
    },
    exit: (direction: number) => ({
      filter: "brightness(0.76)",
      opacity: 1,
      rotateY: direction > 0 ? -90 : 90,
      zIndex: 1,
    }),
  };

  return {
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
    finishClosing,
    getProfileSeenState,
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
    mobileDismissOffset,
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
    mobileActiveRotateY,
    mobilePreviewRotateY,
    mobileSwipeTargetProfile,
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
  };
}
