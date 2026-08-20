export type FieldState = "ok" | "unknown" | "unsupported";

export type RuntimeProbeFailureReason =
  | "runtime_probe_not_configured"
  | "runtime_probe_unreachable"
  | "runtime_probe_timeout"
  | "runtime_probe_invalid_response"
  | "runtime_probe_forbidden"
  | "wordpress_not_detected"
  | "imagick_missing"
  | "php_version_missing";

export interface FieldStatus {
  state: FieldState;
  reason?: RuntimeProbeFailureReason;
}

export interface RuntimeProbeResponse {
  wordpressVersion: string | null;
  phpVersion: string | null;
  imagickVersion: string | null;
  checkedAt: string;
}

export interface SiteStackPayload {
  domain: string;
  wordpressVersion: string | null;
  phpVersion: string | null;
  imagickVersion: string | null;
  checkedAt: string;
  fieldStatus: {
    wordpressVersion: FieldStatus;
    phpVersion: FieldStatus;
    imagickVersion: FieldStatus;
  };
}
