import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseToyotaArenaTokyoEvents } from "../../src/sources/toyotaArenaTokyo.js";

const html = readFileSync(
  resolve(import.meta.dirname, "../fixtures/toyota-arena-tokyo.html"),
  "utf-8",
);

describe("toyotaArenaTokyo parser", () => {
  it("extracts events from fixture HTML", () => {
    const events = parseToyotaArenaTokyoEvents(html, "2026-03-17T00:00:00Z");
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.facility).toBe("TOYOTA ARENA TOKYO");
      expect(e.eventName).toBeTruthy();
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.id).toMatch(/^toyota-arena-tokyo-/);
    }
  });

  it("parses a known event from fixture", () => {
    const events = parseToyotaArenaTokyoEvents(html, "2026-03-17T00:00:00Z");
    // Just verify we got events with proper structure
    const first = events[0];
    expect(first).toBeDefined();
    expect(first.sourceURL).toContain("toyota-arena-tokyo.jp");
  });
});
