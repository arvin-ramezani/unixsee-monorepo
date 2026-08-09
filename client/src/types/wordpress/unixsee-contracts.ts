import { LocaleType } from "../intl.types";

export type UnixseeLanguage = LocaleType | string;
export type UnixseePageType =
  | "home_page"
  | "about_page"
  | "services_page"
  | "service_detail_page"
  | "contact_page"
  | "blog_index_page"
  | "blog_single_page"
  | "legal_page"
  | "landing_page"
  | "standard_page"
  | string;

export type UnixseeMediaSize = {
  url: string;
  width: number;
  height: number;
};

export type UnixseeMedia = {
  id: number;
  url: string;
  alt: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sizes?: Record<string, UnixseeMediaSize>;
};

export type UnixseeSeo = {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: Record<string, string | boolean>;
  openGraph?: Record<string, unknown>;
  twitter?: Record<string, unknown>;
  provider?: string;
};

export type UnixseeSection<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  id?: string;
  type: TType;
  props: TProps;
};

export type UnixseePreviewMeta = {
  enabled: boolean;
  usesDraftData?: boolean;
  draftUpdatedAt?: string | null;
};

export type UnixseePage = {
  id: number;
  type: UnixseePageType;
  lang: UnixseeLanguage;
  path: string;
  title: string;
  slug?: string;
  status?: string;
  seo?: UnixseeSeo;
  sections: UnixseeSection[];
  preview?: UnixseePreviewMeta;
  [key: string]: unknown;
};

export type UnixseeRouteData = {
  route?: {
    path: string;
    lang: UnixseeLanguage;
    type?: string;
    pageId?: number;
  };
  page: UnixseePage;
  schemaVersion?: string;
  [key: string]: unknown;
};

export type UnixseeHomeData =
  | UnixseeRouteData
  | {
      page: UnixseePage;
      schemaVersion?: string;
      [key: string]: unknown;
    };

export type UnixseeSuccessEnvelope<T> = {
  success: true;
  data: T;
  error?: never;
};

export type UnixseeErrorEnvelope = {
  success: false;
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type UnixseeEnvelope<T> =
  | UnixseeSuccessEnvelope<T>
  | UnixseeErrorEnvelope;

export type UnixseeFetchMode = "published" | "preview";

export type UnixseeFetchContext = {
  lang?: UnixseeLanguage;
  mode?: UnixseeFetchMode;
  previewToken?: string | null;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  cache?: RequestCache;
};

export type UnixseeClientConfig = {
  wpApiBaseUrl: string;
  apiKey?: string;
  defaultLang?: UnixseeLanguage;
  previewCookieName?: string;
  fetchImpl?: typeof fetch;
  defaultNext?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export type UnixseeFetchErrorPayload = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  url: string;
};
