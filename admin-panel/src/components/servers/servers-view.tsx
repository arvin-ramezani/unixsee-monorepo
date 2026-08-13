"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Globe2,
  KeyRound,
  Plus,
  Server,
  Unplug,
} from "lucide-react";

import { createServerAction } from "@/actions/servers/server-actions";
import SearchInput from "@/components/common/search-input";
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
import { toastApiErrorMessage } from "@/lib/api/toast-api-error";
import {
  SERVER_AGENT_STATE,
  SERVER_AGENT_STATE_LABELS,
  getServersSummary,
  type ServerType,
} from "@/lib/data/servers-data";
import { cn } from "@/lib/utils";
import {
  CreateServerSheet,
  type CreateServerValues,
} from "./create-server-sheet";
import { ServerStatusBadge } from "./server-status-badge";

export const SERVER_AGENT_FILTER = {
  ALL: "ALL",
  ACTIONABLE: "ACTIONABLE",
  PENDING_AGENT: SERVER_AGENT_STATE.PENDING_AGENT,
  ENROLLMENT_ISSUED: SERVER_AGENT_STATE.ENROLLMENT_ISSUED,
  CONNECTED: SERVER_AGENT_STATE.CONNECTED,
  STALE: SERVER_AGENT_STATE.STALE,
  DISCONNECTED: SERVER_AGENT_STATE.DISCONNECTED,
} as const;

export type ServerAgentFilterType =
  (typeof SERVER_AGENT_FILTER)[keyof typeof SERVER_AGENT_FILTER];

const SERVER_AGENT_FILTER_OPTIONS = [
  { value: SERVER_AGENT_FILTER.ALL, label: "همه وضعیت‌ها" },
  { value: SERVER_AGENT_FILTER.ACTIONABLE, label: "نیازمند اقدام" },
  {
    value: SERVER_AGENT_FILTER.PENDING_AGENT,
    label: SERVER_AGENT_STATE_LABELS[SERVER_AGENT_STATE.PENDING_AGENT],
  },
  {
    value: SERVER_AGENT_FILTER.ENROLLMENT_ISSUED,
    label: SERVER_AGENT_STATE_LABELS[SERVER_AGENT_STATE.ENROLLMENT_ISSUED],
  },
  {
    value: SERVER_AGENT_FILTER.CONNECTED,
    label: SERVER_AGENT_STATE_LABELS[SERVER_AGENT_STATE.CONNECTED],
  },
  {
    value: SERVER_AGENT_FILTER.STALE,
    label: SERVER_AGENT_STATE_LABELS[SERVER_AGENT_STATE.STALE],
  },
  {
    value: SERVER_AGENT_FILTER.DISCONNECTED,
    label: SERVER_AGENT_STATE_LABELS[SERVER_AGENT_STATE.DISCONNECTED],
  },
] as const;

const ACTIONABLE_STATES: ReadonlySet<string> = new Set([
  SERVER_AGENT_STATE.PENDING_AGENT,
  SERVER_AGENT_STATE.ENROLLMENT_ISSUED,
  SERVER_AGENT_STATE.STALE,
  SERVER_AGENT_STATE.DISCONNECTED,
]);

type ServersViewProps = {
  initialServers?: ServerType[];
  initialAgentFilter?: ServerAgentFilterType;
  loadError?: string | null;
};

function getAgentFilterLabel(value: ServerAgentFilterType) {
  return (
    SERVER_AGENT_FILTER_OPTIONS.find((option) => option.value === value)
      ?.label ?? "همه وضعیت‌ها"
  );
}

function getUnassignedCount(server: ServerType) {
  return server.discoveries.filter(
    (discovery) => discovery.assignmentStatus === "UNASSIGNED",
  ).length;
}

