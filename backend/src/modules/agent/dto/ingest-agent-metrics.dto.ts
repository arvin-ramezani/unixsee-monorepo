/**
 * @deprecated Quarantined monitor-shaped ingest (ADR 0008).
 * Phase 1 contract lives in `./phase1-agent.dto.ts`.
 * Do not extend this file for Phase 1 product fields.
 */
export {
  IngestAgentMetricsDto,
  MetricPayloadDto,
  TelemetryBatchEntryDto,
  WebsitePayloadDto,
} from './legacy-ingest-agent-metrics.dto.js';
