import {
  ACCOUNT_ORIGIN,
  ACCOUNT_STATE,
  AUDIT_ACTION,
  AUDIT_RESULT,
  CONTACT_VERIFICATION,
  CURRENT_STAFF,
  CUSTOMER_USERS,
  INVITE_STATUS,
  MEMBERSHIP_ROLE,
  MEMBERSHIPS,
  SECURITY_ACTION,
  SECURITY_ACTION_LABELS,
  TENANT_STATE,
  TENANTS,
  USER_AUDIT_ENTRIES,
  USER_INTERNAL_NOTES,
  type AuditActionType,
  type AuditEntryType,
  type AuditResultType,
  type CustomerLocaleType,
  type CustomerUserType,
  type InternalNoteType,
  type MembershipRoleType,
  type MembershipType,
  type SecurityActionType,
  type TenantType,
} from "@/lib/data/users-data";
import {
  findCustomerByContact,
  hasUnverifiedContact,
  isLastOwnerMembership,
  normalizeEmail,
  normalizeMobile,
} from "@/lib/users-utils";

/**
 * Prototype-only in-memory state. It keeps records created during a session
 * visible across the users queue, the user detail page, and website
 * assignment. Persistence and idempotency belong to NestJS later.
 */
let runtimeUsers: CustomerUserType[] = CUSTOMER_USERS.map((user) => ({
  ...user,
}));
let runtimeTenants: TenantType[] = TENANTS.map((tenant) => ({ ...tenant }));
let runtimeMemberships: MembershipType[] = MEMBERSHIPS.map((membership) => ({
  ...membership,
}));
let runtimeNotes: InternalNoteType[] = USER_INTERNAL_NOTES.map((note) => ({
  ...note,
}));
let runtimeAuditEntries: AuditEntryType[] = USER_AUDIT_ENTRIES.map((entry) => ({
  ...entry,
}));

export function listRuntimeUsers() {
  return runtimeUsers;
}

export function listRuntimeTenants() {
  return runtimeTenants;
}

export function listRuntimeMemberships() {
  return runtimeMemberships;
}

export function getRuntimeUser(id: string) {
  return runtimeUsers.find((user) => user.id === id);
}

export function listUserNotes(userId: string) {
  return runtimeNotes.filter((note) => note.userId === userId);
}

export function listUserAuditEntries(userId: string) {
  return runtimeAuditEntries.filter((entry) => entry.userId === userId);
}

function appendAuditEntry({
  userId,
  action,
  target,
  result,
}: {
  userId: string;
  action: AuditActionType;
  target: string;
  result: AuditResultType;
}) {
  const entry: AuditEntryType = {
    id: `audit-${runtimeAuditEntries.length + 1}-${userId}`,
    userId,
    actorName: CURRENT_STAFF.name,
    action,
    target,
    result,
    occurredAt: "اکنون",
  };

  runtimeAuditEntries = [entry, ...runtimeAuditEntries];

  return entry;
}

export type CreateCustomerInputType = {
  displayName: string;
  email: string;
  mobile: string;
  locale: CustomerLocaleType;
  tenantName: string;
  internalNote: string;
};

export type CreateCustomerResultType = {
  user: CustomerUserType;
  tenant: TenantType;
  membership: MembershipType;
};

export function findDuplicateCustomer(contact: {
  email?: string;
  mobile?: string;
}) {
  return findCustomerByContact(runtimeUsers, contact);
}

/**
 * BR-003/BR-005/BR-011: creates the customer user, its tenant, and the owner
 * membership together. The account stays invite-only and unverified, and no
 * website ownership is implied by this create.
 */
export function createCustomerAccount(
  input: CreateCustomerInputType,
): CreateCustomerResultType {
  const suffix = String(runtimeUsers.length + 1).padStart(3, "0");
  const email = input.email ? normalizeEmail(input.email) : "";
  const mobile = normalizeMobile(input.mobile);

  const user: CustomerUserType = {
    id: `user-9${suffix}`,
    displayName: input.displayName,
    email: email || null,
    emailVerification: email
      ? CONTACT_VERIFICATION.PENDING
      : CONTACT_VERIFICATION.NOT_PROVIDED,
    mobile,
    mobileVerification: CONTACT_VERIFICATION.PENDING,
    locale: input.locale,
    accountState: ACCOUNT_STATE.PENDING_VERIFICATION,
    origin: ACCOUNT_ORIGIN.ADMIN_CREATE,
    inviteStatus: INVITE_STATUS.PENDING,
    twoFactorEnabled: false,
    activeSessionCount: 0,
    createdAt: "اکنون",
    lastSignInAt: null,
    stateReason: null,
  };

  const tenant: TenantType = {
    id: `tenant-9${suffix}`,
    name: input.tenantName,
    state: TENANT_STATE.PENDING_SETUP,
    createdAt: "اکنون",
    stateReason: "در انتظار تکمیل دعوت‌نامه مالک",
  };

  const membership: MembershipType = {
    id: `membership-9${suffix}`,
    tenantId: tenant.id,
    userId: user.id,
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "اکنون",
  };

  runtimeUsers = [user, ...runtimeUsers];
  runtimeTenants = [tenant, ...runtimeTenants];
  runtimeMemberships = [membership, ...runtimeMemberships];

  if (input.internalNote) {
    runtimeNotes = [
      {
        id: `note-9${suffix}`,
        userId: user.id,
        authorName: CURRENT_STAFF.name,
        createdAt: "اکنون",
        text: input.internalNote,
      },
      ...runtimeNotes,
    ];
  }

  appendAuditEntry({
    userId: user.id,
    action: AUDIT_ACTION.ACCOUNT_CREATED,
    target: `حساب مشتری و مستأجر ${tenant.name}`,
    result: AUDIT_RESULT.ACCEPTED,
  });

  appendAuditEntry({
    userId: user.id,
    action: AUDIT_ACTION.INVITE_SENT,
    target: user.email ?? user.mobile,
    result: AUDIT_RESULT.ACCEPTED,
  });

  return { user, tenant, membership };
}

