import { describe, expect, it } from "vitest";
import { OlsDiscoveryTracker, parseOlsRouting } from "./discovery.js";

const config = `
virtualhost shop { vhRoot /ignored }
virtualhost blog { vhRoot /ignored }
listener HTTP {
  map shop www.shop.test, shop.test
  map blog blog.test
}
listener HTTPS {
  map shop shop.test, www.shop.test
}
`;
describe("OLS-only inventory", () => {
  it("deduplicates listener mappings and picks the first non-www name", () => {
    const result = parseOlsRouting(config);
    expect(
      result.find((item) => item.virtualHostName === "shop"),
    ).toMatchObject({ domain: "shop.test", aliases: ["www.shop.test"] });
  });
  it("requires two successful missing scans before removal", () => {
    const tracker = new OlsDiscoveryTracker();
    const initial = parseOlsRouting(config);
    expect(tracker.acceptSuccessfulScan(initial)).toHaveLength(2);
    expect(tracker.acceptSuccessfulScan(initial.slice(0, 1))).toHaveLength(2);
    expect(tracker.acceptSuccessfulScan(initial.slice(0, 1))).toHaveLength(1);
  });
});
