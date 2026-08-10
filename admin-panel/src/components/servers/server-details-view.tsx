"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Globe2,
  KeyRound,
  Monitor,
  Server,
  ShieldAlert,
  Wifi,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DISCOVERY_ASSIGNMENT_STATUS,
  ENROLLMENT_TOKEN_STATUS,
  SERVER_AGENT_STATE,
  SERVER_STACK,
  type ServerType,
  type WebsiteDiscoveryType,
} from "@/lib/data/servers-data";
import { upsertRuntimeServer } from "@/lib/data/servers-runtime";
import { cn } from "@/lib/utils";
import {
  AssignDiscoverySheet,
  type AssignDiscoveryValues,
} from "./assign-discovery-sheet";
import {
  EnrollmentRevealSheet,
  RevokeAgentSheet,
  type EnrollmentRevealPayload,
} from "./enrollment-reveal-sheet";
import { ServerStatusBadge } from "./server-status-badge";

const surfaceClassName = "rounded-2xl border border-border bg-card/90";
const mutedSurfaceClassName = "rounded-2xl border border-border bg-muted/30";

const SERVER_IDENTITY_FIELDS = [
  {
    key: "location",
    label: "موقعیت",
    getValue: (server: ServerType) => server.location,
  },
  {
    key: "capacitySummary",
    label: "ظرفیت",
    getValue: (server: ServerType) => server.capacitySummary,
    dir: "ltr" as const,
  },
  {
    key: "createdAt",
    label: "تاریخ ثبت",
    getValue: (server: ServerType) => server.createdAt,
  },
  {
    key: "stack",
    label: "پشته کشف‌شده",
    getValue: () =>
      `${SERVER_STACK.APPLICATION} · ${SERVER_STACK.CONTROL_PANEL} · ${SERVER_STACK.WEB_SERVER}`,
  },
] as const;

type ServerDetailsViewProps = {
  initialServer: ServerType;
};

