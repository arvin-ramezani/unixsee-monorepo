import { readFile, statfs } from "node:fs/promises";
import { platform } from "node:os";
import { DiscoveredDomain } from "./discovery.js";

export interface WebsiteMetrics {
  domain: string;
  documentRoot: string;
  owner: string;
  appType: string;
  source: string;
  aliases: string[];
  backendAddress?: string;
  concurrentRequests: number;
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  memoryTotalMB: number;
  memoryUsedMB: number;
  liteSpeedConnections: number;
  diskReadBytesPerSecond: number;
  diskWriteBytesPerSecond: number;
  diskIops: number;
  storageTotalMB: number;
  storageAvailableMB: number;
  websites: WebsiteMetrics[];
}

interface LiteSpeedTelemetry {
  globalConnections: number;
  virtualHosts: Record<string, number>;
}

interface DiskTicks {
  sectorsRead: number;
  sectorsWritten: number;
  ioOperationsInProgress: number;
  timestamp: number;
}

let previousCpuTicks = { idle: 0, total: 0 };
let previousDiskTicks: DiskTicks | null = null;

async function getCpuMetrics(): Promise<number> {
  if (platform() === "win32") return Math.floor(Math.random() * 15) + 5;

  try {
    const stat = await readFile("/proc/stat", "utf-8");
    const match = stat.match(/^cpu\s+(.+)$/m);
    if (!match) return 0;

    const parts = match[1].split(/\s+/).map(Number);
    const idle = parts[3] + parts[4];
    const total = parts.reduce((acc, val) => acc + val, 0);

    const deltaIdle = idle - previousCpuTicks.idle;
    const deltaTotal = total - previousCpuTicks.total;

    previousCpuTicks = { idle, total };

    if (deltaTotal === 0) return 0;

    const usage = (1 - deltaIdle / deltaTotal) * 100;
    return parseFloat(usage.toFixed(2));
  } catch (error) {
    return 0;
  }
}

async function getMemoryMetrics() {
  if (platform() === "win32") return { total: 16384, used: 8192 };

  try {
    const meminfo = await readFile("/proc/meminfo", "utf-8");

    const extractValue = (key: string) => {
      const match = meminfo.match(new RegExp(`^${key}:\\s+(\\d+)\\s+kB`, "m"));
      return match ? parseInt(match[1], 10) / 1024 : 0;
    };

    const total = extractValue("MemTotal");
    const available = extractValue("MemAvailable");

    return {
      total: Math.round(total),
      used: Math.round(total - available),
    };
  } catch (error) {
    return { total: 0, used: 0 };
  }
}

async function getDiskMetrics() {
  const defaultDiskMetrics = {
    readBytesPerSecond: 0,
    writeBytesPerSecond: 0,
    iops: 0,
  };
  if (platform() === "win32") return defaultDiskMetrics;

  try {
    const diskstats = await readFile("/proc/diskstats", "utf-8");
    const lines = diskstats.split("\n");

    let targetLine = "";
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.includes("sda ") || line.includes("nvme0n1 ")) {
        targetLine = line;
        break;
      }
    }

    if (!targetLine && lines.length > 0) {
      targetLine = lines[0];
    }

    const parts = targetLine.trim().split(/\s+/);
    if (parts.length < 14) return defaultDiskMetrics;

    const sectorsRead = parseInt(parts[5], 10);
    const sectorsWritten = parseInt(parts[9], 10);
    const ioOperationsInProgress = parseInt(parts[12], 10);
    const currentTimestamp = Date.now();

    if (!previousDiskTicks) {
      previousDiskTicks = {
        sectorsRead,
        sectorsWritten,
        ioOperationsInProgress,
        timestamp: currentTimestamp,
      };
      return defaultDiskMetrics;
    }

    const elapsedSeconds =
      (currentTimestamp - previousDiskTicks.timestamp) / 1000;
    if (elapsedSeconds <= 0) return defaultDiskMetrics;

    const deltaReads = Math.max(0, sectorsRead - previousDiskTicks.sectorsRead);
    const deltaWrites = Math.max(
      0,
      sectorsWritten - previousDiskTicks.sectorsWritten,
    );

    const bytesPerSector = 512;
    const readBytesPerSecond = (deltaReads * bytesPerSector) / elapsedSeconds;
    const writeBytesPerSecond = (deltaWrites * bytesPerSector) / elapsedSeconds;
    const iops = (deltaReads + deltaWrites) / elapsedSeconds;

    previousDiskTicks = {
      sectorsRead,
      sectorsWritten,
      ioOperationsInProgress,
      timestamp: currentTimestamp,
    };

    return {
      readBytesPerSecond: Math.round(readBytesPerSecond),
      writeBytesPerSecond: Math.round(writeBytesPerSecond),
      iops: Math.round(iops),
    };
  } catch (error) {
    return defaultDiskMetrics;
  }
}

