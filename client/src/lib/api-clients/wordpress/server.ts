import "server-only";

import { cookies } from "next/headers";

import type {
  UnixseeClientConfig,
  UnixseeEnvelope,
  UnixseeFetchContext,
  UnixseeFetchErrorPayload,
  UnixseeHomeData,
  //   UnixseeLanguage,
  UnixseeRouteData,
} from "@/types/wordpress/unixsee-contracts";

const DEFAULT_PREVIEW_COOKIE = "__unixsee_preview_token";
const API_KEY_HEADER = "X-Unixsee-Api-Key";

export class UnixseeFetchError extends Error {
  status: number;
  code: string;
  details?: unknown;
  url: string;

  constructor(payload: UnixseeFetchErrorPayload) {
    super(payload.message);
    this.name = "UnixseeFetchError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
    this.url = payload.url;
  }
}

export function createUnixseeClient(config: UnixseeClientConfig) {
  const baseUrl = normalizeBaseUrl(config.wpApiBaseUrl);
  const defaultLang = config.defaultLang || "fa";
  const previewCookieName = config.previewCookieName || DEFAULT_PREVIEW_COOKIE;
  const fetchImpl = config.fetchImpl || fetch;

  async function getPreviewToken(
    explicit?: string | null,
  ): Promise<string | null> {
    if (explicit) return explicit;
    const store = await cookies();
    return store.get(previewCookieName)?.value || null;
  }

  async function request<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
    context: UnixseeFetchContext = {},
  ): Promise<T> {
    const url = new URL(baseUrl + endpoint);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    const mode = context.mode || "published";
    if (mode === "preview") {
      const token = await getPreviewToken(context.previewToken);
      if (!token) {
        throw new UnixseeFetchError({
          status: 400,
          code: "missing_preview_token",
          message:
            "Unixsee preview fetch requires a preview token cookie or explicit previewToken.",
          url: url.toString(),
        });
      }
      url.searchParams.set("preview", "1");
      url.searchParams.set("previewToken", token);
    }

    const headers: HeadersInit = {
      Accept: "application/json",
    };
    if (config.apiKey) {
      headers[API_KEY_HEADER] = config.apiKey;
    }

    const response = await fetchImpl(url.toString(), {
      method: "GET",
      headers,
      cache: context.cache || (mode === "preview" ? "no-store" : undefined),
      next:
        mode === "preview"
          ? undefined
          : {
              revalidate:
                context.next?.revalidate ?? config.defaultNext?.revalidate,
              tags: context.next?.tags ?? config.defaultNext?.tags,
            },
    });

    const json = await safeJson<UnixseeEnvelope<T>>(response);

    if (!response.ok || !json.success) {
      const error = !json.success ? json.error : undefined;
      throw new UnixseeFetchError({
        status: response.status,
        code: error?.code || `http_${response.status}`,
        message:
          error?.message ||
          `Unixsee request failed with HTTP ${response.status}.`,
        details: error?.details,
        url: url.toString(),
      });
    }

    return json.data;
  }

  return {
    route(path: string, context: UnixseeFetchContext = {}) {
      const lang = context.lang || defaultLang;
      return request<UnixseeRouteData>("/route", { path, lang }, context);
    },

    home(context: UnixseeFetchContext = {}) {
      const lang = context.lang || defaultLang;
      return request<UnixseeHomeData>("/home", { lang }, context);
    },
  };
}

async function safeJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {
      success: false,
      error: {
        code: "invalid_json_response",
        message: "Unixsee returned a non-JSON response.",
      },
    } as T;
  }
}

function normalizeBaseUrl(input: string): string {
  if (!input) {
    throw new Error(
      "Missing Unixsee wpApiBaseUrl. Expected something like https://api.example.com/wp-json/unixsee/v1",
    );
  }
  return input.replace(/\/$/, "");
}

export type UnixseeClient = ReturnType<typeof createUnixseeClient>;
