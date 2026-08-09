import {
  Cloud,
  Globe2,
  FileArchive,
  MessageSquareText,
  PenLine,
  RefreshCw,
  SearchCheck,
  Share2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type {
  ActivityIcon,
  ActivityOutcome,
} from "@/lib/data/activity/activity-records";

/**
 * Single source of truth for how an activity is rendered.
 *
 * The backend (WordPress -> Nest.js -> Next.js) only ever sends serializable
 * values: a stable `icon` string key and an `outcome`. JSON cannot carry a React
 * component, so the mapping from those keys to a concrete Lucide icon and to the
 * light/dark tone classes lives here on the frontend, where design tokens and
 * theming belong. Every surface that shows activities (the dashboard strip and
 * the full history page) imports from this registry so an activity type looks
 * identical everywhere and stays correct in both color schemes.
 */
export const activityIcons = {
  backup: Cloud,
  design: PenLine,
  dns: Globe2,
  monitoring: RefreshCw,
  project: FileArchive,
  seo: SearchCheck,
  social: Share2,
  support: MessageSquareText,
  website: Wrench,
} satisfies Record<ActivityIcon, LucideIcon>;

/**
 * Tone classes for the round icon badge, keyed by outcome. Each entry pairs a
 * tinted surface with a foreground that stays legible in both light and dark
 * mode. Override the resolved CSS variables upstream if a surface needs a
 * different tint; do not hardcode raw colors at the call site.
 */
export const activityIconToneClasses = {
  completed: "bg-success/12 text-success-foreground dark:text-success",
  resolved: "bg-success/12 text-success-foreground dark:text-success",
  updated: "bg-popover text-link",
  detected: "bg-popover text-link",
  restored: "bg-success/12 text-success-foreground dark:text-success",
  attention: "bg-warning/18 text-warning-foreground dark:text-warning",
} satisfies Record<ActivityOutcome, string>;
