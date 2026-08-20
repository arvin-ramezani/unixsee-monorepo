import { describe, expect, it, vi } from "vitest";

import type { DiscoveredDomain } from "./discovery.js";
import { enrichSiteStack, type SiteStackPayload } from "./site-stack.js";

describe("site stack runtime-probe facade", () => {
  it("probes each discovered domain through the runtime probe only", async () => {
    const domains: DiscoveredDomain[] = [
      {
        domain: "example.com",
        aliases: ["www.example.com"],
        virtualHostName: "example-vhost",
        source: "openlitespeed",
      },
      {
        domain: "shop.example.com",
        aliases: [],
        virtualHostName: "shop-vhost",
        source: "openlitespeed",
      },
    ];

    const probe = vi.fn(async (domain: string): Promise<SiteStackPayload> => ({
      domain,
      wordpressVersion: "6.8.2",
      phpVersion: "8.3.23",
      imagickVersion: "3.8.0",
      checkedAt: "2026-08-19T12:00:00.000Z",
      fieldStatus: {
        wordpressVersion: { state: "ok" },
        phpVersion: { state: "ok" },
        imagickVersion: { state: "ok" },
      },
    }));

    const result = await enrichSiteStack(domains, { probeSiteStack: probe });

    expect(probe).toHaveBeenCalledTimes(2);
    expect(probe).toHaveBeenNthCalledWith(1, "example.com");
    expect(probe).toHaveBeenNthCalledWith(2, "shop.example.com");
    expect(result.map((item) => item.domain)).toEqual([
      "example.com",
      "shop.example.com",
    ]);
  });
});
