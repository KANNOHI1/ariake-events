# Phase 4 M3補完 + M4（過去データ蓄積）実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CalendarView モーダル内に混雑度バッジを追加し（M3補完）、日次の混雑度スコアを `congestion-scores.json` に蓄積する仕組みを構築する（M4）。

**Architecture:**
- M3補完: CalendarView モーダル内イベント行に `getCongestionInfo()` バッジを追加（EventCard と同パターン）
- M4: `congestion.ts` に `getDailyScores()` を追加、`index.ts` で履歴 JSON に追記、`scrape.yml` でコミット対象に含める
- 履歴 JSON 形式: `{ "YYYY-MM-DD": 0.xx, ... }` を `packages/web/public/history/congestion-scores.json` に蓄積（90日間保持）

**Tech Stack:** TypeScript, React, Next.js, Vitest, GitHub Actions

---

## Task 1: CalendarView モーダル内バッジ追加

**Files:**
- Modify: `packages/web/src/components/CalendarView.tsx:238-261`（モーダル内イベント行）
- Modify: `packages/web/src/components/CalendarView.test.tsx`（テスト追加）

### Step 1: テストを先に追加（失敗を確認）

`packages/web/src/components/CalendarView.test.tsx` の末尾（`})` の直前）に追加:

```tsx
  it('モーダル内のイベントに混雑度バッジが表示される', () => {
    const events = [
      makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: 0.5 }),
    ]
    render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    // 2026-03-18 のセルをクリックしてモーダルを開く
    const cell = document.querySelector('[data-date="2026-03-18"]')
    expect(cell).not.toBeNull()
    fireEvent.click(cell!)
    // モーダル内に「やや混雑」バッジが表示される
    expect(screen.getByText('やや混雑')).toBeInTheDocument()
  })

  it('congestionRisk が null のイベントはモーダル内にバッジが表示されない', () => {
    const events = [
      makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: null }),
    ]
    render(<CalendarView events={events} onResetFilters={vi.fn()} />)
    const cell = document.querySelector('[data-date="2026-03-18"]')
    fireEvent.click(cell!)
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
  })
```

- [ ] テスト追加
- [ ] 実行: `pnpm --filter web test CalendarView` → FAIL（`data-date` 属性なし + バッジ未実装）

### Step 2: CalendarView.tsx にモーダルバッジと data-date 属性を追加

**a) カレンダーセルに `data-date` 属性を追加**

CalendarView.tsx のカレンダーセル（`onClick={() => setSelectedDate(dateStr)}` がある div）を探して `data-date={dateStr}` を追加する。

現在:
```tsx
<div
  key={dateStr}
  className={...}
  onClick={() => setSelectedDate(dateStr)}
>
```

変更後:
```tsx
<div
  key={dateStr}
  data-date={dateStr}
  className={...}
  onClick={() => setSelectedDate(dateStr)}
>
```

**b) モーダル内イベント行にバッジを追加**

`packages/web/src/components/CalendarView.tsx` の行 240-246（`<div className="flex flex-wrap gap-1.5 mb-1.5">` 内）:

```tsx
<div className="flex flex-wrap gap-1.5 mb-1.5">
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FACILITY_COLORS[e.facility] ?? 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
    {e.facility}
  </span>
  <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${CATEGORY_DOT_COLORS[e.category] ? `bg-slate-100 text-slate-700` : 'bg-slate-100 text-slate-600'}`}>
    {CATEGORY_LABELS[e.category] ?? e.category}
  </span>
</div>
```

↓ バッジ追加後:

```tsx
<div className="flex flex-wrap gap-1.5 mb-1.5">
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FACILITY_COLORS[e.facility] ?? 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
    {e.facility}
  </span>
  <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${CATEGORY_DOT_COLORS[e.category] ? `bg-slate-100 text-slate-700` : 'bg-slate-100 text-slate-600'}`}>
    {CATEGORY_LABELS[e.category] ?? e.category}
  </span>
  {(() => {
    const info = getCongestionInfo(e.congestionRisk)
    return info ? (
      <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${info.badgeClass}`}>
        {info.label}
      </span>
    ) : null
  })()}