export type MembershipChangeResultType = {
  accepted: boolean;
  message: string;
};

export function addTenantMembership({
  tenantId,
  userId,
  role,
}: {
  tenantId: string;
  userId: string;
  role: MembershipRoleType;
}): MembershipChangeResultType {
  const alreadyMember = runtimeMemberships.some(
    (membership) =>
      membership.tenantId === tenantId && membership.userId === userId,
  );

  if (alreadyMember) {
    return {
      accepted: false,
      message: "این کاربر از قبل عضو این مستأجر است.",
    };
  }

  const suffix = String(runtimeMemberships.length + 1);
  const membership: MembershipType = {
    id: `membership-9${suffix}`,
    tenantId,
    userId,
    role,
    addedAt: "اکنون",
  };

  runtimeMemberships = [...runtimeMemberships, membership];

  appendAuditEntry({
    userId,
    action: AUDIT_ACTION.MEMBERSHIP_CHANGED,
    target: `افزودن عضو به مستأجر ${tenantId}`,
    result: AUDIT_RESULT.ACCEPTED,
  });

  return { accepted: true, message: "عضو جدید به مستأجر افزوده شد." };
}

export function changeMembershipRole({
  membershipId,
  role,
}: {
  membershipId: string;
  role: MembershipRoleType;
}): MembershipChangeResultType {
  const membership = runtimeMemberships.find(
    (item) => item.id === membershipId,
  );

  if (!membership) {
    return { accepted: false, message: "عضویت موردنظر پیدا نشد." };
  }

  const losesOwnerRole =
    role !== MEMBERSHIP_ROLE.OWNER &&
    isLastOwnerMembership(membership, runtimeMemberships);

  if (losesOwnerRole) {
    appendAuditEntry({
      userId: membership.userId,
      action: AUDIT_ACTION.OWNER_CHANGED,
      target: `تغییر نقش آخرین مالک مستأجر ${membership.tenantId}`,
      result: AUDIT_RESULT.BLOCKED,
    });

    return {
      accepted: false,
      message:
        "این عضو تنها مالک مستأجر است. ابتدا مالک دیگری تعیین کنید، سپس نقش او را تغییر دهید.",
    };
  }

  runtimeMemberships = runtimeMemberships.map((item) =>
    item.id === membershipId ? { ...item, role } : item,
  );

  appendAuditEntry({
    userId: membership.userId,
    action:
      role === MEMBERSHIP_ROLE.OWNER
        ? AUDIT_ACTION.OWNER_CHANGED
        : AUDIT_ACTION.MEMBERSHIP_CHANGED,
    target: `تغییر نقش عضو در مستأجر ${membership.tenantId}`,
    result: AUDIT_RESULT.ACCEPTED,
  });

  return { accepted: true, message: "نقش عضو به‌روزرسانی شد." };
}

export function removeTenantMembership(
  membershipId: string,
): MembershipChangeResultType {
  const membership = runtimeMemberships.find(
    (item) => item.id === membershipId,
  );

  if (!membership) {
    return { accepted: false, message: "عضویت موردنظر پیدا نشد." };
  }

  if (isLastOwnerMembership(membership, runtimeMemberships)) {
    appendAuditEntry({
      userId: membership.userId,
      action: AUDIT_ACTION.OWNER_CHANGED,
      target: `حذف آخرین مالک مستأجر ${membership.tenantId}`,
      result: AUDIT_RESULT.BLOCKED,
    });

    return {
      accepted: false,
      message:
        "حذف آخرین مالک مجاز نیست. ابتدا مالک جانشین را تعیین کنید تا مستأجر بدون مالک نماند.",
    };
  }

  runtimeMemberships = runtimeMemberships.filter(
    (item) => item.id !== membershipId,
  );

  appendAuditEntry({
    userId: membership.userId,
    action: AUDIT_ACTION.MEMBERSHIP_CHANGED,
    target: `حذف عضو از مستأجر ${membership.tenantId}`,
    result: AUDIT_RESULT.ACCEPTED,
  });

  return { accepted: true, message: "عضویت حذف شد." };
}

