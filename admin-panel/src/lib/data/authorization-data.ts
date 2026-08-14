/**
 * Staff review of customer authorization (احراز هویت) packages.
 * Prototype fixtures only — NestJS owns persistence later.
 */

export const AUTHORIZATION_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  NEEDS_MORE_INFO: "needs_more_info",
  REJECTED: "rejected",
  APPROVED: "approved",
} as const;

export type AuthorizationStatusType =
  (typeof AUTHORIZATION_STATUS)[keyof typeof AUTHORIZATION_STATUS];

export const AUTHORIZATION_STATUS_LABELS: Record<
  AuthorizationStatusType,
  string
> = {
  [AUTHORIZATION_STATUS.DRAFT]: "پیش‌نویس",
  [AUTHORIZATION_STATUS.PENDING_REVIEW]: "در حال بررسی",
  [AUTHORIZATION_STATUS.NEEDS_MORE_INFO]: "نیاز به اصلاح",
  [AUTHORIZATION_STATUS.REJECTED]: "رد شده",
  [AUTHORIZATION_STATUS.APPROVED]: "تأیید شده",
};

export const CONTACT_CHALLENGE = {
  SKIPPED_ALREADY_VERIFIED: "skipped_already_verified",
  VERIFIED: "verified",
  PENDING: "pending",
  UNVERIFIED: "unverified",
} as const;

export type ContactChallengeType =
  (typeof CONTACT_CHALLENGE)[keyof typeof CONTACT_CHALLENGE];

export const CONTACT_CHALLENGE_LABELS: Record<ContactChallengeType, string> = {
  [CONTACT_CHALLENGE.SKIPPED_ALREADY_VERIFIED]:
    "تأیید در ثبت‌نام — چالش رد شد",
  [CONTACT_CHALLENGE.VERIFIED]: "تأییدشده در این درخواست",
  [CONTACT_CHALLENGE.PENDING]: "در انتظار تأیید",
  [CONTACT_CHALLENGE.UNVERIFIED]: "تأییدنشده",
};

export const AUTHORIZATION_FIX_FIELD = {
  NATIONAL_ID: "nationalId",
  BIRTH_DATE: "birthDate",
  MOBILE: "mobile",
  EMAIL: "email",
  ADDRESS: "address",
  POSTAL_CODE: "postalCode",
  NATIONAL_ID_CARD: "nationalIdCard",
} as const;

export type AuthorizationFixFieldType =
  (typeof AUTHORIZATION_FIX_FIELD)[keyof typeof AUTHORIZATION_FIX_FIELD];

export const AUTHORIZATION_FIX_FIELD_LABELS: Record<
  AuthorizationFixFieldType,
  string
> = {
  [AUTHORIZATION_FIX_FIELD.NATIONAL_ID]: "کد ملی",
  [AUTHORIZATION_FIX_FIELD.BIRTH_DATE]: "تاریخ تولد",
  [AUTHORIZATION_FIX_FIELD.MOBILE]: "موبایل",
  [AUTHORIZATION_FIX_FIELD.EMAIL]: "ایمیل",
  [AUTHORIZATION_FIX_FIELD.ADDRESS]: "آدرس",
  [AUTHORIZATION_FIX_FIELD.POSTAL_CODE]: "کد پستی",
  [AUTHORIZATION_FIX_FIELD.NATIONAL_ID_CARD]: "عکس کارت ملی",
};

export type AuthorizationPackageType = {
  nationalId: string;
  birthDate: string;
  mobile: string;
  mobileChallenge: ContactChallengeType;
  email: string;
  emailChallenge: ContactChallengeType;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  nationalIdCardFileName: string;
  /** Prototype placeholder — never a public CDN URL for real ID photos. */
  nationalIdCardPreviewLabel: string;
};

export type AuthorizationAuditEntryType = {
  id: string;
  at: string;
  action: string;
  actorName: string;
  note?: string | null;
};

export type AuthorizationCaseType = {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string | null;
  userMobile: string;
  status: AuthorizationStatusType;
  package: AuthorizationPackageType;
  relatedPlanRequestIds: string[];
  staffReason: string | null;
  staffFieldsToFix: AuthorizationFixFieldType[];
  submittedAt: string;
  updatedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  tenantId: string | null;
  tenantName: string | null;
  history: AuthorizationAuditEntryType[];
};

