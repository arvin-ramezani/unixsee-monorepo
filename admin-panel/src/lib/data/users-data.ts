export const ACCOUNT_STATE = {
  ACTIVE: "ACTIVE",
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  LOCKED: "LOCKED",
  SUSPENDED: "SUSPENDED",
} as const;

export type AccountStateType =
  (typeof ACCOUNT_STATE)[keyof typeof ACCOUNT_STATE];

export const ACCOUNT_STATE_LABELS: Record<AccountStateType, string> = {
  [ACCOUNT_STATE.ACTIVE]: "فعال",
  [ACCOUNT_STATE.PENDING_VERIFICATION]: "در انتظار تأیید",
  [ACCOUNT_STATE.LOCKED]: "قفل‌شده",
  [ACCOUNT_STATE.SUSPENDED]: "تعلیق‌شده",
};

export const ACCOUNT_ORIGIN = {
  PUBLIC_SIGNUP: "PUBLIC_SIGNUP",
  PLAN_REQUEST: "PLAN_REQUEST",
  ADMIN_CREATE: "ADMIN_CREATE",
} as const;

export type AccountOriginType =
  (typeof ACCOUNT_ORIGIN)[keyof typeof ACCOUNT_ORIGIN];

export const ACCOUNT_ORIGIN_LABELS: Record<AccountOriginType, string> = {
  [ACCOUNT_ORIGIN.PUBLIC_SIGNUP]: "ثبت‌نام عمومی",
  [ACCOUNT_ORIGIN.PLAN_REQUEST]: "درخواست پلن",
  [ACCOUNT_ORIGIN.ADMIN_CREATE]: "ایجاد توسط کارکنان",
};

export const CONTACT_VERIFICATION = {
  VERIFIED: "VERIFIED",
  PENDING: "PENDING",
  NOT_PROVIDED: "NOT_PROVIDED",
} as const;

export type ContactVerificationType =
  (typeof CONTACT_VERIFICATION)[keyof typeof CONTACT_VERIFICATION];

export const CONTACT_VERIFICATION_LABELS: Record<
  ContactVerificationType,
  string
> = {
  [CONTACT_VERIFICATION.VERIFIED]: "تأییدشده",
  [CONTACT_VERIFICATION.PENDING]: "تأییدنشده",
  [CONTACT_VERIFICATION.NOT_PROVIDED]: "ثبت نشده",
};

/**
 * Staff create is invite-only in this phase: the account never becomes usable
 * from the admin form alone and contacts stay unverified until the customer
 * completes the invite.
 */
export const INVITE_STATUS = {
  NOT_SENT: "NOT_SENT",
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
} as const;

export type InviteStatusType =
  (typeof INVITE_STATUS)[keyof typeof INVITE_STATUS];

export const INVITE_STATUS_LABELS: Record<InviteStatusType, string> = {
  [INVITE_STATUS.NOT_SENT]: "ارسال نشده",
  [INVITE_STATUS.PENDING]: "در انتظار تکمیل توسط مشتری",
  [INVITE_STATUS.ACCEPTED]: "تکمیل‌شده",
  [INVITE_STATUS.EXPIRED]: "منقضی‌شده",
};

export const CUSTOMER_LOCALE = {
  FA_IR: "fa-IR",
  EN_US: "en-US",
} as const;

export type CustomerLocaleType =
  (typeof CUSTOMER_LOCALE)[keyof typeof CUSTOMER_LOCALE];

export const CUSTOMER_LOCALE_LABELS: Record<CustomerLocaleType, string> = {
  [CUSTOMER_LOCALE.FA_IR]: "فارسی (ایران)",
  [CUSTOMER_LOCALE.EN_US]: "English (US)",
};

export const TENANT_STATE = {
  ACTIVE: "ACTIVE",
  PENDING_SETUP: "PENDING_SETUP",
  SUSPENDED: "SUSPENDED",
} as const;

export type TenantStateType = (typeof TENANT_STATE)[keyof typeof TENANT_STATE];

