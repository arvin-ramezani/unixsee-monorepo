export const TICKET_STATUS = {
  WAITING_CUSTOMER: "WAITING_CUSTOMER",
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatusType =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type TicketPriorityType =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export type TicketType = {
  id: string;
  number?: string;
  userId: string;
  fullName: string;
  /** Customer phone from Nest createdBy; never a secret. */
  phoneNumber?: string | null;
  /** Customer email from Nest createdBy; never a secret. */
  email?: string | null;
  subject: string;
  section: TicketServiceType;
  website?: {
    id: string;
    name: string;
    domain: string;
  };
  userImage: {
    url: string;
    alt: string;
  };
  messages: {
    id: string;
    text: string;
    sender: "ADMIN" | "USER";
    isInternal?: boolean;
    files: {
      url: string;
      name?: string;
      type?: string;
    }[];
    createdAt: string;
  }[];
  /** Ticket-scoped attachments (not message-scoped). */
  attachments?: {
    url: string;
    name: string;
    type: string;
  }[];
  status: TicketStatusType;
  priority?: TicketPriorityType;
  tenant?: {
    id: string;
    name: string;
  };
  assigneeId?: string | null;
  assigneeName?: string | null;
  resolvedAt?: string | null;
  autoCloseAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const TICKET_SERVICE = {
  MANAGED_SERVER: "MANAGED_SERVER",
  MIGRATION_OPTIMIZATION: "MIGRATION_OPTIMIZATION",
  WOOCOMMERCE_SUPPORT: "WOOCOMMERCE_SUPPORT",
  SEO: "SEO",
  GRAPHIC_DESIGN: "GRAPHIC_DESIGN",
  PRODUCT_DATA_ENTRY: "PRODUCT_DATA_ENTRY",
  SOCIAL_MEDIA_SUPPORT: "SOCIAL_MEDIA_SUPPORT",
} as const;

export type TicketServiceType =
  (typeof TICKET_SERVICE)[keyof typeof TICKET_SERVICE];

export const TICKET_STATUS_LABELS: Record<TicketStatusType, string> = {
  [TICKET_STATUS.WAITING_CUSTOMER]: "در انتظار کاربر",
  [TICKET_STATUS.IN_PROGRESS]: "در حال بررسی",
  [TICKET_STATUS.SUBMITTED]: "جدید",
  [TICKET_STATUS.RESOLVED]: "حل شده",
  [TICKET_STATUS.CLOSED]: "بسته‌شده",
};

export const TICKET_SERVICE_LABELS: Record<TicketServiceType, string> = {
  [TICKET_SERVICE.MANAGED_SERVER]: "سرور مدیریت شده",
  [TICKET_SERVICE.MIGRATION_OPTIMIZATION]: "مهاجرت و بهینه‌سازی",
  [TICKET_SERVICE.WOOCOMMERCE_SUPPORT]: "پشتیبانی ووکامرس",
  [TICKET_SERVICE.SEO]: "سئو و بهینه‌سازی سایت",
  [TICKET_SERVICE.GRAPHIC_DESIGN]: "طراحی گرافیک",
  [TICKET_SERVICE.PRODUCT_DATA_ENTRY]: "ورود اطلاعات محصول",
  [TICKET_SERVICE.SOCIAL_MEDIA_SUPPORT]: "پشتیبانی شبکه‌های اجتماعی",
};

export const TICKETS: TicketType[] = [
  {
    id: "ticket-001",
    userId: "user-101",
    fullName: "علی رضایی",
    subject: "کندی شدید سایت فروشگاهی",
    section: TICKET_SERVICE.MANAGED_SERVER,
    website: {
      id: "website-001",
      name: "فروشگاه آرتین",
      domain: "artin-shop.ir",
    },
    userImage: {
      url: "/avatars/ali-rezaei.jpg",
      alt: "علی رضایی",
    },
    messages: [
      {
        id: "message-001",
        text: "سایت فروشگاهی من از صبح خیلی کند شده و بعضی صفحات با تأخیر زیادی باز می‌شوند.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-05T06:42:00Z",
      },
      {
        id: "message-002",
        text: "درخواست شما دریافت شد. در حال بررسی وضعیت سرور و منابع مصرفی سایت هستیم.",
        sender: "ADMIN",
        files: [],
        createdAt: "2026-08-05T06:51:00Z",
      },
    ],
    status: TICKET_STATUS.IN_PROGRESS,
    createdAt: "2026-08-05T06:42:00Z",
    updatedAt: "2026-08-05T06:51:00Z",
  },
  {
    id: "ticket-002",
    userId: "user-102",
    fullName: "سارا محمدی",
    subject: "خرابی صفحه پرداخت ووکامرس",
    section: TICKET_SERVICE.WOOCOMMERCE_SUPPORT,
    website: {
      id: "website-002",
      name: "پارس مد",
      domain: "parsmod.com",
    },
    userImage: {
      url: "/avatars/sara-mohammadi.jpg",
      alt: "سارا محمدی",
    },
    messages: [
      {
        id: "message-003",
        text: "بعد از آخرین بروزرسانی وردپرس، صفحه پرداخت ووکامرس برای بعضی مشتری‌ها باز نمی‌شود.",
        sender: "USER",
        files: [
          {
            url: "/tickets/ticket-002/payment-error.png",
            name: "payment-error.png",
            type: "image/png",
          },
        ],
        createdAt: "2026-08-05T05:18:00Z",
      },
    ],
    status: TICKET_STATUS.WAITING_CUSTOMER,
    createdAt: "2026-08-05T05:18:00Z",
    updatedAt: "2026-08-05T05:18:00Z",
  },
  {
    id: "ticket-003",
    userId: "user-103",
    fullName: "محمد احمدی",
    subject: "درخواست افزایش فضای دیسک سرور",
    section: TICKET_SERVICE.MANAGED_SERVER,
    website: {
      id: "website-003",
      name: "فروشگاه احمدی",
      domain: "ahmadi-shop.ir",
    },
    userImage: {
      url: "/avatars/mohammad-ahmadi.jpg",
      alt: "محمد احمدی",
    },
    messages: [
      {
        id: "message-004",
        text: "آیا امکان افزایش فضای دیسک سرور برای سایت ما وجود دارد؟",
        sender: "USER",
        files: [],
        createdAt: "2026-08-04T15:32:00Z",
      },
      {
        id: "message-005",
        text: "بله، امکان افزایش فضای دیسک وجود دارد. میزان فضای موردنیاز را اعلام کنید تا گزینه مناسب را بررسی کنیم.",
        sender: "ADMIN",
        files: [],
        createdAt: "2026-08-04T16:04:00Z",
      },
      {
        id: "message-006",
        text: "لطفاً ۵۰ گیگابایت به فضای فعلی اضافه کنید.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-04T16:27:00Z",
      },
    ],
    status: TICKET_STATUS.SUBMITTED,
    createdAt: "2026-08-04T15:32:00Z",
    updatedAt: "2026-08-04T16:27:00Z",
  },
  {
    id: "ticket-004",
    userId: "user-104",
    fullName: "نگار کریمی",
    subject: "تمدید گواهی SSL سایت",
    section: TICKET_SERVICE.MANAGED_SERVER,
    userImage: {
      url: "/avatars/negar-karimi.jpg",
      alt: "نگار کریمی",
    },
    messages: [
      {
        id: "message-007",
        text: "گواهی SSL سایت من منقضی شده و مرورگر خطای امنیتی نمایش می‌دهد.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-04T11:12:00Z",
      },
      {
        id: "message-008",
        text: "گواهی SSL بررسی و تمدید شد. لطفاً سایت را مجدداً بررسی کنید.",
        sender: "ADMIN",
        files: [],
        createdAt: "2026-08-04T11:46:00Z",
      },
      {
        id: "message-009",
        text: "مشکل برطرف شد، ممنون.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-04T12:03:00Z",
      },
    ],
    status: TICKET_STATUS.RESOLVED,
    createdAt: "2026-08-04T11:12:00Z",
    updatedAt: "2026-08-04T12:03:00Z",
  },
  {
    id: "ticket-005",
    userId: "user-105",
    fullName: "رضا موسوی",
    subject: "عدم نمایش سفارش‌های جدید ووکامرس",
    section: TICKET_SERVICE.WOOCOMMERCE_SUPPORT,
    userImage: {
      url: "/avatars/reza-mousavi.jpg",
      alt: "رضا موسوی",
    },
    messages: [
      {
        id: "message-010",
        text: "سفارش‌های جدید ووکامرس در پنل مدیریت نمایش داده نمی‌شوند.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-04T09:21:00Z",
      },
    ],
    status: TICKET_STATUS.WAITING_CUSTOMER,
    createdAt: "2026-08-04T09:21:00Z",
    updatedAt: "2026-08-04T09:21:00Z",
  },
  {
    id: "ticket-006",
    userId: "user-106",
    fullName: "مریم حسینی",
    subject: "بررسی صحت آخرین بکاپ سایت",
    section: TICKET_SERVICE.MANAGED_SERVER,
    userImage: {
      url: "/avatars/maryam-hosseini.jpg",
      alt: "مریم حسینی",
    },
    messages: [
      {
        id: "message-011",
        text: "لطفاً آخرین نسخه بکاپ سایت را بررسی کنید. می‌خواهم مطمئن شوم بکاپ به‌درستی ایجاد شده است.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-03T18:15:00Z",
      },
      {
        id: "message-012",
        text: "بکاپ بررسی شد و آخرین نسخه با موفقیت ایجاد شده است.",
        sender: "ADMIN",
        files: [],
        createdAt: "2026-08-03T18:47:00Z",
      },
    ],
    status: TICKET_STATUS.RESOLVED,
    createdAt: "2026-08-03T18:15:00Z",
    updatedAt: "2026-08-03T18:47:00Z",
  },
  {
    id: "ticket-007",
    userId: "user-107",
    fullName: "امیرحسین اکبری",
    subject: "خطای ۵۰۰ در صفحه اصلی سایت",
    section: TICKET_SERVICE.MANAGED_SERVER,
    userImage: {
      url: "/avatars/amirhossein-akbari.jpg",
      alt: "امیرحسین اکبری",
    },
    messages: [
      {
        id: "message-013",
        text: "از دیشب خطای ۵۰۰ روی صفحه اصلی سایت دریافت می‌کنم.",
        sender: "USER",
        files: [
          {
            url: "/tickets/ticket-007/server-error.png",
          },
        ],
        createdAt: "2026-08-05T02:34:00Z",
      },
      {
        id: "message-014",
        text: "خطا دریافت شد. لاگ‌های سرور و وضعیت سرویس‌های سایت در حال بررسی است.",
        sender: "ADMIN",
        files: [],
        createdAt: "2026-08-05T02:51:00Z",
      },
    ],
    status: TICKET_STATUS.IN_PROGRESS,
    createdAt: "2026-08-05T02:34:00Z",
    updatedAt: "2026-08-05T02:51:00Z",
  },
  {
    id: "ticket-008",
    userId: "user-108",
    fullName: "الهام نادری",
    subject: "افزودن دامنه جدید به سرویس",
    section: TICKET_SERVICE.MANAGED_SERVER,
    userImage: {
      url: "/avatars/elham-naderi.jpg",
      alt: "الهام نادری",
    },
    messages: [
      {
        id: "message-015",
        text: "می‌خواهم دامنه جدیدی به سرویس فعلی اضافه کنم. لطفاً راهنمایی کنید.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-03T13:08:00Z",
      },
      {
        id: "message-016",
        text: "درخواست شما ثبت شد. برای ادامه، اطلاعات دامنه جدید را ارسال کنید.",
        sender: "ADMIN",
        files: [],
        createdAt: "2026-08-03T13:29:00Z",
      },
    ],
    status: TICKET_STATUS.SUBMITTED,
    createdAt: "2026-08-03T13:08:00Z",
    updatedAt: "2026-08-03T13:29:00Z",
  },
  {
    id: "ticket-009",
    userId: "user-109",
    fullName: "حامد کاظمی",
    subject: "افزایش غیرعادی مصرف CPU سرور",
    section: TICKET_SERVICE.MANAGED_SERVER,
    userImage: {
      url: "/avatars/hamed-kazemi.jpg",
      alt: "حامد کاظمی",
    },
    messages: [
      {
        id: "message-017",
        text: "مصرف CPU سرور در چند ساعت اخیر خیلی بالا رفته است.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-02T20:41:00Z",
      },
    ],
    status: TICKET_STATUS.WAITING_CUSTOMER,
    createdAt: "2026-08-02T20:41:00Z",
    updatedAt: "2026-08-02T20:41:00Z",
  },
  {
    id: "ticket-010",
    userId: "user-110",
    fullName: "سمیه رضوانی",
    subject: "عدم ارسال ایمیل سفارش‌های ووکامرس",
    section: TICKET_SERVICE.WOOCOMMERCE_SUPPORT,
    userImage: {
      url: "/avatars/somayeh-rezvani.jpg",
      alt: "سمیه رضوانی",
    },
    messages: [
      {
        id: "message-018",
        text: "مشکل ارسال ایمیل‌های سفارش ووکامرس برطرف شده یا هنوز در حال بررسی است؟",
        sender: "USER",
        files: [],
        createdAt: "2026-08-02T14:16:00Z",
      },
      {
        id: "message-019",
        text: "مشکل مربوط به تنظیمات ارسال ایمیل شناسایی شد و اصلاحات لازم انجام شد.",
        sender: "ADMIN",
        files: [],
        createdAt: "2026-08-02T14:52:00Z",
      },
      {
        id: "message-020",
        text: "تست کردم و ایمیل سفارش با موفقیت دریافت شد.",
        sender: "USER",
        files: [],
        createdAt: "2026-08-02T15:10:00Z",
      },
    ],
    status: TICKET_STATUS.RESOLVED,
    createdAt: "2026-08-02T14:16:00Z",
    updatedAt: "2026-08-02T15:10:00Z",
  },
];