export const AUTHORIZATION_CASES: AuthorizationCaseType[] = [
  {
    id: "auth-001",
    userId: "user-201",
    userDisplayName: "نیما فرهادی",
    userEmail: "nima.farhadi@example.com",
    userMobile: "09120001122",
    status: AUTHORIZATION_STATUS.PENDING_REVIEW,
    package: {
      nationalId: "0492576881",
      birthDate: "۱۳۶۸/۰۳/۱۲",
      mobile: "09120001122",
      mobileChallenge: CONTACT_CHALLENGE.SKIPPED_ALREADY_VERIFIED,
      email: "nima.farhadi@example.com",
      emailChallenge: CONTACT_CHALLENGE.SKIPPED_ALREADY_VERIFIED,
      province: "تهران",
      city: "تهران",
      address: "خیابان شریعتی، کوچه بهار، پلاک ۸",
      postalCode: "1948573620",
      nationalIdCardFileName: "nima-national-id.jpg",
      nationalIdCardPreviewLabel: "پیش‌نمایش کارت ملی (نمونه)",
    },
    relatedPlanRequestIds: ["plan-req-001"],
    staffReason: null,
    staffFieldsToFix: [],
    submittedAt: "۱۶ مرداد ۱۴۰۵، ۱۴:۲۰",
    updatedAt: "۱۶ مرداد ۱۴۰۵، ۱۴:۲۰",
    decidedAt: null,
    decidedBy: null,
    tenantId: null,
    tenantName: null,
    history: [
      {
        id: "auth-h-001",
        at: "۱۶ مرداد ۱۴۰۵، ۱۴:۲۰",
        action: "ارسال بسته احراز هویت",
        actorName: "نیما فرهادی",
      },
    ],
  },
  {
    id: "auth-002",
    userId: "user-202",
    userDisplayName: "پریسا اکبری",
    userEmail: "parisa.akbari@example.com",
    userMobile: "09123334455",
    status: AUTHORIZATION_STATUS.NEEDS_MORE_INFO,
    package: {
      nationalId: "0013548729",
      birthDate: "۱۳۷۲/۱۱/۰۱",
      mobile: "09123334455",
      mobileChallenge: CONTACT_CHALLENGE.VERIFIED,
      email: "parisa.akbari@example.com",
      emailChallenge: CONTACT_CHALLENGE.SKIPPED_ALREADY_VERIFIED,
      province: "اصفهان",
      city: "اصفهان",
      address: "خیابان چهارباغ، پلاک ۴۲",
      postalCode: "8145678901",
      nationalIdCardFileName: "parisa-national-id-blurry.jpg",
      nationalIdCardPreviewLabel: "پیش‌نمایش کارت ملی (نمونه — تار)",
    },
    relatedPlanRequestIds: [],
    staffReason:
      "عکس کارت ملی خوانا نیست. لطفاً تصویر واضح‌تری از روی کارت بارگذاری کنید.",
    staffFieldsToFix: [AUTHORIZATION_FIX_FIELD.NATIONAL_ID_CARD],
    submittedAt: "۱۴ مرداد ۱۴۰۵، ۱۰:۰۵",
    updatedAt: "۱۵ مرداد ۱۴۰۵، ۰۹:۳۰",
    decidedAt: "۱۵ مرداد ۱۴۰۵، ۰۹:۳۰",
    decidedBy: "آرش نیک‌پور",
    tenantId: null,
    tenantName: null,
    history: [
      {
        id: "auth-h-002b",
        at: "۱۵ مرداد ۱۴۰۵، ۰۹:۳۰",
        action: "درخواست اطلاعات بیشتر",
        actorName: "آرش نیک‌پور",
        note: "عکس کارت ملی خوانا نیست.",
      },
      {
        id: "auth-h-002a",
        at: "۱۴ مرداد ۱۴۰۵، ۱۰:۰۵",
        action: "ارسال بسته احراز هویت",
        actorName: "پریسا اکبری",
      },
    ],
  },
  {
    id: "auth-003",
    userId: "user-203",
    userDisplayName: "کامران یوسفی",
    userEmail: "kamran.yousefi@example.com",
    userMobile: "09351110022",
    status: AUTHORIZATION_STATUS.REJECTED,
    package: {
      nationalId: "1234567890",
      birthDate: "۱۳۶۵/۰۷/۲۰",
      mobile: "09351110022",
      mobileChallenge: CONTACT_CHALLENGE.VERIFIED,
      email: "kamran.yousefi@example.com",
      emailChallenge: CONTACT_CHALLENGE.VERIFIED,
      province: "فارس",
      city: "شیراز",
      address: "بلوار زند، پلاک ۱۵",
      postalCode: "7134567890",
      nationalIdCardFileName: "kamran-national-id.jpg",
      nationalIdCardPreviewLabel: "پیش‌نمایش کارت ملی (نمونه)",
    },
    relatedPlanRequestIds: [],
    staffReason: "کد ملی نامعتبر است و با مشخصات تماس هم‌خوانی ندارد.",
    staffFieldsToFix: [
      AUTHORIZATION_FIX_FIELD.NATIONAL_ID,
      AUTHORIZATION_FIX_FIELD.MOBILE,
    ],
    submittedAt: "۱۰ مرداد ۱۴۰۵، ۱۶:۴۰",
    updatedAt: "۱۱ مرداد ۱۴۰۵، ۱۱:۱۵",
    decidedAt: "۱۱ مرداد ۱۴۰۵، ۱۱:۱۵",
    decidedBy: "آرش نیک‌پور",
    tenantId: null,
    tenantName: null,
    history: [
      {
        id: "auth-h-003b",
        at: "۱۱ مرداد ۱۴۰۵، ۱۱:۱۵",
        action: "رد احراز هویت",
        actorName: "آرش نیک‌پور",
        note: "کد ملی نامعتبر است.",
      },
      {
        id: "auth-h-003a",
        at: "۱۰ مرداد ۱۴۰۵، ۱۶:۴۰",
        action: "ارسال بسته احراز هویت",
        actorName: "کامران یوسفی",
      },
    ],
  },
  {
    id: "auth-004",
    userId: "user-101",
    userDisplayName: "علی رضایی",
    userEmail: "ali.rezaei@greenario.com",
    userMobile: "09121234567",
    status: AUTHORIZATION_STATUS.APPROVED,
    package: {
      nationalId: "0067493821",
      birthDate: "۱۳۶۰/۰۲/۰۵",
      mobile: "09121234567",
      mobileChallenge: CONTACT_CHALLENGE.SKIPPED_ALREADY_VERIFIED,
      email: "ali.rezaei@greenario.com",
      emailChallenge: CONTACT_CHALLENGE.SKIPPED_ALREADY_VERIFIED,
      province: "تهران",
      city: "تهران",
      address: "خیابان ولیعصر، پلاک ۱۲۰",
      postalCode: "1598741230",
      nationalIdCardFileName: "ali-national-id.jpg",
      nationalIdCardPreviewLabel: "پیش‌نمایش کارت ملی (نمونه)",
    },
    relatedPlanRequestIds: [],
    staffReason: null,
    staffFieldsToFix: [],
    submittedAt: "۱ خرداد ۱۴۰۵، ۱۲:۰۰",
    updatedAt: "۲ خرداد ۱۴۰۵، ۰۸:۴۵",
    decidedAt: "۲ خرداد ۱۴۰۵، ۰۸:۴۵",
    decidedBy: "آرش نیک‌پور",
    tenantId: "tenant-501",
    tenantName: "فروشگاه آرتین",
    history: [
      {
        id: "auth-h-004b",
        at: "۲ خرداد ۱۴۰۵، ۰۸:۴۵",
        action: "تأیید و ایجاد مستأجر",
        actorName: "آرش نیک‌پور",
        note: "مستأجر فروشگاه آرتین",
      },
      {
        id: "auth-h-004a",
        at: "۱ خرداد ۱۴۰۵، ۱۲:۰۰",
        action: "ارسال بسته احراز هویت",
        actorName: "علی رضایی",
      },
    ],
  },
];
