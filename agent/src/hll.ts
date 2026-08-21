import { createHash } from "node:crypto";

export const HLL_PRECISION = 12;
export const HLL_REGISTERS = 1 << HLL_PRECISION;
const PACKED_BYTES = HLL_REGISTERS / 2;

export class PackedHll {
  readonly bytes: Uint8Array;
  constructor(serialized?: string) {
    const source = serialized
      ? Buffer.from(serialized, "base64")
      : Buffer.alloc(PACKED_BYTES);
    if (source.length !== PACKED_BYTES)
      throw new Error("Invalid HLL register payload.");
    this.bytes = new Uint8Array(source);
  }
  private get(index: number) {
    const byte = this.bytes[index >> 1];
    return index & 1 ? byte >> 4 : byte & 0x0f;
  }
  private set(index: number, rank: number) {
    const offset = index >> 1;
    const capped = Math.min(15, rank);
    this.bytes[offset] =
      index & 1
        ? (this.bytes[offset] & 0x0f) | (capped << 4)
        : (this.bytes[offset] & 0xf0) | capped;
  }
  add(visitorHash: string): void {
    const digest = createHash("sha256").update(visitorHash).digest();
    const bits = digest.subarray(0, 8).toString("hex");
    const value = BigInt(`0x${bits}`);
    const index = Number(value >> BigInt(64 - HLL_PRECISION));
    const remainder = (value << BigInt(HLL_PRECISION)) & ((1n << 64n) - 1n);
    const binary = remainder.toString(2).padStart(64, "0");
    const firstOne = binary.indexOf("1");
    const rank = Math.min(
      15,
      (firstOne < 0 ? 64 - HLL_PRECISION : firstOne) + 1,
    );
    if (rank > this.get(index)) this.set(index, rank);
  }
  merge(other: PackedHll): void {
    for (let i = 0; i < HLL_REGISTERS; i++) {
      const rank = other.get(i);
      if (rank > this.get(i)) this.set(i, rank);
    }
  }
  estimate(): number {
    let sum = 0;
    let zeros = 0;
    for (let i = 0; i < HLL_REGISTERS; i++) {
      const rank = this.get(i);
      sum += 2 ** -rank;
      if (rank === 0) zeros++;
    }
    const alpha = 0.7213 / (1 + 1.079 / HLL_REGISTERS);
    const raw = (alpha * HLL_REGISTERS * HLL_REGISTERS) / sum;
    const corrected =
      raw <= 2.5 * HLL_REGISTERS && zeros > 0
        ? HLL_REGISTERS * Math.log(HLL_REGISTERS / zeros)
        : raw;
    return Math.max(0, Math.round(corrected));
  }
  serialize(): string {
    return Buffer.from(this.bytes).toString("base64");
  }
}

export class RollingHll24h {
  private buckets = new Map<number, PackedHll>();
  add(visitorHash: string, atMs: number): void {
    const slot = Math.floor(atMs / 300_000);
    const bucket = this.buckets.get(slot) ?? new PackedHll();
    bucket.add(visitorHash);
    this.buckets.set(slot, bucket);
    this.prune(slot);
  }
  estimate(atMs: number): number {
    const slot = Math.floor(atMs / 300_000);
    this.prune(slot);
    const merged = new PackedHll();
    for (const bucket of this.buckets.values()) merged.merge(bucket);
    return merged.estimate();
  }
  serialize(): Record<string, string> {
    return Object.fromEntries(
      Array.from(this.buckets, ([slot, hll]) => [
        String(slot),
        hll.serialize(),
      ]),
    );
  }
  restore(value: Record<string, string>): void {
    this.buckets = new Map(
      Object.entries(value).map(([slot, data]) => [
        Number(slot),
        new PackedHll(data),
      ]),
    );
  }
  private prune(current: number) {
    for (const slot of this.buckets.keys())
      if (slot <= current - 288) this.buckets.delete(slot);
  }
}
