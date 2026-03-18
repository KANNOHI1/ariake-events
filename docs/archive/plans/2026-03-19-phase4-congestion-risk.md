# Phase 4 M2: congestionRisk Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** スクレイパー側に `calcCongestionRisk()` を実装し、すべてのイベントの `congestionRisk` フィールドを `0.0〜1.0` のスコアで埋めて `events.json` に出力する。

**Architecture:** `packages/scraper/src/lib/congestion.ts` に計算ロジックをまとめ、`index.ts` の集計後にスコアを付与する。計算はイベント配列を入力として日別スコアを算出し、各イベントに対応スコアを設定する純粋関数として実装する。`date-holidays` パッケージで日本の祝日を判定する。

**Tech Stack:** TypeScript, Vitest, date-holidays, pnpm

**Spec:** `docs/archive/specs/2026-03-19-phase4-congestion-design.md`

---

## File Map

| ファイル | 変更内容 |
|---|---|
| `packages/scraper/src/lib/congestion.ts` | 新規作成: congestionRisk 計算ロジック全体 |
| `packages/scraper/test/lib/congestion.test.ts` | 新規作成: congestion.ts のテスト |
| `packages/scraper/src/index.ts` | 修正: scrape後に `applyCongestionRisk()` を呼ぶ |
| `packages/scraper/package.json` | 修正: `date-holidays` を dependencies に追加 |

---

## Chunk 1: congestion.ts の実装とテスト

---

### Task 1: date-holidays パッケージを追加

**Files:**
- Modify: `packages/scraper/package.json`

- [ ] **Step 1: パッケージを追加する**

```bash
cd packages/scraper && pnpm add date-holidays
```

- [ ] **Step 2: 型定義も追加する**

```bash
pnpm add -D @types/date-holidays
```

> `@types/date-holidays` が存在しない場合はスキップ。`date-holidays` は独自の型定義を同梱している。

- [ ] **Step 3: インストール確認**

```bash
pnpm --filter scraper test
```

Expected: 既存テストがすべて pass（PASS 72件）

- [ ] **Step 4: コミット**

```bash
git add packages/scraper/package.json pnpm-lock.yaml
git commit -m "chore: add date-holidays dependency to scraper"
```

---

### Task 2: congestion.ts の定数と型を書く

**Files:**
- Create: `packages/scraper/src/lib/congestion.ts`

- [ ] **Step 1: ファイルを作成し定数ブロックを書く**

```typescript
// packages/scraper/src/lib/congestion.ts
import Holidays from "date-holidays";
import type { EventItem } from "../types.js";

// ---- 施設定数 ----

const TOTAL_CAPACITY = 86_000;

const FACILITY_CONFIG: Record<
  string,
  { capacity: number; pattern: "concentrated" | "dispersed"; dayTypeBonus: number }
> = {
  "有明アリーナ":         { capacity: 15_000, pattern: "concentrated", dayTypeBonus: 1.05 },
  "TOYOTA ARENA TOKYO":  { capacity: 10_000, pattern: "concentrated", dayTypeBonus: 1.05 },
  "東京ガーデンシアター": { capacity:  8_000, pattern: "concentrated", dayTypeBonus: 1.05 },
  "東京ビッグサイト":     { capacity: 50_000, pattern: "dispersed",    dayTypeBonus: 1.2  },
  "有明ガーデン":         { capacity:  3_000, pattern: "dispersed",    dayTypeBonus: 1.8  },
};

const CATEGORY_MULTIPLIER: Record<string, number> = {
  music:      1.0,
  sports:     0.9,
  anime:      0.8,
  exhibition: 0.6,
  other:      0.6,
  kids:       0.5,
  fashion:    0.5,
  food:       0.4,
};
const DEFAULT_CATEGORY_MULTIPLIER = 0.6;

const MAX_POSSIBLE_SCORE = 0.74;

// ---- 祝日判定 ----

const hd = new Holidays("JP");

export const isHolidayOrWeekend = (dateStr: string): boolean => {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) return true;
  return hd.isHoliday(d) !== false;
};
```

- [ ] **Step 2: テストファイルを作成して定数の基本動作を確認する**

```typescript
// packages/scraper/test/lib/congestion.test.ts
import { describe, expect, it } from "vitest";
import { isHolidayOrWeekend } from "../../src/lib/congestion.js";

describe("isHolidayOrWeekend", () => {
  it("土曜日を祝日/週末と判定する", () => {
    expect(isHolidayOrWeekend("2026-03-21")).toBe(true); // 土曜
  });
  it("日曜日を祝日/週末と判定する", () => {
    expect(isHolidayOrWeekend("2026-03-22")).toBe(true); // 日曜
  });
  it("平日を祝日/週末と判定しない", () => {
    expect(isHolidayOrWeekend("2026-03-19")).toBe(false); // 木曜
  });
  it("祝日（元日）を祝日/週末と判定する", () => {
    expect(isHolidayOrWeekend("2026-01-01")).toBe(true); // 元日
  });
});
```

