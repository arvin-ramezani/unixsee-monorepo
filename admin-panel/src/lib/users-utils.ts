import {
  ACCOUNT_STATE,
  ACCOUNT_STATE_LABELS,
  CONTACT_VERIFICATION,
  CURRENT_STAFF,
  MEMBERSHIP_ROLE,
  TENANT_STATE,
  TENANT_STATE_LABELS,
  type AccountOriginType,
  type AccountStateType,
  type CustomerUserType,
  type MembershipType,
  type StaffCapabilityType,
  type TenantStateType,
  type TenantType,
} from "@/lib/data/users-data";
import { COMPLEMENTARY_SERVICE_REQUESTS } from "@/lib/data/complementary-services-data";
import { TICKETS } from "@/lib/data/tickets-data";
import { listRuntimeWebsites } from "@/lib/data/websites-runtime";
import type { UserKycStatusType } from "@/lib/users/map-admin-user";

export const ACCOUNT_STATE_CONFIG: Record<
  AccountStateType,
  { label: string; emoji: string; className: string }
> = {
  [ACCOUNT_STATE.ACTIVE]: {
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.ACTIVE],
    emoji: "🟢",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  [ACCOUNT_STATE.PENDING_VERIFICATION]: {
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.PENDING_VERIFICATION],
    emoji: "🟡",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  [ACCOUNT_STATE.LOCKED]: {
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.LOCKED],
    emoji: "🔒",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  [ACCOUNT_STATE.SUSPENDED]: {
    label: ACCOUNT_STATE_LABELS[ACCOUNT_STATE.SUSPENDED],
    emoji: "🔴",
    className: "bg-destructive/10 text-destructive",
  },
};

export const TENANT_STATE_CONFIG: Record<
  TenantStateType,
  { label: string; className: string }
> = {
  [TENANT_STATE.ACTIVE]: {
    label: TENANT_STATE_LABELS[TENANT_STATE.ACTIVE],
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  [TENANT_STATE.PENDING_SETUP]: {
    label: TENANT_STATE_LABELS[TENANT_STATE.PENDING_SETUP],
    className: "bg-primary/10 text-primary",
  },
  [TENANT_STATE.SUSPENDED]: {
    label: TENANT_STATE_LABELS[TENANT_STATE.SUSPENDED],
    className: "bg-destructive/10 text-destructive",
  },
};

export function hasCapability(capability: StaffCapabilityType): boolean {
  return CURRENT_STAFF.capabilities.includes(capability);
}

export function getCustomerInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1);

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`;
}

/** True when a label is essentially a phone number (e.g. OTP personal tenant). */
export function looksLikePhoneLabel(value: string): boolean {
  const normalized = value.replace(/[\s\-()]/g, "");
  return /^\+?\d{8,15}$/.test(normalized);
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;

  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
}

export function maskMobile(mobile: string): string {
  if (mobile.length < 8) return mobile;

  return `${mobile.slice(0, 4)}${"*".repeat(mobile.length - 8)}${mobile.slice(-4)}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeMobile(mobile: string): string {
  return mobile.replace(/[^\d]/g, "");
}

export function findCustomerByContact(
  users: CustomerUserType[],
  contact: { email?: string; mobile?: string },
): CustomerUserType | undefined {
  const email = contact.email ? normalizeEmail(contact.email) : "";
  const mobile = contact.mobile ? normalizeMobile(contact.mobile) : "";

  return users.find((user) => {
    const matchesEmail =
      email.length > 0 && !!user.email && normalizeEmail(user.email) === email;
    const matchesMobile =
      mobile.length > 0 && normalizeMobile(user.mobile) === mobile;

    return matchesEmail || matchesMobile;
  });
}

export type TenantMembershipType = {
  tenant: TenantType;
  membership: MembershipType;
};

export function getUserTenantMemberships(
  userId: string,
  tenants: TenantType[],
  memberships: MembershipType[],
): TenantMembershipType[] {
  return memberships
    .filter((membership) => membership.userId === userId)
    .flatMap((membership) => {
      const tenant = tenants.find((item) => item.id === membership.tenantId);
      return tenant ? [{ tenant, membership }] : [];
    });
}

export type TenantMemberType = {
  membership: MembershipType;
  user: CustomerUserType;
};

export function getTenantMembers(
  tenantId: string,
  users: CustomerUserType[],
  memberships: MembershipType[],
): TenantMemberType[] {
  return memberships
    .filter((membership) => membership.tenantId === tenantId)
    .flatMap((membership) => {
      const user = users.find((item) => item.id === membership.userId);
      return user ? [{ membership, user }] : [];
    });
}

export function countTenantOwners(
  tenantId: string,
  memberships: MembershipType[],
): number {
  return memberships.filter(
    (membership) =>
      membership.tenantId === tenantId &&
      membership.role === MEMBERSHIP_ROLE.OWNER,
  ).length;
}

/**
 * BR-007: the last owner may not be removed or demoted, otherwise the tenant
 * becomes ownerless and its websites cannot be operated.
 */
export function isLastOwnerMembership(
  membership: MembershipType,
  memberships: MembershipType[],
): boolean {
  return (
    membership.role === MEMBERSHIP_ROLE.OWNER &&
    countTenantOwners(membership.tenantId, memberships) === 1
  );
}