const SECURITY_ACTION_RESULT_MESSAGES: Record<SecurityActionType, string> = {
  [SECURITY_ACTION.SUSPEND]: "حساب تعلیق شد و دلیل در سابقه ثبت گردید.",
  [SECURITY_ACTION.RESTORE]: "حساب بازگردانی شد و دلیل در سابقه ثبت گردید.",
  [SECURITY_ACTION.REVOKE_SESSIONS]:
    "نشست‌های فعال پایان یافت. هیچ اطلاعات ورود نمایش داده نمی‌شود.",
  [SECURITY_ACTION.START_RECOVERY]:
    "فرایند بازیابی امن آغاز شد. مشتری مراحل را از کانال تأییدشده دنبال می‌کند.",
};

export type SecurityActionResultType = {
  user: CustomerUserType;
  message: string;
};

/**
 * BR-008/BR-009: every high-impact account action needs a reason and produces
 * an audit entry, and no credential or recovery material is ever returned.
 */
export function applySecurityAction({
  userId,
  action,
  reason,
}: {
  userId: string;
  action: SecurityActionType;
  reason: string;
}): SecurityActionResultType | null {
  const user = runtimeUsers.find((item) => item.id === userId);
  if (!user) return null;

  const updatedUser = applySecurityActionToUser(user, action, reason);

  runtimeUsers = runtimeUsers.map((item) =>
    item.id === userId ? updatedUser : item,
  );

  appendAuditEntry({
    userId,
    action: AUDIT_ACTION.SECURITY_ACTION,
    target: `${SECURITY_ACTION_LABELS[action]} — ${reason}`,
    result: AUDIT_RESULT.ACCEPTED,
  });

  return {
    user: updatedUser,
    message: SECURITY_ACTION_RESULT_MESSAGES[action],
  };
}

function applySecurityActionToUser(
  user: CustomerUserType,
  action: SecurityActionType,
  reason: string,
): CustomerUserType {
  switch (action) {
    case SECURITY_ACTION.SUSPEND:
      return {
        ...user,
        accountState: ACCOUNT_STATE.SUSPENDED,
        activeSessionCount: 0,
        stateReason: reason,
      };
    case SECURITY_ACTION.RESTORE:
      return {
        ...user,
        accountState: hasUnverifiedContact(user)
          ? ACCOUNT_STATE.PENDING_VERIFICATION
          : ACCOUNT_STATE.ACTIVE,
        stateReason: null,
      };
    case SECURITY_ACTION.REVOKE_SESSIONS:
      return { ...user, activeSessionCount: 0 };
    case SECURITY_ACTION.START_RECOVERY:
      return { ...user, inviteStatus: INVITE_STATUS.PENDING };
  }
}

export type CreateTenantForUserResultType =
  | {
      ok: true;
      tenant: TenantType;
      membership: MembershipType;
      created: boolean;
    }
  | { ok: false; message: string };

/**
 * Creates an active tenant + owner membership for an existing customer who
 * has none yet. Used when staff approve an authorization package.
 */
export function createTenantForExistingUser({
  userId,
  tenantName,
}: {
  userId: string;
  tenantName: string;
}): CreateTenantForUserResultType {
  const user = runtimeUsers.find((entry) => entry.id === userId);
  if (!user) {
    return { ok: false, message: "کاربر یافت نشد." };
  }

  const existingMembership = runtimeMemberships.find(
    (membership) =>
      membership.userId === userId &&
      membership.role === MEMBERSHIP_ROLE.OWNER,
  );

  if (existingMembership) {
    const tenant = runtimeTenants.find(
      (entry) => entry.id === existingMembership.tenantId,
    );
    if (!tenant) {
      return { ok: false, message: "مستأجر موجود یافت نشد." };
    }
    return {
      ok: true,
      tenant,
      membership: existingMembership,
      created: false,
    };
  }

  const suffix = String(runtimeTenants.length + 1).padStart(3, "0");
  const tenant: TenantType = {
    id: `tenant-auth-${suffix}`,
    name: tenantName,
    state: TENANT_STATE.ACTIVE,
    createdAt: "اکنون",
    stateReason: null,
  };
  const membership: MembershipType = {
    id: `membership-auth-${suffix}`,
    tenantId: tenant.id,
    userId,
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "اکنون",
  };

  runtimeTenants = [tenant, ...runtimeTenants];
  runtimeMemberships = [membership, ...runtimeMemberships];

  appendAuditEntry({
    userId,
    action: AUDIT_ACTION.ACCOUNT_CREATED,
    target: `مستأجر ${tenant.name} از احراز هویت`,
    result: AUDIT_RESULT.ACCEPTED,
  });

  return { ok: true, tenant, membership, created: true };
}