export function ServerDetailsView({ initialServer }: ServerDetailsViewProps) {
  const [server, setServer] = useState(initialServer);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [enrollmentMode, setEnrollmentMode] = useState<"issue" | "reissue">(
    "issue",
  );
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] =
    useState<WebsiteDiscoveryType | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const unassignedDiscoveries = server.discoveries.filter(
    (discovery) =>
      discovery.assignmentStatus === DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED,
  );
  const assignedDiscoveries = server.discoveries.filter(
    (discovery) =>
      discovery.assignmentStatus === DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
  );

  const canIssueToken =
    server.agent.state === SERVER_AGENT_STATE.PENDING_AGENT ||
    server.agent.state === SERVER_AGENT_STATE.DISCONNECTED ||
    server.enrollment.status === ENROLLMENT_TOKEN_STATUS.REVOKED ||
    server.enrollment.status === ENROLLMENT_TOKEN_STATUS.EXPIRED ||
    server.enrollment.status === ENROLLMENT_TOKEN_STATUS.NONE;

  const canReissueToken =
    server.agent.state === SERVER_AGENT_STATE.ENROLLMENT_ISSUED ||
    server.agent.state === SERVER_AGENT_STATE.DISCONNECTED ||
    server.agent.state === SERVER_AGENT_STATE.STALE ||
    server.agent.state === SERVER_AGENT_STATE.CONNECTED;

  const canSimulateConnect =
    server.agent.state === SERVER_AGENT_STATE.ENROLLMENT_ISSUED ||
    server.agent.state === SERVER_AGENT_STATE.PENDING_AGENT;

  const canRevoke =
    server.agent.state === SERVER_AGENT_STATE.CONNECTED ||
    server.agent.state === SERVER_AGENT_STATE.STALE ||
    server.agent.state === SERVER_AGENT_STATE.ENROLLMENT_ISSUED;

  const persistServer = (next: ServerType, message: string) => {
    setServer(next);
    upsertRuntimeServer(next);
    setStatusMessage(message);
  };

  const handleEnrollmentIssued = (payload: EnrollmentRevealPayload) => {
    persistServer(
      {
        ...server,
        agent: {
          state: SERVER_AGENT_STATE.ENROLLMENT_ISSUED,
        },
        enrollment: {
          status: ENROLLMENT_TOKEN_STATUS.UNUSED,
          issuedAt: payload.issuedAt,
          expiresAt: payload.expiresAt,
        },
      },
      payload.mode === "reissue"
        ? "توکن جدید صادر شد. مقدار متنی دیگر در دسترس نیست."
        : "توکن اتصال صادر شد. مقدار متنی دیگر در دسترس نیست.",
    );
  };

  const handleSimulateConnect = () => {
    persistServer(
      {
        ...server,
        agent: {
          state: SERVER_AGENT_STATE.CONNECTED,
          version: "1.4.2",
          lastSeenAt: "اکنون",
          dataFreshness: "UP_TO_DATE",
        },
        enrollment: {
          ...server.enrollment,
          status: ENROLLMENT_TOKEN_STATUS.USED,
        },
        discoveries:
          server.discoveries.length > 0
            ? server.discoveries
            : [
                {
                  id: `discovery-${server.id}-demo`,
                  domain: `${server.label.toLowerCase().replace(/[^a-z0-9]/g, "")}.example.ir`,
                  title: `فروشگاه ${server.label}`,
                  controlPanel: SERVER_STACK.CONTROL_PANEL,
                  webServer: SERVER_STACK.WEB_SERVER,
                  application: SERVER_STACK.APPLICATION,
                  assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED,
                  discoveredAt: "اکنون",
                },
              ],
      },
      "اتصال Agent شبیه‌سازی شد. در محیط واقعی Agent به NestJS وصل می‌شود.",
    );
  };

  const handleRevoke = (reason: string) => {
    persistServer(
      {
        ...server,
        agent: {
          ...server.agent,
          state: SERVER_AGENT_STATE.DISCONNECTED,
          dataFreshness: "STALE",
        },
        enrollment: {
          ...server.enrollment,
          status: ENROLLMENT_TOKEN_STATUS.REVOKED,
        },
      },
      `Agent باطل شد: ${reason}`,
    );
  };

  const handleAssignDiscovery = (
    discovery: WebsiteDiscoveryType,
    values: AssignDiscoveryValues,
  ) => {
    const websiteId = `website-${discovery.id}`;

    persistServer(
      {
        ...server,
        discoveries: server.discoveries.map((item) =>
          item.id === discovery.id
            ? {
                ...item,
                title: values.title,
                assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
                assignedWebsiteId: websiteId,
              }
            : item,
        ),
        websiteIds: server.websiteIds.includes(websiteId)
          ? server.websiteIds
          : [...server.websiteIds, websiteId],
      },
      `وب‌سایت ${discovery.domain} به ${values.tenantName} تخصیص داده شد.`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/servers"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-2",
          )}
        >
          <ArrowRight data-icon="inline-start" />
          بازگشت به سرورها
        </Link>
      </div>

      <header className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Server className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">سرور / VPS</p>
              <h1
                className="mt-1 text-2xl font-semibold tracking-tight"
                dir="ltr"
              >
                {server.label}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {server.notes || "بدون یادداشت داخلی"}
              </p>
            </div>
          </div>
          <ServerStatusBadge state={server.agent.state} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SERVER_IDENTITY_FIELDS.map((field) => (
            <div key={field.key} className={cn(mutedSurfaceClassName, "p-3")}>
              <p className="text-xs text-muted-foreground">{field.label}</p>
              <p
                className={cn("mt-2 text-sm font-medium", {
                  "w-fit": "dir" in field,
                })}
                dir={"dir" in field ? field.dir : undefined}
              >
                {field.getValue(server)}
              </p>
            </div>
          ))}
        </div>
      </header>

      {statusMessage && (
        <div
          className="rounded-xl border border-accent bg-accent/20 px-4 py-3 text-sm text-accent-foreground"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}

      <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="size-5" aria-hidden="true" />
            <h2 className="font-semibold">Agent و اتصال</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {canIssueToken && (
              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setEnrollmentMode("issue");
                  setEnrollmentOpen(true);
                }}
              >
                <KeyRound className="size-4" aria-hidden="true" />
                صدور توکن اتصال
              </Button>
            )}
            {canReissueToken && !canIssueToken && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setEnrollmentMode("reissue");
                  setEnrollmentOpen(true);
                }}
              >
                <KeyRound className="size-4" aria-hidden="true" />
                صدور مجدد توکن
              </Button>
            )}
            {canReissueToken && canIssueToken && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setEnrollmentMode("reissue");
                  setEnrollmentOpen(true);
                }}
              >
                صدور مجدد
              </Button>
            )}
            {canSimulateConnect && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleSimulateConnect}
              >
                <Wifi className="size-4" aria-hidden="true" />
                شبیه‌سازی اتصال Agent
              </Button>
            )}
            {canRevoke && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="gap-2"
                onClick={() => setRevokeOpen(true)}
              >
                <ShieldAlert className="size-4" aria-hidden="true" />
                باطل‌سازی
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className={cn(mutedSurfaceClassName, "p-4")}>
            <p className="text-sm text-muted-foreground">وضعیت</p>
            <div className="mt-3">
              <ServerStatusBadge state={server.agent.state} />
            </div>
          </div>
          <div className={cn(mutedSurfaceClassName, "p-4")}>
            <p className="text-sm text-muted-foreground">نسخه Agent</p>
            <p className="mt-3 text-lg font-semibold w-fit" dir="ltr">
              {server.agent.version ?? "—"}
            </p>
          </div>
          <div className={cn(mutedSurfaceClassName, "p-4")}>
            <p className="text-sm text-muted-foreground">آخرین ارتباط</p>
            <p className="mt-3 text-lg font-semibold">
              {server.agent.lastSeenAt ?? "هنوز برقرار نشده"}
            </p>
          </div>
          <div className={cn(mutedSurfaceClassName, "p-4")}>
            <p className="text-sm text-muted-foreground">وضعیت توکن</p>
            <p className="mt-3 text-lg font-semibold">
              {server.enrollment.status === ENROLLMENT_TOKEN_STATUS.NONE &&
                "صادر نشده"}
              {server.enrollment.status === ENROLLMENT_TOKEN_STATUS.UNUSED &&
                "استفاده‌نشده"}
              {server.enrollment.status === ENROLLMENT_TOKEN_STATUS.USED &&
                "مصرف‌شده"}
              {server.enrollment.status === ENROLLMENT_TOKEN_STATUS.EXPIRED &&
                "منقضی"}
              {server.enrollment.status === ENROLLMENT_TOKEN_STATUS.REVOKED &&
                "باطل‌شده"}
            </p>
            {server.enrollment.expiresAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                انقضا: {server.enrollment.expiresAt}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex items-center gap-2">
          <Globe2 className="size-5" aria-hidden="true" />
          <h2 className="font-semibold">وب‌سایت‌های کشف‌شده</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Agent وب‌سایت‌های WooCommerce روی DirectAdmin و OpenLiteSpeed را گزارش
          می‌کند. تخصیص مستأجر جدا از کشف است.
        </p>

        {server.discoveries.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            هنوز کشفی ثبت نشده است. پس از اتصال Agent، موجودی اینجا ظاهر می‌شود.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="px-4 py-3">دامنه</TableHead>
                  <TableHead className="px-4 py-3">پشته</TableHead>
                  <TableHead className="px-4 py-3">وضعیت تخصیص</TableHead>
                  <TableHead className="px-4 py-3">اقدام</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {server.discoveries.map((discovery) => {
                  const isAssigned =
                    discovery.assignmentStatus ===
                    DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED;

                  return (
                    <TableRow key={discovery.id}>
                      <TableCell className="px-4 py-3">
                        <p className="font-medium w-fit" dir="ltr">
                          {discovery.domain}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {discovery.title}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                        {discovery.application} · {discovery.controlPanel} ·{" "}
                        {discovery.webServer}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {isAssigned ? (
                          <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm text-accent-foreground">
                            تخصیص‌یافته
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                            تخصیص‌نیافته
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {isAssigned && discovery.assignedWebsiteId ? (
                          discovery.assignedWebsiteId.startsWith(
                            "website-00",
                          ) ? (
                            <Link
                              href={`/websites/${discovery.assignedWebsiteId}`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                              })}
                            >
                              مشاهده وب‌سایت
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              تخصیص محلی ثبت شد
                            </span>
                          )
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setSelectedDiscovery(discovery);
                              setAssignOpen(true);
                            }}
                          >
                            تخصیص
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {unassignedDiscoveries.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {unassignedDiscoveries.length.toLocaleString("fa-IR")} کشف در انتظار
            تخصیص است.
          </p>
        )}
      </section>

      <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <h2 className="font-semibold">وب‌سایت‌های تخصیص‌یافته</h2>
        {assignedDiscoveries.length === 0 && server.websiteIds.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            هنوز وب‌سایتی به این سرور تخصیص داده نشده است.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {(assignedDiscoveries.length > 0
              ? assignedDiscoveries.map((discovery) => ({
                  id: discovery.id,
                  domain: discovery.domain,
                  title: discovery.title,
                  assignedWebsiteId: discovery.assignedWebsiteId,
                }))
              : server.websiteIds.map((websiteId) => ({
                  id: websiteId,
                  domain: websiteId,
                  title: websiteId,
                  assignedWebsiteId: websiteId,
                }))
            ).map((item) => (
              <li
                key={item.id}
                className={cn(
                  mutedSurfaceClassName,
                  "flex items-center justify-between gap-3 p-4",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium w-fit" dir="ltr">
                    {item.domain}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.title}
                  </p>
                </div>
                {item.assignedWebsiteId?.startsWith("website-00") && (
                  <Link
                    href={`/websites/${item.assignedWebsiteId}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    جزئیات
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <EnrollmentRevealSheet
        open={enrollmentOpen}
        serverLabel={server.label}
        mode={enrollmentMode}
        onOpenChange={setEnrollmentOpen}
        onIssued={handleEnrollmentIssued}
      />
      <RevokeAgentSheet
        open={revokeOpen}
        serverLabel={server.label}
        onOpenChange={setRevokeOpen}
        onRevoke={handleRevoke}
      />
      <AssignDiscoverySheet
        open={assignOpen}
        discovery={selectedDiscovery}
        serverLabel={server.label}
        onOpenChange={setAssignOpen}
        onAssign={handleAssignDiscovery}
      />
    </div>
  );
}