export const TENANT_STATE_LABELS: Record<TenantStateType, string> = {
  [TENANT_STATE.ACTIVE]: "فعال",
  [TENANT_STATE.PENDING_SETUP]: "در حال راه‌اندازی",
  [TENANT_STATE.SUSPENDED]: "تعلیق‌شده",
};

export const MEMBERSHIP_ROLE = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  VIEWER: "VIEWER",
} as const;

export type MembershipRoleType =
  (typeof MEMBERSHIP_ROLE)[keyof typeof MEMBERSHIP_ROLE];

export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRoleType, string> = {
  [MEMBERSHIP_ROLE.OWNER]: "مالک",
  [MEMBERSHIP_ROLE.MANAGER]: "مدیر",
  [MEMBERSHIP_ROLE.VIEWER]: "بازبین",
};

export const SECURITY_ACTION = {
  SUSPEND: "SUSPEND",
  RESTORE: "RESTORE",
  REVOKE_SESSIONS: "REVOKE_SESSIONS",
  START_RECOVERY: "START_RECOVERY",
} as const;

export type SecurityActionType =
  (typeof SECURITY_ACTION)[keyof typeof SECURITY_ACTION];

export const SECURITY_ACTION_LABELS: Record<SecurityActionType, string> = {
  [SECURITY_ACTION.SUSPEND]: "تعلیق حساب",
  [SECURITY_ACTION.RESTORE]: "بازگردانی حساب",
  [SECURITY_ACTION.REVOKE_SESSIONS]: "پایان نشست‌های فعال",
  [SECURITY_ACTION.START_RECOVERY]: "شروع بازیابی امن",
};

/**
 * Capability names only describe intent for this prototype. Real enforcement
 * happens in NestJS; hiding or disabling a control here is not authorization.
 */
export const STAFF_CAPABILITY = {
  VIEW_CUSTOMERS: "VIEW_CUSTOMERS",
  CREATE_CUSTOMER: "CREATE_CUSTOMER",
  MANAGE_MEMBERSHIP: "MANAGE_MEMBERSHIP",
  SUSPEND_RESTORE: "SUSPEND_RESTORE",
  REVOKE_SESSIONS: "REVOKE_SESSIONS",
  START_RECOVERY: "START_RECOVERY",
  VIEW_INTERNAL_NOTES: "VIEW_INTERNAL_NOTES",
  ASSIGN_WEBSITE: "ASSIGN_WEBSITE",
  ENABLE_PLAN_REQUEST: "ENABLE_PLAN_REQUEST",
} as const;

export type StaffCapabilityType =
  (typeof STAFF_CAPABILITY)[keyof typeof STAFF_CAPABILITY];

export const AUDIT_ACTION = {
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  INVITE_SENT: "INVITE_SENT",
  MEMBERSHIP_CHANGED: "MEMBERSHIP_CHANGED",
  OWNER_CHANGED: "OWNER_CHANGED",
  SECURITY_ACTION: "SECURITY_ACTION",
  WEBSITE_ASSIGNED: "WEBSITE_ASSIGNED",
} as const;

export type AuditActionType = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  [AUDIT_ACTION.ACCOUNT_CREATED]: "ایجاد حساب مشتری",
  [AUDIT_ACTION.INVITE_SENT]: "ارسال دعوت‌نامه",
  [AUDIT_ACTION.MEMBERSHIP_CHANGED]: "تغییر عضویت",
  [AUDIT_ACTION.OWNER_CHANGED]: "تغییر مالک مستأجر",
  [AUDIT_ACTION.SECURITY_ACTION]: "اقدام امنیتی",
  [AUDIT_ACTION.WEBSITE_ASSIGNED]: "تخصیص وب‌سایت",
};

export const AUDIT_RESULT = {
  ACCEPTED: "ACCEPTED",
  BLOCKED: "BLOCKED",
} as const;

export type AuditResultType = (typeof AUDIT_RESULT)[keyof typeof AUDIT_RESULT];

export const AUDIT_RESULT_LABELS: Record<AuditResultType, string> = {
  [AUDIT_RESULT.ACCEPTED]: "پذیرفته شد",
  [AUDIT_RESULT.BLOCKED]: "متوقف شد",
};

