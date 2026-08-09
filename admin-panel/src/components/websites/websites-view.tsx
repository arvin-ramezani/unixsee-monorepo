"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Rocket,
  Wrench,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchInput from "@/components/common/search-input";
import {
  WEBSITE_STATUS,
  type WebsiteStatusType,
  type WebsiteType,
} from "@/lib/data/websites-data";
import { cn } from "@/lib/utils";
import WebsiteNavicon from "./website-navicon";

export const WEBSITE_STATUS_FILTER = {
  ALL: "ALL",
  ONLINE: WEBSITE_STATUS.ONLINE,
  NEEDS_ATTENTION: WEBSITE_STATUS.NEEDS_ATTENTION,
  MAINTENANCE: WEBSITE_STATUS.MAINTENANCE,
  PENDING_SETUP: WEBSITE_STATUS.PENDING_SETUP,
} as const;

export type WebsiteStatusFilterType =
  (typeof WEBSITE_STATUS_FILTER)[keyof typeof WEBSITE_STATUS_FILTER];

export const WEBSITE_AGENT_FILTER = {
  ALL: "ALL",
  CONNECTED: "CONNECTED",
  STALE: "STALE",
  DISCONNECTED: "DISCONNECTED",
} as const;

export type WebsiteAgentFilterType =
  (typeof WEBSITE_AGENT_FILTER)[keyof typeof WEBSITE_AGENT_FILTER];

export const WEBSITE_PLAN_FILTER = {
  ALL: "ALL",
  CORE: "UNIX CORE",
  SCALE: "UNIX SCALE",
  PEAK: "UNIX PEAK",
  ENTERPRISE: "UNIX ENTERPRISE",
} as const;

export type WebsitePlanFilterType =
  (typeof WEBSITE_PLAN_FILTER)[keyof typeof WEBSITE_PLAN_FILTER];

const WEBSITE_STATUS_CONFIG: Record<
  WebsiteStatusType,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  [WEBSITE_STATUS.ONLINE]: {
    label: "آنلاین",
    icon: CheckCircle2,
    className: "bg-accent/10 text-accent-foreground",
  },
  [WEBSITE_STATUS.NEEDS_ATTENTION]: {
    label: "نیازمند توجه",
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive",
  },
  [WEBSITE_STATUS.MAINTENANCE]: {
    label: "در حال نگهداری",
    icon: Wrench,
    className: "bg-secondary/70 text-secondary-foreground",
  },
  [WEBSITE_STATUS.PENDING_SETUP]: {
    label: "در انتظار راه‌اندازی",
    icon: Rocket,
    className: "bg-primary/10 text-primary",
  },
};

const WEBSITE_STATUS_FILTER_OPTIONS = [
  { value: WEBSITE_STATUS_FILTER.ALL, label: "همه وضعیت‌ها" },
  { value: WEBSITE_STATUS_FILTER.ONLINE, label: "آنلاین" },
  { value: WEBSITE_STATUS_FILTER.NEEDS_ATTENTION, label: "نیازمند توجه" },
  { value: WEBSITE_STATUS_FILTER.MAINTENANCE, label: "در حال نگهداری" },
  { value: WEBSITE_STATUS_FILTER.PENDING_SETUP, label: "در انتظار راه‌اندازی" },
] as const;

const WEBSITE_AGENT_FILTER_OPTIONS = [
  { value: WEBSITE_AGENT_FILTER.ALL, label: "همه Agent" },
  { value: WEBSITE_AGENT_FILTER.CONNECTED, label: "متصل" },
  { value: WEBSITE_AGENT_FILTER.STALE, label: "قدیمی" },
  { value: WEBSITE_AGENT_FILTER.DISCONNECTED, label: "قطع شده" },
] as const;

const WEBSITE_PLAN_FILTER_OPTIONS = [
  { value: WEBSITE_PLAN_FILTER.ALL, label: "همه طرح‌ها" },
  { value: WEBSITE_PLAN_FILTER.CORE, label: "UNIX CORE" },
  { value: WEBSITE_PLAN_FILTER.SCALE, label: "UNIX SCALE" },
  { value: WEBSITE_PLAN_FILTER.PEAK, label: "UNIX PEAK" },
  { value: WEBSITE_PLAN_FILTER.ENTERPRISE, label: "UNIX ENTERPRISE" },
] as const;

function formatStatusBadge(status: WebsiteStatusType) {
  const config = WEBSITE_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm",
        config.className,
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}

function getAgentLabel(website: WebsiteType) {
  if (website.monitoring.agentStatus === "DISCONNECTED") {
    return "قطع شده";
  }

  if (website.monitoring.dataFreshness === "STALE") {
    return "قدیمی";
  }

  return "متصل";
}

function getCustomerInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}

function getStatusFilterLabel(value: WebsiteStatusFilterType) {
  return (
    WEBSITE_STATUS_FILTER_OPTIONS.find((option) => option.value === value)
      ?.label ?? "همه وضعیت‌ها"
  );
}

