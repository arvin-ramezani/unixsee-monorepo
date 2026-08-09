import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import { getEmailConfig } from "./email-config";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendEmailInput): Promise<string> {
  const config = getEmailConfig();

  const result = await getTransporter().sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
    replyTo,
  });

  return result.messageId;
}
