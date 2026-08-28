import * as z from "zod";

import { isValidInternationalPhone } from "@/lib/phone/international-phone";
import { errorKey } from "../form-errors";
import { DAILY_VISITOR_BANDS } from "./guest-plan-request-schema";

export { DAILY_VISITOR_BANDS };

const fullNameRegex = /^[\p{L}\p{M}]+(?:[ '\-‌][\p{L}\p{M}]+)+$/u;

export const SERVICE_VALUES = [
  "managedServer",
  "woocommerceSupport",
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
] as const;

export type ServiceValue = (typeof SERVICE_VALUES)[number];

export const YES_NO_VALUES = ["yes", "no"] as const;
export type YesNoValue = (typeof YES_NO_VALUES)[number];

export const YES_NO_UNKNOWN_VALUES = ["yes", "no", "unknown"] as const;

export const STORAGE_BANDS = [
  "under_10gb",
  "10_50gb",
  "50_100gb",
  "over_100gb",
  "unknown",
] as const;

export const DATABASE_BANDS = [
  "under_1gb",
  "1_5gb",
  "5_20gb",
  "over_20gb",
  "unknown",
] as const;

export const WEBSITE_COUNT_BANDS = ["1", "2_5", "6_10", "over_10"] as const;

export const CMS_VALUES = [
  "wordpress",
  "woocommerce",
  "custom",
  "other",
] as const;

export const HOSTING_TYPE_VALUES = [
  "shared",
  "vps",
  "dedicated",
  "cloud",
  "unknown",
] as const;

export const PROJECT_TYPE_VALUES = [
  "shop",
  "corporate",
  "content",
  "app",
  "other",
] as const;

export const LAUNCH_TIME_BANDS = [
  "under_1_month",
  "1_3_months",
  "3_6_months",
  "over_6_months",
  "unknown",
] as const;

export const PRODUCT_COUNT_BANDS = [
  "under_50",
  "50_200",
  "200_1000",
  "over_1000",
  "unknown",
] as const;

export const ORDER_COUNT_BANDS = [
  "under_50",
  "50_200",
  "200_1000",
  "over_1000",
  "unknown",
] as const;

export const WOOCOMMERCE_ISSUE_VALUES = [
  "bugFix",
  "speed",
  "payment",
  "orders",
  "theme",
  "plugin",
  "featureDev",
  "security",
  "other",
] as const;

export const MANAGED_SERVER_PROBLEM_VALUES = [
  "slow",
  "downtime",
  "security",
  "lowResources",
  "hardToManage",
  "poorSupport",
  "other",
] as const;

export const SEO_GOAL_VALUES = [
  "increaseSales",
  "increaseTraffic",
  "keywordRankings",
  "localSeo",
  "technicalFixes",
] as const;

export const DESIGN_TYPE_VALUES = [
  "banner",
  "social",
  "ads",
  "logo",
  "other",
] as const;

export const DESIGN_COUNT_BANDS = [
  "1",
  "2_5",
  "6_10",
  "11_20",
  "over_20",
  "unknown",
] as const;

export const ASPECT_RATIO_VALUES = [
  "1_1",
  "4_5",
  "9_16",
  "16_9",
  "3_2",
  "2_3",
  "4_3",
  "21_9",
  "other",
] as const;

export const DATA_ENTRY_WORK_VALUES = [
  "productEntry",
  "articleEntry",
  "infoEntry",
  "contentMigration",
  "contentCreation",
] as const;

export const DATA_SOURCE_VALUES = [
  "excel",
  "csv",
  "pdf",
  "website",
  "images",
  "other",
] as const;

export const SOCIAL_PLATFORM_VALUES = [
  "instagram",
  "linkedin",
  "telegram",
  "x",
  "youtube",
  "other",
] as const;

export const SOCIAL_GOAL_VALUES = [
  "sales",
  "brandAwareness",
  "engagement",
  "leadGen",
  "dailyManagement",
] as const;

export const POST_COUNT_BANDS = [
  "under_4",
  "4_8",
  "8_16",
  "over_16",
  "unknown",
] as const;

export const ITEM_COUNT_BANDS = [
  "under_50",
  "50_200",
  "200_1000",
  "over_1000",
  "unknown",
] as const;

export const DELIVERY_TIME_BANDS = [
  "under_1_week",
  "1_2_weeks",
  "2_4_weeks",
  "over_4_weeks",
  "flexible",
] as const;

export const REQUEST_ASSESSMENT_UPLOAD = {
  accept: ".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.csv,.zip,.webp",
  acceptMime: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/zip",
    "application/x-zip-compressed",
  ] as const,
  maxFiles: 8,
  maxBytes: 20 * 1024 * 1024,
} as const;

export type RequestAssessmentAttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

export function isAcceptedRequestAssessmentFile(file: File): boolean {
  if (file.size <= 0 || file.size > REQUEST_ASSESSMENT_UPLOAD.maxBytes) {
    return false;
  }
  const lower = file.name.toLowerCase();
  const byExt = REQUEST_ASSESSMENT_UPLOAD.accept
    .split(",")
    .some((ext) => lower.endsWith(ext.trim()));
  const byMime = (
    REQUEST_ASSESSMENT_UPLOAD.acceptMime as readonly string[]
  ).includes(file.type);
  return byExt || byMime;
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidWebsite(value: string): boolean {
  try {
    const url = new URL(normalizeWebsite(value));
    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

const optionalText = z.string().trim().optional().or(z.literal(""));

const serviceDetailsSchema = z.object({
  // Managed server
  hasActiveWebsite: z.enum(YES_NO_VALUES).optional(),
  websiteUrl: optionalText,
  cms: z.enum(CMS_VALUES).optional(),
  currentHosting: optionalText,
  currentServiceType: z.enum(HOSTING_TYPE_VALUES).optional(),
  websiteCount: z.enum(WEBSITE_COUNT_BANDS).optional(),
  storageUsage: z.enum(STORAGE_BANDS).optional(),
  databaseSize: z.enum(DATABASE_BANDS).optional(),
  monthlyVisits: z.enum(DAILY_VISITOR_BANDS).optional(),
  hasWooCommerce: z.enum(YES_NO_VALUES).optional(),
  hasPeakTraffic: z.enum(YES_NO_VALUES).optional(),
  peakTrafficDetails: optionalText,
  needsMigration: z.enum(YES_NO_VALUES).optional(),
  currentProblems: z.array(z.enum(MANAGED_SERVER_PROBLEM_VALUES)).optional(),
  managedServerAdditionalDetails: optionalText,
  projectType: z.enum(PROJECT_TYPE_VALUES).optional(),
  expectedTraffic: z.enum(DAILY_VISITOR_BANDS).optional(),
  expectedStorage: z.enum(STORAGE_BANDS).optional(),
  willUseWooCommerce: z.enum(YES_NO_VALUES).optional(),
  expectedLaunchTime: z.enum(LAUNCH_TIME_BANDS).optional(),

  // WooCommerce support
  storeUrl: optionalText,
  storeActive: z.enum(YES_NO_VALUES).optional(),
  productCount: z.enum(PRODUCT_COUNT_BANDS).optional(),
  monthlyOrders: z.enum(ORDER_COUNT_BANDS).optional(),
  wcMonthlyVisits: z.enum(DAILY_VISITOR_BANDS).optional(),
  mainIssues: z.array(z.enum(WOOCOMMERCE_ISSUE_VALUES)).optional(),
  paymentGateways: optionalText,
  hasUrgentIssue: z.enum(YES_NO_VALUES).optional(),
  issueDescription: optionalText,

  // SEO
  seoWebsiteUrl: optionalText,
  businessArea: optionalText,
  mainGoal: z.enum(SEO_GOAL_VALUES).optional(),
  targetCountry: optionalText,
  targetLanguages: optionalText,
  organicTraffic: z.enum(DAILY_VISITOR_BANDS).optional(),
  hasSearchConsole: z.enum(YES_NO_VALUES).optional(),
  hasAnalytics: z.enum(YES_NO_VALUES).optional(),
  importantKeywords: optionalText,
  mainCompetitors: optionalText,
  mainSeoProblem: optionalText,

  // Graphic design
  designTypes: z.array(z.enum(DESIGN_TYPE_VALUES)).optional(),
  designCount: z.enum(DESIGN_COUNT_BANDS).optional(),
  dimensionsOrPlatform: z.array(z.enum(ASPECT_RATIO_VALUES)).optional(),
  hasBrandGuideline: z.enum(YES_NO_VALUES).optional(),
  contentReady: z.enum(YES_NO_VALUES).optional(),
  expectedDelivery: z.enum(DELIVERY_TIME_BANDS).optional(),
  styleDescription: optionalText,

  // Product data entry
  dataEntryWebsiteUrl: optionalText,
  workType: z.enum(DATA_ENTRY_WORK_VALUES).optional(),
  siteSystem: z.enum(CMS_VALUES).optional(),
  itemCount: z.enum(ITEM_COUNT_BANDS).optional(),
  dataSources: z.array(z.enum(DATA_SOURCE_VALUES)).optional(),
  contentLanguage: optionalText,
  needsImageProcessing: z.enum(YES_NO_VALUES).optional(),
  expectedCompletion: z.enum(DELIVERY_TIME_BANDS).optional(),
  specialInstructions: optionalText,

  // Social media
  platforms: z.array(z.enum(SOCIAL_PLATFORM_VALUES)).optional(),
  accountLinks: z.array(z.string()).optional(),
  socialMainGoal: z.enum(SOCIAL_GOAL_VALUES).optional(),
  socialBusinessArea: optionalText,
  targetMarket: optionalText,
  monthlyPosts: z.enum(POST_COUNT_BANDS).optional(),
  needsGraphicDesign: z.enum(YES_NO_VALUES).optional(),
  needsCaptionContent: z.enum(YES_NO_VALUES).optional(),
  needsCommunityManagement: z.enum(YES_NO_VALUES).optional(),
  needsAdManagement: z.enum(YES_NO_VALUES).optional(),
  socialAdditionalDetails: optionalText,
});

export type ServiceDetailsType = z.infer<typeof serviceDetailsSchema>;

export function getDefaultServiceDetails(): ServiceDetailsType {
  return {
    currentProblems: [],
    mainIssues: [],
    designTypes: [],
    dimensionsOrPlatform: [],
    dataSources: [],
    platforms: [],
    accountLinks: [],
  };
}

function requireField(
  ctx: z.RefinementCtx,
  path: (string | number)[],
  condition: boolean,
  key: Parameters<typeof errorKey>[0],
) {
  if (!condition) {
    ctx.addIssue({
      code: "custom",
      message: errorKey(key),
      path,
    });
  }
}

function validateManagedServer(
  details: ServiceDetailsType,
  ctx: z.RefinementCtx,
) {
  requireField(
    ctx,
    ["serviceDetails", "hasActiveWebsite"],
    !!details.hasActiveWebsite,
    "servicesRequired",
  );

  if (details.hasActiveWebsite === "yes") {
    requireField(
      ctx,
      ["serviceDetails", "websiteUrl"],
      !!details.websiteUrl?.trim() && isValidWebsite(details.websiteUrl),
      "websiteRequired",
    );
    requireField(
      ctx,
      ["serviceDetails", "currentServiceType"],
      !!details.currentServiceType,
      "servicesRequired",
    );
    requireField(
      ctx,
      ["serviceDetails", "storageUsage"],
      !!details.storageUsage,
      "databaseSizeRequired",
    );
    requireField(
      ctx,
      ["serviceDetails", "databaseSize"],
      !!details.databaseSize,
      "databaseSizeRequired",
    );
    requireField(
      ctx,
      ["serviceDetails", "monthlyVisits"],
      !!details.monthlyVisits,
      "dailyVisitorsRequired",
    );
    requireField(
      ctx,
      ["serviceDetails", "hasPeakTraffic"],
      !!details.hasPeakTraffic,
      "servicesRequired",
    );
    return;
  }
}

function validateWooCommerceSupport(
  details: ServiceDetailsType,
  ctx: z.RefinementCtx,
) {
  requireField(
    ctx,
    ["serviceDetails", "storeUrl"],
    !!details.storeUrl?.trim() && isValidWebsite(details.storeUrl),
    "websiteRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "storeActive"],
    !!details.storeActive,
    "servicesRequired",
  );
  if (details.storeActive === "yes") {
    requireField(
      ctx,
      ["serviceDetails", "productCount"],
      !!details.productCount,
      "servicesRequired",
    );
    requireField(
      ctx,
      ["serviceDetails", "monthlyOrders"],
      !!details.monthlyOrders,
      "servicesRequired",
    );
    requireField(
      ctx,
      ["serviceDetails", "wcMonthlyVisits"],
      !!details.wcMonthlyVisits,
      "dailyVisitorsRequired",
    );
  }
  requireField(
    ctx,
    ["serviceDetails", "hasUrgentIssue"],
    !!details.hasUrgentIssue,
    "servicesRequired",
  );
  if (details.hasUrgentIssue === "yes") {
    requireField(
      ctx,
      ["serviceDetails", "issueDescription"],
      !!details.issueDescription?.trim(),
      "messageRequired",
    );
  }
}

function validateSeo(details: ServiceDetailsType, ctx: z.RefinementCtx) {
  requireField(
    ctx,
    ["serviceDetails", "seoWebsiteUrl"],
    !!details.seoWebsiteUrl?.trim() && isValidWebsite(details.seoWebsiteUrl),
    "websiteRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "businessArea"],
    !!details.businessArea?.trim(),
    "messageRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "mainGoal"],
    !!details.mainGoal,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "targetCountry"],
    !!details.targetCountry?.trim(),
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "targetLanguages"],
    !!details.targetLanguages?.trim(),
    "servicesRequired",
  );
}

function validateGraphicDesign(
  details: ServiceDetailsType,
  ctx: z.RefinementCtx,
) {
  requireField(
    ctx,
    ["serviceDetails", "designTypes"],
    (details.designTypes?.length ?? 0) > 0,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "designCount"],
    !!details.designCount,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "hasBrandGuideline"],
    !!details.hasBrandGuideline,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "contentReady"],
    !!details.contentReady,
    "servicesRequired",
  );
}

