import { PLAN_ID } from "@/lib/data/plans-data";

export const PLAN_REQUEST_STATUS = {
  PENDING: "pending",
  READY_TO_ENABLE: "ready_to_enable",
  ENABLED: "enabled",
  DECLINED: "declined",
  CANCELLED: "cancelled",
} as const;

export type PlanRequestStatusType =
  (typeof PLAN_REQUEST_STATUS)[keyof typeof PLAN_REQUEST_STATUS];

export const PLAN_REQUEST_STATUS_LABELS: Record<PlanRequestStatusType, string> =
  {
    [PLAN_REQUEST_STATUS.PENDING]: "در انتظار تکمیل",
    [PLAN_REQUEST_STATUS.READY_TO_ENABLE]: "آماده فعال‌سازی",
    [PLAN_REQUEST_STATUS.ENABLED]: "فعال‌شده",
    [PLAN_REQUEST_STATUS.DECLINED]: "رد شده",
    [PLAN_REQUEST_STATUS.CANCELLED]: "لغو شده",
  };

export const PLAN_REQUEST_BLOCKER = {
  MISSING_USER: "missing_user",
  MISSING_TENANT: "missing_tenant",
  MISSING_WEBSITE: "missing_website",
  ACTIVE_PLAN_CONFLICT: "active_plan_conflict",
} as const;

export type PlanRequestBlockerType =
  (typeof PLAN_REQUEST_BLOCKER)[keyof typeof PLAN_REQUEST_BLOCKER];

export const PLAN_REQUEST_BLOCKER_LABELS: Record<
  PlanRequestBlockerType,
  string
> = {
  [PLAN_REQUEST_BLOCKER.MISSING_USER]:
    "کاربر موجود هنوز به این درخواست متصل نشده است.",
  [PLAN_REQUEST_BLOCKER.MISSING_TENANT]:
    "مشتری هنوز مستأجر تأییدشده نیست. ابتدا احراز هویت را تأیید کنید.",
  [PLAN_REQUEST_BLOCKER.MISSING_WEBSITE]:
    "وب‌سایت هدف برای فعال‌سازی انتخاب نشده است.",
  [PLAN_REQUEST_BLOCKER.ACTIVE_PLAN_CONFLICT]:
    "وب‌سایت انتخاب‌شده از قبل پلن فعال دارد. فعال‌سازی مسدود است.",
};

export type PlanRequestHistoryEntryType = {
  id: string;
  at: string;
  action: string;
  actorName: string;
  note?: string | null;
};

export type PlanRequestType = {
  id: string;
  /** Nest plan code (preferred) or plan UUID when code is missing. */
  chosenPlanId: string;
  chosenPlanName: string;
  contactName: string;
  contactEmail: string | null;
  contactMobile: string | null;
  domainHint: string | null;
  notes: string | null;
  linkedUserId: string | null;
  linkedUserName: string | null;
  linkedUserMobile?: string | null;
  linkedUserEmail?: string | null;
  linkedTenantId: string | null;
  linkedTenantName: string | null;
  targetWebsiteId: string | null;
  targetWebsiteDomain: string | null;
  status: PlanRequestStatusType;
  nextAction: string;
  submittedAt: string;
  updatedAt: string;
  terminalReason: string | null;
  history: PlanRequestHistoryEntryType[];
};

