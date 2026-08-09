import "server-only";

import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";

import { sendEmail } from "../email-client";
import { getEmailConfig } from "../email-config";
import {
  renderNewsletterAdminEmail,
  renderNewsletterSubscriberEmail,
} from "../templates/newsletter-email-template";

type SendNewsletterEmailInput = {
  email: string;
  locale: Locale;
};

export async function sendNewsletterEmail({
  email,
  locale,
}: SendNewsletterEmailInput): Promise<void> {
  const config = getEmailConfig();

  const [tUser, tAdmin] = await Promise.all([
    getTranslations({
      locale,
      namespace: "Email.newsletter",
    }),
    getTranslations({
      locale: config.adminLocale,
      namespace: "Email.newsletter.admin",
    }),
  ]);

  const results = await Promise.allSettled([
    sendEmail({
      to: config.adminTo,
      subject: tAdmin("subject"),
      text: [
        tAdmin("title"),
        "",
        tAdmin("description"),
        `${tAdmin("emailLabel")}: ${email}`,
      ].join("\n"),
      html: renderNewsletterAdminEmail({
        locale: config.adminLocale,
        previewText: tAdmin("subject"),
        title: tAdmin("title"),
        description: tAdmin("description"),
        emailLabel: tAdmin("emailLabel"),
        email,
      }),
    }),
    sendEmail({
      to: email,
      subject: tUser("subject"),
      text: `${tUser("title")}\n\n${tUser("description")}`,
      html: renderNewsletterSubscriberEmail({
        locale,
        previewText: tUser("subject"),
        title: tUser("title"),
        description: tUser("description"),
      }),
    }),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("Newsletter email delivery failed.", {
        emailType: index === 0 ? "admin" : "subscriber",
        error:
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown email error",
      });
    }
  });

  if (results.some((result) => result.status === "rejected")) {
    throw new Error("Newsletter email delivery failed.");
  }
}