function validateProductDataEntry(
  details: ServiceDetailsType,
  ctx: z.RefinementCtx,
) {
  requireField(
    ctx,
    ["serviceDetails", "workType"],
    !!details.workType,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "itemCount"],
    !!details.itemCount,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "dataSources"],
    (details.dataSources?.length ?? 0) > 0,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "contentLanguage"],
    !!details.contentLanguage?.trim(),
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "needsImageProcessing"],
    !!details.needsImageProcessing,
    "servicesRequired",
  );
}

function validateSocialMedia(
  details: ServiceDetailsType,
  ctx: z.RefinementCtx,
) {
  requireField(
    ctx,
    ["serviceDetails", "platforms"],
    (details.platforms?.length ?? 0) > 0,
    "servicesRequired",
  );
  details.accountLinks?.forEach((link, index) => {
    const trimmed = link.trim();
    if (trimmed && !isValidWebsite(trimmed)) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("websiteInvalid"),
        path: ["serviceDetails", "accountLinks", index],
      });
    }
  });
  requireField(
    ctx,
    ["serviceDetails", "targetMarket"],
    !!details.targetMarket?.trim(),
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "monthlyPosts"],
    !!details.monthlyPosts,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "needsGraphicDesign"],
    !!details.needsGraphicDesign,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "needsCommunityManagement"],
    !!details.needsCommunityManagement,
    "servicesRequired",
  );
  requireField(
    ctx,
    ["serviceDetails", "needsAdManagement"],
    !!details.needsAdManagement,
    "servicesRequired",
  );
}