</div>
```

`getCongestionInfo` は行 3 に既にインポート済みなので追加不要。

- [ ] `data-date` 属性追加
- [ ] バッジ JSX 追加
- [ ] 実行: `pnpm --filter web test CalendarView` → PASS

### Step 3: 全 web テスト実行

- [ ] `pnpm --filter web test` → 全テスト PASS

### Step 4: コミット

```bash
git add packages/web/src/components/CalendarView.tsx packages/web/src/components/CalendarView.test.tsx
git commit -m "feat: add congestion badge to CalendarView modal"
```

---

## Task 2: congestion.ts に getDailyScores() を追加

**Files:**
- Modify: `packages/scraper/src/lib/congestion.ts`
- Modify: `packages/scraper/test/lib/congestion.test.ts`

**背景:** `applyCongestionRisk` 内の `dailyFacilityMap` と `dailyScore` 計算ロジックを内部ヘルパーに切り出し、`getDailyScores()` として公開する。DRY 原則: 重複なし。

### Step 1: テストを追加（失敗を確認）

`packages/scraper/test/lib/congestion.test.ts` に追加（`applyCongestionRisk` の describe ブロックの後）:

```typescript
describe("getDailyScores", () => {
  it("イベントのある日の日別スコアを返す", () => {
    const events: EventItem[] = [
      makeEvent({
        facility: "有明アリーナ",
        category: "music",
        startDate: "2026-03-19",
        endDate: "2026-03-19",
      }),
    ]
    const scores = getDailyScores(events)
    expect(scores["2026-03-19"]).toBeGreaterThan(0)
    expect(scores["2026-03-19"]).toBeLessThanOrEqual(1)
  })

  it("イベントがない日のキーは含まれない", () => {
    const events: EventItem[] = [
      makeEvent({ startDate: "2026-03-19", endDate: "2026-03-19" }),
    ]
    const scores = getDailyScores(events)
    expect(scores["2026-03-20"]).toBeUndefined()
  })

  it("applyCongestionRisk と同じスコアを返す", () => {
    const events: EventItem[] = [
      makeEvent({ startDate: "2026-03-19", endDate: "2026-03-19" }),
    ]
    const withRisk = applyCongestionRisk(events)
    const scores = getDailyScores(events)
    expect(scores["2026-03-19"]).toBeCloseTo(withRisk[0].congestionRisk ?? 0, 5)
  })

  it("空配列は空オブジェクトを返す", () => {
    expect(getDailyScores([])).toEqual({})
  })
})
```

import に `getDailyScores` を追加:
```typescript
import { isHolidayOrWeekend, calcFacilityScore, applyCongestionRisk, getDailyScores } from "../../src/lib/congestion.js";
```

- [ ] テスト追加
- [ ] 実行: `pnpm --filter scraper test congestion` → FAIL（`getDailyScores` 未定義）

### Step 2: congestion.ts をリファクタリング

`packages/scraper/src/lib/congestion.ts` の `applyCongestionRisk` を以下のように書き換える:

```typescript
// ---- 内部ヘルパー ----

/** date -> facility -> max facilityScore のマップを構築 */
const buildDailyFacilityMap = (events: EventItem[]): Map<string, Map<string, number>> => {
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
  return dailyFacilityMap;
};

/** dailyFacilityMap を正規化して date -> score (0~1) の Map を返す */
const normalizeDailyScores = (dailyFacilityMap: Map<string, Map<string, number>>): Map<string, number> => {
  const dailyScore = new Map<string, number>();
  for (const [date, facilityMap] of dailyFacilityMap) {
    const raw = [...facilityMap.values()].reduce((sum, s) => sum + s, 0);
    dailyScore.set(date, Math.min(raw / MAX_POSSIBLE_SCORE, 1.0));
  }
  return dailyScore;
};

// ---- 公開 API ----

export const applyCongestionRisk = (events: EventItem[]): EventItem[] => {
  const dailyScore = normalizeDailyScores(buildDailyFacilityMap(events));
  return events.map((event) => ({
    ...event,
    congestionRisk: dailyScore.get(event.startDate) ?? 0,
  }));
};

/**
 * イベント配列から日別の混雑度スコアを返す。
 * @returns { "YYYY-MM-DD": 0.0~1.0, ... }
 */