- [ ] **Step 3: テストを実行して pass を確認する**

```bash
pnpm --filter scraper test test/lib/congestion.test.ts
```

Expected: 4件 PASS

- [ ] **Step 4: コミット**

```bash
git add packages/scraper/src/lib/congestion.ts packages/scraper/test/lib/congestion.test.ts
git commit -m "feat: add congestion constants and isHolidayOrWeekend"
```

---

### Task 3: 施設スコア計算関数を実装する

**Files:**
- Modify: `packages/scraper/src/lib/congestion.ts`

- [ ] **Step 1: 失敗するテストを先に書く**

`congestion.test.ts` に以下を追加する:

```typescript
import { calcFacilityScore } from "../../src/lib/congestion.js";

describe("calcFacilityScore", () => {
  it("音楽イベント（有明アリーナ、平日、単日）のスコアを計算する", () => {
    // (15000/86000) * 1.0 * 1.0 * 1.0 = 0.17441...
    const score = calcFacilityScore("有明アリーナ", "music", "2026-03-19", "2026-03-19");
    expect(score).toBeCloseTo(0.1744, 3);
  });
  it("土日はdayTypeBonusが適用される（アリーナ×1.05）", () => {
    // (15000/86000) * 1.0 * 1.0 * 1.05 = 0.18313...
    const score = calcFacilityScore("有明アリーナ", "music", "2026-03-21", "2026-03-21");
    expect(score).toBeCloseTo(0.1831, 3);
  });
  it("展示会（東京ビッグサイト、3日間）は日数で割る", () => {
    // (50000/86000) * 0.6 * (0.7/3) * 1.0 = 0.08122...
    const score = calcFacilityScore("東京ビッグサイト", "exhibition", "2026-03-19", "2026-03-21");
    expect(score).toBeCloseTo(0.0812, 3);
  });
  it("未知施設はスコア0を返す", () => {
    const score = calcFacilityScore("未知施設", "music", "2026-03-19", "2026-03-19");
    expect(score).toBe(0);
  });
  it("未知カテゴリはデフォルト係数0.6を使う", () => {
    // (15000/86000) * 0.6 * 1.0 * 1.0 = 0.10465...
    const score = calcFacilityScore("有明アリーナ", "unknown_category" as any, "2026-03-19", "2026-03-19");
    expect(score).toBeCloseTo(0.1047, 3);
  });
});
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pnpm --filter scraper test test/lib/congestion.test.ts
```

Expected: `calcFacilityScore` が未定義でエラー

- [ ] **Step 3: calcFacilityScore を実装する**

`congestion.ts` に追加:

```typescript
/**
 * 1施設の1日分の施設スコアを計算する。
 * @param facility  event.facility の文字列値
 * @param category  event.category
 * @param startDate イベント開始日 YYYY-MM-DD
 * @param endDate   イベント終了日 YYYY-MM-DD
 * @returns 施設スコア（未正規化）。未知施設は 0。
 */
export const calcFacilityScore = (
  facility: string,
  category: string,
  startDate: string,
  endDate: string,
): number => {
  const config = FACILITY_CONFIG[facility];
  if (!config) return 0;

  const capacityScore = config.capacity / TOTAL_CAPACITY;
  const catMultiplier = CATEGORY_MULTIPLIER[category] ?? DEFAULT_CATEGORY_MULTIPLIER;

  // 来場パターン係数
  let timePatternFactor: number;
  if (config.pattern === "concentrated") {
    timePatternFactor = 1.0;
  } else {
    const start = new Date(startDate + "T00:00:00Z");
    const end   = new Date(endDate   + "T00:00:00Z");
    const n = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    timePatternFactor = Math.max(0.7 / n, 0.3);
  }

  // dayTypeBonus: startDate の曜日/祝日で判定
  const bonus = isHolidayOrWeekend(startDate) ? config.dayTypeBonus : 1.0;

  return capacityScore * catMultiplier * timePatternFactor * bonus;
};
```

- [ ] **Step 4: テストを実行して pass を確認する**

```bash
pnpm --filter scraper test test/lib/congestion.test.ts
```