export function getRequestAssessmentDefaultValues(): RequestAssessmentSchemaType {
  return {
    fullName: "",
    preferredContact: "phone",
    phone: "",
    email: "",
    aboutProject: "",
    services: "managedServer",
    serviceDetails: getDefaultServiceDetails(),
    attachments: [],
  };
}

function validateContact(
  data: {
    preferredContact: "phone" | "email";
    phone: string;
    email: string;
  },
  ctx: z.RefinementCtx,
) {
  const phone = data.phone?.replace(/[\s()-]/g, "") ?? "";
  const email = data.email?.trim() ?? "";

  if (data.preferredContact === "phone") {
    if (!phone) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("phoneRequired"),
        path: ["phone"],
      });
    } else if (!isValidInternationalPhone(phone)) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("phoneInvalid"),
        path: ["phone"],
      });
    }
    if (email) {
      const emailResult = z.email().safeParse(email);
      if (!emailResult.success) {
        ctx.addIssue({
          code: "custom",
          message: errorKey("emailInvalid"),
          path: ["email"],
        });
      }
    }
    return;
  }

  if (!email) {
    ctx.addIssue({
      code: "custom",
      message: errorKey("emailRequired"),
      path: ["email"],
    });
  } else {
    const emailResult = z.email().safeParse(email);
    if (!emailResult.success) {
      ctx.addIssue({
        code: "custom",
        message: errorKey("emailInvalid"),
        path: ["email"],
      });
    }
  }
  if (phone && !isValidInternationalPhone(phone)) {
    ctx.addIssue({
      code: "custom",
      message: errorKey("phoneInvalid"),
      path: ["phone"],
    });
  }
}

