import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAriakeArenaEvents } from "../../src/sources/ariakeArena.js";

const html = readFileSync(
  resolve(import.meta.dirname, "../fixtures/ariake-arena.html"),
  "utf-8",
);

describe("ariakeArena parser", () => {
  it("extracts events from fixture HTML", () => {
    const events = parseAriakeArenaEvents(html, "2026-03-17T00:00:00Z", 2026);
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.facility).toBe("有明アリーナ");
      expect(e.eventName).toBeTruthy();
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.id).toMatch(/^ariake-arena-/);
    }
  });

  it("parses RIZIN event from fixture", () => {
    const events = parseAriakeArenaEvents(html, "2026-03-17T00:00:00Z", 2026);
    const rizin = events.find((e) => e.eventName.includes("RIZIN"));
    expect(rizin).toBeDefined();
    expect(rizin!.startDate).toBe("2026-03-07");
  });

  it("handles multi-day events", () => {
    const events = parseAriakeArenaEvents(html, "2026-03-17T00:00:00Z", 2026);
    const daice = events.find((e) => e.eventName.includes("Da-iCE"));
    expect(daice).toBeDefined();
    // Feb 28 - Mar 1
    expect(daice!.startDate).toBe("2026-02-28");
    expect(daice!.endDate).toBe("2026-03-01");
  });

  it("returns null imageUrl for reserve.ariake-arena.tokyo (auth-gated URLs)", () => {
    const events = parseAriakeArenaEvents(html, "2026-03-17T00:00:00Z", 2026);
    const daice = events.find((e) => e.eventName.includes("Da-iCE"));

    expect(daice).toBeDefined();
    // reserve.ariake-arena.tokyo は認証URLのため公開不可 → null を返す
    expect(daice!.imageUrl).toBeNull();
  });
});
