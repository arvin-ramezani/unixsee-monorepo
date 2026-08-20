export const COMPLEMENTARY_SERVICE_FAMILY = {
  SEO: "SEO",
  GRAPHIC_DESIGN: "GRAPHIC_DESIGN",
  PRODUCT_DATA_ENTRY: "PRODUCT_DATA_ENTRY",
  SOCIAL_MEDIA: "SOCIAL_MEDIA",
} as const;

export type ComplementaryServiceFamilyType =
  (typeof COMPLEMENTARY_SERVICE_FAMILY)[keyof typeof COMPLEMENTARY_SERVICE_FAMILY];

export const COMPLEMENTARY_SERVICE_FAMILY_LABELS: Record<
  ComplementaryServiceFamilyType,
  string
> = {
  [COMPLEMENTARY_SERVICE_FAMILY.SEO]: "سئو",
  [COMPLEMENTARY_SERVICE_FAMILY.GRAPHIC_DESIGN]: "طراحی گرافیک",
  [COMPLEMENTARY_SERVICE_FAMILY.PRODUCT_DATA_ENTRY]: "ورود اطلاعات محصول",
  [COMPLEMENTARY_SERVICE_FAMILY.SOCIAL_MEDIA]: "پشتیبانی شبکه‌های اجتماعی",
};

export const SERVICE_REQUEST_STATUS = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  NEEDS_CUSTOMER_INFORMATION: "NEEDS_CUSTOMER_INFORMATION",
  SCOPED: "SCOPED",
  QUOTED: "QUOTED",
  ACCEPTED: "ACCEPTED",
  ACTIVATED: "ACTIVATED",
  DECLINED: "DECLINED",
} as const;

export type ServiceRequestStatusType =
  (typeof SERVICE_REQUEST_STATUS)[keyof typeof SERVICE_REQUEST_STATUS];

export const SERVICE_ASSIGNMENT_STATUS = {
  SCHEDULED: "SCHEDULED",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
} as const;

export type ServiceAssignmentStatusType =
  (typeof SERVICE_ASSIGNMENT_STATUS)[keyof typeof SERVICE_ASSIGNMENT_STATUS];

export const SERVICE_COMMERCIAL_MODEL = {
  FIXED_SCOPE: "FIXED_SCOPE",
  RECURRING_RETAINER: "RECURRING_RETAINER",
  QUOTA_PACKAGE: "QUOTA_PACKAGE",
  MILESTONE_PROJECT: "MILESTONE_PROJECT",
  CUSTOM_QUOTE: "CUSTOM_QUOTE",
} as const;

export type ServiceCommercialModelType =
  (typeof SERVICE_COMMERCIAL_MODEL)[keyof typeof SERVICE_COMMERCIAL_MODEL];

export const SERVICE_COMMERCIAL_MODEL_LABELS: Record<
  ServiceCommercialModelType,
  string
> = {
  [SERVICE_COMMERCIAL_MODEL.FIXED_SCOPE]: "پروژه با محدوده ثابت",
  [SERVICE_COMMERCIAL_MODEL.RECURRING_RETAINER]: "همکاری مستمر",
  [SERVICE_COMMERCIAL_MODEL.QUOTA_PACKAGE]: "بسته سهمیه‌ای",
  [SERVICE_COMMERCIAL_MODEL.MILESTONE_PROJECT]: "پروژه مرحله‌ای",
  [SERVICE_COMMERCIAL_MODEL.CUSTOM_QUOTE]: "پیشنهاد اختصاصی",
};

export type ComplementaryServiceRequestType = {
  id: string;
  customerName: string;
  customerId: string;
  websiteId: string;
  websiteDomain: string;
  websiteTitle: string;
  family: ComplementaryServiceFamilyType;
  title: string;
  description: string;
  preferredEngagement: string;
  status: ServiceRequestStatusType;
  ownerName: string | null;
  submittedAt: string;
  updatedAt: string;
  nextAction: string;
  dueLabel: string | null;
  customerNote: string | null;
};

