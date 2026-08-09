export type ActivityCategory =
  | "monitoring"
  | "domainsDns"
  | "backups"
  | "support"
  | "seo"
  | "graphic-design"
  | "product-data-entry"
  | "social-media-support";

export type ActivityOutcome =
  "completed" | "resolved" | "updated" | "detected" | "restored" | "attention";

export type ActivitySource = "monitoring" | "team" | "customer";

export type ActivityIcon =
  | "backup"
  | "design"
  | "dns"
  | "monitoring"
  | "project"
  | "seo"
  | "social"
  | "support"
  | "website";

export type ActivityRecordKey =
  | "availabilityRestored"
  | "backupCompleted"
  | "catalogImported"
  | "contentScheduleApproved"
  | "dnsUpdated"
  | "domainConnected"
  | "formPublished"
  | "monitoringDetected"
  | "projectArchived"
  | "revisionDelivered"
  | "seoReviewCompleted"
  | "ticketResolved"
  | "websiteContentUpdated";

export interface ActivityResource {
  id: string;
  label: string;
  href?: string;
  available: boolean;
  technical?: boolean;
}

export interface ActivityRecord {
  id: string;
  occurredAt: string;
  category: ActivityCategory;
  outcome: ActivityOutcome;
  source: ActivitySource;
  icon: ActivityIcon;
  titleKey: ActivityRecordKey;
  titleValues?: Record<string, string | number>;
  resource?: ActivityResource;
}

export const activityReferenceDate = "2026-07-27T18:00:00Z";

/**
 * Recent activities for the dashboard summary strip. Returns the newest records
 * first so the compact card and the full history page render the same events
 * from the same source of truth. `limit` bounds how many rows the strip shows.
 */
export function getRecentActivities(limit = 4): ActivityRecord[] {
  return [...activityRecords]
    .sort(
      (first, second) =>
        new Date(second.occurredAt).getTime() -
        new Date(first.occurredAt).getTime(),
    )
    .slice(0, limit);
}

