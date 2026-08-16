"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Globe2,
  KeyRound,
  Monitor,
  Server,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import {
  issueEnrollmentTokenAction,
  revokeAgentCredentialsAction,
  revokeEnrollmentTokenAction,
  deleteServerAction,
  type EnrollmentRevealPayload,
} from "@/actions/servers/server-actions";
import { AdminBackLink } from "@/components/common/admin-back-link";
import { Button, buttonVariants } from "@/components/ui/button";
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
  DISCOVERY_ASSIGNMENT_STATUS,
  ENROLLMENT_TOKEN_STATUS,
  SERVER_AGENT_STATE,
  SERVER_STACK,
  type ServerType,
  type WebsiteDiscoveryType,
} from "@/lib/data/servers-data";
import { cn } from "@/lib/utils";
import {
  AssignDiscoveryDialog,
  type AssignDiscoveryValues,
} from "./assign-discovery-dialog";
import { DeleteServerDialog } from "./delete-server-dialog";
import { EnrollmentRevealDialog } from "./enrollment-reveal-dialog";
import { RevokeAgentDialog } from "./revoke-agent-dialog";
import { ServerStatusBadge } from "./server-status-badge";

const surfaceClassName = "rounded-2xl border border-border bg-card/90";
const mutedSurfaceClassName = "rounded-2xl border border-border bg-muted/30";

