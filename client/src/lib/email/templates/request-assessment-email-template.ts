import type { Locale } from "@/i18n/routing";

import {
  renderEmailLayout,
  renderEmailNotice,
  renderEmailSummary,
  renderEmailTextPanel,
} from "./email-layout";

type RequestAssessmentLabels = {
  requestId: string;
  fullName: string;
  email: string;
  service: string;
  description: string;
};

type RequestAssessmentDetails = {
  requestId: string;
  fullName: string;
  workEmail: string;
  serviceLabel: string;
  description?: string;
};

type RenderRequestAssessmentCustomerEmailInput = {
  locale: Locale;
  previewText: string;
  title: string;
  greeting: string;
  description: string;
  labels: RequestAssessmentLabels;
  details: RequestAssessmentDetails;
};

type RenderRequestAssessmentAdminEmailInput = {
  locale: Locale;
  previewText: string;
  title: string;
  labels: RequestAssessmentLabels;
  details: RequestAssessmentDetails;
};

export function renderRequestAssessmentCustomerEmail({
  locale,
  previewText,
  title,
  greeting,
  description,
  labels,
  details,
}: RenderRequestAssessmentCustomerEmailInput): string {
  return renderEmailLayout({
    locale,
    previewText,
    content: [
      renderEmailNotice({
        locale,
        tone: "success",
        title,
        eyebrow: greeting,
      }),
      renderEmailSummary({
        locale,
        rows: [
          { label: labels.fullName, value: details.fullName },
          {
            label: labels.email,
            value: details.workEmail,
            valueDirection: "ltr",
          },
          { label: labels.service, value: details.serviceLabel },
          {
            label: labels.requestId,
            value: details.requestId,
            valueDirection: "ltr",
          },
        ],
      }),
      renderEmailTextPanel({
        locale,
        content: description,
      }),
    ].join(""),
  });
}

export function renderRequestAssessmentAdminEmail({
  locale,
  previewText,
  title,
  labels,
  details,
}: RenderRequestAssessmentAdminEmailInput): string {
  return renderEmailLayout({
    locale,
    previewText,
    content: [
      renderEmailNotice({
        locale,
        tone: "info",
        title,
      }),
      renderEmailSummary({
        locale,
        rows: [
          {
            label: labels.requestId,
            value: details.requestId,
            valueDirection: "ltr",
          },
          { label: labels.fullName, value: details.fullName },
          {
            label: labels.email,
            value: details.workEmail,
            valueDirection: "ltr",
          },
          { label: labels.service, value: details.serviceLabel },
        ],
      }),
      renderEmailTextPanel({
        locale,
        label: labels.description,
        content: details.description,
      }),
    ].join(""),
  });
}
