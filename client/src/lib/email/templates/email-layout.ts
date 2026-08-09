import type { Locale } from "@/i18n/routing";

import {
  escapeHtml,
  getEmailDirection,
  getEmailTextAlign,
  renderMultilineText,
  type EmailDirection,
} from "../email-template-utils";

const EMAIL_FONT_FAMILY = "Tahoma, Arial, Helvetica, sans-serif";

type RenderEmailLayoutInput = {
  locale: Locale;
  previewText: string;
  content: string;
};

type RenderEmailNoticeInput = {
  locale: Locale;
  tone: "info" | "success";
  title: string;
  description?: string;
  eyebrow?: string;
};

export type EmailSummaryRow = {
  label: string;
  value?: string | null;
  valueDirection?: EmailDirection;
  multiline?: boolean;
};

type RenderEmailSummaryInput = {
  locale: Locale;
  rows: EmailSummaryRow[];
};

type RenderEmailTextPanelInput = {
  locale: Locale;
  label?: string;
  content?: string | null;
};

function renderDarkModeOverrides(): string {
  return `
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #09131f !important; }
      .email-main { background-color: #111d2a !important; border-color: #294158 !important; }
      .email-notice { background-color: #111d2a !important; }
      .email-summary,
      .email-text-panel { background-color: #172b40 !important; border-color: #294158 !important; }
      .email-title,
      .email-body-text,
      .email-summary-value { color: #f4f7fb !important; }
      .email-muted,
      .email-summary-label,
      .email-footer { color: #a9b7c8 !important; }
      .email-divider { border-color: #294158 !important; }
      .email-brand-header { background-color: #12263f !important; }
      .email-success-icon { background-color: #173f32 !important; color: #62d89a !important; }
      .email-info-icon { background-color: #172b40 !important; color: #9fdcff !important; }
    }

    [data-ogsc] .email-bg { background-color: #09131f !important; }
    [data-ogsc] .email-main { background-color: #111d2a !important; border-color: #294158 !important; }
    [data-ogsc] .email-notice { background-color: #111d2a !important; }
    [data-ogsc] .email-summary,
    [data-ogsc] .email-text-panel { background-color: #172b40 !important; border-color: #294158 !important; }
    [data-ogsc] .email-title,
    [data-ogsc] .email-body-text,
    [data-ogsc] .email-summary-value { color: #f4f7fb !important; }
    [data-ogsc] .email-muted,
    [data-ogsc] .email-summary-label,
    [data-ogsc] .email-footer { color: #a9b7c8 !important; }
    [data-ogsc] .email-divider { border-color: #294158 !important; }
    [data-ogsc] .email-success-icon { background-color: #173f32 !important; color: #62d89a !important; }
    [data-ogsc] .email-info-icon { background-color: #172b40 !important; color: #9fdcff !important; }
  `;
}

function renderResponsiveOverrides(): string {
  return `
    @media only screen and (max-width: 480px) {
      .email-outer-padding { padding: 20px 12px !important; }
      .email-brand-padding { padding: 18px 20px !important; }
      .email-main-padding { padding: 20px !important; }
      .email-notice-padding { padding: 0 !important; }
      .email-summary-padding { padding: 18px !important; }
      .email-summary-label,
      .email-summary-value {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .email-summary-value {
        padding-top: 5px !important;
        padding-right: 0 !important;
        padding-left: 0 !important;
      }
    }
  `;
}