const SERVER_IDENTITY_FIELDS = [
  {
    key: "ip",
    label: "آدرس IP",
    getValue: (server: ServerType) => server.ip || "—",
    dir: "ltr" as const,
  },
  {
    key: "capacitySummary",
    label: "ظرفیت",
    getValue: (server: ServerType) => server.capacitySummary || "—",
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
  initialAssignDiscoveryId?: string | null;
  initialTenantId?: string | null;
};

export function ServerDetailsView({
  initialServer,
  initialAssignDiscoveryId = null,
  initialTenantId = null,
}: ServerDetailsViewProps) {
  const router = useRouter();
  const didResumeAssign = useRef(false);
  const [server, setServer] = useState(initialServer);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [revealPayload, setRevealPayload] =
    useState<EnrollmentRevealPayload | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] =
    useState<WebsiteDiscoveryType | null>(null);
  const [resumeTenantId, setResumeTenantId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setServer(initialServer);
  }, [initialServer]);

  useEffect(() => {
    if (didResumeAssign.current || !initialAssignDiscoveryId) return;

    const discovery = initialServer.discoveries.find(
      (item) => item.id === initialAssignDiscoveryId,
    );
    if (
      !discovery ||
      discovery.assignmentStatus !== DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED
    ) {
      return;
    }

    didResumeAssign.current = true;
    setSelectedDiscovery(discovery);
    setResumeTenantId(initialTenantId);
    setAssignOpen(true);
    router.replace(`/servers/${initialServer.id}`, { scroll: false });
  }, [
    initialAssignDiscoveryId,
    initialServer,
    initialTenantId,
    router,
  ]);

  const unassignedDiscoveries = server.discoveries.filter(
    (discovery) =>
      discovery.assignmentStatus === DISCOVERY_ASSIGNMENT_STATUS.UNASSIGNED,
  );
  const assignedDiscoveries = server.discoveries.filter(
    (discovery) =>
      discovery.assignmentStatus === DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
  );

  const activeToken = server.enrollmentTokens.find(
    (token) => token.status === "ACTIVE",
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

  const canRevokeAgent =
    server.agent.state === SERVER_AGENT_STATE.CONNECTED ||
    server.agent.state === SERVER_AGENT_STATE.STALE ||
    server.agent.state === SERVER_AGENT_STATE.DISCONNECTED;

  const canRevokeUnusedToken =
    Boolean(activeToken) &&
    server.enrollment.status === ENROLLMENT_TOKEN_STATUS.UNUSED;

  const issueToken = (mode: "issue" | "reissue") => {
    startTransition(async () => {
      const result = await issueEnrollmentTokenAction({
        serverId: server.id,
        mode,
      });

      if (!result.ok) {
        toastApiErrorMessage(result.message);
        return;
      }

      setServer(result.server);
      setRevealPayload(result.reveal);
      setEnrollmentOpen(true);
      setStatusMessage(
        mode === "reissue"
          ? "توکن جدید صادر شد. مقدار متنی فقط در این پنل قابل مشاهده است."
          : "توکن اتصال صادر شد. مقدار متنی فقط در این پنل قابل مشاهده است.",
      );
      router.refresh();
    });
  };

  const handleRevokeAgent = async (reason: string) => {
    const result = await revokeAgentCredentialsAction({
      serverId: server.id,
      reason,
    });

    if (!result.ok) {
      toastApiErrorMessage(result.message);
      return false;
    }

    setServer(result.server);
    setStatusMessage(`Agent باطل شد: ${reason}`);
    router.refresh();
    return true;
  };

  const handleDeleteServer = async () => {
    const result = await deleteServerAction({ serverId: server.id });
    if (!result.ok) {
      toastApiErrorMessage(result.message);
      return false;
    }
    router.push("/servers");
    router.refresh();
    return true;
  };

  const handleRevokeUnusedToken = () => {
    if (!activeToken) return;

    startTransition(async () => {
      const result = await revokeEnrollmentTokenAction({
        serverId: server.id,
        tokenId: activeToken.id,
      });

      if (!result.ok) {
        toastApiErrorMessage(result.message);
        return;
      }

      setServer(result.server);
      setStatusMessage("توکن استفاده‌نشده باطل شد.");
      router.refresh();
    });
  };

  const handleAssignDiscovery = (
    discovery: WebsiteDiscoveryType,
    values: AssignDiscoveryValues,
  ) => {
    const websiteId = `website-${discovery.id}`;

    setServer((current) => ({
      ...current,
      discoveries: current.discoveries.map((item) =>
        item.id === discovery.id
          ? {
              ...item,
              assignmentStatus: DISCOVERY_ASSIGNMENT_STATUS.ASSIGNED,
              assignedWebsiteId: websiteId,
              title: values.tenantName
                ? `${item.domain} · ${values.tenantName}`
                : item.title,
            }
          : item,
      ),
      websiteIds: current.websiteIds.includes(websiteId)
        ? current.websiteIds
        : [...current.websiteIds, websiteId],
    }));
    setStatusMessage(
      `وب‌سایت ${discovery.domain} به ${values.tenantName} تخصیص داده شد (محلی؛ هنوز به Nest وصل نیست).`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminBackLink href="/servers">بازگشت به سرورها</AdminBackLink>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="gap-2"
          disabled={isPending}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          حذف سرور
        </Button>
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
                disabled={isPending}
                onClick={() => issueToken("issue")}
              >
                <KeyRound className="size-4" aria-hidden="true" />
                {isPending ? "در حال صدور…" : "صدور توکن اتصال"}
              </Button>
            )}
            {canReissueToken && !canIssueToken && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isPending}
                onClick={() => issueToken("reissue")}
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
                disabled={isPending}
                onClick={() => issueToken("reissue")}
              >
                صدور مجدد
              </Button>
            )}
            {canRevokeUnusedToken && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isPending}
                onClick={handleRevokeUnusedToken}
              >
                باطل‌سازی توکن
              </Button>
            )}
            {canRevokeAgent && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="gap-2"
                disabled={isPending}
                onClick={() => setRevokeOpen(true)}
              >
                <ShieldAlert className="size-4" aria-hidden="true" />
                باطل‌سازی Agent
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
                          <span className="text-sm text-muted-foreground">
                            تخصیص ثبت شده
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setResumeTenantId(null);
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <EnrollmentRevealDialog
        open={enrollmentOpen}
        serverLabel={server.label}
        payload={revealPayload}
        onOpenChange={(nextOpen) => {
          setEnrollmentOpen(nextOpen);
          if (!nextOpen) {
            setRevealPayload(null);
          }
        }}
        onDismissed={() => {
          setRevealPayload(null);
          setStatusMessage(
            "پنل توکن بسته شد. مقدار متنی دیگر قابل بازیابی نیست.",
          );
        }}
      />
      <RevokeAgentDialog
        open={revokeOpen}
        serverLabel={server.label}
        onOpenChange={setRevokeOpen}
        onRevoke={handleRevokeAgent}
      />
      <DeleteServerDialog
        open={deleteOpen}
        serverLabel={server.label}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteServer}
      />
      <AssignDiscoveryDialog
        open={assignOpen}
        discovery={selectedDiscovery}
        serverId={server.id}
        serverLabel={server.label}
        initialTenantId={resumeTenantId}
        onOpenChange={(open) => {
          setAssignOpen(open);
          if (!open) {
            setResumeTenantId(null);
          }
        }}
        onAssign={handleAssignDiscovery}
      />
    </div>
  );
}
