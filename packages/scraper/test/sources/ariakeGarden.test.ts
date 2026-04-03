import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAriakeGardenEvents } from "../../src/sources/ariakeGarden.js";

const html = readFileSync(
  resolve(import.meta.dirname, "../fixtures/ariake-garden.html"),
  "utf-8",
);

describe("ariakeGarden parser", () => {
  it("extracts events from list page HTML", () => {
    const events = parseAriakeGardenEvents(html, "2026-03-17T00:00:00Z");
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.facility).toBe("有明ガーデン");
      expect(e.eventName).toBeTruthy();
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.id).toMatch(/^ariake-garden-/);
    }
  });

  it("extracts imageUrl from data-original attribute", () => {
    const events = parseAriakeGardenEvents(html, "2026-03-17T00:00:00Z");
    const donutEvent = events.find((e) => e.eventName.includes("JACK IN THE DONUTS"));
    expect(donutEvent).toBeDefined();
    expect(donutEvent!.imageUrl).toBe(
      "https://www.shopping-sumitomo-rd.com/images/event/2876/top_image.jpg",
    );
  });

  it("parses known event from fixture", () => {
    const events = parseAriakeGardenEvents(html, "2026-03-17T00:00:00Z");
    const kidsEvent = events.find((e) =>
      e.eventName.includes("TOKYOキッズフェスタ"),
    );
    expect(kidsEvent).toBeDefined();
    expect(kidsEvent!.startDate).toBe("2026-03-14");
    expect(kidsEvent!.endDate).toBe("2026-03-22");
    expect(kidsEvent!.category).toBe("exhibition"); // has "exhibition" label
  });
});