function ServerTableRow({ server }: { server: ServerType }) {
  const router = useRouter();
  const serverHref = `/servers/${server.id}`;
  const rowLabel = `مشاهده سرور ${server.label}`;
  const unassignedCount = getUnassignedCount(server);

  const navigateToServer = () => {
    router.push(serverHref);
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("a, button, [data-slot='dropdown-menu-trigger']")) {
      return;
    }

    navigateToServer();
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    navigateToServer();
  };

  return (
    <TableRow
      className="group cursor-pointer border-b border-border/60 transition-colors even:bg-muted/50 hover:bg-muted/20 even:hover:bg-muted/30"
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      role="link"
      aria-label={rowLabel}
    >
      <TableCell className="px-4 py-3">
        <Link href={serverHref} className="block min-w-0">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Server className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground" dir="ltr">
                {server.label}
              </p>
              <p className="truncate text-sm text-muted-foreground" dir="ltr">
                {server.location}
              </p>
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="px-4 py-3">
        <ServerStatusBadge state={server.agent.state} />
      </TableCell>
      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
        {server.agent.lastSeenAt ?? "—"}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm">
        <span className="font-medium">
          {server.websiteIds.length.toLocaleString("fa-IR")}
        </span>
        {unassignedCount > 0 && (
          <span className="ms-2 text-xs text-destructive">
            {unassignedCount.toLocaleString("fa-IR")} کشف‌نشده
          </span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground" dir="ltr">
        {server.location || "—"}
      </TableCell>
    </TableRow>
  );
}

function ServerCard({ server }: { server: ServerType }) {
  const unassignedCount = getUnassignedCount(server);

  return (
    <Link
      href={`/servers/${server.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground" dir="ltr">
            {server.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
            {server.location}
          </p>
        </div>
        <ServerStatusBadge state={server.agent.state} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <p className="text-xs">آخرین ارتباط</p>
          <p className="mt-1 font-medium text-foreground">
            {server.agent.lastSeenAt ?? "هنوز متصل نشده"}
          </p>
        </div>
        <div>
          <p className="text-xs">وب‌سایت‌ها</p>
          <p className="mt-1 font-medium text-foreground">
            {server.websiteIds.length.toLocaleString("fa-IR")}
            {unassignedCount > 0
              ? ` · ${unassignedCount.toLocaleString("fa-IR")} کشف‌نشده`
              : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ServersView({
  initialServers = [],
  initialAgentFilter = SERVER_AGENT_FILTER.ACTIONABLE,
  loadError = null,
}: ServersViewProps) {
  const router = useRouter();
  const [servers, setServers] = useState(initialServers);
  const [query, setQuery] = useState("");
  const [agentFilter, setAgentFilter] =
    useState<ServerAgentFilterType>(initialAgentFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setServers(initialServers);
  }, [initialServers]);

  const summary = useMemo(() => getServersSummary(servers), [servers]);
  const agentFilterLabel = getAgentFilterLabel(agentFilter);

  const filteredServers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return servers.filter((server) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [server.label, server.location, server.notes]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesAgent =
        agentFilter === SERVER_AGENT_FILTER.ALL ||
        (agentFilter === SERVER_AGENT_FILTER.ACTIONABLE &&
          ACTIONABLE_STATES.has(server.agent.state)) ||
        server.agent.state === agentFilter;

      return matchesQuery && matchesAgent;
    });
  }, [agentFilter, query, servers]);

  const summaryItems = [
    {
      key: "actionable",
      label: "نیازمند اقدام",
      value:
        summary.pendingAgent +
        summary.enrollmentIssued +
        summary.stale +
        summary.disconnected,
      hint: "در انتظار، قدیمی یا قطع‌شده",
      icon: AlertTriangle,
      emphasis: true,
      filter: SERVER_AGENT_FILTER.ACTIONABLE,
    },
    {
      key: "pending",
      label: "در انتظار Agent",
      value: summary.pendingAgent + summary.enrollmentIssued,
      hint: "نیاز به صدور یا نصب توکن",
      icon: KeyRound,
      emphasis: false,
      filter: SERVER_AGENT_FILTER.PENDING_AGENT,
    },
    {
      key: "connected",
      label: "متصل",
      value: summary.connected,
      hint: "گزارش‌دهی سالم",
      icon: CheckCircle2,
      emphasis: false,
      filter: SERVER_AGENT_FILTER.CONNECTED,
    },
    {
      key: "discoveries",
      label: "کشف‌های تخصیص‌نیافته",
      value: summary.unassignedDiscoveries,
      hint: "وب‌سایت‌های پیدا شده",
      icon: Globe2,
      emphasis: false,
      filter: SERVER_AGENT_FILTER.ALL,
    },
  ];

  const handleCreateServer = async (values: CreateServerValues) => {
    const result = await createServerAction({
      name: values.name,
      ipAddress: values.ipAddress,
      notes: values.notes,
    });

    if (!result.ok) {
      toastApiErrorMessage(result.message);
      return false;
    }

    setServers((current) => [result.server, ...current]);
    setAgentFilter(SERVER_AGENT_FILTER.PENDING_AGENT);
    router.push(`/servers/${result.server.id}`);
    router.refresh();
    return true;
  };

  return (
    <div className="flex flex-col gap-4">
      {loadError ? (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {loadError}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setAgentFilter(item.filter)}
              className={cn(
                "rounded-xl border p-4 text-start transition-colors",
                item.emphasis
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted/30",
                agentFilter === item.filter &&
                  !item.emphasis &&
                  "ring-2 ring-primary/30",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      "text-sm",
                      item.emphasis
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {item.value.toLocaleString("fa-IR")}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      item.emphasis
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.hint}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    item.emphasis
                      ? "bg-primary-foreground/10"
                      : "bg-muted text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">سرورها</h2>
            <p className="text-sm text-muted-foreground">
              مدیریت VPS، اتصال Agent و وب‌سایت‌های کشف‌شده
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((value) => !value)}
              className="gap-2 lg:hidden"
            >
              <Filter className="size-4" />
              فیلتر
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              ایجاد سرور
            </Button>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,220px)]">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در شناسه، IP یا یادداشت..."
          />

          <div className="hidden lg:block">
            <Select
              value={agentFilter}
              onValueChange={(value) =>
                value && setAgentFilter(value as ServerAgentFilterType)
              }
            >
              <SelectTrigger className="w-full" aria-label="فیلتر وضعیت Agent">
                <SelectValue>{agentFilterLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {SERVER_AGENT_FILTER_OPTIONS.map((option) => (
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
            <Select
              value={agentFilter}
              onValueChange={(value) =>
                value && setAgentFilter(value as ServerAgentFilterType)
              }
            >
              <SelectTrigger className="w-full" aria-label="فیلتر وضعیت Agent">
                <SelectValue>{agentFilterLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {SERVER_AGENT_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {filteredServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {agentFilter === SERVER_AGENT_FILTER.ACTIONABLE ? (
              <Clock3 className="size-6" aria-hidden="true" />
            ) : (
              <Unplug className="size-6" aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-medium">سروری با این فیلتر پیدا نشد</p>
            <p className="mt-1 text-sm text-muted-foreground">
              فیلتر را تغییر دهید یا سرور جدیدی ایجاد کنید.
            </p>
          </div>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            ایجاد سرور
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="px-4 py-3">سرور</TableHead>
                  <TableHead className="px-4 py-3">وضعیت Agent</TableHead>
                  <TableHead className="px-4 py-3">آخرین ارتباط</TableHead>
                  <TableHead className="px-4 py-3">وب‌سایت‌ها</TableHead>
                  <TableHead className="px-4 py-3">آدرس IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServers.map((server) => (
                  <ServerTableRow key={server.id} server={server} />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        </>
      )}

      <CreateServerSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateServer}
      />
    </div>
  );
}
