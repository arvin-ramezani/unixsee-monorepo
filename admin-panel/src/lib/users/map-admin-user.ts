import {
  ACCOUNT_ORIGIN,
  ACCOUNT_STATE,
  CONTACT_VERIFICATION,
  CUSTOMER_LOCALE,
  INVITE_STATUS,
  MEMBERSHIP_ROLE,
  TENANT_STATE,
  type AccountStateType,
  type CustomerLocaleType,
  type CustomerUserType,
  type MembershipRoleType,
  type MembershipType,
  type TenantStateType,
  type TenantType,
} from "@/lib/data/users-data";
import type { CustomerQueueRowType } from "@/lib/users-utils";

/**
 * Nest admin user shapes (list includes membership summary).
 * Never map national-ID / card images here — those are not on this API.
 */

export type NestUserAccountStatus = "ACTIVE" | "SUSPENDED" | string;
export type NestUserRole = "USER" | "TENANT" | "ADMIN" | "OPERATOR" | string;
export type NestMembershipRole = "OWNER" | "ADMIN" | "VIEWER" | string;
export type NestTenantStatus = "ACTIVE" | "SUSPENDED" | string;

export type AdminUserTenantDto = {
  id: string;
  name: string;
  displayName?: string | null;
  status: NestTenantStatus;
};

export type AdminUserMembershipDto = {
  id: string;
  userId: string;
  tenantId: string;
  role: NestMembershipRole;
  createdAt?: string;
  tenant?: AdminUserTenantDto | null;
};

export type AdminUserDto = {
  id: string;
  phoneNumber: string;
  email: string | null;
  username: string | null;
  fullName: string | null;
  role: NestUserRole;
  status: NestUserAccountStatus;
  locale: string;
  suspendedAt: string | null;
  suspendedReason: string | null;
  createdAt: string;
  updatedAt: string;
  memberships?: AdminUserMembershipDto[];
  _count?: {
    websites?: number;
    memberships?: number;
  };
};

export type AdminUserListResponse = {
  items: AdminUserDto[];
  total: number;
};

export const USER_KYC_STATUS = {
  APPROVED: "APPROVED",
  NOT_SUBMITTED: "NOT_SUBMITTED",
  REJECTED: "REJECTED",
} as const;

export type UserKycStatusType =
  (typeof USER_KYC_STATUS)[keyof typeof USER_KYC_STATUS];

/** @deprecated Use USER_KYC_STATUS — kept for older imports during rename. */
export const TENANT_AUTHORIZATION = {
  AUTHORIZED: USER_KYC_STATUS.APPROVED,
  NOT_AUTHORIZED: USER_KYC_STATUS.NOT_SUBMITTED,
} as const;

export type TenantAuthorizationType = UserKycStatusType;

export const USER_KYC_STATUS_LABELS: Record<UserKycStatusType, string> = {
  [USER_KYC_STATUS.APPROVED]: "تایید شده",
  [USER_KYC_STATUS.NOT_SUBMITTED]: "ارسال نشده",
  [USER_KYC_STATUS.REJECTED]: "رد شده",
};

export const TENANT_AUTHORIZATION_LABELS = USER_KYC_STATUS_LABELS;

export type MappedAdminUserBundle = {
  user: CustomerUserType;
  tenants: TenantType[];
  memberships: MembershipType[];
  websiteCount: number;
  authorization: UserKycStatusType;
};

export function mapAuthorizationCaseStatusToUserKyc(
  status: string | null | undefined,
): UserKycStatusType {
  if (status === "approved") return USER_KYC_STATUS.APPROVED;
  if (status === "rejected") return USER_KYC_STATUS.REJECTED;
  return USER_KYC_STATUS.NOT_SUBMITTED;
}

function formatFaDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function mapAccountState(status: NestUserAccountStatus): AccountStateType {
  if (status === "SUSPENDED") return ACCOUNT_STATE.SUSPENDED;
  return ACCOUNT_STATE.ACTIVE;
}

function mapLocale(locale: string): CustomerLocaleType {
  if (locale.toLowerCase().startsWith("en")) return CUSTOMER_LOCALE.EN_US;
  return CUSTOMER_LOCALE.FA_IR;
}