export type CustomerUserType = {
  id: string;
  displayName: string;
  email: string | null;
  emailVerification: ContactVerificationType;
  mobile: string | null;
  mobileVerification: ContactVerificationType;
  locale: CustomerLocaleType;
  accountState: AccountStateType;
  origin: AccountOriginType;
  inviteStatus: InviteStatusType;
  twoFactorEnabled: boolean;
  activeSessionCount: number;
  createdAt: string;
  lastSignInAt: string | null;
  stateReason: string | null;
};

export type TenantType = {
  id: string;
  name: string;
  state: TenantStateType;
  createdAt: string;
  stateReason: string | null;
};

export type MembershipType = {
  id: string;
  tenantId: string;
  userId: string;
  role: MembershipRoleType;
  addedAt: string;
};

export type InternalNoteType = {
  id: string;
  userId: string;
  authorName: string;
  createdAt: string;
  text: string;
};

export type AuditEntryType = {
  id: string;
  userId: string;
  actorName: string;
  action: AuditActionType;
  target: string;
  result: AuditResultType;
  occurredAt: string;
};

export const CURRENT_STAFF = {
  name: "آرش نیک‌پور",
  roleLabel: "کارشناس مشتریان",
  capabilities: [
    STAFF_CAPABILITY.VIEW_CUSTOMERS,
    STAFF_CAPABILITY.CREATE_CUSTOMER,
    STAFF_CAPABILITY.MANAGE_MEMBERSHIP,
    STAFF_CAPABILITY.SUSPEND_RESTORE,
    STAFF_CAPABILITY.REVOKE_SESSIONS,
    STAFF_CAPABILITY.VIEW_INTERNAL_NOTES,
    STAFF_CAPABILITY.ASSIGN_WEBSITE,
    STAFF_CAPABILITY.ENABLE_PLAN_REQUEST,
  ] as StaffCapabilityType[],
} as const;