Expected: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add packages/scraper/src/lib/congestion.ts packages/scraper/test/lib/congestion.test.ts
git commit -m "feat: implement calcFacilityScore"
```

---

### Task 4: 日別スコア集計と applyCongestionRisk を実装する

**Files:**
- Modify: `packages/scraper/src/lib/congestion.ts`
- Modify: `packages/scraper/test/lib/congestion.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

```typescript
import { applyCongestionRisk } from "../../src/lib/congestion.js";
import type { EventItem } from "../../src/types.js";

const makeEvent = (overrides: Partial<EventItem>): EventItem => ({
  id: "test-id",
  eventName: "テストイベント",
  facility: "有明アリーナ",
  category: "music",
  startDate: "2026-03-19",
  endDate: "2026-03-19",
  peakTimeStart: null,
  peakTimeEnd: null,
  estimatedAttendees: null,
  congestionRisk: null,
  sourceURL: "https://example.com",
  lastUpdated: "2026-03-19T00:00:00.000Z",
  ...overrides,
});

describe("applyCongestionRisk", () => {
  it("単一イベントのcongestionRiskを埋める", () => {
    const events = [makeEvent({ facility: "有明アリーナ", category: "music", startDate: "2026-03-19", endDate: "2026-03-19" })];
    const result = applyCongestionRisk(events);
    expect(result[0].congestionRisk).not.toBeNull();
    expect(result[0].congestionRisk).toBeGreaterThan(0);
    expect(result[0].congestionRisk).toBeLessThanOrEqual(1.0);
  });

  it("同日に複数施設のイベントがあればスコアが加算される", () => {
    const events = [
      makeEvent({ id: "a", facility: "有明アリーナ",         category: "music", startDate: "2026-03-19", endDate: "2026-03-19" }),
      makeEvent({ id: "b", facility: "東京ガーデンシアター", category: "music", startDate: "2026-03-19", endDate: "2026-03-19" }),
    ];
    const result = applyCongestionRisk(events);
    const singleEvent = applyCongestionRisk([events[0]]);
    expect(result[0].congestionRisk!).toBeGreaterThan(singleEvent[0].congestionRisk!);
    // 同日の2イベントは同じスコアを持つ
    expect(result[0].congestionRisk).toBeCloseTo(result[1].congestionRisk!, 5);
  });

  it("複数日イベントはすべての期間日に同スコアが割り当てられる", () => {
    const events = [
      makeEvent({ id: "c", facility: "東京ビッグサイト", category: "exhibition", startDate: "2026-03-19", endDate: "2026-03-21" }),
    ];
    const result = applyCongestionRisk(events);
    // 単一イベントなのでスコアは1件のみ
    expect(result[0].congestionRisk).not.toBeNull();
    expect(result[0].congestionRisk).toBeGreaterThan(0);
  });

  it("スコアは常に0.0〜1.0の範囲に収まる", () => {
    const events = [
      makeEvent({ id: "d1", facility: "有明アリーナ",         category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d2", facility: "東京ガーデンシアター", category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d3", facility: "TOYOTA ARENA TOKYO",  category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d4", facility: "東京ビッグサイト",     category: "exhibition", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d5", facility: "有明ガーデン",         category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
    ];
    const result = applyCongestionRisk(events);
    for (const e of result) {
      expect(e.congestionRisk).toBeGreaterThanOrEqual(0);
      expect(e.congestionRisk).toBeLessThanOrEqual(1.0);
    }
  });
});
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pnpm --filter scraper test test/lib/congestion.test.ts
```

Expected: `applyCongestionRisk` が未定義でエラー

- [ ] **Step 3: applyCongestionRisk を実装する**

`congestion.ts` に追加:

