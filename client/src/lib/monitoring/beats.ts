export type CaptionBeat = {
  /** Inclusive start of this caption on the 0–1 scroll progress. */
  start: number;
  fa: string;
  en: string;
};

export const SCROLL_HEIGHT_VH = 300;

export const CAPTION_BEATS: CaptionBeat[] = [
  {
    start: 0,
    fa: "فروشگاه خواب است",
    en: "The store is asleep.",
  },
  {
    start: 0.18,
    fa: "نبض ایجنت",
    en: "The agent keeps a pulse.",
  },
  {
    start: 0.38,
    fa: "چی را می‌بینیم",
    en: "Availability, backups, checkout health.",
  },
  {
    start: 0.58,
    fa: "تازه، نه سبزِ دروغین",
    en: "Stale never looks healthy.",
  },
  {
    start: 0.78,
    fa: "صبح بدون حادثه",
    en: "Morning, without an incident.",
  },
];

export function beatIndexForProgress(progress: number): number {
  let index = 0;
  for (let i = 0; i < CAPTION_BEATS.length; i += 1) {
    if (progress >= CAPTION_BEATS[i].start) index = i;
  }
  return index;
}
