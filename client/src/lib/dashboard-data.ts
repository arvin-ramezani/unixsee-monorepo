import type { LucideIcon } from "lucide-react";
import {
  CircleAlert,
  CircleCheck,
  Clock3,
  Cloud,
  CreditCard,
  FileText,
  Globe2,
  Headphones,
  History,
  Layers3,
  LayoutDashboard,
  Link2,
  MessageSquareText,
  Megaphone,
  Newspaper,
  Palette,
  Search,
  UserRound,
  WalletCards,
  Wrench,
  MessagesSquare,
} from "lucide-react";

export type SiteStatus =
  "online" | "attention" | "maintenance" | "setupPending";
export type BackupStatus = "successful" | "scheduled" | "needsReview";
export type PlanCode = "starter" | "business" | "pro" | "premium" | "dedicated";
export type DescriptionCode =
  "ecommerce" | "portfolio" | "saas" | "agency" | "blog";

export interface Website {
  id: string;
  name: string;
  description: DescriptionCode;
  domain: string;
  monogram: string;
  accent: "success" | "danger" | "violet" | "info" | "warning";
  plan: PlanCode;
  status: SiteStatus;
  backup: BackupStatus;
  updatedAt: string;
}

export type NotificationKind =
  "platformUpdate" | "seoGuide" | "designShowcase" | "socialMediaTrends";

export interface FeedItem {
  kind: NotificationKind;
  occurredAt: string;
  href?: string;
  relative?: { value: number; unit: "minute" | "hour" };
  tone: "notification";
  icon: LucideIcon;
}

export interface NotificationItem extends FeedItem {
  kind: NotificationKind;
  notificationId: string;
  seenAt: string | null;
}

export const websites: Website[] = [
  {
    id: "greenario-store",
    name: "Greenario Store",
    description: "ecommerce",
    domain: "greenario.com",
    monogram: "G",
    accent: "success",
    plan: "starter",
    status: "online",
    backup: "successful",
    updatedAt: "2024-05-24T10:24:00Z",
  },
  {
    id: "luna-studio",
    name: "Luna Studio",
    description: "portfolio",
    domain: "lunastudio.co",
    monogram: "L",
    accent: "danger",
    plan: "business",
    status: "online",
    backup: "scheduled",
    updatedAt: "2024-05-23T16:18:00Z",
  },
  {
    id: "orbit-labs",
    name: "Orbit Labs",
    description: "saas",
    domain: "orbitlabs.io",
    monogram: "O",
    accent: "violet",
    plan: "pro",
    status: "attention",
    backup: "needsReview",
    updatedAt: "2024-05-22T11:07:00Z",
  },
  {
    id: "nova-agency",
    name: "Nova Agency",
    description: "agency",
    domain: "novaagency.com",
    monogram: "N",
    accent: "info",
    plan: "premium",
    status: "online",
    backup: "successful",
    updatedAt: "2024-05-21T09:35:00Z",
  },
  {
    id: "pixel-nest",
    name: "Pixel Nest",
    description: "blog",
    domain: "pixelnest.dev",
    monogram: "P",
    accent: "warning",
    plan: "dedicated",
    status: "maintenance",
    backup: "scheduled",
    updatedAt: "2024-05-20T14:41:00Z",
  },
];

export const notifications: NotificationItem[] = [
  {
    notificationId: "unixsee-monthly-update-2024-05",
    href: "/dashboard/notifications/unixsee-monthly-update-2024-05",
    seenAt: null,
    kind: "platformUpdate",
    occurredAt: "2024-05-24T10:24:00Z",
    relative: { value: -2, unit: "hour" },
    tone: "notification",
    icon: Newspaper,
  },
  {
    notificationId: "seo-visibility-guide-2024-05",
    href: "/dashboard/notifications/seo-visibility-guide-2024-05",
    seenAt: "2024-05-24T10:16:00Z",
    kind: "seoGuide",
    occurredAt: "2024-05-24T10:11:00Z",
    relative: { value: -5, unit: "hour" },
    tone: "notification",
    icon: Search,
  },
  {
    notificationId: "design-highlights-2024-05",
    href: "/dashboard/notifications/design-highlights-2024-05",
    seenAt: "2024-05-24T09:30:00Z",
    kind: "designShowcase",
    occurredAt: "2024-05-24T09:26:00Z",
    relative: { value: -8, unit: "hour" },
    tone: "notification",
    icon: Palette,
  },
  {
    notificationId: "social-media-trends-2024-05",
    href: "/dashboard/notifications/social-media-trends-2024-05",
    seenAt: "2024-05-24T07:30:00Z",
    kind: "socialMediaTrends",
    occurredAt: "2024-05-24T07:26:00Z",
    relative: { value: -12, unit: "hour" },
    tone: "notification",
    icon: Megaphone,
  },
];

