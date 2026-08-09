import "server-only";

import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { RequestAssessmentSchemaType } from "@/lib/zod-schemas/request-assessment-schema";

import { sendEmail } from "../email-client";
import { getEmailConfig } from "../email-config";
import {
  renderRequestAssessmentAdminEmail,
  renderRequestAssessmentCustomerEmail,
} from "../templates/request-assessment-email-template";

type SendRequestAssessmentEmailsInput = {
  requestId: string;
  fullName: string;
  workEmail: string;
  description: string;
  serviceType: RequestAssessmentSchemaType["services"];
  locale: Locale;
};

export async function sendRequestAssessmentEmails({
  requestId,
  fullName,
  workEmail,
  description,
  serviceType,
  locale,
}: SendRequestAssessmentEmailsInput): Promise<void> {
  const config = getEmailConfig();

  const [tCustomer, tCustomerServices, tAdmin, tAdminServices] =
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
    ]);

  const customerServiceLabel = tCustomerServices(serviceType);
  const adminServiceLabel = tAdminServices(serviceType);
  const trimmedDescription = description.trim();

  const adminTextLines = [
    tAdmin("adminTitle"),
    `${tAdmin("fields.requestId")}: ${requestId}`,
    `${tAdmin("fields.fullName")}: ${fullName}`,
    `${tAdmin("fields.email")}: ${workEmail}`,
    `${tAdmin("fields.service")}: ${adminServiceLabel}`,
  ];

  if (trimmedDescription) {
    adminTextLines.push(
      `${tAdmin("fields.description")}: ${trimmedDescription}`,
    );
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
      service: tAdmin("fields.service"),
      description: tAdmin("fields.description"),
    },
    details: {
      requestId,
      fullName,
      workEmail,
      serviceLabel: adminServiceLabel,
      description: trimmedDescription,
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
      replyTo: workEmail,
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