export function renderEmailLayout({
  locale,
  previewText,
  content,
}: RenderEmailLayoutInput): string {
  const direction = getEmailDirection(locale);
  const textAlign = getEmailTextAlign(locale);
  const safePreviewText = escapeHtml(previewText);

  return `<!doctype html>
<html lang="${locale}" dir="${direction}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${safePreviewText}</title>
    <style>
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }

      table,
      td {
        border-collapse: collapse !important;
        mso-table-lspace: 0pt !important;
        mso-table-rspace: 0pt !important;
      }

      img {
        border: 0;
        display: block;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }

      a {
        color: inherit;
      }

      ${renderResponsiveOverrides()}
      ${renderDarkModeOverrides()}
    </style>
    <!--[if mso]>
      <style>
        * { font-family: Arial, sans-serif !important; }
      </style>
    <![endif]-->
  </head>
  <body
    dir="${direction}"
    style="margin:0;padding:0;width:100%;background-color:#f5f9fd;color:#172435;direction:${direction};text-align:${textAlign};font-family:${EMAIL_FONT_FAMILY};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;"
  >
    <div
      aria-hidden="true"
      style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;overflow:hidden;mso-hide:all;"
    >
      ${safePreviewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      class="email-bg"
      bgcolor="#f5f9fd"
      dir="${direction}"
      style="width:100%;background-color:#f5f9fd;direction:${direction};text-align:${textAlign};"
    >
      <tr>
        <td
          align="center"
          class="email-outer-padding"
          style="padding:32px 20px;"
        >
          <!--[if mso]>
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
          <![endif]-->

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            dir="${direction}"
            style="width:100%;max-width:600px;direction:${direction};text-align:${textAlign};"
          >
            <tr>
              <td
                class="email-brand-header email-brand-padding"
                bgcolor="#12263f"
                style="padding:20px 28px;background-color:#12263f;border-radius:14px 14px 0 0;"
              >
                <div
                  role="img"
                  aria-label="Unixsee"
                  style="color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;line-height:24px;letter-spacing:2px;direction:ltr;text-align:${textAlign};"
                >
                  UNIXSEE
                </div>
              </td>
            </tr>

            <tr>
              <td
                class="email-main email-main-padding"
                bgcolor="#fdfefe"
                style="padding:32px;background-color:#fdfefe;border:1px solid #d5e2ee;border-top:0;border-radius:0 0 14px 14px;direction:${direction};text-align:${textAlign};"
              >
                ${content}
              </td>
            </tr>

            <tr>
              <td
                align="center"
                class="email-footer"
                style="padding:18px 12px 0;color:#617086;font-size:12px;line-height:20px;text-align:center;"
              >
                <span style="font-family:Arial,Helvetica,sans-serif;letter-spacing:1px;direction:ltr;">UNIXSEE</span>
              </td>
            </tr>
          </table>

          <!--[if mso]>
                </td>
              </tr>
            </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderEmailNotice({
  locale,
  tone,
  title,
  description,
  eyebrow,
}: RenderEmailNoticeInput): string {
  const direction = getEmailDirection(locale);
  const textAlign = getEmailTextAlign(locale);
  const isSuccess = tone === "success";
  const icon = isSuccess ? "&#10003;" : "i";
  const iconClass = isSuccess ? "email-success-icon" : "email-info-icon";
  const iconBackground = isSuccess ? "#dff7eb" : "#e9f6ff";
  const iconColor = isSuccess ? "#167b50" : "#244a74";
  const safeDescription = description?.trim();
  const safeEyebrow = eyebrow?.trim();

  return `
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      class="email-notice"
      dir="${direction}"
      style="width:100%;direction:${direction};text-align:${textAlign};"
    >
      <tr>
        <td class="email-notice-padding" style="padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${textAlign}">
            <tr>
              <td
                width="40"
                height="40"
                align="center"
                valign="middle"
                bgcolor="${iconBackground}"
                class="${iconClass}"
                style="width:32px;height:32px;background-color:${iconBackground};border-radius:999px;color:${iconColor};font-family:Arial,Helvetica,sans-serif;font-size:${isSuccess ? "24px" : "18px"};font-weight:700;line-height:32px;text-align:center;"
              >
                ${icon}
              </td>
            </tr>
          </table>

          ${
            safeEyebrow
              ? `<p class="email-muted" style="margin:8px 40px 6px;color:#617086;font-size:14px;font-weight:600;line-height:22px;">${escapeHtml(safeEyebrow)}</p>`
              : '<div style="height:16px;line-height:16px;">&nbsp;</div>'
          }

          <h1
            class="email-title"
            style="margin:-20px 38px 0px;color:#12263f;font-family:${EMAIL_FONT_FAMILY};font-size:24px;font-weight:700;line-height:36px;letter-spacing:-0.2px;text-align:${textAlign};"
          >
            ${escapeHtml(title)}
          </h1>

          ${
            safeDescription
              ? `<p class="email-body-text" style="margin:10px 0 0;color:#172435;font-size:16px;line-height:28px;text-align:${textAlign};">${escapeHtml(safeDescription)}</p>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailSummary({
  locale,
  rows,
}: RenderEmailSummaryInput): string {
  const direction = getEmailDirection(locale);
  const textAlign = getEmailTextAlign(locale);
  const visibleRows = rows.filter(
    (row) => typeof row.value === "string" && row.value.trim().length > 0,
  );

  if (visibleRows.length === 0) {
    return "";
  }

  const renderedRows = visibleRows
    .map((row, index) => {
      const isLastRow = index === visibleRows.length - 1;
      const value = row.value ?? "";
      const safeValue = row.multiline
        ? renderMultilineText(value)
        : escapeHtml(value);
      const valueDirection = row.valueDirection ?? direction;
      const valueInlinePadding =
        direction === "rtl" ? "padding-right:14px;" : "padding-left:14px;";

      return `
        <tr>
          <td
            class="email-summary-label ${isLastRow ? "" : "email-divider"}"
            width="34%"
            valign="top"
            style="width:34%;padding:${isLastRow ? "12px 0 0" : "12px 0"};color:#617086;border-bottom:${isLastRow ? "0" : "1px solid #d5e2ee"};font-size:13px;font-weight:600;line-height:22px;text-align:${textAlign};"
          >
            ${escapeHtml(row.label)}
          </td>
          <td
            class="email-summary-value ${isLastRow ? "" : "email-divider"}"
            width="66%"
            valign="top"
            dir="${valueDirection}"
            style="width:66%;padding-top:12px;padding-bottom:${isLastRow ? "0" : "12px"};${valueInlinePadding}color:#172435;border-bottom:${isLastRow ? "0" : "1px solid #d5e2ee"};font-size:15px;font-weight:600;line-height:24px;direction:${valueDirection};unicode-bidi:embed;text-align:${textAlign};overflow-wrap:anywhere;word-break:break-word;"
          >
            ${safeValue}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="height:24px;line-height:24px;">&nbsp;</div>
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      class="email-summary"
      bgcolor="#e9f6ff"
      dir="${direction}"
      style="width:100%;background-color:#e9f6ff;border:1px solid #d5e2ee;border-radius:12px;direction:${direction};text-align:${textAlign};"
    >
      <tr>
        <td class="email-summary-padding" style="padding:10px 20px 20px;">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            dir="${direction}"
            style="width:100%;direction:${direction};text-align:${textAlign};"
          >
            ${renderedRows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailTextPanel({
  locale,
  label,
  content,
}: RenderEmailTextPanelInput): string {
  const safeContent = content?.trim();

  if (!safeContent) {
    return "";
  }

  const direction = getEmailDirection(locale);
  const textAlign = getEmailTextAlign(locale);

  return `
    <div style="height:20px;line-height:20px;">&nbsp;</div>
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      class="email-text-panel"
      bgcolor="#e9f6ff"
      dir="${direction}"
      style="width:100%;background-color:#e9f6ff;border:1px solid #d5e2ee;border-radius:12px;direction:${direction};text-align:${textAlign};"
    >
      <tr>
        <td style="padding:18px 20px;">
          ${
            label
              ? `<p class="email-summary-label" style="margin:0 0 7px;color:#617086;font-size:13px;font-weight:600;line-height:22px;">${escapeHtml(label)}</p>`
              : ""
          }
          <p class="email-body-text" style="margin:0;color:#172435;font-size:15px;line-height:26px;text-align:${textAlign};">
            ${renderMultilineText(safeContent)}
          </p>
        </td>
      </tr>
    </table>
  `;
}
