export const CONTACT_MESSAGE_STATUS = {
  NEW: "NEW",
  READ: "READ",
  ARCHIVED: "ARCHIVED",
} as const;

export type ContactMessageStatusType =
  (typeof CONTACT_MESSAGE_STATUS)[keyof typeof CONTACT_MESSAGE_STATUS];

export const CONTACT_MESSAGE_STATUS_LABELS: Record<
  ContactMessageStatusType,
  string
> = {
  NEW: "جدید",
  READ: "خوانده‌شده",
  ARCHIVED: "بایگانی",
};

export const CONTACT_MESSAGE_SUBJECT = {
  managedServer: "managedServer",
  migrationOptimization: "migrationOptimization",
  woocommerceSupport: "woocommerceSupport",
  seo: "seo",
  graphicDesign: "graphicDesign",
  productDataEntry: "productDataEntry",
  socialMedia: "socialMedia",
} as const;

export type ContactMessageSubjectType =
  (typeof CONTACT_MESSAGE_SUBJECT)[keyof typeof CONTACT_MESSAGE_SUBJECT];

export const CONTACT_MESSAGE_SUBJECT_LABELS: Record<
  ContactMessageSubjectType,
  string
> = {
  managedServer: "سرور مدیریت‌شده",
  migrationOptimization: "مهاجرت و بهینه‌سازی",
  woocommerceSupport: "پشتیبانی تخصصی ووکامرس",
  seo: "سئو",
  graphicDesign: "طراحی گرافیک",
  productDataEntry: "ورود اطلاعات محصول",
  socialMedia: "پشتیبانی شبکه‌های اجتماعی",
};

export type ContactMessageAttachmentType = {
  storageKey: string;
  downloadUrl: string | null;
};

export type ContactMessageType = {
  id: string;
  subject: ContactMessageSubjectType;
  subjectLabel: string;
  fullName: string;
  email: string;
  phone: string;
  website: string | null;
  activityBasin: string | null;
  message: string | null;
  locale: string | null;
  source: string | null;
  status: ContactMessageStatusType;
  attachmentCount: number;
  attachments: ContactMessageAttachmentType[];
  createdAt: string;
  updatedAt: string;
};
