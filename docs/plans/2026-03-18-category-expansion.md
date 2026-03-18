# Category Expansion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce "other" category events from 73 to ≤20 by adding kids/food/fashion/anime categories and expanding keyword dictionary.

**Architecture:** All changes are in `normalize.ts` (mapCategory function) and `types.ts` (EventCategory union type). No scraper source files need modification — Ariake Garden already passes data-eventlabel values through mapCategory, and other scrapers already pass event titles.

**Tech Stack:** TypeScript, Vitest, pnpm

---

## File Map

| File | Change |
|------|--------|
| `packages/scraper/src/types.ts` | Add `EventCategory` union type, update `EventItem.category` |
| `packages/scraper/src/lib/normalize.ts` | Expand `mapCategory` with new categories + keyword patterns |
| `packages/scraper/test/lib/normalize.test.ts` | Update `mapCategory("kids")` / `mapCategory("food")` expectations + add new tests |
| `packages/scraper/test/sources/ariakeGarden.test.ts` | No change expected (existing tests should still pass) |

---

## Chunk 1: Types + Core Logic

### Task 1: Add EventCategory type

**Files:**
- Modify: `packages/scraper/src/types.ts`

- [ ] **Step 1: Write the failing test**

In `packages/scraper/test/lib/normalize.test.ts`, the existing test currently expects:
```typescript
expect(mapCategory("kids")).toBe("other");   // will change to "kids"
expect(mapCategory("food")).toBe("other");   // will change to "food"
```
These tests will fail after the change — that's intentional. Run them first to confirm current behavior:

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
pnpm --filter scraper test test/lib/normalize.test.ts
```
Expected: PASS (current behavior)

- [ ] **Step 2: Update types.ts**

Replace the `category: string` field with a typed union:

```typescript
// packages/scraper/src/types.ts

export type EventCategory =
  | "music"
  | "sports"
  | "exhibition"
  | "kids"
  | "food"
  | "fashion"
  | "anime"
  | "other";

export type EventItem = {
  id: string;
  eventName: string;
  facility: string;
  category: EventCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  peakTimeStart: string | null;
  peakTimeEnd: string | null;
  estimatedAttendees: number | null;
  congestionRisk: number | null;
  sourceURL: string;
  lastUpdated: string; // ISO 8601
};

export type ScrapeResult = {
  facility: string;
  sourceURL: string;
  events: EventItem[];
  warnings: string[];
  errors: string[];
};

export type FacilityScraper = {
  facility: string;
  sourceURL: string;
  run: (ctx: ScrapeContext) => Promise<ScrapeResult>;
};

import type { Page } from "playwright";

export type ScrapeContext = {
  nowISO: string;
  timezone: string;
  fetchHtml: (url: string) => Promise<string>;
  /** Create a Playwright Page for direct browser interaction */
  newPage: () => Promise<Page>;
  log: (message: string) => void;
};
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
pnpm --filter scraper exec tsc --noEmit
```
Expected: no errors (category: string → EventCategory is compatible since the existing mapCategory returns string literals that are all in the union)

---

### Task 2: Expand mapCategory

**Files:**
- Modify: `packages/scraper/src/lib/normalize.ts`

- [ ] **Step 1: Replace mapCategory implementation**

```typescript
// packages/scraper/src/lib/normalize.ts
import { createHash } from "node:crypto";
import type { EventCategory } from "../types.js";

const FACILITY_SLUG: Record<string, string> = {
  有明ガーデン: "ariake-garden",
  東京ガーデンシアター: "tokyo-garden-theater",
  有明アリーナ: "ariake-arena",
  "TOYOTA ARENA TOKYO": "toyota-arena-tokyo",
  東京ビッグサイト: "tokyo-big-sight",
};

export const normalizeWhitespace = (s: string): string =>
  s.replace(/\s+/g, " ").trim();

export const removeNewTabNotice = (s: string): string =>
  normalizeWhitespace(s.replace(/新規タブで開きます/g, ""));