export const PLAN_REQUESTS: PlanRequestType[] = [
  {
    id: "plan-req-001",
    chosenPlanId: PLAN_ID.UNIX_CORE,
    chosenPlanName: "UNIX CORE",
    notes: null,
    contactName: "نیما فرهادی",
    contactEmail: "nima.farhadi@example.com",
    contactMobile: "09120001122",
    domainHint: "nima-store.ir",
    linkedUserId: "user-201",
    linkedUserName: "نیما فرهادی",
    linkedTenantId: null,
    linkedTenantName: null,
    targetWebsiteId: null,
    targetWebsiteDomain: null,
    status: PLAN_REQUEST_STATUS.PENDING,
    nextAction: "تأیید احراز هویت / ایجاد مستأجر",
    submittedAt: "۱۶ مرداد ۱۴۰۵",
    updatedAt: "۱۶ مرداد ۱۴۰۵",
    terminalReason: null,
    history: [
      {
        id: "prh-001",
        at: "۱۶ مرداد ۱۴۰۵",
        action: "ثبت درخواست",
        actorName: "سامانه",
        note: "پلن UNIX CORE انتخاب شد؛ حساب پس از تأیید تماس ایجاد شد.",
      },
    ],
  },
  {
    id: "plan-req-002",
    chosenPlanId: PLAN_ID.UNIX_SCALE,
    chosenPlanName: "UNIX SCALE",
    notes: null,
    contactName: "علی رضایی",
    contactEmail: "ali.rezaei@greenario.com",
    contactMobile: "09121234567",
    domainHint: "ali-studio.ir",
    linkedUserId: "user-101",
    linkedUserName: null,
    linkedTenantId: "tenant-501",
    linkedTenantName: null,
    targetWebsiteId: null,
    targetWebsiteDomain: null,
    status: PLAN_REQUEST_STATUS.PENDING,
    nextAction: "انتخاب وب‌سایت هدف",
    submittedAt: "۱۵ مرداد ۱۴۰۵",
    updatedAt: "۱۵ مرداد ۱۴۰۵",
    terminalReason: null,
    history: [
      {
        id: "prh-002",
        at: "۱۵ مرداد ۱۴۰۵",
        action: "ثبت درخواست",
        actorName: "سامانه",
        note: "علی رضایی / فروشگاه آرتین",
      },
    ],
  },
  {
    id: "plan-req-003",
    chosenPlanId: PLAN_ID.UNIX_PEAK,
    chosenPlanName: "UNIX PEAK",
    notes: null,
    contactName: "مریم حسینی",
    contactEmail: "maryam.hosseini@habibeh.ir",
    contactMobile: "09125551212",
    domainHint: "habibeh.ir",
    linkedUserId: "user-106",
    linkedUserName: null,
    linkedTenantId: "tenant-504",
    linkedTenantName: null,
    targetWebsiteId: "website-006",
    targetWebsiteDomain: null,
    status: PLAN_REQUEST_STATUS.READY_TO_ENABLE,
    nextAction: "فعال‌سازی پلن روی وب‌سایت",
    submittedAt: "۱۴ مرداد ۱۴۰۵",
    updatedAt: "۱۴ مرداد ۱۴۰۵",
    terminalReason: null,
    history: [
      {
        id: "prh-004",
        at: "۱۴ مرداد ۱۴۰۵",
        action: "ثبت درخواست",
        actorName: "سامانه",
      },
      {
        id: "prh-005",
        at: "۱۴ مرداد ۱۴۰۵",
        action: "اتصال وب‌سایت",
        actorName: "سارا کریمی",
        note: "habibeh.ir بدون پلن فعال",
      },
    ],
  },
  {
    id: "plan-req-004",
    chosenPlanId: PLAN_ID.UNIX_ENTERPRISE,
    chosenPlanName: "UNIX ENTERPRISE",
    notes: "دامنه فروشگاه اصلی",
    contactName: "علی رضایی",
    contactEmail: "ali.rezaei@greenario.com",
    contactMobile: "09121234567",
    domainHint: "greenario.com",
    linkedUserId: "user-101",
    linkedUserName: null,
    linkedTenantId: "tenant-501",
    linkedTenantName: null,
    targetWebsiteId: "website-001",
    targetWebsiteDomain: null,
    status: PLAN_REQUEST_STATUS.PENDING,
    nextAction: "رفع تداخل پلن فعال",
    submittedAt: "۱۳ مرداد ۱۴۰۵",
    updatedAt: "۱۳ مرداد ۱۴۰۵",
    terminalReason: null,
    history: [
      {
        id: "prh-006",
        at: "۱۳ مرداد ۱۴۰۵",
        action: "ثبت درخواست",
        actorName: "سامانه",
      },
      {
        id: "prh-007",
        at: "۱۳ مرداد ۱۴۰۵",
        action: "اتصال وب‌سایت",
        actorName: "سارا کریمی",
        note: "greenario.com از قبل UNIX SCALE دارد",
      },
    ],
  },
  {
    id: "plan-req-005",
    chosenPlanId: PLAN_ID.UNIX_SCALE,
    chosenPlanName: "UNIX SCALE",
    notes: null,
    contactName: "سارا محمدی",
    contactEmail: "sara.mohammadi@parsmod.com",
    contactMobile: "09123334455",
    domainHint: "parsmod.com",
    linkedUserId: "user-102",
    linkedUserName: null,
    linkedTenantId: "tenant-502",
    linkedTenantName: null,
    targetWebsiteId: "website-004",
    targetWebsiteDomain: null,
    status: PLAN_REQUEST_STATUS.ENABLED,
    nextAction: "مشاهده وب‌سایت فعال",
    submittedAt: "۱۰ مرداد ۱۴۰۵",
    updatedAt: "۱۱ مرداد ۱۴۰۵",
    terminalReason: null,
    history: [
      {
        id: "prh-008",
        at: "۱۰ مرداد ۱۴۰۵",
        action: "ثبت درخواست",
        actorName: "سامانه",
      },
      {
        id: "prh-009",
        at: "۱۱ مرداد ۱۴۰۵",
        action: "فعال‌سازی پلن",
        actorName: "سارا کریمی",
        note: "UNIX SCALE روی وب‌سایت هدف فعال شد.",
      },
    ],
  },
  {
    id: "plan-req-006",
    chosenPlanId: PLAN_ID.UNIX_SCALE,
    chosenPlanName: "UNIX SCALE",
    notes: null,
    contactName: "حامد کاظمی",
    contactEmail: null,
    contactMobile: "09351234567",
    domainHint: null,
    linkedUserId: "user-210",
    linkedUserName: "حامد کاظمی",
    linkedTenantId: null,
    linkedTenantName: null,
    targetWebsiteId: null,
    targetWebsiteDomain: null,
    status: PLAN_REQUEST_STATUS.DECLINED,
    nextAction: "بایگانی",
    submittedAt: "۸ مرداد ۱۴۰۵",
    updatedAt: "۹ مرداد ۱۴۰۵",
    terminalReason: "درخواست خارج از محدوده سرویس فعلی است.",
    history: [
      {
        id: "prh-010",
        at: "۸ مرداد ۱۴۰۵",
        action: "ثبت درخواست",
        actorName: "سامانه",
      },
      {
        id: "prh-011",
        at: "۹ مرداد ۱۴۰۵",
        action: "رد درخواست",
        actorName: "سارا کریمی",
        note: "درخواست خارج از محدوده سرویس فعلی است.",
      },
    ],
  },
];
