### Step 1: Expand System Metrics Data Structure

- Update the `SystemMetrics` interface in `metrics.ts` to include properties for disk reads/writes, IOPS, total disk storage capacity, and available disk storage capacity.
- Update the payload construction block in `engine.ts` to compute mean values for disk I/O metrics and capture current snapshots of storage capacity metrics during the 60-second aggregation window.

### Step 2: Implement Disk I/O Parser

- Create an asynchronous file reader function in `metrics.ts` to read `/proc/diskstats`.
- Implement a low-allocation string parsing routine to target specific operational disk partitions (e.g., `sda` or `nvme0n1`).
- Extract sector reads and sector writes, calculate the delta against the previous tick's values, and convert them into true throughput (KB/s) and IOPS numbers.

### Step 3: Implement Storage Capacity Scraper

- Use Node's native `node:fs` module to call `statfs` asynchronously on the primary root mount point (`/`).
- Extract the `bsize` (block size), `blocks` (total blocks), and `bavail` (available blocks to unprivileged users) from the resulting statistics object.
- Convert these block counts into Megabytes to determine total and available storage capacity.

### Step 4: Implement Per-Virtual-Host LiteSpeed Parser

- Modify `getLiteSpeedMetrics` in `metrics.ts` to accept the array of discovered `DiscoveredDomain` objects as an argument.
- Enhance the `.rtreport` file parser to scan past global metrics and match virtual-host allocation sections against the active domains found via the DirectAdmin scanner.
- Extract individual concurrent request counters and active bandwidth load for each matching domain block during the 10-second loop.

### Step 5: Refactor the Aggregator Engine for Domain Mapping

- Modify the 10-second loop in `engine.ts` to pass the resolved host identity into the metrics collection function.
- Update the 60-second aggregation loop to maintain an array or dictionary of detailed domain metrics instead of flattening them into a single integer length count.
- Structure the final transmission payload so that it embeds the detailed array of `DiscoveredDomain` objects, complete with their respective per-site peak traffic and directory paths, alongside the general VPS performance stats.

### Step 6: Optimize Daemon Logging Noise

- Refactor the `try/catch` block inside the LiteSpeed path scanner loop in `metrics.ts` to suppress the console warning when files do not exist during development.
- Implement a state flag or a single initialization check to log server capabilities (e.g., "LiteSpeed detected", "DirectAdmin structure found") exactly once at startup instead of printing warnings on every recurring tick.
