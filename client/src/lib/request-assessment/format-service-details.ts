import type { RequestAssessmentSchemaType } from "@/lib/zod-schemas/request-assessment-schema";

type FormatOptions = {
  resolveValue: (group: string, value: string) => string;
};

function formatScalar(
  value: unknown,
  group: string,
  { resolveValue }: FormatOptions,
): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    if (value === "yes" || value === "no" || value === "unknown") {
      return resolveValue("common", value);
    }
    if (group === "text") {
      return value.trim();
    }
    return resolveValue(group, value);
  }

  return String(value);
}

function formatArray(
  value: unknown,
  group: string,
  options: FormatOptions,
): string | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  return value
    .map((item) => formatScalar(item, group, options))
    .filter(Boolean)
    .join(", ");
}

function pushLine(
  lines: string[],
  label: string,
  value: unknown,
  group: string,
  options: FormatOptions,
) {
  const formatted = Array.isArray(value)
    ? formatArray(value, group, options)
    : formatScalar(value, group, options);

  if (!formatted) return;
  lines.push(`${label}: ${formatted}`);
}

export function buildRequestAssessmentDetailsText(
  data: RequestAssessmentSchemaType,
  labels: Record<string, string>,
  options: FormatOptions,
): string {
  const lines: string[] = [];
  const details = data.serviceDetails;

  switch (data.services) {
    case "managedServer":
      pushLine(
        lines,
        labels.hasActiveWebsite,
        details.hasActiveWebsite,
        "common",
        options,
      );
      if (details.hasActiveWebsite === "yes") {
        pushLine(lines, labels.websiteUrl, details.websiteUrl, "text", options);
        pushLine(lines, labels.cms, details.cms, "cms", options);
        pushLine(
          lines,
          labels.currentHosting,
          details.currentHosting,
          "text",
          options,
        );
        pushLine(
          lines,
          labels.currentServiceType,
          details.currentServiceType,
          "hostingType",
          options,
        );
        pushLine(
          lines,
          labels.storageUsage,
          details.storageUsage,
          "storage",
          options,
        );
        pushLine(
          lines,
          labels.databaseSize,
          details.databaseSize,
          "database",
          options,
        );
        pushLine(
          lines,
          labels.monthlyVisits,
          details.monthlyVisits,
          "dailyVisits",
          options,
        );
        pushLine(
          lines,
          labels.hasWooCommerce,
          details.hasWooCommerce,
          "common",
          options,
        );
        pushLine(
          lines,
          labels.hasPeakTraffic,
          details.hasPeakTraffic,
          "common",
          options,
        );
        pushLine(
          lines,
          labels.peakTrafficDetails,
          details.peakTrafficDetails,
          "text",
          options,
        );
        pushLine(
          lines,
          labels.additionalDetails,
          details.managedServerAdditionalDetails,
          "text",
          options,
        );
      }
      break;
    case "woocommerceSupport":
      pushLine(lines, labels.storeUrl, details.storeUrl, "text", options);
      pushLine(lines, labels.storeActive, details.storeActive, "common", options);
      pushLine(
        lines,
        labels.productCount,
        details.productCount,
        "productCount",
        options,
      );
      pushLine(
        lines,
        labels.monthlyOrders,
        details.monthlyOrders,
        "orderCount",
        options,
      );
      pushLine(
        lines,
        labels.monthlyVisits,
        details.wcMonthlyVisits,
        "dailyVisits",
        options,
      );
      pushLine(
        lines,
        labels.hasUrgentIssue,
        details.hasUrgentIssue,
        "common",
        options,
      );
      pushLine(
        lines,
        labels.issueDescription,
        details.issueDescription,
        "text",
        options,
      );
      break;
    case "seo":
      pushLine(lines, labels.websiteUrl, details.seoWebsiteUrl, "text", options);
      pushLine(
        lines,
        labels.businessArea,
        details.businessArea,
        "text",
        options,
      );
      pushLine(lines, labels.mainGoal, details.mainGoal, "seoGoals", options);
      pushLine(
        lines,
        labels.targetCountry,
        details.targetCountry,
        "text",
        options,
      );
      pushLine(
        lines,
        labels.targetLanguages,
        details.targetLanguages,
        "text",
        options,
      );
      pushLine(
        lines,
        labels.organicTraffic,
        details.organicTraffic,
        "dailyVisits",
        options,
      );
      break;
    case "graphicDesign":
      pushLine(
        lines,
        labels.designTypes,
        details.designTypes,
        "designTypes",
        options,
      );
      pushLine(
        lines,
        labels.designCount,
        details.designCount,
        "designCount",
        options,
      );
      pushLine(
        lines,
        labels.dimensionsOrPlatform,
        details.dimensionsOrPlatform,
        "aspectRatios",
        options,
      );
      pushLine(
        lines,
        labels.hasBrandGuideline,
        details.hasBrandGuideline,
        "common",
        options,
      );
      pushLine(
        lines,
        labels.contentReady,
        details.contentReady,
        "common",
        options,
      );
      break;
    case "productDataEntry":
      pushLine(
        lines,
        labels.websiteUrl,
        details.dataEntryWebsiteUrl,
        "text",
        options,
      );
      pushLine(
        lines,
        labels.workType,
        details.workType,
        "dataEntryWork",
        options,
      );
      pushLine(lines, labels.siteSystem, details.siteSystem, "cms", options);
      pushLine(lines, labels.itemCount, details.itemCount, "itemCount", options);
      pushLine(
        lines,
        labels.dataSources,
        details.dataSources,
        "dataSources",
        options,
      );
      pushLine(
        lines,
        labels.contentLanguage,
        details.contentLanguage,
        "text",
        options,
      );
      pushLine(
        lines,
        labels.needsImageProcessing,
        details.needsImageProcessing,
        "common",
        options,
      );
      pushLine(
        lines,
        labels.specialInstructions,
        details.specialInstructions,
        "text",
        options,
      );
      break;
    case "socialMedia":
      pushLine(
        lines,
        labels.platforms,
        details.platforms,
        "socialPlatforms",
        options,
      );
      pushLine(
        lines,
        labels.accountLinks,
        details.accountLinks,
        "text",
        options,
      );
      pushLine(
        lines,
        labels.targetMarket,
        details.targetMarket,
        "text",
        options,
      );
      pushLine(
        lines,
        labels.monthlyPosts,
        details.monthlyPosts,
        "postCount",
        options,
      );
      pushLine(
        lines,
        labels.needsGraphicDesign,
        details.needsGraphicDesign,
        "common",
        options,
      );
      pushLine(
        lines,
        labels.needsCommunityManagement,
        details.needsCommunityManagement,
        "common",
        options,
      );
      pushLine(
        lines,
        labels.needsAdManagement,
        details.needsAdManagement,
        "common",
        options,
      );
      pushLine(
        lines,
        labels.additionalDetails,
        details.socialAdditionalDetails,
        "text",
        options,
      );
      break;
    default:
      break;
  }

  if (data.attachments?.length) {
    lines.push(
      `${labels.attachments}: ${data.attachments.map((file) => file.name).join(", ")}`,
    );
  }

  return lines.join("\n");
}