function getAgentFilterLabel(value: WebsiteAgentFilterType) {
  return (
    WEBSITE_AGENT_FILTER_OPTIONS.find((option) => option.value === value)
      ?.label ?? "همه Agent"
  );
}

function getPlanFilterLabel(value: WebsitePlanFilterType) {
  return (
    WEBSITE_PLAN_FILTER_OPTIONS.find((option) => option.value === value)
      ?.label ?? "همه طرح‌ها"
  );
}

function WebsiteTableRow({ website }: { website: WebsiteType }) {
  const router = useRouter();
  const websiteHref = `/websites/${website.id}`;
  const rowLabel = `مشاهده وب‌سایت ${website.domain}`;

  const navigateToWebsite = () => {
    router.push(websiteHref);
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("a, button, [data-slot='dropdown-menu-trigger']")) {
      return;
    }

    navigateToWebsite();
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    navigateToWebsite();
  };

  return (
    <TableRow
      className="group cursor-pointer even:bg-muted/50 border-b border-border/60 transition-colors hover:bg-muted/20 even:hover:bg-muted/30"
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      role="link"
      aria-label={rowLabel}
    >
      <TableCell className="px-4 py-3">
        <Link href={websiteHref} className="block min-w-0">
          <div className="flex items-start gap-3">
            <WebsiteNavicon
              status={website.status}
              icon={website.domain.slice(0, 1)}
            />
            {/* {formatWebsiteFav(
              website.status,
              website.domain.split(".")[0].slice(0, 1),
            )} */}
            {/* </div> */}
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {website.domain}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {website.title}
              </p>
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar size="sm">
            <AvatarImage src="" alt={website.tenantName} />
            <AvatarFallback>
              {getCustomerInitials(website.tenantName)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{website.tenantName}</span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        {formatStatusBadge(website.status)}
      </TableCell>
      <TableCell className="px-4 py-3">
        <span className="text-sm font-medium text-foreground">
          {getAgentLabel(website)}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {website.lastAvailabilityCheckAt}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {website.lastAgentDataAt}
      </TableCell>
    </TableRow>
  );
}

