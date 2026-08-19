import { describe, expect, it } from "vitest";

import type { DiscoveredDomain } from "../discovery.js";
import type { SiteStackPayload } from "../site-stack.js";
import {
  toPhase1DiscoveryPayload,
  toPhase1StackSnapshotPayload,
} from "./phase1-ingest.js";

describe("phase1 ingest contract adapters", () => {
  it("converts an OLS discovery to inventory-only payload", () => {
    const discovered: DiscoveredDomain = {
      domain: "Example.com",
      documentRoot: "/home/user/domains/example.com/public_html",
      owner: "user",
      appType: "wordpress",
      source: "openlitespeed",
      aliases: ["Example.com", "www.example.com", "internal_vhost"],
      backendAddress: "127.0.0.1:3000",
      virtualHostName: "site-vhost",
    };

    const payload = toPhase1DiscoveryPayload(
      discovered,
      "2026-08-19T12:00:00.000Z",
    );

    expect(payload).toEqual({
      domain: "example.com",
      aliases: ["www.example.com"],
      virtualHostName: "site-vhost",
      source: "openlitespeed",
      discoveredAt: "2026-08-19T12:00:00.000Z",
    });

    expect(payload).not.toHaveProperty("documentRoot");
    expect(payload).not.toHaveProperty("owner");
    expect(payload).not.toHaveProperty("appType");
    expect(payload).not.toHaveProperty("backendAddress");
  });

  it("does not emit DirectAdmin/filesystem discoveries on the new contract", () => {
    const discovered: DiscoveredDomain = {
      domain: "example.com",
      documentRoot: "/home/user/domains/example.com/public_html",
      owner: "user",
      appType: "wordpress",
      source: "directadmin",
      aliases: ["www.example.com"],
    };

    expect(
      toPhase1DiscoveryPayload(discovered, "2026-08-19T12:00:00.000Z"),
    ).toBeNull();
  });

  it("converts legacy stack enrichment to stack-only payload", () => {
    const stack: SiteStackPayload = {
      domain: "example.com",
      aliases: ["www.example.com"],
      documentRoot: "/home/user/domains/example.com/public_html",
      owner: "user",
      appType: "wordpress",
      source: "openlitespeed",
      backendAddress: null,
      controlPanelUrl: "https://panel.example.com:2222",
      wordpressAdminUrl: "https://example.com/wp-admin/",
      wordpressVersion: "6.8.2",
      phpVersion: "8.3.23",
      phpVersionScope: "host",
      imagickVersion: null,
      wordpressUpdateStatus: "up_to_date",
      wordpressUpdateCheckedAt: "2026-08-19T11:00:00.000Z",
      fieldStatus: {
        wordpressVersion: { state: "ok" },
        phpVersion: { state: "ok" },
        imagickVersion: { state: "unsupported", reason: "imagick_missing" },
        controlPanelUrl: { state: "ok" },
        wordpressAdminUrl: { state: "ok" },
        wordpressUpdateStatus: { state: "ok" },
      },
    };

    const payload = toPhase1StackSnapshotPayload(
      stack,
      "2026-08-19T12:00:00.000Z",
    );

    expect(payload).toEqual({
      domain: "example.com",
      wordpressVersion: "6.8.2",
      phpVersion: "8.3.23",
      imagickVersion: null,
      checkedAt: "2026-08-19T12:00:00.000Z",
      fieldStatus: {
        wordpressVersion: { state: "ok" },
        phpVersion: { state: "ok" },
        imagickVersion: { state: "unsupported", reason: "imagick_missing" },
      },
    });

    expect(payload).not.toHaveProperty("documentRoot");
    expect(payload).not.toHaveProperty("controlPanelUrl");
    expect(payload).not.toHaveProperty("wordpressAdminUrl");
    expect(payload).not.toHaveProperty("phpVersionScope");
    expect(payload).not.toHaveProperty("wordpressUpdateStatus");
  });

  it("downgrades an impossible ok-with-null legacy stack field to unknown", () => {
    const stack = {
      domain: "example.com",
      aliases: [],
      documentRoot: "/legacy",
      owner: "user",
      appType: "wordpress",
      source: "openlitespeed",
      controlPanelUrl: null,
      wordpressAdminUrl: null,
      wordpressVersion: null,
      phpVersion: "8.3.23",
      phpVersionScope: "host",
      imagickVersion: "3.8.0",
      wordpressUpdateStatus: null,
      wordpressUpdateCheckedAt: null,
      fieldStatus: {
        wordpressVersion: { state: "ok" },
        phpVersion: { state: "ok" },
        imagickVersion: { state: "ok" },
      },
    } satisfies SiteStackPayload;

    const payload = toPhase1StackSnapshotPayload(
      stack,
      "2026-08-19T12:00:00.000Z",
    );

    expect(payload.wordpressVersion).toBeNull();
    expect(payload.fieldStatus.wordpressVersion).toEqual({
      state: "unknown",
      reason: "wordpress_version_missing",
    });
  });
});
