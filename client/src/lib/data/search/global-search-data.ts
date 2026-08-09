import { helpSearchArticles } from "@/lib/data/help-center/help-search-data";
import { ticketRecords } from "@/lib/data/tickets/ticket-records";
import { websiteRecords } from "@/lib/websites-data";

export type GlobalSearchGroup =
  "websites" | "tickets" | "helpCenter" | "pagesActions";

export type GlobalSearchSource =
  | {
      id: string;
      group: "websites";
      href: string;
      name: string;
      domain: string;
      status: (typeof websiteRecords)[number]["status"];
    }
  | {
      id: string;
      group: "tickets";
      href: string;
      number: string;
      subjectKey: (typeof ticketRecords)[number]["subjectKey"];
      status: (typeof ticketRecords)[number]["status"];
      websiteName?: string;
      websiteDomain?: string;
    }
  | {
      id: string;
      group: "helpCenter";
      href: string;
      topicKey: (typeof helpSearchArticles)[number]["topicKey"];
      articleKey: string;
    }
  | {
      id: string;
      group: "pagesActions";
      href: string;
      itemKey:
        | "addWebsite"
        | "createTicket"
        | "viewActivities"
        | "websites"
        | "tickets"
        | "helpCenter";
      itemType: "action" | "page";
    };

const websiteSources: GlobalSearchSource[] = websiteRecords.map((website) => ({
  id: `website:${website.id}`,
  group: "websites",
  href: `/dashboard/websites/${website.id}`,
  name: website.name,
  domain: website.domain,
  status: website.status,
}));

const ticketSources: GlobalSearchSource[] = ticketRecords.map((ticket) => ({
  id: `ticket:${ticket.id}`,
  group: "tickets",
  href: `/dashboard/tickets/${ticket.id}`,
  number: ticket.number,
  subjectKey: ticket.subjectKey,
  status: ticket.status,
  websiteName: ticket.website?.name,
  websiteDomain: ticket.website?.domain,
}));

const helpCenterSources: GlobalSearchSource[] = helpSearchArticles.map(
  (article) => ({
    id: `help:${article.id}`,
    group: "helpCenter",
    href: article.href.replace("/dashboard/help-center", "/help-center"),
    topicKey: article.topicKey,
    articleKey: article.articleKey,
  }),
);

const pageActionSources: GlobalSearchSource[] = [
  {
    id: "action:add-website",
    group: "pagesActions",
    href: "/dashboard/plans",
    itemKey: "addWebsite",
    itemType: "action",
  },
  {
    id: "action:create-ticket",
    group: "pagesActions",
    href: "/dashboard/tickets/new",
    itemKey: "createTicket",
    itemType: "action",
  },
  {
    id: "action:view-activities",
    group: "pagesActions",
    href: "/dashboard/activities",
    itemKey: "viewActivities",
    itemType: "action",
  },
  {
    id: "page:websites",
    group: "pagesActions",
    href: "/dashboard/websites",
    itemKey: "websites",
    itemType: "page",
  },
  {
    id: "page:tickets",
    group: "pagesActions",
    href: "/dashboard/tickets",
    itemKey: "tickets",
    itemType: "page",
  },
  {
    id: "page:help-center",
    group: "pagesActions",
    href: "/help-center",
    itemKey: "helpCenter",
    itemType: "page",
  },
];

export const globalSearchSources: readonly GlobalSearchSource[] = [
  ...websiteSources,
  ...ticketSources,
  ...helpCenterSources,
  ...pageActionSources,
];

export const defaultRecentSearchIds = [
  "website:luna-studio",
  "ticket:TCK-1049",
] as const;

export const quickActionSearchIds = [
  "action:add-website",
  "action:create-ticket",
  "action:view-activities",
] as const;

export const suggestedDestinationSearchIds = [
  "page:websites",
  "page:tickets",
  "page:help-center",
] as const;