export const mapCategory = (raw: string | null | undefined): EventCategory => {
  if (!raw) return "other";
  const s = raw.toLowerCase();

  // Music: concerts, live shows, tours
  // Note: フェス(?!タ) excludes フェスタ (which is a festival/event suffix, not a music fest)
  if (/ライブ|コンサート|フェス(?!タ)|ショー|live|music|concert/.test(s))
    return "music";
  if (/ツアー|tour/.test(s)) return "music";

  // Sports: leagues, tournaments, combat sports
  if (/スポーツ|試合|大会|カップ|選手権|sports/.test(s)) return "sports";
  if (/リーグ|league/.test(s)) return "sports"; // B.LEAGUE, D.LEAGUE
  if (/rizin|格闘/.test(s)) return "sports";

  // Exhibition: trade shows, fairs, expos
  // Note: /展/ matches standalone 展 suffix (二次電池展, AI業務自動化展)
  if (/展示|展覧|見本市|expo|exhibition/.test(s)) return "exhibition";
  if (/展/.test(s)) return "exhibition";
  if (/フェア|fair/.test(s)) return "exhibition";
  if (/\bweek\b/.test(s)) return "exhibition"; // Japan IT Week, SMART ENERGY WEEK

  // Kids: children's events (data-eventlabel "kids" + Japanese keywords)
  if (/\bkids\b|キッズ|こども|子ども|子供|乗り物/.test(s)) return "kids";

  // Food: food/beverage events (data-eventlabel "food" + Japanese keywords)
  if (/\bfood\b|フード|食材|グルメ/.test(s)) return "food";

  // Fashion: fashion shows and apparel (data-eventlabel "fashion" + Japanese)
  if (/\bfashion\b|ファッション|アパレル/.test(s)) return "fashion";

  // Anime/Comic: otaku culture events (comic markets, doll shows)
  if (/\bcomic\b|\bdoll\b/.test(s)) return "anime";

  return "other";
};