function WebsiteCard({ website }: { website: WebsiteType }) {
  return (
    <Link
      href={`/websites/${website.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{website.domain}</p>
          <p className="mt-1 text-sm text-muted-foreground">{website.title}</p>
        </div>
        {formatStatusBadge(website.status)}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src="" alt={website.tenantName} />
          <AvatarFallback>
            {getCustomerInitials(website.tenantName)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{website.tenantName}</span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <p className="text-xs">Agent</p>
          <p className="mt-1 font-medium text-foreground">
            {getAgentLabel(website)}
          </p>
        </div>
        <div>
          <p className="text-xs">آخرین بررسی</p>
          <p className="mt-1 font-medium text-foreground">
            {website.lastAvailabilityCheckAt}
          </p>
        </div>
      </div>
    </Link>
  );
}

type WebsitesViewProps = {
  websites: WebsiteType[];
  initialStatus?: WebsiteStatusFilterType;
};

export function WebsitesView({
  websites,
  initialStatus = WEBSITE_STATUS_FILTER.ALL,
}: WebsitesViewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<WebsiteStatusFilterType>(initialStatus);
  const [agentStatus, setAgentStatus] = useState<WebsiteAgentFilterType>(
    WEBSITE_AGENT_FILTER.ALL,
  );
  const [plan, setPlan] = useState<WebsitePlanFilterType>(
    WEBSITE_PLAN_FILTER.ALL,
  );
  const [showFilters, setShowFilters] = useState(false);

  const handleStatusChange = (value: string | null) => {
    if (value !== null) {
      setStatus(value as WebsiteStatusFilterType);
    }
  };

  const handleAgentStatusChange = (value: string | null) => {
    if (value !== null) {
      setAgentStatus(value as WebsiteAgentFilterType);
    }
  };

  const handlePlanChange = (value: string | null) => {
    if (value !== null) {
      setPlan(value as WebsitePlanFilterType);
    }
  };

  const statusLabel = getStatusFilterLabel(status);
  const agentLabel = getAgentFilterLabel(agentStatus);
  const planLabel = getPlanFilterLabel(plan);

  const filteredWebsites = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return websites.filter((website) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [website.domain, website.title, website.tenantName]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        status === WEBSITE_STATUS_FILTER.ALL || website.status === status;
      const matchesAgent =
        agentStatus === WEBSITE_AGENT_FILTER.ALL ||
        (agentStatus === WEBSITE_AGENT_FILTER.CONNECTED &&
          website.monitoring.agentStatus === "CONNECTED" &&
          website.monitoring.dataFreshness === "UP_TO_DATE") ||
        (agentStatus === WEBSITE_AGENT_FILTER.STALE &&
          website.monitoring.dataFreshness === "STALE") ||
        (agentStatus === WEBSITE_AGENT_FILTER.DISCONNECTED &&
          website.monitoring.agentStatus === "DISCONNECTED");
      const matchesPlan =
        plan === WEBSITE_PLAN_FILTER.ALL || website.service.plan === plan;

      return matchesQuery && matchesStatus && matchesAgent && matchesPlan;
    });
  }, [agentStatus, plan, query, status, websites]);

  const summaryCounts = useMemo(() => {
    const onlineCount = filteredWebsites.filter(
      (website) => website.status === WEBSITE_STATUS.ONLINE,
    ).length;
    const needsAttentionCount = filteredWebsites.filter(
      (website) => website.status === WEBSITE_STATUS.NEEDS_ATTENTION,
    ).length;
    const maintenanceCount = filteredWebsites.filter(
      (website) => website.status === WEBSITE_STATUS.MAINTENANCE,
    ).length;
    const pendingSetupCount = filteredWebsites.filter(
      (website) => website.status === WEBSITE_STATUS.PENDING_SETUP,
    ).length;

    return {
      onlineCount,
      needsAttentionCount,
      maintenanceCount,
      pendingSetupCount,
    };
  }, [filteredWebsites]);

  const statusSummaryItems = [
    {
      key: WEBSITE_STATUS.NEEDS_ATTENTION,
      label: "نیازمند توجه",
      count: summaryCounts.needsAttentionCount,
      icon: AlertTriangle,
      className: "border-destructive/20 bg-destructive/10 text-destructive",
    },
    {
      key: WEBSITE_STATUS.MAINTENANCE,
      label: "در حال نگهداری",
      count: summaryCounts.maintenanceCount,
      icon: Wrench,
      className:
        "border-secondary/40 bg-secondary/70 text-secondary-foreground",
    },
    {
      key: WEBSITE_STATUS.PENDING_SETUP,
      label: "در انتظار راه‌اندازی",
      count: summaryCounts.pendingSetupCount,
      icon: Rocket,
      className: "border-primary/20 bg-primary/10 text-primary",
    },
    {
      key: WEBSITE_STATUS.ONLINE,
      label: "آنلاین",
      count: summaryCounts.onlineCount,
      icon: CheckCircle2,
      className: "border-accent/20 bg-accent/10 text-accent-foreground",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">وب‌سایت‌ها</h2>
            <p className="text-sm text-muted-foreground">
              مدیریت و پایش وب‌سایت‌های مشتریان
            </p>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((value) => !value)}
              className="gap-2"
            >
              <Filter className="size-4" />
              فیلتر
            </Button>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(220px,420px)_repeat(3,minmax(140px,180px))]">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در وب‌سایت، دامنه یا مستأجر..."
            className="lg:col-span-1"
          />

          <div className="hidden lg:block">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full" aria-label="فیلتر وضعیت">
                <SelectValue>{statusLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {WEBSITE_STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden lg:block">
            <Select value={agentStatus} onValueChange={handleAgentStatusChange}>
              <SelectTrigger className="w-full" aria-label="فیلتر Agent">
                <SelectValue>{agentLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {WEBSITE_AGENT_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden lg:block">
            <Select value={plan} onValueChange={handlePlanChange}>
              <SelectTrigger className="w-full" aria-label="فیلتر طرح">
                <SelectValue>{planLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {WEBSITE_PLAN_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-2 lg:hidden">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full" aria-label="فیلتر وضعیت">
                <SelectValue>{statusLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {WEBSITE_STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={agentStatus} onValueChange={handleAgentStatusChange}>
              <SelectTrigger className="w-full" aria-label="فیلتر Agent">
                <SelectValue>{agentLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {WEBSITE_AGENT_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={plan} onValueChange={handlePlanChange}>
              <SelectTrigger className="w-full" aria-label="فیلتر طرح">
                <SelectValue>{planLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {WEBSITE_PLAN_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="rounded-lg self-start inline-flex gap-2 border-border py-1 px-4">
        <p className="text-sm lg:text-base">کل وب‌سایت‌ها</p>
        <p className="text-sm lg:text-base">
          {filteredWebsites.length.toLocaleString("fa-IR")}
        </p>
      </div>
      <div className="flex gap-4 flex-wrap">
        {statusSummaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className={cn(
                "rounded-full border items-center flex gap-2 py-2 px-4",
                item.className,
              )}
            >
              <Icon className="size-4" />
              <p className="text-xs">{item.label}</p>

              <p className="text-xs font-semibold">
                {item.count.toLocaleString("fa-IR")}
              </p>
            </div>
          );
        })}
      </div>

      <div className="hidden rounded-xl border border-border bg-card lg:block">
        <Table className="w-full min-w-190 text-sm">
          <TableHeader className="border-b border-border bg-muted/30 text-muted-foreground">
            <TableRow>
              <TableHead className="px-4 py-3 text-right font-medium">
                وب‌سایت
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                مستأجر مالک
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                وضعیت
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                Agent
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                آخرین بررسی
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                آخرین داده Agent
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWebsites.length > 0 ? (
              filteredWebsites.map((website) => (
                <WebsiteTableRow key={website.id} website={website} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  وب‌سایتی با این فیلترها پیدا نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {filteredWebsites.length > 0 ? (
          filteredWebsites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            وب‌سایتی با این فیلترها پیدا نشد.
          </div>
        )}
      </div>
    </div>
  );
}
