import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTokyoBigSightEvents } from "../../src/sources/tokyoBigSight.js";

const html = readFileSync(
  resolve(import.meta.dirname, "../fixtures/tokyo-big-sight.html"),
  "utf-8",
);

describe("tokyoBigSight parser", () => {
  it("extracts events from page HTML", () => {
    const events = parseTokyoBigSightEvents(html, "2026-03-17T00:00:00Z");
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.facility).toBe("東京ビッグサイト");
      expect(e.eventName).toBeTruthy();
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.id).toMatch(/^tokyo-big-sight-/);
    }
  });

  it("parses known event from fixture", () => {
    const events = parseTokyoBigSightEvents(html, "2026-03-17T00:00:00Z");
    const smartEnergy = events.find((e) =>
      e.eventName.includes("SMART ENERGY"),
    );
    expect(smartEnergy).toBeDefined();
    expect(smartEnergy!.startDate).toBe("2026-03-17");
    expect(smartEnergy!.endDate).toBe("2026-03-19");
    expect(smartEnergy!.sourceURL).toContain("wsew.jp");
  });

  it("extracts imageUrl from img src", () => {
    const snippet = `<article class="lyt-event-01">
      <img src="/visitor/event/img/thumbnail/123J.jpg" />
      <h3 class="hdg-01"><a href="/visitor/event/detail/456">テスト展示会</a></h3>
      <dl class="list-01"><div><dt>開催期間</dt><dd>2026年4月1日（水）〜4月3日（金）</dd></div></dl>
    </article>`;
    const events = parseTokyoBigSightEvents(snippet, "2026-03-17T00:00:00Z");
    expect(events).toHaveLength(1);
    expect(events[0].imageUrl).toBe("https://www.bigsight.jp/visitor/event/img/thumbnail/123J.jpg");
  });
});
