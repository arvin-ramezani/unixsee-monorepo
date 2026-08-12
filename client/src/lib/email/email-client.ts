import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import { getEmailConfig, type EmailConfig } from "./email-config";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

let transporter: Transporter | undefined;
let transporterFingerprint: string | undefined;

function transporterKey(config: EmailConfig): string {
  return [
    config.smtpHost,
    config.smtpPort,
    config.smtpSecure,
    config.smtpTlsRejectUnauthorized,
    config.smtpUser,
    config.smtpPassword.length,
  ].join("|");
}

function getTransporter(): Transporter {
  const config = getEmailConfig();
  const fingerprint = transporterKey(config);

  if (transporter && transporterFingerprint === fingerprint) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
    tls: {
      rejectUnauthorized: config.smtpTlsRejectUnauthorized,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  transporterFingerprint = fingerprint;

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
