# カードの並び順改善 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** カテゴリ優先度（music最優先）と長期開催ペナルティ（4日以上は低優先）を組み合わせたソートロジックを共通関数として抽出し、DayView・MonthView・CalendarView の3ビューに適用する。

**Architecture:** `lib/sortEvents.ts` に純粋関数 `sortEvents()` を新規作成し、各ビューのインラインソートをすべて差し替える。テストはフィクスチャを使わず EventItem オブジェクトを直接構築する単体テスト。

**Tech Stack:** TypeScript, Vitest, Next.js 15 (packages/web)

---

## File Map

| 操作 | ファイル | 内容 |
|---|---|---|
| **新規作成** | `packages/web/src/lib/sortEvents.ts` | CATEGORY_PRIORITY, getDurationDays, eventSortScore, sortEvents |
| **新規作成** | `packages/web/src/lib/sortEvents.test.ts` | 単体テスト |
| **修正** | `packages/web/src/components/DayView.tsx:18-25` | sortByFacility → sortEvents に差し替え |
| **修正** | `packages/web/src/components/MonthView.tsx:41` | startDate sort → sortEvents に差し替え |
| **修正** | `packages/web/src/components/CalendarView.tsx:164` | selectedEvents に sortEvents 適用 |

---

## Chunk 1: sortEvents.ts の作成とテスト

### Task 1: `lib/sortEvents.ts` 新規作成

**Files:**
- Create: `packages/web/src/lib/sortEvents.ts`

- [ ] **Step 1: ファイルを作成する**

```typescript
import type { EventItem, EventCategory } from '../types'

const CATEGORY_PRIORITY: Record<EventCategory, number> = {
  music:      0,
  sports:     1,
  kids:       2,
  anime:      2,
  food:       3,
  fashion:    3,
  exhibition: 4,
  other:      5,
}

const LONG_RUN_DAYS = 4
const LONG_RUN_PENALTY = 10

function getDurationDays(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
}

function eventSortScore(event: EventItem): number {
  const categoryScore = CATEGORY_PRIORITY[event.category] ?? 5
  const durationPenalty =
    getDurationDays(event.startDate, event.endDate) >= LONG_RUN_DAYS
      ? LONG_RUN_PENALTY
      : 0
  return categoryScore + durationPenalty
}

export function sortEvents(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    const scoreDiff = eventSortScore(a) - eventSortScore(b)
    if (scoreDiff !== 0) return scoreDiff
    return a.startDate.localeCompare(b.startDate)
  })
}
```

---

### Task 2: `lib/sortEvents.test.ts` 新規作成とテスト実行

**Files:**
- Create: `packages/web/src/lib/sortEvents.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
import { describe, it, expect } from 'vitest'
import { sortEvents } from './sortEvents'
import type { EventItem } from '../types'

function makeEvent(overrides: Partial<EventItem> & { category: EventItem['category'] }): EventItem {
  return {
    id: 'test-id',
    eventName: 'Test Event',
    facility: '東京ビッグサイト',
    startDate: '2026-04-10',
    endDate: '2026-04-10',
    sourceURL: 'https://example.com',
    lastUpdated: '2026-04-07T00:00:00Z',
    congestionRisk: null,
    imageUrl: null,
    ...overrides,
  }
}

describe('sortEvents', () => {
  it('music は other より前に来る', () => {
    const events = [
      makeEvent({ id: 'b', category: 'other', eventName: 'Other Event' }),
      makeEvent({ id: 'a', category: 'music', eventName: 'Music Event' }),
    ]
    const result = sortEvents(events)
    expect(result[0].category).toBe('music')
    expect(result[1].category).toBe('other')
  })

  it('music は sports より前に来る', () => {
    const events = [
      makeEvent({ id: 'b', category: 'sports' }),
      makeEvent({ id: 'a', category: 'music' }),
    ]
    const result = sortEvents(events)
    expect(result[0].category).toBe('music')
  })

  it('4日以上開催のイベントは同カテゴリの短期イベントより後に来る', () => {
    const events = [
      makeEvent({ id: 'long', category: 'music', startDate: '2026-04-10', endDate: '2026-04-13' }), // 4日
      makeEvent({ id: 'short', category: 'music', startDate: '2026-04-10', endDate: '2026-04-10' }), // 1日
    ]
    const result = sortEvents(events)
    expect(result[0].id).toBe('short')
    expect(result[1].id).toBe('long')
  })

  it('3日開催はペナルティなし（4日未満）', () => {
    const events = [
      makeEvent({ id: 'three', category: 'other', startDate: '2026-04-10', endDate: '2026-04-12' }), // 3日
      makeEvent({ id: 'music', category: 'music', startDate: '2026-04-10', endDate: '2026-04-10' }),
    ]
    const result = sortEvents(events)
    expect(result[0].category).toBe('music')
  })

  it('スコアが同じ場合は startDate 昇順になる', () => {
    const events = [
      makeEvent({ id: 'later', category: 'sports', startDate: '2026-04-15', endDate: '2026-04-15' }),
      makeEvent({ id: 'earlier', category: 'sports', startDate: '2026-04-10', endDate: '2026-04-10' }),
    ]
    const result = sortEvents(events)
    expect(result[0].id).toBe('earlier')
  })

  it('元の配列を変更しない（immutable）', () => {
    const events = [
      makeEvent({ id: 'b', category: 'other' }),
      makeEvent({ id: 'a', category: 'music' }),
    ]
    const original = [...events]
    sortEvents(events)
    expect(events[0].id).toBe(original[0].id)
  })

  it('空配列を渡すと空配列を返す', () => {
    expect(sortEvents([])).toEqual([])
  })
})
```

