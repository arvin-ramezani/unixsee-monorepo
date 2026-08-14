"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Globe2,
  History,
  LifeBuoy,
  Lock,
  NotebookPen,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ACCOUNT_ORIGIN_LABELS,
  ACCOUNT_STATE,
  AUDIT_ACTION_LABELS,
  AUDIT_RESULT,
  AUDIT_RESULT_LABELS,
  CONTACT_VERIFICATION,
  CONTACT_VERIFICATION_LABELS,
  CUSTOMER_LOCALE_LABELS,
  INVITE_STATUS,
  INVITE_STATUS_LABELS,
  SECURITY_ACTION,
  SECURITY_ACTION_LABELS,
  STAFF_CAPABILITY,
  type CustomerUserType,
  type MembershipRoleType,
  type MembershipType,
  type SecurityActionType,
  type StaffCapabilityType,
  type TenantType,
} from "@/lib/data/users-data";
import {
  addTenantMembership,
  applySecurityAction,
  changeMembershipRole,
  listRuntimeMemberships,
  listRuntimeTenants,
  listRuntimeUsers,
  listUserAuditEntries,
  listUserNotes,
  removeTenantMembership,
} from "@/lib/data/users-runtime";
import {
  countUserServiceRequests,
  countUserTickets,
  getCustomerInitials,
  getTenantWebsites,
  getUserTenantMemberships,
  hasCapability,
} from "@/lib/users-utils";
import {
  USER_KYC_STATUS,
  type UserKycStatusType,
} from "@/lib/users/map-admin-user";
import { cn } from "@/lib/utils";
import { AccountStateBadge } from "./account-status-badge";
import { AuthorizationStatusBadge } from "./authorization-status-badge";
import { AddMemberDialog } from "./add-member-dialog";
import { SecurityActionDialog } from "./security-action-dialog";
import { TenantMembershipsSection } from "./tenant-memberships-section";

const surfaceClassName = "rounded-2xl border border-border bg-card/90";
const mutedSurfaceClassName = "rounded-2xl border border-border bg-muted/30";

const USER_IDENTITY_FIELDS = [
  {
    key: "email",
    label: "ایمیل",
    dir: "ltr" as const,
    getValue: (user: CustomerUserType) => user.email ?? "ثبت نشده",
    getHint: (user: CustomerUserType) =>
      CONTACT_VERIFICATION_LABELS[user.emailVerification],
  },
  {
    key: "mobile",
    label: "موبایل",
    dir: "ltr" as const,
    getValue: (user: CustomerUserType) => user.mobile,
    getHint: (user: CustomerUserType) =>
      CONTACT_VERIFICATION_LABELS[user.mobileVerification],
  },
  {
    key: "locale",
    label: "زبان مشتری",
    getValue: (user: CustomerUserType) => CUSTOMER_LOCALE_LABELS[user.locale],
    getHint: () => null,
  },
  {
    key: "origin",
    label: "منبع ایجاد",
    getValue: (user: CustomerUserType) => ACCOUNT_ORIGIN_LABELS[user.origin],
    getHint: () => "منبع ایجاد به‌تنهایی تأیید پلن یا تخصیص وب‌سایت نیست.",
  },
  {
    key: "invite",
    label: "وضعیت دعوت‌نامه",
    getValue: (user: CustomerUserType) =>
      INVITE_STATUS_LABELS[user.inviteStatus],
    getHint: (user: CustomerUserType) =>
      user.inviteStatus === INVITE_STATUS.PENDING
        ? "تا تکمیل دعوت توسط مشتری، دسترسی کامل فعال نمی‌شود."
        : null,
  },
  {
    key: "twoFactor",
    label: "تأیید دومرحله‌ای",
    getValue: (user: CustomerUserType) =>
      user.twoFactorEnabled ? "فعال" : "غیرفعال",
    getHint: () => null,
  },
  {
    key: "sessions",
    label: "نشست‌های فعال",
    getValue: (user: CustomerUserType) =>
      user.activeSessionCount.toLocaleString("fa-IR"),
    getHint: () => null,
  },
  {
    key: "createdAt",
    label: "تاریخ ایجاد",
    getValue: (user: CustomerUserType) => user.createdAt,
    getHint: () => null,
  },
  {
    key: "lastSignIn",
    label: "آخرین ورود",
    getValue: (user: CustomerUserType) => user.lastSignInAt ?? "بدون ورود",
    getHint: () => null,
  },
] as const;

type SecurityActionConfigType = {
  action: SecurityActionType;
  capability: StaffCapabilityType;
  icon: typeof ShieldAlert;
  variant: "default" | "outline" | "destructive";
  isAvailable: (user: CustomerUserType) => boolean;
  unavailableReason: string;
};