export const requestAssessmentSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, errorKey("fullNameRequired"))
      .regex(fullNameRegex, errorKey("fullNameInvalid")),

    preferredContact: z.enum(["phone", "email"]),

    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s()-]/g, "")),

    email: z.string().trim(),

    aboutProject: z
      .string()
      .trim()
      .min(1, errorKey("messageRequired"))
      .max(1000, errorKey("aboutProjectTooLong")),

    services: z.enum(SERVICE_VALUES, {
      error: errorKey("servicesRequired"),
    }),

    serviceDetails: serviceDetailsSchema,

    attachments: z
      .array(
        z.object({
          name: z.string(),
          size: z.number(),
          type: z.string(),
        }),
      )
      .max(REQUEST_ASSESSMENT_UPLOAD.maxFiles, errorKey("attachmentsTooMany"))
      .optional(),
  })
  .superRefine((data, ctx) => {
    validateContact(data, ctx);

    switch (data.services) {
      case "managedServer":
        validateManagedServer(data.serviceDetails, ctx);
        break;
      case "woocommerceSupport":
        validateWooCommerceSupport(data.serviceDetails, ctx);
        break;
      case "seo":
        validateSeo(data.serviceDetails, ctx);
        break;
      case "graphicDesign":
        validateGraphicDesign(data.serviceDetails, ctx);
        break;
      case "productDataEntry":
        validateProductDataEntry(data.serviceDetails, ctx);
        break;
      case "socialMedia":
        validateSocialMedia(data.serviceDetails, ctx);
        break;
      default:
        break;
    }
  });

export type RequestAssessmentSchemaType = z.infer<
  typeof requestAssessmentSchema
>;