- [ ] **Step 2: テストを実行してすべて PASS することを確認**

```bash
pnpm --filter web test -- --reporter=verbose src/lib/sortEvents.test.ts
```

Expected: 7 tests PASS

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/lib/sortEvents.ts packages/web/src/lib/sortEvents.test.ts
git commit -m "feat(web): add sortEvents utility with category priority and long-run penalty"
```

---

## Chunk 2: 各ビューへの適用

### Task 3: DayView.tsx を修正

**Files:**
- Modify: `packages/web/src/components/DayView.tsx`

現在の状態（`DayView.tsx:1-25`）:
```typescript
// 既存の不要なコード（削除対象）
const FACILITY_ORDER = Object.fromEntries(FACILITIES.map((f, i) => [f, i]))

function sortByFacility(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    const fa = FACILITY_ORDER[a.facility] ?? 999
    const fb = FACILITY_ORDER[b.facility] ?? 999
    if (fa !== fb) return fa - fb
    return a.eventName.localeCompare(b.eventName, 'ja')
  })
}
```

- [ ] **Step 1: import に sortEvents を追加し、sortByFacility と FACILITY_ORDER を削除して差し替える**

ファイル先頭の import 群に追加:
```typescript
import { sortEvents } from '../lib/sortEvents'
```

`FACILITY_ORDER` 定数と `sortByFacility` 関数（14〜25行目）を**丸ごと削除**する。

`sortByFacility(` を `sortEvents(` に置き換える（DayView 内で1箇所）。

また、`FACILITIES` の import が不要になる場合は削除する（他で使っていなければ）。

- [ ] **Step 2: テストを実行**

```bash
pnpm --filter web test -- --reporter=verbose src/components/DayView.test.tsx
```

Expected: PASS（既存テストが壊れていないこと）

---

### Task 4: MonthView.tsx を修正

**Files:**
- Modify: `packages/web/src/components/MonthView.tsx`

現在の状態（MonthView.tsx 約41行目）:
```typescript
const monthEvents = events
  .filter(e => e.startDate <= monthEnd && e.endDate >= monthStart)
  .sort((a, b) => a.startDate.localeCompare(b.startDate))
```

- [ ] **Step 1: import に sortEvents を追加し、sort 句を差し替える**

ファイル先頭の import 群に追加:
```typescript
import { sortEvents } from '../lib/sortEvents'
```

該当箇所を以下に書き換える:
```typescript
const monthEvents = sortEvents(
  events.filter(e => e.startDate <= monthEnd && e.endDate >= monthStart)
)
```

- [ ] **Step 2: テストを実行**

```bash
pnpm --filter web test -- --reporter=verbose src/components/MonthView.test.tsx
```

Expected: PASS

---

### Task 5: CalendarView.tsx を修正

**Files:**
- Modify: `packages/web/src/components/CalendarView.tsx`

現在の状態（CalendarView.tsx 約164行目）:
```typescript
const selectedEvents = selectedDate ? getEventsForDate(events, selectedDate) : []
```

`getEventsForDate` は `events.filter(e => e.startDate <= dateStr && e.endDate >= dateStr)` を返すだけでソートなし。

- [ ] **Step 1: import に sortEvents を追加し、selectedEvents にソートを適用する**

ファイル先頭の import 群に追加:
```typescript
import { sortEvents } from '../lib/sortEvents'
```

該当箇所を以下に書き換える:
```typescript
const selectedEvents = selectedDate ? sortEvents(getEventsForDate(events, selectedDate)) : []
```

- [ ] **Step 2: テストを実行**

```bash
pnpm --filter web test -- --reporter=verbose src/components/CalendarView.test.tsx
```

Expected: PASS

---

### Task 6: 全テスト実行・コミット・push

- [ ] **Step 1: 全テストを実行**

```bash
pnpm --filter web test
```

Expected: 17スイート、143テスト以上すべて PASS（sortEvents の7テスト追加で150+）

- [ ] **Step 2: コミット**

```bash
git add packages/web/src/components/DayView.tsx packages/web/src/components/MonthView.tsx packages/web/src/components/CalendarView.tsx
git commit -m "feat(web): apply sortEvents to DayView, MonthView, CalendarView"
```

- [ ] **Step 3: push**

```bash
git push
```

- [ ] **Step 4: PROGRESS.md を更新してコミット**

`PROGRESS.md` の「次にやること」から「カードの並び順改善」を削除し、「完了済み」に追記する。

```bash
git add PROGRESS.md
git commit -m "docs: mark card sort improvement as complete"
git push
```

---

## 完了条件チェックリスト

- [ ] `pnpm --filter web test` 全 PASS
- [ ] sortEvents.test.ts に7件以上のテスト
- [ ] DayView / MonthView / CalendarView で sortByFacility / 旧ソートが完全除去されている
- [ ] music イベントが先頭、4日以上開催が同カテゴリの末尾になっていること（目視確認）
- [ ] PROGRESS.md 更新・push 済み