export const makeEventId = (
  facility: string,
  eventName: string,
  startDate: string,
  sourceURL: string,
): string => {
  const slug = FACILITY_SLUG[facility] ?? "unknown";
  const hash = createHash("sha1")
    .update(`${facility}|${eventName}|${startDate}|${sourceURL}`)
    .digest("hex")
    .slice(0, 8);
  return `${slug}-${startDate.replace(/-/g, "")}-${hash}`;
};
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
pnpm --filter scraper exec tsc --noEmit
```
Expected: no errors

---

### Task 3: Update normalize tests

**Files:**
- Modify: `packages/scraper/test/lib/normalize.test.ts`

- [ ] **Step 1: Update existing expectations + add new tests**

Replace the full `mapCategory` describe block:

```typescript
describe("mapCategory", () => {
  // --- music ---
  it("maps Japanese music keywords", () => {
    expect(mapCategory("ライブ")).toBe("music");
    expect(mapCategory("コンサート2026")).toBe("music");
    expect(mapCategory("フェス")).toBe("music");
  });
  it("maps English tour/concert keywords", () => {
    expect(mapCategory("Da-iCE ARENA TOUR 2026 -TERMiNaL-")).toBe("music");
    expect(mapCategory("DREAMS COME TRUE CONCERT TOUR")).toBe("music");
    expect(mapCategory("Seiko Matsuda Concert Tour")).toBe("music");
    expect(mapCategory("Spring Tour 2026")).toBe("music");
  });

  // --- sports ---
  it("maps Japanese sports keywords", () => {
    expect(mapCategory("全国大会")).toBe("sports");
    expect(mapCategory("選手権")).toBe("sports");
    expect(mapCategory("Bリーグ")).toBe("sports"); // preserve existing coverage
  });
  it("maps English league keywords (B.LEAGUE, D.LEAGUE)", () => {
    expect(mapCategory("B.LEAGUE 2025-26シーズン 第25節")).toBe("sports");
    expect(mapCategory("D.LEAGUE 25-26 SEASON ROUND6")).toBe("sports");
  });
  it("maps combat sports (RIZIN)", () => {
    expect(mapCategory("RIZIN.52")).toBe("sports");
  });

  // --- exhibition ---
  it("maps Japanese exhibition keywords", () => {
    expect(mapCategory("展示会")).toBe("exhibition");
    expect(mapCategory("EXPO 2026")).toBe("exhibition");
  });
  it("maps standalone 展 suffix (Tokyo Big Sight trade shows)", () => {
    expect(mapCategory("AI/DX営業・マーケティング展 2026 Spring")).toBe(
      "exhibition",
    );
    expect(
      mapCategory("BATTERY JAPAN【春】～第20回 [国際] 二次電池展～"),
    ).toBe("exhibition");
    expect(mapCategory("第9回 AI・業務自動化 展【春】")).toBe("exhibition");
  });
  it("maps フェア/fair suffix", () => {
    expect(mapCategory("インターペット東京～人とペットの豊かな暮らしフェア～")).toBe(
      "exhibition",
    );
  });
  it("maps week/WEEK trade shows", () => {
    expect(mapCategory("SMART ENERGY WEEK 【春】2026")).toBe("exhibition");
    expect(mapCategory("Japan IT Week 春 2026")).toBe("exhibition");
    expect(mapCategory("EC・店舗 Week 春 2026")).toBe("exhibition");
  });
  it("maps data-eventlabel exhibition", () => {
    expect(mapCategory("exhibition")).toBe("exhibition");
  });

  // --- kids ---
  it("maps data-eventlabel kids", () => {
    expect(mapCategory("kids")).toBe("kids");
  });
  it("maps Japanese kids keywords", () => {
    expect(mapCategory("キッズチャレンジ")).toBe("kids");
    expect(mapCategory("ありあけ乗り物ガーデン")).toBe("kids");
    expect(mapCategory("こども向けイベント")).toBe("kids");
  });

  // --- food ---
  it("maps data-eventlabel food", () => {
    expect(mapCategory("food")).toBe("food");
  });
  it("maps Japanese food keywords", () => {
    expect(mapCategory("フードトラック出店")).toBe("food");
    expect(mapCategory("食材宅配サービス")).toBe("food");
    expect(mapCategory("グルメイベント")).toBe("food"); // グルメ keyword → food
    // Note: "グルメフェスタ" is NOT tested here — フェスタ contains フェス which the music
    // regex matches first. The music regex uses フェス(?!タ) to exclude フェスタ, so
    // グルメフェスタ → "food" is correct, but we use グルメイベント as a cleaner test case.
  });

  // --- fashion ---
  it("maps data-eventlabel fashion", () => {
    expect(mapCategory("fashion")).toBe("fashion");
  });
  it("maps Japanese fashion keywords", () => {
    expect(mapCategory("ファッションワールド春")).toBe("fashion");
    expect(mapCategory("レディースアパレル販売")).toBe("fashion");
  });

  // --- anime ---
  it("maps comic/doll events", () => {
    expect(mapCategory("HARU COMIC CITY 35")).toBe("anime");
    expect(mapCategory("I・Doll VOL.76")).toBe("anime");
  });

  // --- other ---
  it("defaults to other for unclassifiable events", () => {
    expect(mapCategory("キャンペーン")).toBe("other");
    expect(mapCategory("PRイベント")).toBe("other");
    expect(mapCategory(null)).toBe("other");
    expect(mapCategory("")).toBe("other");
  });
});
```

Note: `mapCategory("グルメフェスタ")` → "food" because グルメ matches food BEFORE フェスタ (フェスタ≠フェス). Verify this is correct behavior.

- [ ] **Step 2: Run tests to verify FAIL (expected — we haven't changed the code yet)**

Wait — actually by this point Task 2 is already done. Run to verify PASS:

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
pnpm --filter scraper test test/lib/normalize.test.ts
```
Expected: all PASS

- [ ] **Step 3: Run full test suite**

```bash
pnpm --filter scraper test
```
Expected: all 44+ tests PASS. If ariakeGarden.test.ts fails, check the note below.

> **Note:** If `ariakeGarden.test.ts` `parses known event from fixture` fails with `expected "kids" but got "exhibition"`: the "TOKYOキッズフェスタ" event has data-eventlabel="exhibition" in the fixture, so `mapCategory("exhibition")` should still return "exhibition" (exhibition is checked before kids in our new code). If it unexpectedly returns "kids", update the test expectation to `"kids"` since kids-focused events classified as kids is more accurate.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
git add packages/scraper/src/types.ts packages/scraper/src/lib/normalize.ts packages/scraper/test/lib/normalize.test.ts
git commit -m "feat(scraper): expand category taxonomy with kids/food/fashion/anime

- Add EventCategory union type to types.ts for type safety
- Expand mapCategory: tour/concert→music, league→sports, 展/フェア/week→exhibition
- Add new categories: kids, food, fashion, anime
- Fixes: B.LEAGUE/D.LEAGUE now→sports, TOUR events→music, Tokyo Big Sight trade shows→exhibition"
```

---

## Chunk 2: Validation

### Task 4: Verify category distribution

- [ ] **Step 1: Run full test suite**

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
pnpm --filter scraper test
```
Expected: all tests PASS