export const SERVICE_ENGAGEMENT = {
  ONE_TIME: "ONE_TIME",
  RECURRING: "RECURRING",
} as const;

export type ServiceEngagementType =
  (typeof SERVICE_ENGAGEMENT)[keyof typeof SERVICE_ENGAGEMENT];

export const SERVICE_ENGAGEMENT_LABELS: Record<ServiceEngagementType, string> =
  {
    [SERVICE_ENGAGEMENT.ONE_TIME]: "یک‌باره",
    [SERVICE_ENGAGEMENT.RECURRING]: "همکاری مستمر",
  };

export const SEO_SCOPE_OPTIONS = [
  { value: "technical", label: "فنی" },
  { value: "audit", label: "ممیزی" },
  { value: "content", label: "محتوا" },
  { value: "ongoing", label: "مستمر" },
  { value: "unsure", label: "نامشخص" },
] as const;

export const DESIGN_SCOPE_OPTIONS = [
  { value: "logo", label: "لوگو" },
  { value: "banner", label: "بنر" },
  { value: "socialPost", label: "پست شبکه اجتماعی" },
  { value: "other", label: "سایر" },
] as const;

export const ASSIGNMENT_CREATE_SOURCE = {
  REQUEST: "REQUEST",
  STAFF: "STAFF",
} as const;

export type AssignmentCreateSourceType =
  (typeof ASSIGNMENT_CREATE_SOURCE)[keyof typeof ASSIGNMENT_CREATE_SOURCE];

export type ComplementaryServiceAssignmentType = {
  id: string;
  requestId: string | null;
  source: AssignmentCreateSourceType;
  createReason: string | null;
  customerName: string;
  websiteId: string;
  websiteDomain: string;
  websiteTitle?: string;
  family: ComplementaryServiceFamilyType;
  title: string;
  description?: string;
  engagement: ServiceEngagementType | null;
  serviceScope: string | null;
  scopeSummary: string | null;
  exclusions: string | null;
  ownerName: string;
  commercialModel: ServiceCommercialModelType;
  status: ServiceAssignmentStatusType;
  startDate: string;
  renewalDate: string | null;
  progressLabel: string;
  agreedAmount: string;
};