/** Status metadata for the Website Status card — icon + tone per status */
const statusMeta: Record<
  SiteStatus,
  { icon: LucideIcon; tone: "success" | "warning" | "info" }
> = {
  attention: { icon: CircleAlert, tone: "warning" },
  online: { icon: CircleCheck, tone: "success" },
  maintenance: { icon: Wrench, tone: "info" },
  setupPending: { icon: Clock3, tone: "info" },
};

/** Order of rows in the Website Status card — operational health first */
const statusOrder: SiteStatus[] = [
  "attention",
  "online",
  "maintenance",
  "setupPending",
];

export const websiteSummaryToneStyles = {
  success: {
    icon: "text-success-foreground dark:text-success",
    dot: "bg-success",
  },
  warning: {
    icon: "text-warning-foreground dark:text-warning",
    dot: "bg-warning",
  },
  info: {
    icon: "text-link",
    dot: "bg-link",
  },
} as const;

/** Derive website status summary from the websites array (replaces hardcoded overviewItems) */
export function getWebsiteStatusSummary() {
  const total = websites.length;

  const counts: Record<SiteStatus, number> = {
    attention: 0,
    online: 0,
    maintenance: 0,
    setupPending: 0,
  };

  for (const site of websites) {
    counts[site.status]++;
  }

  const statusRows = statusOrder.map((status) => ({
    status,
    count: counts[status],
    icon: statusMeta[status].icon,
    tone: statusMeta[status].tone,
  }));

  return { total, statusRows };
}

export const quickActions = [
  { label: "addSite", icon: FileText },
  { label: "connectDomain", icon: Link2 },
  { label: "createBackup", icon: Cloud },
  { label: "openTicket", icon: MessageSquareText },
] as const;

export const supportContact = {
  displayPhoneNumber: "+98 912 123 4567",
  phoneNumber: "+989121234567",
} as const;

export const navigation = [
  {
    key: "dashboard",
    activeItem: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    key: "domains",
    activeItem: "Domains",
    icon: Globe2,
    href: "/dashboard/domains",
    disabled: true,
  },
  {
    key: "websites",
    activeItem: "Websites",
    icon: WalletCards,
    href: "/dashboard/websites",
  },
  {
    key: "billing",
    activeItem: undefined,
    icon: CreditCard,
    href: "/dashboard/billing",
    disabled: true,
  },
  {
    key: "tickets",
    activeItem: "Tickets",
    icon: Headphones,
    href: "/dashboard/tickets",
  },
  {
    key: "unixseeMessages",
    activeItem: "UnixseeMessages",
    icon: MessageSquareText,
    href: "/dashboard/unixsee-messages",
  },
  {
    key: "complementaryServices",
    activeItem: "ComplementaryServices",
    icon: Layers3,
    href: "/dashboard/complementary-services",
  },
  {
    key: "activities",
    activeItem: "Activities",
    icon: History,
    href: "/dashboard/activities",
  },
  {
    key: "profile",
    activeItem: "Profile",
    icon: UserRound,
    href: "/dashboard/profile",
  },
  // {
  //   key: "helpCenter",
  //   activeItem: "HelpCenter",
  //   icon: LifeBuoy,
  //   href: "/help-center",
  // },
] as const;

export const complementaryServicesQuickActions = [
  {
    key: "activeServices",
    tab: "active",
    icon: Layers3,
  },
  {
    key: "consultationRequests",
    tab: "requests",
    icon: MessagesSquare,
  },
  {
    key: "serviceHistory",
    tab: "history",
    icon: History,
  },
] as const;
