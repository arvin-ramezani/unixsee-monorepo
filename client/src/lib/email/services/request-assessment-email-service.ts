import "server-only";

import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { buildRequestAssessmentDetailsText } from "@/lib/request-assessment/format-service-details";
import type { RequestAssessmentSchemaType } from "@/lib/zod-schemas/request-assessment-schema";

import { sendEmail } from "../email-client";
import { getEmailConfig } from "../email-config";
import {
  renderRequestAssessmentAdminEmail,
  renderRequestAssessmentCustomerEmail,
} from "../templates/request-assessment-email-template";

type SendRequestAssessmentEmailsInput = {
  requestId: string;
  payload: RequestAssessmentSchemaType & { locale: Locale };
};

export async function sendRequestAssessmentEmails({
  requestId,
  payload,
}: SendRequestAssessmentEmailsInput): Promise<void> {
  const config = getEmailConfig();
  const {
    locale,
    fullName,
    preferredContact,
    phone,
    email,
    aboutProject,
    services: serviceType,
  } = payload;

  const workEmail =
    preferredContact === "email"
      ? email.trim()
      : email.trim() || phone.trim();
  const replyTo = email.trim() || undefined;

  const [tCustomer, tCustomerServices, tAdmin, tAdminServices, tDetailLabels, tFormCommon, tFormOptions] =
    await Promise.all([
      getTranslations({
        locale,
        namespace: "Email.requestAssessment",
      }),
      getTranslations({
        locale,
        namespace:
          "HomePage.ConsultationSection.requestAssessment.form.fields.service.options",
      }),
      getTranslations({
        locale: config.adminLocale,
        namespace: "Email.requestAssessment",
      }),
      getTranslations({
        locale: config.adminLocale,
        namespace:
          "HomePage.ConsultationSection.requestAssessment.form.fields.service.options",
      }),
      getTranslations({
        locale: config.adminLocale,
        namespace: "Email.requestAssessment.detailLabels",
      }),
      getTranslations({
        locale: config.adminLocale,
        namespace: "HomePage.ConsultationSection.requestAssessment.form.common",
      }),
      getTranslations({
        locale: config.adminLocale,
        namespace: "HomePage.ConsultationSection.requestAssessment.form.options",
      }),
    ]);

  const customerServiceLabel = tCustomerServices(serviceType);
  const adminServiceLabel = tAdminServices(serviceType);
  const trimmedDescription = aboutProject.trim();

  const serviceDetailsText = buildRequestAssessmentDetailsText(
    payload,
    {
      hasActiveWebsite: tDetailLabels("hasActiveWebsite"),
      websiteUrl: tDetailLabels("websiteUrl"),
      cms: tDetailLabels("cms"),
      currentHosting: tDetailLabels("currentHosting"),
      currentServiceType: tDetailLabels("currentServiceType"),
      storageUsage: tDetailLabels("storageUsage"),
      databaseSize: tDetailLabels("databaseSize"),
      monthlyVisits: tDetailLabels("monthlyVisits"),
      hasWooCommerce: tDetailLabels("hasWooCommerce"),
      hasPeakTraffic: tDetailLabels("hasPeakTraffic"),
      peakTrafficDetails: tDetailLabels("peakTrafficDetails"),
      additionalDetails: tDetailLabels("additionalDetails"),
      storeUrl: tDetailLabels("storeUrl"),
      storeActive: tDetailLabels("storeActive"),
      productCount: tDetailLabels("productCount"),
      monthlyOrders: tDetailLabels("monthlyOrders"),
      hasUrgentIssue: tDetailLabels("hasUrgentIssue"),
      issueDescription: tDetailLabels("issueDescription"),
      businessArea: tDetailLabels("businessArea"),
      mainGoal: tDetailLabels("mainGoal"),
      targetCountry: tDetailLabels("targetCountry"),
      targetLanguages: tDetailLabels("targetLanguages"),
      organicTraffic: tDetailLabels("organicTraffic"),
      designTypes: tDetailLabels("designTypes"),
      designCount: tDetailLabels("designCount"),
      dimensionsOrPlatform: tDetailLabels("dimensionsOrPlatform"),
      hasBrandGuideline: tDetailLabels("hasBrandGuideline"),
      contentReady: tDetailLabels("contentReady"),
      workType: tDetailLabels("workType"),
      siteSystem: tDetailLabels("siteSystem"),
      itemCount: tDetailLabels("itemCount"),
      dataSources: tDetailLabels("dataSources"),
      contentLanguage: tDetailLabels("contentLanguage"),
      needsImageProcessing: tDetailLabels("needsImageProcessing"),
      specialInstructions: tDetailLabels("specialInstructions"),
      platforms: tDetailLabels("platforms"),
      accountLinks: tDetailLabels("accountLinks"),
      targetMarket: tDetailLabels("targetMarket"),
      monthlyPosts: tDetailLabels("monthlyPosts"),
      needsGraphicDesign: tDetailLabels("needsGraphicDesign"),
      needsCommunityManagement: tDetailLabels("needsCommunityManagement"),
      needsAdManagement: tDetailLabels("needsAdManagement"),
      attachments: tDetailLabels("attachments"),
    },
    {
      resolveValue: (group, value) => {
        if (group === "common") {
          if (value === "yes") return tFormCommon("yes");
          if (value === "no") return tFormCommon("no");
          if (value === "unknown") return tFormCommon("unknown");
        }
        if (group === "text") {
          return value;
        }
        return tFormOptions(`${group}.${value}` as never);
      },
    },
  );

  const adminTextLines = [
    tAdmin("adminTitle"),
    `${tAdmin("fields.requestId")}: ${requestId}`,
    `${tAdmin("fields.fullName")}: ${fullName}`,
    `${tAdmin("fields.email")}: ${workEmail}`,
  ];

  if (phone?.trim()) {
    adminTextLines.push(`${tAdmin("fields.phone")}: ${phone.trim()}`);
  }

  adminTextLines.push(`${tAdmin("fields.service")}: ${adminServiceLabel}`);

  if (trimmedDescription) {
    adminTextLines.push(
      `${tAdmin("fields.description")}: ${trimmedDescription}`,
    );
  }

  if (serviceDetailsText) {
    adminTextLines.push("", tAdmin("fields.serviceDetails"), serviceDetailsText);
  }

  const customerText = [
    tCustomer("customerGreeting", { fullName }),
    "",
    tCustomer("customerDescription"),
    "",
    `${tCustomer("fields.fullName")}: ${fullName}`,
    `${tCustomer("fields.email")}: ${workEmail}`,
    `${tCustomer("fields.service")}: ${customerServiceLabel}`,
    `${tCustomer("fields.requestId")}: ${requestId}`,
  ].join("\n");

  const adminHtml = renderRequestAssessmentAdminEmail({
    locale: config.adminLocale,
    previewText: tAdmin("adminSubject", { fullName }),
    title: tAdmin("adminTitle"),
    labels: {
      requestId: tAdmin("fields.requestId"),
      fullName: tAdmin("fields.fullName"),
      email: tAdmin("fields.email"),
      phone: tAdmin("fields.phone"),
      service: tAdmin("fields.service"),
      description: tAdmin("fields.description"),
      serviceDetails: tAdmin("fields.serviceDetails"),
    },
    details: {
      requestId,
      fullName,
      workEmail,
      phone: phone?.trim() || undefined,
      serviceLabel: adminServiceLabel,
      description: trimmedDescription,
      serviceDetails: serviceDetailsText,
    },
  });

  const customerHtml = renderRequestAssessmentCustomerEmail({
    locale,
    previewText: tCustomer("customerSubject"),
    title: tCustomer("customerTitle"),
    greeting: tCustomer("customerGreeting", { fullName }),
    description: tCustomer("customerDescription"),
    labels: {
      requestId: tCustomer("fields.requestId"),
      fullName: tCustomer("fields.fullName"),
      email: tCustomer("fields.email"),
      service: tCustomer("fields.service"),
      description: tCustomer("fields.description"),
    },
    details: {
      requestId,
      fullName,
      workEmail,
      serviceLabel: customerServiceLabel,
    },
  });

  const results = await Promise.allSettled([
    sendEmail({
      to: config.adminTo,
      ...(replyTo ? { replyTo } : {}),
      subject: tAdmin("adminSubject", { fullName }),
      text: adminTextLines.join("\n"),
      html: adminHtml,
    }),
    sendEmail({
      to: workEmail,
      subject: tCustomer("customerSubject"),
      text: customerText,
      html: customerHtml,
    }),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("Request assessment email delivery failed.", {
        requestId,
        emailType: index === 0 ? "admin" : "customer",
        error:
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown email error",
      });
    }
  });

  if (results.some((result) => result.status === "rejected")) {
    throw new Error("Request assessment email delivery failed.");
  }
}
