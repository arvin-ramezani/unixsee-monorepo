import type { Locale } from "@/i18n/routing";

import {
  renderEmailLayout,
  renderEmailNotice,
  renderEmailSummary,
} from "./email-layout";

type RenderNewsletterSubscriberEmailInput = {
  locale: Locale;
  previewText: string;
  title: string;
  description: string;
};

type RenderNewsletterAdminEmailInput = {
  locale: Locale;
  previewText: string;
  title: string;
  description: string;
  emailLabel: string;
  email: string;
};

export function renderNewsletterSubscriberEmail({
  locale,
  previewText,
  title,
  description,
}: RenderNewsletterSubscriberEmailInput): string {
  return renderEmailLayout({
    locale,
    previewText,
    content: renderEmailNotice({
      locale,
      tone: "success",
      title,
      description,
    }),
  });
}

export function renderNewsletterAdminEmail({
  locale,
  previewText,
  title,
  description,
  emailLabel,
  email,
}: RenderNewsletterAdminEmailInput): string {
  return renderEmailLayout({
    locale,
    previewText,
    content: [
      renderEmailNotice({
        locale,
        tone: "info",
        title,
        description,
      }),
      renderEmailSummary({
        locale,
        rows: [
          {
            label: emailLabel,
            value: email,
            valueDirection: "ltr",
          },
        ],
      }),
    ].join(""),
  });
}