export const CUSTOMER_USERS: CustomerUserType[] = [
  {
    id: "user-101",
    displayName: "علی رضایی",
    email: "ali.rezaei@greenario.com",
    emailVerification: CONTACT_VERIFICATION.VERIFIED,
    mobile: "09121234567",
    mobileVerification: CONTACT_VERIFICATION.VERIFIED,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.ACTIVE,
    origin: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: true,
    activeSessionCount: 3,
    createdAt: "۱۲ اردیبهشت ۱۴۰۵",
    lastSignInAt: "امروز، ۰۹:۲۰",
    stateReason: null,
  },
  {
    id: "user-102",
    displayName: "سارا محمدی",
    email: "sara.mohammadi@parsmod.com",
    emailVerification: CONTACT_VERIFICATION.VERIFIED,
    mobile: "09351112233",
    mobileVerification: CONTACT_VERIFICATION.PENDING,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.ACTIVE,
    origin: ACCOUNT_ORIGIN.PLAN_REQUEST,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: false,
    activeSessionCount: 2,
    createdAt: "۳ خرداد ۱۴۰۵",
    lastSignInAt: "دیروز، ۱۷:۰۵",
    stateReason: null,
  },
  {
    id: "user-103",
    displayName: "محمد احمدی",
    email: "mohammad@mohammadi-design.ir",
    emailVerification: CONTACT_VERIFICATION.VERIFIED,
    mobile: "09127778899",
    mobileVerification: CONTACT_VERIFICATION.VERIFIED,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.LOCKED,
    origin: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: true,
    activeSessionCount: 0,
    createdAt: "۱۸ خرداد ۱۴۰۵",
    lastSignInAt: "۵ مرداد، ۱۱:۴۰",
    stateReason: "قفل خودکار پس از چند تلاش ناموفق ورود",
  },
  {
    id: "user-104",
    displayName: "نگار کریمی",
    email: "negar.karimi@alborzsport.ir",
    emailVerification: CONTACT_VERIFICATION.VERIFIED,
    mobile: null,
    mobileVerification: CONTACT_VERIFICATION.NOT_PROVIDED,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.ACTIVE,
    origin: ACCOUNT_ORIGIN.PLAN_REQUEST,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: false,
    activeSessionCount: 1,
    createdAt: "۲۴ خرداد ۱۴۰۵",
    lastSignInAt: "امروز، ۰۸:۱۰",
    stateReason: null,
  },
  {
    id: "user-105",
    displayName: "رضا موسوی",
    email: "reza.mousavi@parsmod.com",
    emailVerification: CONTACT_VERIFICATION.VERIFIED,
    mobile: "09122223344",
    mobileVerification: CONTACT_VERIFICATION.VERIFIED,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.ACTIVE,
    origin: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: false,
    activeSessionCount: 1,
    createdAt: "۲ تیر ۱۴۰۵",
    lastSignInAt: "امروز، ۱۰:۰۲",
    stateReason: null,
  },
  {
    id: "user-106",
    displayName: "مریم حسینی",
    email: "maryam.hosseini@habibeh.ir",
    emailVerification: CONTACT_VERIFICATION.VERIFIED,
    mobile: "09305556677",
    mobileVerification: CONTACT_VERIFICATION.VERIFIED,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.ACTIVE,
    origin: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: true,
    activeSessionCount: 2,
    createdAt: "۹ تیر ۱۴۰۵",
    lastSignInAt: "امروز، ۰۷:۴۵",
    stateReason: null,
  },
  {
    id: "user-107",
    displayName: "امیرحسین اکبری",
    email: "amirhossein@sepehr-ec.com",
    emailVerification: CONTACT_VERIFICATION.VERIFIED,
    mobile: "09199990011",
    mobileVerification: CONTACT_VERIFICATION.VERIFIED,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.SUSPENDED,
    origin: ACCOUNT_ORIGIN.ADMIN_CREATE,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: false,
    activeSessionCount: 0,
    createdAt: "۱۵ تیر ۱۴۰۵",
    lastSignInAt: "۲۸ تیر، ۱۳:۳۰",
    stateReason: "تعلیق در پی بررسی تخلف سرویس، درخواست واحد امنیت",
  },
  {
    id: "user-108",
    displayName: "الهام نادری",
    email: "elham.naderi@example.com",
    emailVerification: CONTACT_VERIFICATION.PENDING,
    mobile: null,
    mobileVerification: CONTACT_VERIFICATION.NOT_PROVIDED,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.PENDING_VERIFICATION,
    origin: ACCOUNT_ORIGIN.ADMIN_CREATE,
    inviteStatus: INVITE_STATUS.PENDING,
    twoFactorEnabled: false,
    activeSessionCount: 0,
    createdAt: "۱۶ مرداد ۱۴۰۵",
    lastSignInAt: null,
    stateReason: null,
  },
  {
    id: "user-109",
    displayName: "حامد کاظمی",
    email: null,
    emailVerification: CONTACT_VERIFICATION.NOT_PROVIDED,
    mobile: "09364445566",
    mobileVerification: CONTACT_VERIFICATION.VERIFIED,
    locale: CUSTOMER_LOCALE.EN_US,
    accountState: ACCOUNT_STATE.ACTIVE,
    origin: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    inviteStatus: INVITE_STATUS.ACCEPTED,
    twoFactorEnabled: false,
    activeSessionCount: 1,
    createdAt: "۲۱ تیر ۱۴۰۵",
    lastSignInAt: "دیروز، ۱۲:۱۵",
    stateReason: null,
  },
  {
    id: "user-110",
    displayName: "سمیه رضوانی",
    email: "somaye.rezvani@example.com",
    emailVerification: CONTACT_VERIFICATION.PENDING,
    mobile: "09128887766",
    mobileVerification: CONTACT_VERIFICATION.PENDING,
    locale: CUSTOMER_LOCALE.FA_IR,
    accountState: ACCOUNT_STATE.PENDING_VERIFICATION,
    origin: ACCOUNT_ORIGIN.PUBLIC_SIGNUP,
    inviteStatus: INVITE_STATUS.NOT_SENT,
    twoFactorEnabled: false,
    activeSessionCount: 0,
    createdAt: "۱۷ مرداد ۱۴۰۵",
    lastSignInAt: null,
    stateReason: null,
  },
];