export const COMPLEMENTARY_SERVICE_REQUESTS: ComplementaryServiceRequestType[] = [
  {
    id: "CSR-1048",
    customerName: "علی رضایی",
    customerId: "user-101",
    websiteId: "website-002",
    websiteDomain: "artin-shop.ir",
    websiteTitle: "فروشگاه اینترنتی آرتین",
    family: COMPLEMENTARY_SERVICE_FAMILY.SEO,
    title: "بهبود رتبه صفحات دسته‌بندی",
    description:
      "بررسی مشکلات فنی و محتوایی صفحات دسته‌بندی و ارائه برنامه اجرایی برای سه ماه آینده.",
    preferredEngagement: "همکاری مستمر",
    status: SERVICE_REQUEST_STATUS.ACCEPTED,
    ownerName: "مهدی کریمی",
    submittedAt: "۱۲ مرداد ۱۴۰۵",
    updatedAt: "امروز، ۱۰:۴۰",
    nextAction: "ایجاد سرویس و تعیین تاریخ شروع",
    dueLabel: "امروز",
    customerNote: "پیشنهاد شماره ۲ در تاریخ ۱۷ مرداد تأیید شده است.",
  },
  {
    id: "CSR-1047",
    customerName: "سارا محمدی",
    customerId: "user-102",
    websiteId: "website-004",
    websiteDomain: "parsmod.com",
    websiteTitle: "پارس مد",
    family: COMPLEMENTARY_SERVICE_FAMILY.GRAPHIC_DESIGN,
    title: "طراحی بنر کمپین پاییز",
    description:
      "طراحی مجموعه بنرهای صفحه اصلی و شبکه‌های اجتماعی برای کمپین پاییز.",
    preferredEngagement: "یک‌باره",
    status: SERVICE_REQUEST_STATUS.QUOTED,
    ownerName: "نگار احمدی",
    submittedAt: "۱۴ مرداد ۱۴۰۵",
    updatedAt: "دیروز، ۱۶:۲۰",
    nextAction: "پیگیری تصمیم مشتری",
    dueLabel: "۲ روز دیگر",
    customerNote: "پیشنهاد قیمت برای مشتری ارسال شده است.",
  },
  {
    id: "CSR-1046",
    customerName: "مریم حسینی",
    customerId: "user-106",
    websiteId: "website-006",
    websiteDomain: "habibeh.ir",
    websiteTitle: "فروشگاه حبیبه",
    family: COMPLEMENTARY_SERVICE_FAMILY.PRODUCT_DATA_ENTRY,
    title: "ورود محصولات کالکشن جدید",
    description:
      "ورود حدود ۲۵۰ محصول با تصاویر، ویژگی‌ها و دسته‌بندی‌های ارائه‌شده در فایل اکسل.",
    preferredEngagement: "یک‌باره",
    status: SERVICE_REQUEST_STATUS.NEEDS_CUSTOMER_INFORMATION,
    ownerName: "رضا اکبری",
    submittedAt: "۱۰ مرداد ۱۴۰۵",
    updatedAt: "امروز، ۰۹:۱۵",
    nextAction: "دریافت فایل تصاویر و ویژگی‌ها",
    dueLabel: "۳ روز گذشته",
    customerNote: "فایل اصلی دریافت شده، اما تصاویر محصولات ناقص است.",
  },
  {
    id: "CSR-1045",
    customerName: "محمد احمدی",
    customerId: "user-103",
    websiteId: "website-005",
    websiteDomain: "mohammadi-design.ir",
    websiteTitle: "استودیو طراحی محمدی",
    family: COMPLEMENTARY_SERVICE_FAMILY.SOCIAL_MEDIA,
    title: "برنامه محتوایی ماهانه اینستاگرام",
    description:
      "تهیه تقویم محتوایی و طراحی دوازده پست برای معرفی خدمات استودیو.",
    preferredEngagement: "مطمئن نیستم",
    status: SERVICE_REQUEST_STATUS.UNDER_REVIEW,
    ownerName: "نگار احمدی",
    submittedAt: "۱۶ مرداد ۱۴۰۵",
    updatedAt: "امروز، ۰۸:۳۰",
    nextAction: "بررسی اهداف و کانال‌های انتشار",
    dueLabel: "فردا",
    customerNote: null,
  },
  {
    id: "CSR-1044",
    customerName: "علی رضایی",
    customerId: "user-101",
    websiteId: "website-001",
    websiteDomain: "greenario.com",
    websiteTitle: "فروشگاه آرتین",
    family: COMPLEMENTARY_SERVICE_FAMILY.SEO,
    title: "ممیزی فنی سئو",
    description:
      "ممیزی ایندکس، ساختار لینک‌ها، سرعت صفحات و مشکلات فنی اثرگذار بر جستجو.",
    preferredEngagement: "یک‌باره",
    status: SERVICE_REQUEST_STATUS.SUBMITTED,
    ownerName: null,
    submittedAt: "۱۷ مرداد ۱۴۰۵",
    updatedAt: "۲ ساعت پیش",
    nextAction: "تخصیص کارشناس و شروع بررسی",
    dueLabel: "۲ روز دیگر",
    customerNote: null,
  },
  {
    id: "CSR-1039",
    customerName: "سارا محمدی",
    customerId: "user-102",
    websiteId: "website-004",
    websiteDomain: "parsmod.com",
    websiteTitle: "پارس مد",
    family: COMPLEMENTARY_SERVICE_FAMILY.PRODUCT_DATA_ENTRY,
    title: "پاک‌سازی اطلاعات محصولات",
    description: "اصلاح دسته‌بندی و ویژگی‌های محصولات قدیمی فروشگاه.",
    preferredEngagement: "یک‌باره",
    status: SERVICE_REQUEST_STATUS.ACTIVATED,
    ownerName: "رضا اکبری",
    submittedAt: "۲۸ تیر ۱۴۰۵",
    updatedAt: "۵ مرداد، ۱۴:۱۰",
    nextAction: "مشاهده سرویس فعال",
    dueLabel: null,
    customerNote: "سرویس فعال و به تیم ورود اطلاعات تحویل داده شده است.",
  },
];