const SECURITY_ACTION_CONFIGS: SecurityActionConfigType[] = [
  {
    action: SECURITY_ACTION.SUSPEND,
    capability: STAFF_CAPABILITY.SUSPEND_RESTORE,
    icon: ShieldAlert,
    variant: "destructive",
    isAvailable: (user) => user.accountState !== ACCOUNT_STATE.SUSPENDED,
    unavailableReason: "این حساب از قبل تعلیق شده است.",
  },
  {
    action: SECURITY_ACTION.RESTORE,
    capability: STAFF_CAPABILITY.SUSPEND_RESTORE,
    icon: RotateCcw,
    variant: "default",
    isAvailable: (user) =>
      user.accountState === ACCOUNT_STATE.SUSPENDED ||
      user.accountState === ACCOUNT_STATE.LOCKED,
    unavailableReason: "حساب تعلیق یا قفل نیست.",
  },
  {
    action: SECURITY_ACTION.REVOKE_SESSIONS,
    capability: STAFF_CAPABILITY.REVOKE_SESSIONS,
    icon: Lock,
    variant: "outline",
    isAvailable: (user) => user.activeSessionCount > 0,
    unavailableReason: "نشست فعالی برای پایان دادن وجود ندارد.",
  },
  {
    action: SECURITY_ACTION.START_RECOVERY,
    capability: STAFF_CAPABILITY.START_RECOVERY,
    icon: LifeBuoy,
    variant: "outline",
    isAvailable: () => true,
    unavailableReason: "",
  },
];

type StatusMessageType = {
  text: string;
  isBlocked: boolean;
};

type UserDetailsViewProps = {
  initialUser: CustomerUserType;
  initialTenants?: TenantType[];
  initialMemberships?: MembershipType[];
  authorization?: UserKycStatusType;
  nestBacked?: boolean;
};

