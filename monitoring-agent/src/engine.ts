import {
  collectCurrentMetrics,
  SystemMetrics,
  WebsiteMetrics,
} from "./metrics.js";
import { HostIdentity, initializeIdentity } from "./discovery.js";
import {
  AgentApiError,
  sendHeartbeat,
  sendIngestBatch,
} from "./api/client.js";
import { config } from "./config/config.js";

const MAX_QUEUE_SIZE = 60;

let metricBuffer: SystemMetrics[] = [];
let offlineQueue: unknown[] = [];
let isTransmitting = false;
let activeSecretKey: string | null = null;
let secretInvalidated = false;

const calculateMean = (values: number[]) =>
  values.reduce((accumulator, current) => accumulator + current, 0) /
  (values.length || 1);

const calculateMax = (values: number[]) => Math.max(...values, 0);

function assertSecretReady(): string {
  if (!activeSecretKey || secretInvalidated) {
    throw new Error(
      "Agent secret is missing or invalidated. Re-enroll with a new ENROLLMENT_TOKEN.",
    );
  }

  return activeSecretKey;
}

function invalidateSecret(reason: string): void {
  secretInvalidated = true;
  activeSecretKey = null;
  console.error(
    `[Security] ${reason} Re-issue an enrollment token from the admin panel and restart the agent with ENROLLMENT_TOKEN.`,
  );
}

async function flushQueue() {
  if (isTransmitting || offlineQueue.length === 0 || secretInvalidated) return;
  isTransmitting = true;

  const payloadsToSend = [...offlineQueue];

  try {
    console.log(`[Network] Processing ${payloadsToSend.length} payload(s)...`);
    const secretKey = assertSecretReady();
    await sendIngestBatch(payloadsToSend, secretKey);
    console.log(`[Network] Successfully transmitted secure snapshot.`);
    offlineQueue.splice(0, payloadsToSend.length);
  } catch (error: unknown) {
    if (error instanceof AgentApiError && error.status === 401) {
      invalidateSecret("Ingest rejected with HTTP 401.");
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Network] Core transmission failed. Reason:`, message);
  } finally {
    isTransmitting = false;
  }
}

async function runHeartbeat(machineId: string): Promise<void> {
  if (secretInvalidated) return;

  try {
    const secretKey = assertSecretReady();
    await sendHeartbeat(machineId, secretKey);
  } catch (error: unknown) {
    if (error instanceof AgentApiError && error.status === 401) {
      invalidateSecret("Heartbeat rejected with HTTP 401.");
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[Network] Heartbeat failed:`, message);
  }
}

async function refreshDiscovery(identity: HostIdentity): Promise<void> {
  try {
    const refreshed = await initializeIdentity();
    identity.domains = refreshed.domains;
    console.log(
      `[Discovery] Rediscovery complete. Active domains: ${identity.domains.length}`,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Discovery] Rediscovery failed:`, message);
  }
}

export function startEngine(identity: HostIdentity, secretKey: string) {
  activeSecretKey = secretKey;
  secretInvalidated = false;

  console.log(
    `[Engine] Initiating secure metric loops. Collection: ${config.collectionIntervalMs / 1000}s, Flush: ${config.transmitIntervalMs / 1000}s, Heartbeat: ${config.heartbeatIntervalMs / 1000}s, Rediscovery: ${config.rediscoveryIntervalMs / 1000}s.`,
  );

  setInterval(async () => {
    try {
      const currentMetrics = await collectCurrentMetrics(identity.domains);
      metricBuffer.push(currentMetrics);
    } catch (err) {
      console.error(`[Engine] Metric collection tick failed:`, err);
    }
  }, config.collectionIntervalMs);

  setInterval(() => {
    if (metricBuffer.length === 0 || secretInvalidated) return;

    const snapshot = [...metricBuffer];
    metricBuffer = [];
    const latestMetricIndex = snapshot.length - 1;

    const domainAggregates = identity.domains.map((domainConfig) => {
      const targetDomainSnapshots = snapshot
        .map((systemMetric) =>
          systemMetric.websites.find(
            (site) => site.domain === domainConfig.domain,
          ),
        )
        .filter((siteMetric): siteMetric is WebsiteMetrics => !!siteMetric);

      const peakConcurrentRequests = calculateMax(
        targetDomainSnapshots.map(
          (siteMetric) => siteMetric.concurrentRequests,
        ),
      );

      return {
        domain: domainConfig.domain,
        documentRoot: domainConfig.documentRoot,
        owner: domainConfig.owner,
        peakConcurrentRequests,
        appType: domainConfig.appType,
        source: domainConfig.source,
        aliases: domainConfig.aliases,
        backendAddress: domainConfig.backendAddress,
        virtualHostName: domainConfig.virtualHostName,
      };
    });

    const payload = {
      machineId: identity.machineId,
      timestamp: new Date().toISOString(),
      metrics: {
        cpuMean: parseFloat(
          calculateMean(snapshot.map((m) => m.cpuUsagePercent)).toFixed(2),
        ),
        ramMeanMB: Math.round(
          calculateMean(snapshot.map((m) => m.memoryUsedMB)),
        ),
        ramTotalMB: snapshot[0].memoryTotalMB,
        lsConnectionsPeak: calculateMax(
          snapshot.map((m) => m.liteSpeedConnections),
        ),
        diskReadBytesPerSecondMean: Math.round(
          calculateMean(snapshot.map((m) => m.diskReadBytesPerSecond)),
        ),
        diskWriteBytesPerSecondMean: Math.round(
          calculateMean(snapshot.map((m) => m.diskWriteBytesPerSecond)),
        ),
        diskIopsMean: Math.round(
          calculateMean(snapshot.map((m) => m.diskIops)),
        ),
        storageTotalMB: snapshot[latestMetricIndex].storageTotalMB,
        storageAvailableMB: snapshot[latestMetricIndex].storageAvailableMB,
      },
      websites: domainAggregates,
    };

    offlineQueue.push(payload);

    if (offlineQueue.length > MAX_QUEUE_SIZE) {
      console.warn(`[Engine] Queue limit reached. Discarding oldest payload.`);
      offlineQueue.shift();
    }

    void flushQueue();
  }, config.transmitIntervalMs);

  setInterval(() => {
    void runHeartbeat(identity.machineId);
  }, config.heartbeatIntervalMs);

  setInterval(() => {
    void refreshDiscovery(identity);
  }, config.rediscoveryIntervalMs);

  void runHeartbeat(identity.machineId);
}
