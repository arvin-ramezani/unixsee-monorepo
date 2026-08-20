import type { DiscoveredDomain } from "./discovery.js";
import { probeSiteStack as defaultProbeSiteStack } from "./runtime-probe/client.js";

export type {
  FieldState,
  FieldStatus,
  RuntimeProbeFailureReason,
  RuntimeProbeResponse,
  SiteStackPayload,
} from "./runtime-probe/types.js";

import type { SiteStackPayload } from "./runtime-probe/types.js";

export interface SiteStackDependencies {
  probeSiteStack?: (domain: string) => Promise<SiteStackPayload>;
}

/**
 * Resolve stack data only through the protected local OpenLiteSpeed/PHP probe.
 * This module performs no DirectAdmin reads, website filesystem reads, PHP CLI,
 * shell execution, or host-level PHP fallback.
 */
export async function enrichSiteStack(
  domains: readonly DiscoveredDomain[],
  dependencies: SiteStackDependencies = {},
): Promise<SiteStackPayload[]> {
  const probeSiteStack = dependencies.probeSiteStack ?? defaultProbeSiteStack;
  return Promise.all(domains.map((domain) => probeSiteStack(domain.domain)));
}

export { InvalidRuntimeProbeDomainError, probeSiteStack } from "./runtime-probe/client.js";