export function UserDetailsView({
  initialUser,
  initialTenants,
  initialMemberships,
  authorization,
  nestBacked = false,
}: UserDetailsViewProps) {
  const [user, setUser] = useState(initialUser);
  const [users, setUsers] = useState(listRuntimeUsers);
  const [tenants] = useState(
    () => initialTenants ?? listRuntimeTenants(),
  );
  const [memberships, setMemberships] = useState(
    () => initialMemberships ?? listRuntimeMemberships(),
  );
  const [auditEntries, setAuditEntries] = useState(() =>
    nestBacked ? [] : listUserAuditEntries(initialUser.id),
  );
  const [statusMessage, setStatusMessage] = useState<StatusMessageType | null>(
    null,
  );
  const [securityAction, setSecurityAction] =
    useState<SecurityActionType | null>(null);
  const [memberTenant, setMemberTenant] = useState<TenantType | null>(null);

  const notes = nestBacked ? [] : listUserNotes(user.id);
  const canManageMembership =
    !nestBacked && hasCapability(STAFF_CAPABILITY.MANAGE_MEMBERSHIP);
  const canViewNotes =
    !nestBacked && hasCapability(STAFF_CAPABILITY.VIEW_INTERNAL_NOTES);
  const resolvedAuthorization =
    authorization ?? USER_KYC_STATUS.NOT_SUBMITTED;

  const tenantMemberships = getUserTenantMemberships(
    user.id,
    tenants,
    memberships,
  );
  const relatedWebsites = tenantMemberships.flatMap(({ tenant }) =>
    getTenantWebsites(tenant.id),
  );
  const ticketCount = countUserTickets(user.id);
  const serviceRequestCount = countUserServiceRequests(user.id);

  const memberCandidates = memberTenant
    ? users.filter(
        (candidate) =>
          !memberships.some(
            (membership) =>
              membership.tenantId === memberTenant.id &&
              membership.userId === candidate.id,
          ),
      )
    : [];

  const applyMembershipResult = (result: {
    accepted: boolean;
    message: string;
  }) => {
    setMemberships(listRuntimeMemberships());
    setAuditEntries(listUserAuditEntries(user.id));
    setStatusMessage({ text: result.message, isBlocked: !result.accepted });
  };

  const handleChangeRole = (membershipId: string, role: MembershipRoleType) => {
    if (nestBacked) {
      setStatusMessage({
        text: "تغییر عضویت هنوز به NestJS وصل نشده است.",
        isBlocked: true,
      });
      return;
    }
    applyMembershipResult(changeMembershipRole({ membershipId, role }));
  };

  const handleRemoveMembership = (membershipId: string) => {
    if (nestBacked) {
      setStatusMessage({
        text: "حذف عضویت هنوز به NestJS وصل نشده است.",
        isBlocked: true,
      });
      return;
    }
    applyMembershipResult(removeTenantMembership(membershipId));
  };

  const handleAddMember = ({
    userId,
    role,
  }: {
    userId: string;
    role: MembershipRoleType;
  }) => {
    if (nestBacked || !memberTenant) return;

    applyMembershipResult(
      addTenantMembership({ tenantId: memberTenant.id, userId, role }),
    );
  };

  const handleSecurityAction = (action: SecurityActionType, reason: string) => {
    if (nestBacked) {
      setStatusMessage({
        text: "اقدام امنیتی هنوز به NestJS وصل نشده است.",
        isBlocked: true,
      });
      return;
    }
    const result = applySecurityAction({ userId: user.id, action, reason });
    if (!result) return;

    setUser(result.user);
    setUsers(listRuntimeUsers());
    setAuditEntries(listUserAuditEntries(user.id));
    setStatusMessage({ text: result.message, isBlocked: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/users"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-2",
          )}
        >
          <ArrowRight data-icon="inline-start" />
          بازگشت به کاربران
        </Link>
      </div>

      <div
        className={cn(
          "rounded-xl border px-4 py-3 text-sm",
          resolvedAuthorization === USER_KYC_STATUS.APPROVED
            ? "border-emerald-500/30 bg-emerald-500/5"
            : resolvedAuthorization === USER_KYC_STATUS.REJECTED
              ? "border-destructive/30 bg-destructive/5"
              : "border-amber-500/30 bg-amber-500/5",
        )}
        role="status"
      >
        <div className="flex flex-wrap items-center gap-2">
          <AuthorizationStatusBadge status={resolvedAuthorization} />
          <p className="text-muted-foreground">
            {resolvedAuthorization === USER_KYC_STATUS.APPROVED
              ? "بسته احراز هویت این حساب تایید شده است."
              : resolvedAuthorization === USER_KYC_STATUS.REJECTED
                ? "بسته احراز هویت این حساب رد شده است."
                : "هنوز بسته احراز هویت ارسال نشده یا در صف بررسی است."}
          </p>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          کد ملی و عکس کارت ملی در این صفحه نیست.{" "}
          <Link
            href="/users/authorization"
            className="text-primary underline underline-offset-2"
          >
            رفتن به صف بررسی مدارک
          </Link>
        </p>
      </div>

      <header className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Avatar size="lg">
              <AvatarFallback>
                {getCustomerInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">کاربر مشتری</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {user.displayName}
              </h1>
              <p className="mt-2 text-xs text-muted-foreground" dir="ltr">
                {user.id}
              </p>
              {user.stateReason && (
                <p className="mt-2 text-sm text-muted-foreground">
                  دلیل وضعیت فعلی: {user.stateReason}
                </p>
              )}
            </div>
          </div>
          <AccountStateBadge state={user.accountState} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {USER_IDENTITY_FIELDS.map((field) => {
            const hint = field.getHint(user);

            return (
              <div key={field.key} className={cn(mutedSurfaceClassName, "p-3")}>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p
                  className={cn("mt-2 text-sm font-medium break-all", {
                    "w-fit": "dir" in field,
                  })}
                  dir={"dir" in field ? field.dir : undefined}
                >
                  {field.getValue(user)}
                </p>
                {!!hint && (
                  <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                )}
              </div>
            );
          })}
        </div>

        {(user.emailVerification === CONTACT_VERIFICATION.PENDING ||
          user.mobileVerification === CONTACT_VERIFICATION.PENDING) && (
          <p className="mt-3 text-sm text-muted-foreground">
            ذخیره اطلاعات تماس در پنل، آن را تأییدشده نمی‌کند. تأیید فقط با
            فرایند تأیید مشتری انجام می‌شود.
          </p>
        )}
      </header>

      <div role="status" aria-live="polite" aria-atomic="true">
        {statusMessage && (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              statusMessage.isBlocked
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-accent bg-accent/20 text-accent-foreground",
            )}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      <TenantMembershipsSection
        user={user}
        tenantMemberships={tenantMemberships}
        users={users}
        memberships={memberships}
        canManageMembership={canManageMembership}
        onChangeRole={handleChangeRole}
        onRemoveMembership={handleRemoveMembership}
        onAddMemberRequest={setMemberTenant}
      />

      <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <h2 className="font-semibold">امنیت حساب</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {nestBacked
            ? "اقدام‌های امنیتی (تعلیق، بازیابی، پایان نشست) هنوز از این صفحه به Nest وصل نشده‌اند. رمز، OTP و توکن هرگز نمایش داده نمی‌شوند."
            : "هر اقدام امنیتی نیازمند دلیل است. رمز عبور، کد یک‌بارمصرف و اطلاعات بازیابی هرگز نمایش داده نمی‌شوند."}
        </p>

        {!nestBacked && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {SECURITY_ACTION_CONFIGS.map((config) => {
                const Icon = config.icon;
                const isPermitted = hasCapability(config.capability);
                const isAvailable = config.isAvailable(user);

                return (
                  <Button
                    key={config.action}
                    type="button"
                    size="sm"
                    variant={config.variant}
                    className="gap-2"
                    disabled={!isPermitted || !isAvailable}
                    onClick={() => setSecurityAction(config.action)}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {SECURITY_ACTION_LABELS[config.action]}
                  </Button>
                );
              })}
            </div>

            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {SECURITY_ACTION_CONFIGS.filter(
                (config) =>
                  !hasCapability(config.capability) || !config.isAvailable(user),
              ).map((config) => (
                <li key={config.action}>
                  {SECURITY_ACTION_LABELS[config.action]}:{" "}
                  {hasCapability(config.capability)
                    ? config.unavailableReason
                    : "برای نقش فعلی فعال نیست و باید به همکار دارای این دسترسی ارجاع شود."}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex items-center gap-2">
          <Globe2 className="size-5" aria-hidden="true" />
          <h2 className="font-semibold">رکوردهای مرتبط</h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className={cn(mutedSurfaceClassName, "p-4")}>
            <p className="text-sm text-muted-foreground">
              وب‌سایت‌های مستأجرها
            </p>
            {relatedWebsites.length === 0 ? (
              <p className="mt-3 text-sm">
                وب‌سایتی به مستأجرهای این مشتری تخصیص نیافته است.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {relatedWebsites.map((website) => (
                  <li
                    key={website.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" dir="ltr">
                        {website.domain}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {website.tenantName}
                      </p>
                    </div>
                    <Link
                      href={`/websites/${website.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      جزئیات
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cn(mutedSurfaceClassName, "p-4")}>
            <p className="text-sm text-muted-foreground">
              تیکت‌ها و درخواست‌های سرویس
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-4" aria-hidden="true" />
                  <p className="text-sm">
                    {ticketCount.toLocaleString("fa-IR")} تیکت پشتیبانی
                  </p>
                </div>
                <Link
                  href="/tickets"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فهرست تیکت‌ها
                </Link>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-4" aria-hidden="true" />
                  <p className="text-sm">
                    {serviceRequestCount.toLocaleString("fa-IR")} درخواست سرویس
                    مکمل
                  </p>
                </div>
                <Link
                  href="/complementary-services"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  فهرست درخواست‌ها
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {canViewNotes && (
        <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
          <div className="flex items-center gap-2">
            <NotebookPen className="size-5" aria-hidden="true" />
            <h2 className="font-semibold">یادداشت‌های داخلی</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            این یادداشت‌ها فقط برای کارکنان است و هرگز به مشتری نمایش داده
            نمی‌شود.
          </p>

          {notes.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              یادداشت داخلی برای این مشتری ثبت نشده است.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {notes.map((note) => (
                <li key={note.id} className={cn(mutedSurfaceClassName, "p-3")}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{note.authorName}</span>
                    <span>{note.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm">{note.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className={cn(surfaceClassName, "p-4 shadow-sm")}>
        <div className="flex items-center gap-2">
          <History className="size-5" aria-hidden="true" />
          <h2 className="font-semibold">سابقه اقدام‌ها</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          اقدام‌کننده، هدف، زمان و نتیجه بدون هیچ اطلاعات محرمانه ثبت می‌شود.
        </p>

        {auditEntries.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            برای این حساب سابقه‌ای ثبت نشده است.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {auditEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {AUDIT_ACTION_LABELS[entry.action]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.target}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserRound className="size-3.5" aria-hidden="true" />
                    {entry.actorName}
                  </span>
                  <span>{entry.occurredAt}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1",
                      entry.result === AUDIT_RESULT.BLOCKED
                        ? "bg-destructive/10 text-destructive"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    )}
                  >
                    {AUDIT_RESULT_LABELS[entry.result]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SecurityActionDialog
        open={!!securityAction}
        action={securityAction}
        user={user}
        onOpenChange={(open) => {
          if (!open) setSecurityAction(null);
        }}
        onConfirm={handleSecurityAction}
      />
      <AddMemberDialog
        open={!!memberTenant}
        tenant={memberTenant}
        candidates={memberCandidates}
        onOpenChange={(open) => {
          if (!open) setMemberTenant(null);
        }}
        onAddMember={handleAddMember}
      />
    </div>
  );
}
