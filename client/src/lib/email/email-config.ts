import "server-only";

import { z } from "zod";

import type { Locale } from "@/i18n/routing";

const emailEnvironmentSchema = z.object({
  EMAIL_SMTP_HOST: z.string().trim().min(1),
  EMAIL_SMTP_PORT: z.coerce.number().int().positive(),
  EMAIL_SMTP_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  EMAIL_SMTP_USER: z.email(),
  EMAIL_SMTP_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().trim().min(1),
  EMAIL_ADMIN_TO: z.email(),
  EMAIL_ADMIN_LOCALE: z.enum(["en", "fa"]).default("fa"),
});

export type EmailConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  from: string;
  adminTo: string;
  adminLocale: Locale;
};

let cachedEmailConfig: EmailConfig | undefined;

export function getEmailConfig(): EmailConfig {
  if (cachedEmailConfig) {
    return cachedEmailConfig;
  }

  const result = emailEnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error("Email environment configuration is invalid.");
  }

  cachedEmailConfig = {
    smtpHost: result.data.EMAIL_SMTP_HOST,
    smtpPort: result.data.EMAIL_SMTP_PORT,
    smtpSecure: result.data.EMAIL_SMTP_SECURE,
    smtpUser: result.data.EMAIL_SMTP_USER,
    smtpPassword: result.data.EMAIL_SMTP_PASSWORD,
    from: result.data.EMAIL_FROM,
    adminTo: result.data.EMAIL_ADMIN_TO,
    adminLocale: result.data.EMAIL_ADMIN_LOCALE,
  };

  return cachedEmailConfig;
}