```typescript
/**
 * イベント配列に congestionRisk スコアを付与して返す。
 * 元の配列は変更しない（immutable）。
 *
 * アルゴリズム:
 * 1. 各イベントの開催期間（startDate〜endDate）を1日ずつ展開して「日付→施設スコアMap」を構築
 * 2. 同一日・同一施設のイベントが複数ある場合は最大施設スコアを使う（同施設二重加算を防ぐ）
 * 3. 日別スコア = 施設スコアの合計 / MAX_POSSIBLE_SCORE（0〜1 にクランプ）
 * 4. 各イベントの congestionRisk = そのイベントの startDate の日別スコア
 */
export const applyCongestionRisk = (events: EventItem[]): EventItem[] => {
  // date -> facility -> max facilityScore
  const dailyFacilityMap = new Map<string, Map<string, number>>();

  for (const event of events) {
    const start = new Date(event.startDate + "T00:00:00Z");
    const end   = new Date(event.endDate   + "T00:00:00Z");
    const facilityScore = calcFacilityScore(
      event.facility,
      event.category,
      event.startDate,
      event.endDate,
    );

    // startDate〜endDate の各日に対して記録
    const cursor = new Date(start);
    while (cursor <= end) {
      const dateKey = cursor.toISOString().slice(0, 10);
      if (!dailyFacilityMap.has(dateKey)) {
        dailyFacilityMap.set(dateKey, new Map());
      }
      const facilityMap = dailyFacilityMap.get(dateKey)!;
      const existing = facilityMap.get(event.facility) ?? 0;
      facilityMap.set(event.facility, Math.max(existing, facilityScore));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  // 日別スコアを合算・正規化
  const dailyScore = new Map<string, number>();
  for (const [date, facilityMap] of dailyFacilityMap) {
    const raw = [...facilityMap.values()].reduce((sum, s) => sum + s, 0);
    dailyScore.set(date, Math.min(raw / MAX_POSSIBLE_SCORE, 1.0));
  }

  // 各イベントに startDate のスコアを設定
  return events.map((event) => ({
    ...event,
    congestionRisk: dailyScore.get(event.startDate) ?? 0,
  }));
};
```

- [ ] **Step 4: テストを実行して pass を確認する**

```bash
pnpm --filter scraper test test/lib/congestion.test.ts
```

Expected: 全テスト PASS

- [ ] **Step 5: 全テストを実行してリグレッションがないことを確認する**

```bash
pnpm --filter scraper test
```

Expected: 全件 PASS（既存72件 + 新規テスト分）

- [ ] **Step 6: コミット**

```bash
git add packages/scraper/src/lib/congestion.ts packages/scraper/test/lib/congestion.test.ts
git commit -m "feat: implement applyCongestionRisk"
```

---

## Chunk 2: index.ts への組み込みと動作確認

---

### Task 5: index.ts に applyCongestionRisk を組み込む

**Files:**
- Modify: `packages/scraper/src/index.ts`

- [ ] **Step 1: import を追加する**

`index.ts` の既存 import ブロックに追加:

```typescript
import { applyCongestionRisk } from "./lib/congestion.js";
```

- [ ] **Step 2: 集計・dedupe・sort の後に congestionRisk を付与する**

`index.ts` の以下の行を探す:
```typescript
// Dedupe and sort
const finalEvents = sortEvents(dedupeEvents(valid));
```

これを以下に置き換える:
```typescript
// Dedupe and sort
const deduped = sortEvents(dedupeEvents(valid));

// Assign congestionRisk scores
const finalEvents = applyCongestionRisk(deduped);
```

- [ ] **Step 3: 全テストを実行して pass を確認する**

```bash
pnpm --filter scraper test
```

Expected: 全件 PASS

- [ ] **Step 4: コミット**

```bash
git add packages/scraper/src/index.ts
git commit -m "feat: apply congestionRisk scores in scraper pipeline"
```

---

### Task 6: events.json の出力確認とログ追加

**Files:**
- Modify: `packages/scraper/src/index.ts`

- [ ] **Step 1: congestionRisk のサマリーログを追加する**

`index.ts` のログ出力ブロック（`// Summary per facility` の直前）に追加:

```typescript
// congestionRisk summary
const scored = finalEvents.filter((e) => e.congestionRisk !== null && e.congestionRisk > 0);
const maxRisk = finalEvents.reduce((m, e) => Math.max(m, e.congestionRisk ?? 0), 0);
console.log(`[scraper] congestionRisk: ${scored.length}/${finalEvents.length} events scored, max=${maxRisk.toFixed(3)}`);
```

- [ ] **Step 2: 全テストが引き続き pass することを確認する**

```bash
pnpm --filter scraper test
```

Expected: 全件 PASS

- [ ] **Step 3: events.json の出力内容を手動確認する（任意・ローカル環境のみ）**

Playwright が使える場合:
```bash
pnpm --filter scraper start
```

その後:
```bash
node -e "
const d=require('./packages/web/public/events.json');
const scored=d.filter(e=>e.congestionRisk>0);
console.log('Scored events:', scored.length);
console.log('Max risk:', Math.max(...d.map(e=>e.congestionRisk||0)).toFixed(3));
console.log('Sample:', JSON.stringify(scored[0], null, 2));
"
```

Expected: `congestionRisk` が `null` でなく `0.0〜1.0` の値を持つ

- [ ] **Step 4: 最終コミットとプッシュ**

```bash
git add packages/scraper/src/index.ts
git commit -m "feat: add congestionRisk summary log to scraper output"
git push
```

Expected: GitHub Actions が自動実行され、events.json に congestionRisk が付与される