async function getStorageMetrics() {
  if (platform() === "win32") return { totalMB: 512000, availableMB: 256000 };

  try {
    const stats = await statfs("/");
    const bytesInMegabyte = 1024 * 1024;

    const totalMB = (stats.blocks * stats.bsize) / bytesInMegabyte;
    const availableMB = (stats.bavail * stats.bsize) / bytesInMegabyte;

    return {
      totalMB: Math.round(totalMB),
      availableMB: Math.round(availableMB),
    };
  } catch (error) {
    return { totalMB: 0, availableMB: 0 };
  }
}

async function getLiteSpeedTelemetry(): Promise<LiteSpeedTelemetry> {
  const telemetry: LiteSpeedTelemetry = {
    globalConnections: 0,
    virtualHosts: {},
  };

  if (platform() === "win32") {
    telemetry.globalConnections = Math.floor(Math.random() * 50);
    return telemetry;
  }

  const lsPaths = ["/tmp/lshttpd/.rtreport", "/tmp/lshttpd/.rtreport.2"];

  for (const path of lsPaths) {
    try {
      const report = await readFile(path, "utf-8");

      const globalMatch =
        report.match(/PLAINCONN:\s*\[(\d+)\]/i) ||
        report.match(/MAXCONN:\s*\[(\d+)\]/i);

      if (globalMatch) {
        telemetry.globalConnections = parseInt(globalMatch[1], 10);
      }

      const virtualHostMatcher =
        /VHOST\s+\[?([^\]:\n]+)\]?:([\s\S]*?)(?=\nVHOST\s+\[?|\nEXTAPP\s+\[?|$)/gi;

      let match: RegExpExecArray | null;
      while ((match = virtualHostMatcher.exec(report)) !== null) {
        const virtualHostName = match[1].trim().toLowerCase();
        const section = match[2];
        const processingMatch = section.match(/REQ_PROCESSING:\s*\[(\d+)\]/i);
        if (!processingMatch) continue;

        const processingRequests = parseInt(processingMatch[1], 10);
        telemetry.virtualHosts[virtualHostName] = processingRequests;
        telemetry.virtualHosts[virtualHostName.replace(/^www\./i, "")] = processingRequests;
      }

      return telemetry;
    } catch {
      // Metrics collection must not fail because OpenLiteSpeed report is unavailable.
    }
  }

  return telemetry;
}

function resolveConcurrentRequests(
  liteSpeedData: LiteSpeedTelemetry,
  property: DiscoveredDomain,
): number {
  const candidates = [
    property.domain,
    ...property.aliases,
    property.virtualHostName ?? "",
    property.documentRoot.split("/").filter(Boolean).at(-1) ?? "",
  ].map((value) => value.toLowerCase().replace(/^www\./i, ""));

  for (const candidate of candidates) {
    const requests = liteSpeedData.virtualHosts[candidate];
    if (typeof requests === "number") return requests;
  }

  return 0;
}

export async function collectCurrentMetrics(
  discoveredDomains: DiscoveredDomain[],
): Promise<SystemMetrics> {
  const [cpu, memory, disk, storage, liteSpeedData] = await Promise.all([
    getCpuMetrics(),
    getMemoryMetrics(),
    getDiskMetrics(),
    getStorageMetrics(),
    getLiteSpeedTelemetry(),
  ]);

  const websiteMetrics: WebsiteMetrics[] = discoveredDomains.map((property) => {
    const concurrentRequests = resolveConcurrentRequests(liteSpeedData, property);

    return {
      domain: property.domain,
      documentRoot: property.documentRoot,
      owner: property.owner,
      appType: property.appType,
      source: property.source,
      aliases: property.aliases,
      backendAddress: property.backendAddress,
      concurrentRequests,
    };
  });

  return {
    cpuUsagePercent: cpu,
    memoryTotalMB: memory.total,
    memoryUsedMB: memory.used,
    liteSpeedConnections: liteSpeedData.globalConnections,
    diskReadBytesPerSecond: disk.readBytesPerSecond,
    diskWriteBytesPerSecond: disk.writeBytesPerSecond,
    diskIops: disk.iops,
    storageTotalMB: storage.totalMB,
    storageAvailableMB: storage.availableMB,
    websites: websiteMetrics,
  };
}