export const TENANTS: TenantType[] = [
  {
    id: "tenant-501",
    name: "فروشگاه آرتین",
    state: TENANT_STATE.ACTIVE,
    createdAt: "۱۲ اردیبهشت ۱۴۰۵",
    stateReason: null,
  },
  {
    id: "tenant-502",
    name: "پارس مد",
    state: TENANT_STATE.ACTIVE,
    createdAt: "۳ خرداد ۱۴۰۵",
    stateReason: null,
  },
  {
    id: "tenant-503",
    name: "استودیو طراحی محمدی",
    state: TENANT_STATE.ACTIVE,
    createdAt: "۱۸ خرداد ۱۴۰۵",
    stateReason: null,
  },
  {
    id: "tenant-504",
    name: "فروشگاه حبیبه",
    state: TENANT_STATE.ACTIVE,
    createdAt: "۹ تیر ۱۴۰۵",
    stateReason: null,
  },
  {
    id: "tenant-505",
    name: "کالای ورزشی البرز",
    state: TENANT_STATE.ACTIVE,
    createdAt: "۲۴ خرداد ۱۴۰۵",
    stateReason: null,
  },
  {
    id: "tenant-506",
    name: "تجارت الکترونیک سپهر",
    state: TENANT_STATE.SUSPENDED,
    createdAt: "۱۵ تیر ۱۴۰۵",
    stateReason: "تعلیق سرویس تا نتیجه بررسی واحد امنیت",
  },
  {
    id: "tenant-507",
    name: "گل‌آرا",
    state: TENANT_STATE.PENDING_SETUP,
    createdAt: "۱۴ مرداد ۱۴۰۵",
    stateReason: "بدون عضو مالک؛ در انتظار تعیین مالک",
  },
  {
    id: "tenant-508",
    name: "آرایشی و بهداشتی الهام — شعبه مرکزی تهران و فروش عمده استانی",
    state: TENANT_STATE.PENDING_SETUP,
    createdAt: "۱۶ مرداد ۱۴۰۵",
    stateReason: "در انتظار تکمیل دعوت‌نامه مالک",
  },
];

export const MEMBERSHIPS: MembershipType[] = [
  {
    id: "membership-701",
    tenantId: "tenant-501",
    userId: "user-101",
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "۱۲ اردیبهشت ۱۴۰۵",
  },
  {
    id: "membership-702",
    tenantId: "tenant-501",
    userId: "user-110",
    role: MEMBERSHIP_ROLE.VIEWER,
    addedAt: "۱۷ مرداد ۱۴۰۵",
  },
  {
    id: "membership-703",
    tenantId: "tenant-502",
    userId: "user-102",
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "۳ خرداد ۱۴۰۵",
  },
  {
    id: "membership-704",
    tenantId: "tenant-502",
    userId: "user-105",
    role: MEMBERSHIP_ROLE.MANAGER,
    addedAt: "۲ تیر ۱۴۰۵",
  },
  {
    id: "membership-705",
    tenantId: "tenant-502",
    userId: "user-109",
    role: MEMBERSHIP_ROLE.VIEWER,
    addedAt: "۲۱ تیر ۱۴۰۵",
  },
  {
    id: "membership-706",
    tenantId: "tenant-503",
    userId: "user-103",
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "۱۸ خرداد ۱۴۰۵",
  },
  {
    id: "membership-707",
    tenantId: "tenant-504",
    userId: "user-106",
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "۹ تیر ۱۴۰۵",
  },
  {
    id: "membership-708",
    tenantId: "tenant-505",
    userId: "user-104",
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "۲۴ خرداد ۱۴۰۵",
  },
  {
    id: "membership-709",
    tenantId: "tenant-506",
    userId: "user-107",
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "۱۵ تیر ۱۴۰۵",
  },
  {
    id: "membership-710",
    tenantId: "tenant-508",
    userId: "user-108",
    role: MEMBERSHIP_ROLE.OWNER,
    addedAt: "۱۶ مرداد ۱۴۰۵",
  },
];

