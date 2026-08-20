import "server-only";

import { z } from "zod";

import type { Locale } from "@/i18n/routing";

const emailEnvironmentSchema = z.object({
  EMAIL_SMTP_HOST: z.string().trim().min(1),
  EMAIL_SMTP_PORT: z.coerce.number().int().positive(),
  EMAIL_SMTP_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  EMAIL_SMTP_TLS_REJECT_UNAUTHORIZED: z
    .enum(["true", "false"])
    .default("true")
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
  smtpTlsRejectUnauthorized: boolean;
  smtpUser: string;
  smtpPassword: string;
  from: string;
  adminTo: string;
  adminLocale: Locale;
};

let cachedEmailConfig: EmailConfig | undefined;
let cachedEnvFingerprint: string | undefined;

function readEnvFingerprint(): string {
  return [
    process.env.EMAIL_SMTP_HOST ?? "",
    process.env.EMAIL_SMTP_PORT ?? "",
    process.env.EMAIL_SMTP_SECURE ?? "",
    process.env.EMAIL_SMTP_TLS_REJECT_UNAUTHORIZED ?? "",
    process.env.EMAIL_SMTP_USER ?? "",
    process.env.EMAIL_SMTP_PASSWORD ?? "",
    process.env.EMAIL_FROM ?? "",
    process.env.EMAIL_ADMIN_TO ?? "",
    process.env.EMAIL_ADMIN_LOCALE ?? "",
  ].join("\0");
}

export function getEmailConfig(): EmailConfig {
  const fingerprint = readEnvFingerprint();
  if (cachedEmailConfig && cachedEnvFingerprint === fingerprint) {
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
    smtpTlsRejectUnauthorized: result.data.EMAIL_SMTP_TLS_REJECT_UNAUTHORIZED,
    smtpUser: result.data.EMAIL_SMTP_USER,
    smtpPassword: result.data.EMAIL_SMTP_PASSWORD,
    from: result.data.EMAIL_FROM,
    adminTo: result.data.EMAIL_ADMIN_TO,
    adminLocale: result.data.EMAIL_ADMIN_LOCALE,
  };
  cachedEnvFingerprint = fingerprint;

  return cachedEmailConfig;
}