- [ ] **Step 2: Check current events.json category distribution**

The existing `events.json` was scraped with the old `mapCategory`. Re-running the scraper will regenerate it with new categories. But we can first simulate by checking which events would be reclassified:

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('packages/web/public/events.json', 'utf8'));
const counts = {};
for (const e of data) counts[e.category] = (counts[e.category] || 0) + 1;
console.log('Current distribution:', JSON.stringify(counts, null, 2));
"
```

Expected output shows old distribution (before re-scrape):
```
music: 60, exhibition: 35, sports: 5, other: 73
```

- [ ] **Step 3: Run scraper to regenerate events.json**

> ⚠ Playwright required. Takes ~5 minutes.

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
pnpm --filter scraper start
```

- [ ] **Step 4: Verify new category distribution**

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('packages/web/public/events.json', 'utf8'));
const counts = {};
for (const e of data) counts[e.category] = (counts[e.category] || 0) + 1;
console.log('New distribution:', JSON.stringify(counts, null, 2));
console.log('Total other:', counts['other'] || 0);
"
```

Expected: other ≤ 20 (target: ≤ 15).

If `other > 20`, examine remaining events:
```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('packages/web/public/events.json', 'utf8'));
const others = data.filter(e => e.category === 'other');
const byFacility = {};
for (const e of others) {
  if (!byFacility[e.facility]) byFacility[e.facility] = [];
  byFacility[e.facility].push(e.eventName);
}
for (const [f, events] of Object.entries(byFacility)) {
  console.log(f + ' (' + events.length + '):', events.join(', '));
}
"
```

Then add missing keywords to `mapCategory` as needed and re-run.

- [ ] **Step 5: Commit events.json and PROGRESS.md update**

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
git add packages/web/public/events.json
git commit -m "chore: regenerate events.json with expanded category classification"
```

Update `PROGRESS.md`:
- current: `Phase 2 / M2` (or M3 if count is ≤ 20 and CI confirms)
- completed: Phase 2 M1 + M2

---

### Task 5: CI confirmation (M3)

- [ ] **Step 1: Push to GitHub and confirm CI passes**

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
git push
```

Monitor: https://github.com/KANNOHI1/ariake-events/actions

Expected: tests pass, scraper runs successfully, events.json committed with new category distribution shown in GitHub Actions Summary.

- [ ] **Step 2: Update PROGRESS.md to Phase 3**

```
Current: Phase 3 / M1 — 未着手
Completed: Phase 1 (done), Phase 2 M1/M2/M3 (done)
Next: Phase 3 M1 — Next.js セットアップ + events.json 読み込み
```

```bash
git add PROGRESS.md
git commit -m "docs: Phase 2 complete, advance to Phase 3"
```

---

## Category Decision Reference

| Input pattern | Category | Example |
|---|---|---|
| ライブ/コンサート/concert/tour | music | "Da-iCE ARENA TOUR 2026", "Seiko Matsuda Concert Tour" |
| league/リーグ/rizin | sports | "B.LEAGUE 第25節", "D.LEAGUE ROUND6", "RIZIN.52" |
| 展示/展覧/expo/exhibition/展/フェア/week | exhibition | "二次電池展", "インターペットフェア", "Japan IT Week" |
| kids/キッズ/こども/子ども/乗り物 | kids | "kids" (label), "トミカ キッズチャレンジ", "乗り物ガーデン" |
| food/フード/食材/グルメ | food | "food" (label), "フードトラック出店", "食材宅配Oisix" |
| fashion/ファッション/アパレル | fashion | "fashion" (label), "FaW TOKYO ファッションワールド", "アパレル販売" |
| comic/doll | anime | "HARU COMIC CITY 35", "I・Doll VOL.76" |
| (none of above) | other | "PRイベント", "キャンペーン", "Private" |

**Priority order:** music > sports > exhibition > kids > food > fashion > anime > other

**Note on フェス vs フェスタ:** Music regex uses `フェス(?!タ)` to exclude フェスタ. So `グルメフェスタ` → food ✓, `音楽フェス` → music ✓
**Note on 展 rule:** `/展/` is broad but safe for these specific venues. All Tokyo Big Sight events ending in 展 are trade shows.
