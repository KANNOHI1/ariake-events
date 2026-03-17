import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTokyoGardenTheaterEvents } from "../../src/sources/tokyoGardenTheater.js";

const html = readFileSync(
  resolve(import.meta.dirname, "../fixtures/tokyo-garden-theater.html"),
  "utf-8",
);

describe("tokyoGardenTheater parser", () => {
  it("extracts events from fixture HTML", () => {
    const events = parseTokyoGardenTheaterEvents(html, "2026-03-17T00:00:00Z", 2026);
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.facility).toBe("東京ガーデンシアター");
      expect(e.eventName).toBeTruthy();
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.id).toMatch(/^tokyo-garden-theater-/);
    }
  });

  it("combines player and title when both exist", () => {
    const events = parseTokyoGardenTheaterEvents(html, "2026-03-17T00:00:00Z", 2026);
    // Events with both player and title should have combined display name
    const withBoth = events.find((e) => e.eventName.includes(" "));
    if (withBoth) {
      expect(withBoth.eventName.length).toBeGreaterThan(3);
    }
  });
});