export const USER_INTERNAL_NOTES: InternalNoteType[] = [
  {
    id: "note-901",
    userId: "user-101",
    authorName: "مهدی کریمی",
    createdAt: "۱۴ مرداد ۱۴۰۵",
    text: "مشتری ترجیح می‌دهد تغییرات فنی خارج از ساعات فروش انجام شود.",
  },
  {
    id: "note-902",
    userId: "user-103",
    authorName: "نگار احمدی",
    createdAt: "۵ مرداد ۱۴۰۵",
    text: "حساب پس از چند تلاش ناموفق ورود قفل شد. مشتری با شماره ثابت تماس گرفت و هویت او با اطلاعات سرویس تأیید شد، اما تا اجرای فرایند بازیابی امن نباید هیچ اطلاعات ورودی در اختیار او قرار گیرد. پیگیری با واحد امنیت انجام شده است.",
  },
  {
    id: "note-903",
    userId: "user-107",
    authorName: "واحد امنیت",
    createdAt: "۲۹ تیر ۱۴۰۵",
    text: "تعلیق تا اعلام نتیجه بررسی باقی می‌ماند. بازگردانی فقط با تأیید سرپرست.",
  },
  {
    id: "note-904",
    userId: "user-108",
    authorName: "آرش نیک‌پور",
    createdAt: "۱۶ مرداد ۱۴۰۵",
    text: "حساب برای انتقال از درخواست پلن ایجاد شد. دعوت‌نامه ارسال شده و در انتظار تکمیل توسط مشتری است.",
  },
];

export const USER_AUDIT_ENTRIES: AuditEntryType[] = [
  {
    id: "audit-801",
    userId: "user-108",
    actorName: "آرش نیک‌پور",
    action: AUDIT_ACTION.ACCOUNT_CREATED,
    target: "حساب مشتری و مستأجر آرایشی و بهداشتی الهام",
    result: AUDIT_RESULT.ACCEPTED,
    occurredAt: "۱۶ مرداد ۱۴۰۵، ۱۰:۱۲",
  },
  {
    id: "audit-802",
    userId: "user-108",
    actorName: "سامانه",
    action: AUDIT_ACTION.INVITE_SENT,
    target: "elham.naderi@example.com",
    result: AUDIT_RESULT.ACCEPTED,
    occurredAt: "۱۶ مرداد ۱۴۰۵، ۱۰:۱۳",
  },
  {
    id: "audit-803",
    userId: "user-107",
    actorName: "واحد امنیت",
    action: AUDIT_ACTION.SECURITY_ACTION,
    target: "تعلیق حساب امیرحسین اکبری",
    result: AUDIT_RESULT.ACCEPTED,
    occurredAt: "۲۹ تیر ۱۴۰۵، ۰۹:۴۰",
  },
  {
    id: "audit-804",
    userId: "user-102",
    actorName: "آرش نیک‌پور",
    action: AUDIT_ACTION.MEMBERSHIP_CHANGED,
    target: "افزودن رضا موسوی به پارس مد با نقش مدیر",
    result: AUDIT_RESULT.ACCEPTED,
    occurredAt: "۲ تیر ۱۴۰۵، ۱۴:۲۵",
  },
  {
    id: "audit-805",
    userId: "user-102",
    actorName: "آرش نیک‌پور",
    action: AUDIT_ACTION.OWNER_CHANGED,
    target: "حذف آخرین مالک پارس مد",
    result: AUDIT_RESULT.BLOCKED,
    occurredAt: "۲ تیر ۱۴۰۵، ۱۴:۳۱",
  },
  {
    id: "audit-806",
    userId: "user-101",
    actorName: "سامانه",
    action: AUDIT_ACTION.WEBSITE_ASSIGNED,
    target: "greenario.com به فروشگاه آرتین",
    result: AUDIT_RESULT.ACCEPTED,
    occurredAt: "۱۲ اردیبهشت ۱۴۰۵، ۱۱:۰۵",
  },
];