export const COMPLEMENTARY_SERVICE_ASSIGNMENTS: ComplementaryServiceAssignmentType[] =
  [
    {
      id: "CSA-3021",
      requestId: "CSR-1039",
      source: ASSIGNMENT_CREATE_SOURCE.REQUEST,
      createReason: null,
      customerName: "سارا محمدی",
      websiteId: "website-004",
      websiteDomain: "parsmod.com",
      websiteTitle: "پارس مد",
      family: COMPLEMENTARY_SERVICE_FAMILY.PRODUCT_DATA_ENTRY,
      title: "پاک‌سازی اطلاعات محصولات پارس مد",
      engagement: SERVICE_ENGAGEMENT.ONE_TIME,
      serviceScope: "250",
      scopeSummary: "ورود و پاک‌سازی حدود ۲۵۰ محصول",
      exclusions: null,
      ownerName: "رضا اکبری",
      commercialModel: SERVICE_COMMERCIAL_MODEL.QUOTA_PACKAGE,
      status: SERVICE_ASSIGNMENT_STATUS.ACTIVE,
      startDate: "۵ مرداد ۱۴۰۵",
      renewalDate: null,
      progressLabel: "۱۴۰ از ۳۰۰ محصول تکمیل شده",
      agreedAmount: "۳۶٬۰۰۰٬۰۰۰ تومان",
    },
    {
      id: "CSA-3018",
      requestId: "CSR-1027",
      source: ASSIGNMENT_CREATE_SOURCE.REQUEST,
      createReason: null,
      customerName: "علی رضایی",
      websiteId: "website-001",
      websiteDomain: "greenario.com",
      websiteTitle: "فروشگاه آرتین",
      family: COMPLEMENTARY_SERVICE_FAMILY.SEO,
      title: "پشتیبانی ماهانه سئو",
      engagement: SERVICE_ENGAGEMENT.RECURRING,
      serviceScope: "ongoing",
      scopeSummary: "پایش و بهینه‌سازی ماهانه",
      exclusions: null,
      ownerName: "مهدی کریمی",
      commercialModel: SERVICE_COMMERCIAL_MODEL.RECURRING_RETAINER,
      status: SERVICE_ASSIGNMENT_STATUS.ACTIVE,
      startDate: "۱ تیر ۱۴۰۵",
      renewalDate: "۱ شهریور ۱۴۰۵",
      progressLabel: "مرحله پایش و بهینه‌سازی محتوا",
      agreedAmount: "۲۸٬۰۰۰٬۰۰۰ تومان / ماه",
    },
    {
      id: "CSA-3011",
      requestId: "CSR-1014",
      source: ASSIGNMENT_CREATE_SOURCE.REQUEST,
      createReason: null,
      customerName: "محمد احمدی",
      websiteId: "website-005",
      websiteDomain: "mohammadi-design.ir",
      websiteTitle: "استودیو طراحی محمدی",
      family: COMPLEMENTARY_SERVICE_FAMILY.GRAPHIC_DESIGN,
      title: "بسته طراحی هویت بصری",
      engagement: SERVICE_ENGAGEMENT.ONE_TIME,
      serviceScope: "logo",
      scopeSummary: "بسته هویت بصری",
      exclusions: null,
      ownerName: "نگار احمدی",
      commercialModel: SERVICE_COMMERCIAL_MODEL.MILESTONE_PROJECT,
      status: SERVICE_ASSIGNMENT_STATUS.PAUSED,
      startDate: "۱۸ خرداد ۱۴۰۵",
      renewalDate: null,
      progressLabel: "در انتظار تأیید اتود دوم",
      agreedAmount: "۷۵٬۰۰۰٬۰۰۰ تومان",
    },
  ];

export const COMPLEMENTARY_SERVICE_OWNERS = [
  "مهدی کریمی",
  "نگار احمدی",
  "رضا اکبری",
] as const;