export const getDailyScores = (events: EventItem[]): Record<string, number> => {
  return Object.fromEntries(normalizeDailyScores(buildDailyFacilityMap(events)));
};
```

- [ ] congestion.ts をリファクタリング（旧 `buildDailyFacilityMap` の内容を抽出、`applyCongestionRisk` を薄くする、`getDailyScores` を追加）
- [ ] 実行: `pnpm --filter scraper test congestion` → 全テスト PASS

### Step 3: 全スクレイパーテスト実行

- [ ] `pnpm --filter scraper test` → 全テスト PASS

### Step 4: コミット

```bash
git add packages/scraper/src/lib/congestion.ts packages/scraper/test/lib/congestion.test.ts
git commit -m "feat: add getDailyScores() to congestion.ts"
```

---

## Task 3: index.ts — 履歴 JSON 書き出し

**Files:**
- Modify: `packages/scraper/src/index.ts`（OUTPUT_PATH の直後に履歴書き出しを追加）

### Step 1: 実装追加

`packages/scraper/src/index.ts` の import に `getDailyScores` を追加:

```typescript
import { applyCongestionRisk, getDailyScores } from "./lib/congestion.js";
```

（`existsSync`, `readFileSync` が未 import であれば追加）

`OUTPUT_PATH` 書き出し処理（現在の行 118-120）の直後に以下を追加:

```typescript
  // 履歴 JSON に今日のスコアを追記（過去 90 日分を保持）
  const HISTORY_PATH = path.join(path.dirname(OUTPUT_PATH), "history", "congestion-scores.json");
  const todayScores = getDailyScores(finalEvents);
  let history: Record<string, number> = {};
  if (existsSync(HISTORY_PATH)) {
    try {
      history = JSON.parse(readFileSync(HISTORY_PATH, "utf-8"));
    } catch {
      console.warn("[scraper] ⚠ Failed to read history JSON, starting fresh");
    }
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const merged = Object.fromEntries(
    Object.entries({ ...history, ...todayScores })
      .filter(([date]) => date >= cutoffStr)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  writeFileSync(HISTORY_PATH, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`[scraper] Written history (${Object.keys(merged).length} days) to ${HISTORY_PATH}`);
```

- [ ] import に `getDailyScores` を追加、必要なら `existsSync`/`readFileSync` も追加
- [ ] 履歴書き出しブロックを追加
- [ ] ローカル動作確認（`pnpm --filter scraper test` が引き続き PASS すること）

### Step 2: コミット

```bash
git add packages/scraper/src/index.ts
git commit -m "feat: write daily congestion-scores.json history (90-day rolling)"
```

---

## Task 4: scrape.yml — 履歴ファイルをコミット対象に追加

**Files:**
- Modify: `.github/workflows/scrape.yml`

### Step 1: Check for changes ステップを更新

現在:
```yaml
      - name: Check for changes
        id: check_changes
        run: |
          if git diff --exit-code packages/web/public/events.json; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi
```

変更後:
```yaml
      - name: Check for changes
        id: check_changes
        run: |
          changes=$(git status --porcelain packages/web/public/events.json packages/web/public/history/ 2>/dev/null)
          if [ -z "$changes" ]; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi
```

**理由:** `git diff` は未追跡ファイル（初回の history/ 作成）を検知できない。`git status --porcelain` は未追跡ファイルも含めて検知する。

### Step 2: Commit ステップを更新

現在:
```yaml
          git add packages/web/public/events.json
          git commit -m "chore: update events.json [skip ci]"
```

変更後:
```yaml
          git add packages/web/public/events.json packages/web/public/history/
          git commit -m "chore: update events.json and congestion history [skip ci]"
```

- [ ] Check for changes を `git status --porcelain` に変更
- [ ] Commit に `packages/web/public/history/` を追加

### Step 3: コミット

```bash
git add .github/workflows/scrape.yml
git commit -m "ci: include history/congestion-scores.json in daily commit"
```

---

## Task 5: PROGRESS.md・ROADMAP.md 更新 + push

- [ ] `PROGRESS.md` の現在地を「Phase 4 M3補完 + M4 完了」に更新、完了済みに追記
- [ ] `docs/ROADMAP.md` の M3補完・M4 ステータスを `✅ 完了 (2026-03-19)` に更新

```bash
git add PROGRESS.md docs/ROADMAP.md
git commit -m "docs: mark Phase 4 M3-supplement + M4 complete"
git push
```

---

## 最終確認

- [ ] `pnpm --filter web test` → 全テスト PASS（CalendarView 含む）
- [ ] `pnpm --filter scraper test` → 全テスト PASS（getDailyScores 含む）
- [ ] `packages/web/public/history/` が `.gitignore` に入っていないこと確認
- [ ] push 後、次回 CI 実行で `congestion-scores.json` がコミットされること（手動 workflow_dispatch で確認可能）
