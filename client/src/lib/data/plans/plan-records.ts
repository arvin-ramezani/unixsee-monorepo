import type { WebsitePlan } from "@/lib/websites-data";

export type PlanTier = Extract<
  WebsitePlan,
  "starter" | "business" | "pro" | "premium"
>;

export interface PlanRecord {
  /** Stable identifier used for routing and selection. */
  id: PlanTier;
  /** Localized plan name key under `Common.plans`. */
  nameKey: PlanTier;
  /** Monthly price shown on the card. Deterministic dummy pricing. */
  priceUsd: number;
  /** Short marketing line under the title. */
  tagline: string;
  /** Feature bullet list shown on the card. */
  features: string[];
  /** Highlights the card as the suggested option. */
  recommended?: boolean;
}

/**
 * Placeholder plan catalog. Real plan content and pricing are added later;
 * this keeps the presentation layer decoupled from any future data source.
 */
export const planRecords: PlanRecord[] = [
  {
    id: "starter",
    nameKey: "starter",
    priceUsd: 9,
    tagline: "For a single personal site getting started.",
    features: ["1 website", "10 GB storage", "Daily backups", "Community support"],
  },
  {
    id: "business",
    nameKey: "business",
    priceUsd: 29,
    tagline: "For growing sites that need more room.",
    features: ["5 websites", "50 GB storage", "Hourly backups", "Email support"],
    recommended: true,
  },
  {
    id: "pro",
    nameKey: "pro",
    priceUsd: 59,
    tagline: "For teams running production workloads.",
    features: ["20 websites", "200 GB storage", "Realtime backups", "Priority support"],
  },
  {
    id: "premium",
    nameKey: "premium",
    priceUsd: 129,
    tagline: "For high-traffic sites needing top tier.",
    features: [
      "Unlimited websites",
      "1 TB storage",
      "Realtime backups",
      "Dedicated support",
    ],
  },
];