function mapMembershipRole(role: NestMembershipRole): MembershipRoleType {
  if (role === "OWNER") return MEMBERSHIP_ROLE.OWNER;
  if (role === "VIEWER") return MEMBERSHIP_ROLE.VIEWER;
  // Nest ADMIN membership ≈ staff UI MANAGER
  return MEMBERSHIP_ROLE.MANAGER;
}

function mapTenantState(status: NestTenantStatus): TenantStateType {
  if (status === "SUSPENDED") return TENANT_STATE.SUSPENDED;
  return TENANT_STATE.ACTIVE;
}

/** Personal tenants created via OTP often store the phone as name/displayName. */
function isPhoneLabel(value: string): boolean {
  const normalized = value.replace(/[\s\-()]/g, "");
  return /^\+?\d{8,15}$/.test(normalized);
}

function resolveTenantDisplayName(
  tenantDto: AdminUserTenantDto,
  owner: Pick<AdminUserDto, "fullName" | "username" | "phoneNumber">,
): string {
  const candidates = [
    tenantDto.displayName?.trim(),
    tenantDto.name?.trim(),
    owner.fullName?.trim(),
    owner.username?.trim(),
  ].filter((value): value is string => Boolean(value));

  const humanName = candidates.find((value) => !isPhoneLabel(value));
  if (humanName) return humanName;

  return candidates[0] || owner.phoneNumber?.trim() || tenantDto.id;
}

export function mapAdminUserToBundle(dto: AdminUserDto): MappedAdminUserBundle {
  const membershipsDto = dto.memberships ?? [];
  const tenants: TenantType[] = [];
  const memberships: MembershipType[] = [];

  for (const membership of membershipsDto) {
    const tenantDto = membership.tenant;
    if (tenantDto) {
      tenants.push({
        id: tenantDto.id,
        name: resolveTenantDisplayName(tenantDto, dto),
        state: mapTenantState(tenantDto.status),
        createdAt: formatFaDateTime(membership.createdAt) ?? "—",
        stateReason: null,
      });
    }
    memberships.push({
      id: membership.id,
      tenantId: membership.tenantId,
      userId: membership.userId || dto.id,
      role: mapMembershipRole(membership.role),
      addedAt: formatFaDateTime(membership.createdAt) ?? "—",
    });
  }

  const user: CustomerUserType = {
    id: dto.id,
    displayName:
      dto.fullName?.trim() ||
      dto.username?.trim() ||
      dto.phoneNumber,
    email: dto.email,
    emailVerification: dto.email
      ? CONTACT_VERIFICATION.VERIFIED
      : CONTACT_VERIFICATION.NOT_PROVIDED,
    mobile: dto.phoneNumber,
    // Nest does not expose contact OTP state on admin users; stay neutral.
    mobileVerification: CONTACT_VERIFICATION.VERIFIED,
    locale: mapLocale(dto.locale),
    accountState: mapAccountState(dto.status),
    origin: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: false,
    activeSessionCount: 0,
    createdAt: formatFaDateTime(dto.createdAt) ?? "—",
    lastSignInAt: null,
    stateReason: dto.suspendedReason,
  };

  return {
    user,
    tenants,
    memberships,
    websiteCount: dto._count?.websites ?? 0,
    // KYC list status is filled from authorization-cases on the users page.
    authorization: USER_KYC_STATUS.NOT_SUBMITTED,
  };
}

export function mapAdminUserListToQueueRows(
  data: AdminUserListResponse,
): CustomerQueueRowType[] {
  return data.items.map((item) => {
    const mapped = mapAdminUserToBundle(item);
    const tenantMemberships = mapped.memberships.flatMap((membership) => {
      const tenant = mapped.tenants.find(
        (entry) => entry.id === membership.tenantId,
      );
      return tenant ? [{ tenant, membership }] : [];
    });

    return {
      user: mapped.user,
      tenantMemberships,
      websiteCount: mapped.websiteCount,
      authorization: mapped.authorization,
    };
  });
}

export function mapAdminUserDetail(dto: AdminUserDto): MappedAdminUserBundle {
  return mapAdminUserToBundle(dto);
}