export function getTenantWebsites(tenantId: string) {
  return listRuntimeWebsites().filter(
    (website) => website.tenantId === tenantId,
  );
}

export function countUserTickets(userId: string): number {
  return TICKETS.filter((ticket) => ticket.userId === userId).length;
}

export function countUserServiceRequests(userId: string): number {
  return COMPLEMENTARY_SERVICE_REQUESTS.filter(
    (request) => request.customerId === userId,
  ).length;
}

export type TenantEligibilityType = {
  eligible: boolean;
  reason: string | null;
};

/**
 * BR-010/BR-014: a website may only be owned by a tenant that is operable and
 * has an owner membership.
 */
export function getTenantAssignmentEligibility(
  tenant: TenantType,
  memberships: MembershipType[],
): TenantEligibilityType {
  if (tenant.state === TENANT_STATE.SUSPENDED) {
    return {
      eligible: false,
      reason:
        "این مستأجر تعلیق شده است. تا بازگردانی، تخصیص وب‌سایت انجام نمی‌شود.",
    };
  }

  if (countTenantOwners(tenant.id, memberships) === 0) {
    return {
      eligible: false,
      reason:
        "این مستأجر عضو مالک ندارد. ابتدا مالک را تعیین کنید تا مالکیت وب‌سایت کامل شود.",
    };
  }

  return { eligible: true, reason: null };
}

export type CustomerQueueRowType = {
  user: CustomerUserType;
  tenantMemberships: TenantMembershipType[];
  websiteCount: number;
  /** Nest-derived: tenant membership means organizationally authorized. */
  authorization?: UserKycStatusType;
  /** Present when list is Nest-over-fixture hybrid. */
  source?: "nest" | "fixture";
};

export function buildCustomerQueueRows(
  users: CustomerUserType[],
  tenants: TenantType[],
  memberships: MembershipType[],
): CustomerQueueRowType[] {
  return users.map((user) => {
    const tenantMemberships = getUserTenantMemberships(
      user.id,
      tenants,
      memberships,
    );

    const websiteCount = tenantMemberships.reduce(
      (total, item) => total + getTenantWebsites(item.tenant.id).length,
      0,
    );

    return { user, tenantMemberships, websiteCount };
  });
}

export const ACCOUNT_STATE_FILTER = {
  ALL: "ALL",
  ACTIONABLE: "ACTIONABLE",
} as const;

export type AccountStateFilterType =
  | AccountStateType
  | (typeof ACCOUNT_STATE_FILTER)[keyof typeof ACCOUNT_STATE_FILTER];

export const ACCOUNT_ORIGIN_FILTER_ALL = "ALL";

export type AccountOriginFilterType =
  | AccountOriginType
  | typeof ACCOUNT_ORIGIN_FILTER_ALL;

const ACTIONABLE_ACCOUNT_STATES: ReadonlySet<AccountStateType> = new Set([
  ACCOUNT_STATE.PENDING_VERIFICATION,
  ACCOUNT_STATE.LOCKED,
  ACCOUNT_STATE.SUSPENDED,
]);

function matchesAccountStateFilter(
  state: AccountStateType,
  filter: AccountStateFilterType,
): boolean {
  if (filter === ACCOUNT_STATE_FILTER.ALL) return true;
  if (filter === ACCOUNT_STATE_FILTER.ACTIONABLE) {
    return ACTIONABLE_ACCOUNT_STATES.has(state);
  }

  return state === filter;
}

export function filterCustomerQueueRows(
  rows: CustomerQueueRowType[],
  {
    query,
    accountState,
    origin,
  }: {
    query: string;
    accountState: AccountStateFilterType;
    origin: AccountOriginFilterType;
  },
): CustomerQueueRowType[] {
  const normalizedQuery = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (!matchesAccountStateFilter(row.user.accountState, accountState)) {
      return false;
    }

    if (origin !== ACCOUNT_ORIGIN_FILTER_ALL && row.user.origin !== origin) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchableText = [
      row.user.displayName,
      row.user.id,
      row.user.email ?? "",
      row.user.mobile,
      ...row.tenantMemberships.map((item) => item.tenant.name),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export type CustomerQueueSummaryType = {
  total: number;
  actionable: number;
  pendingVerification: number;
  suspendedOrLocked: number;
};

export function getCustomerQueueSummary(
  rows: CustomerQueueRowType[],
): CustomerQueueSummaryType {
  const pendingVerification = rows.filter(
    (row) => row.user.accountState === ACCOUNT_STATE.PENDING_VERIFICATION,
  ).length;

  const suspendedOrLocked = rows.filter(
    (row) =>
      row.user.accountState === ACCOUNT_STATE.SUSPENDED ||
      row.user.accountState === ACCOUNT_STATE.LOCKED,
  ).length;

  return {
    total: rows.length,
    actionable: pendingVerification + suspendedOrLocked,
    pendingVerification,
    suspendedOrLocked,
  };
}

export function formatContactSummary(user: CustomerUserType): string {
  return maskMobile(user.mobile);
}

export function hasUnverifiedContact(user: CustomerUserType): boolean {
  return (
    user.emailVerification === CONTACT_VERIFICATION.PENDING ||
    user.mobileVerification === CONTACT_VERIFICATION.PENDING
  );
}