export const activityRecords: ActivityRecord[] = [
  {
    id: "act-domain-luna-0727",
    occurredAt: "2026-07-27T16:15:00Z",
    category: "domainsDns",
    outcome: "completed",
    source: "team",
    icon: "dns",
    titleKey: "domainConnected",
    titleValues: { domain: "lunastudio.co" },
    resource: {
      id: "luna-studio",
      label: "lunastudio.co",
      href: "/dashboard/websites/luna-studio",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-backup-greenario-0727",
    occurredAt: "2026-07-27T14:40:00Z",
    category: "backups",
    outcome: "completed",
    source: "monitoring",
    icon: "backup",
    titleKey: "backupCompleted",
    titleValues: { domain: "greenario.com" },
    resource: {
      id: "greenario-store",
      label: "greenario.com",
      href: "/dashboard/websites/greenario-store",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-restore-orbit-0727",
    occurredAt: "2026-07-27T11:05:00Z",
    category: "monitoring",
    outcome: "restored",
    source: "monitoring",
    icon: "monitoring",
    titleKey: "availabilityRestored",
    titleValues: { domain: "orbitlabs.io" },
    resource: {
      id: "orbit-labs",
      label: "orbitlabs.io",
      href: "/dashboard/websites/orbit-labs",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-ticket-1052-0726",
    occurredAt: "2026-07-26T19:20:00Z",
    category: "support",
    outcome: "resolved",
    source: "team",
    icon: "support",
    titleKey: "ticketResolved",
    titleValues: { id: "TCK-1052" },
    resource: {
      id: "ticket-1052",
      label: "TCK-1052",
      href: "/dashboard/tickets/TCK-1052",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-content-nova-0726",
    occurredAt: "2026-07-26T15:10:00Z",
    category: "monitoring",
    outcome: "updated",
    source: "team",
    icon: "website",
    titleKey: "websiteContentUpdated",
    titleValues: { domain: "novaagency.com" },
    resource: {
      id: "nova-agency",
      label: "novaagency.com",
      href: "/dashboard/websites/nova-agency",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-seo-nova-0725",
    occurredAt: "2026-07-25T09:35:00Z",
    category: "seo",
    outcome: "completed",
    source: "team",
    icon: "seo",
    titleKey: "seoReviewCompleted",
    titleValues: { domain: "novaagency.com" },
    resource: {
      id: "nova-agency",
      label: "novaagency.com",
      href: "/dashboard/websites/nova-agency",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-dns-greenario-0724",
    occurredAt: "2026-07-24T13:05:00Z",
    category: "domainsDns",
    outcome: "updated",
    source: "team",
    icon: "dns",
    titleKey: "dnsUpdated",
    titleValues: { domain: "greenario.com" },
    resource: {
      id: "greenario-store",
      label: "greenario.com",
      href: "/dashboard/domains",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-design-summer-0722",
    occurredAt: "2026-07-22T16:45:00Z",
    category: "graphic-design",
    outcome: "completed",
    source: "team",
    icon: "design",
    titleKey: "revisionDelivered",
    titleValues: { project: "Summer Campaign" },
    resource: {
      id: "summer-campaign",
      label: "Summer Campaign",
      href: "/dashboard/complementary-services",
      available: true,
    },
  },
  {
    id: "act-social-acme-0718",
    occurredAt: "2026-07-18T10:30:00Z",
    category: "social-media-support",
    outcome: "completed",
    source: "customer",
    icon: "social",
    titleKey: "contentScheduleApproved",
    titleValues: { project: "Acme Social" },
    resource: {
      id: "acme-social",
      label: "Acme Social",
      href: "/dashboard/complementary-services",
      available: true,
    },
  },
  {
    id: "act-import-greenario-0713",
    occurredAt: "2026-07-13T12:05:00Z",
    category: "product-data-entry",
    outcome: "completed",
    source: "team",
    icon: "project",
    titleKey: "catalogImported",
    titleValues: { count: 240 },
    resource: {
      id: "greenario-store",
      label: "Greenario Store",
      href: "/dashboard/complementary-services",
      available: true,
    },
  },
  {
    id: "act-form-luna-0630",
    occurredAt: "2026-06-30T08:55:00Z",
    category: "monitoring",
    outcome: "updated",
    source: "team",
    icon: "website",
    titleKey: "formPublished",
    titleValues: { domain: "lunastudio.co" },
    resource: {
      id: "luna-studio",
      label: "lunastudio.co",
      href: "/dashboard/websites/luna-studio",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-detected-orbit-0614",
    occurredAt: "2026-06-14T17:25:00Z",
    category: "monitoring",
    outcome: "attention",
    source: "monitoring",
    icon: "monitoring",
    titleKey: "monitoringDetected",
    titleValues: { domain: "orbitlabs.io" },
    resource: {
      id: "orbit-labs",
      label: "orbitlabs.io",
      href: "/dashboard/websites/orbit-labs",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-backup-nova-0523",
    occurredAt: "2026-05-23T07:40:00Z",
    category: "backups",
    outcome: "completed",
    source: "monitoring",
    icon: "backup",
    titleKey: "backupCompleted",
    titleValues: { domain: "novaagency.com" },
    resource: {
      id: "nova-agency",
      label: "novaagency.com",
      href: "/dashboard/websites/nova-agency",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-ticket-1038-0410",
    occurredAt: "2026-04-10T14:10:00Z",
    category: "support",
    outcome: "resolved",
    source: "team",
    icon: "support",
    titleKey: "ticketResolved",
    titleValues: { id: "TCK-1038" },
    resource: {
      id: "ticket-1038",
      label: "TCK-1038",
      href: "/dashboard/tickets/TCK-1038",
      available: true,
      technical: true,
    },
  },
  {
    id: "act-archive-0318",
    occurredAt: "2026-03-18T09:00:00Z",
    category: "graphic-design",
    outcome: "completed",
    source: "team",
    icon: "project",
    titleKey: "projectArchived",
    titleValues: { project: "Winter Launch" },
    resource: {
      id: "winter-launch",
      label: "Winter Launch",
      available: false,
    },
  },
];
