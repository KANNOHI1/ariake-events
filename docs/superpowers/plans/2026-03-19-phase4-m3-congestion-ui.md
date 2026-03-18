# Phase 4 M3: congestionRisk UI Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** EventCard に混雑度バッジ、CalendarView の各日セルに混雑度カラーバーを表示する。

**Architecture:** `colorMap.ts` に `getCongestionInfo()` 純粋関数を追加して色・ラベルを一元管理し、EventCard と CalendarView がそれぞれ参照する。型修正（`congestionRisk?: null` → `number | null`）も行う。

**Tech Stack:** TypeScript, React, Tailwind CSS, Vitest, @testing-library/react

**Spec:** `docs/archive/specs/2026-03-19-phase4-congestion-design.md`（UIマッピング セクション参照）

---

## File Map

| ファイル | 変更内容 |
|---|---|
| `packages/web/src/types.ts` | 修正: `congestionRisk?: null` → `congestionRisk?: number \| null` |
| `packages/web/src/lib/colorMap.ts` | 追加: `CongestionInfo` interface + `getCongestionInfo()` |
| `packages/web/src/lib/colorMap.test.ts` | 新規作成: getCongestionInfo テスト |
| `packages/web/src/components/EventCard.tsx` | 修正: 混雑度バッジ追加 |
| `packages/web/src/components/EventCard.test.tsx` | 追加: バッジ表示テスト |
| `packages/web/src/components/CalendarView.tsx` | 修正: `getMaxCongestionRiskForDate()` + カラーバー |
| `packages/web/src/components/CalendarView.test.tsx` | 追加: カラーバー表示テスト |

---

## Chunk 1: 型修正と getCongestionInfo

---

### Task 1: types.ts の congestionRisk 型を修正する

**Files:**
- Modify: `packages/web/src/types.ts:44`

- [ ] **Step 1: types.ts を編集する**

`congestionRisk?: null` の行を以下に変更する:

```typescript
congestionRisk?: number | null
```

- [ ] **Step 2: テストを実行して既存テストが pass することを確認する**

```bash
pnpm --filter web test
```

Expected: 既存テスト全 PASS（コンパイルエラーなし）

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/types.ts
git commit -m "fix: widen congestionRisk type to number | null"
```

---

### Task 2: getCongestionInfo を colorMap.ts に追加する（TDD）

**Files:**
- Modify: `packages/web/src/lib/colorMap.ts`
- Create: `packages/web/src/lib/colorMap.test.ts`

- [ ] **Step 1: テストファイルを先に作成する**

`packages/web/src/lib/colorMap.test.ts` を新規作成:

```typescript
import { describe, it, expect } from 'vitest'
import { getCongestionInfo } from './colorMap'

describe('getCongestionInfo', () => {
  it('null を渡すと null を返す', () => {
    expect(getCongestionInfo(null)).toBeNull()
  })
  it('0 を渡すと null を返す', () => {
    expect(getCongestionInfo(0)).toBeNull()
  })
  it('undefined を渡すと null を返す', () => {
    expect(getCongestionInfo(undefined)).toBeNull()
  })
  it('0.1 → 空いている (emerald)', () => {
    const info = getCongestionInfo(0.1)
    expect(info).not.toBeNull()
    expect(info!.label).toBe('空いている')
    expect(info!.badgeClass).toContain('emerald')
    expect(info!.barClass).toContain('emerald')
  })
  it('0.3 → やや混雑 (amber)（境界値は上位レンジ）', () => {
    const info = getCongestionInfo(0.3)
    expect(info!.label).toBe('やや混雑')
    expect(info!.badgeClass).toContain('amber')
  })
  it('0.5 → やや混雑 (amber)', () => {
    const info = getCongestionInfo(0.5)
    expect(info!.label).toBe('やや混雑')
  })
  it('0.6 → 混雑 (orange)（境界値は上位レンジ）', () => {
    const info = getCongestionInfo(0.6)
    expect(info!.label).toBe('混雑')
    expect(info!.badgeClass).toContain('orange')
  })
  it('0.75 → 混雑 (orange)', () => {
    const info = getCongestionInfo(0.75)
    expect(info!.label).toBe('混雑')
  })
  it('0.8 → 非常に混雑 (rose)（境界値は上位レンジ）', () => {
    const info = getCongestionInfo(0.8)
    expect(info!.label).toBe('非常に混雑')
    expect(info!.badgeClass).toContain('rose')
  })
  it('1.0 → 非常に混雑 (rose)', () => {
    const info = getCongestionInfo(1.0)
    expect(info!.label).toBe('非常に混雑')
  })
})
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pnpm --filter web test src/lib/colorMap.test.ts
```

Expected: `getCongestionInfo` が未定義でエラー（FAIL）

- [ ] **Step 3: getCongestionInfo を colorMap.ts に追加する**

`packages/web/src/lib/colorMap.ts` の末尾に追加:

```typescript
/** Congestion risk level info for a given score */
export interface CongestionInfo {
  label: string
  /** Tailwind classes for EventCard badge: "bg-emerald-50 text-emerald-700" etc. */
  badgeClass: string
  /** Tailwind bg class for CalendarView cell bar: "bg-emerald-400" etc. */
  barClass: string
}

/**
 * Returns label and color info for a congestionRisk score.
 * Returns null if score is null, undefined, or 0 (no events / no risk).
 *
 * Ranges (spec: docs/archive/specs/2026-03-19-phase4-congestion-design.md):
 *   0.0        → null (no display)
 *   0.0 < s < 0.3  → 空いている (emerald)
 *   0.3 ≤ s < 0.6  → やや混雑 (amber)
 *   0.6 ≤ s < 0.8  → 混雑 (orange)
 *   0.8 ≤ s ≤ 1.0  → 非常に混雑 (rose)
 */
export const getCongestionInfo = (score: number | null | undefined): CongestionInfo | null => {
  if (score == null || score <= 0) return null
  if (score < 0.3) return { label: '空いている',  badgeClass: 'bg-emerald-50 text-emerald-700', barClass: 'bg-emerald-400' }
  if (score < 0.6) return { label: 'やや混雑',    badgeClass: 'bg-amber-50 text-amber-700',   barClass: 'bg-amber-400'   }
  if (score < 0.8) return { label: '混雑',        badgeClass: 'bg-orange-50 text-orange-700', barClass: 'bg-orange-400'  }
  return               { label: '非常に混雑',  badgeClass: 'bg-rose-50 text-rose-700',     barClass: 'bg-rose-500'    }
}
```

- [ ] **Step 4: テストを実行して pass を確認する**

```bash
pnpm --filter web test src/lib/colorMap.test.ts
```

Expected: 10件 PASS

- [ ] **Step 5: 全テストを実行してリグレッションがないことを確認する**

```bash
pnpm --filter web test
```

Expected: 全件 PASS

- [ ] **Step 6: コミット**

```bash
git add packages/web/src/lib/colorMap.ts packages/web/src/lib/colorMap.test.ts
git commit -m "feat: add getCongestionInfo to colorMap"
```

---

## Chunk 2: EventCard と CalendarView への UI 追加

---

### Task 3: EventCard に混雑度バッジを追加する（TDD）

**Files:**
- Modify: `packages/web/src/components/EventCard.tsx`
- Modify: `packages/web/src/components/EventCard.test.tsx`

- [ ] **Step 1: テストを先に追加する**

`packages/web/src/components/EventCard.test.tsx` の末尾に追加:

```typescript
it('congestionRisk が 0.5 のとき「やや混雑」バッジを表示する', () => {
  render(<EventCard event={{ ...sampleEvent, congestionRisk: 0.5 }} />)
  expect(screen.getByText('やや混雑')).toBeInTheDocument()
})

it('congestionRisk が 0.1 のとき「空いている」バッジを表示する', () => {
  render(<EventCard event={{ ...sampleEvent, congestionRisk: 0.1 }} />)
  expect(screen.getByText('空いている')).toBeInTheDocument()
})

it('congestionRisk が null のときバッジを表示しない', () => {
  render(<EventCard event={{ ...sampleEvent, congestionRisk: null }} />)
  expect(screen.queryByText('空いている')).toBeNull()
  expect(screen.queryByText('やや混雑')).toBeNull()
  expect(screen.queryByText('混雑')).toBeNull()
  expect(screen.queryByText('非常に混雑')).toBeNull()
})

it('congestionRisk が 0 のときバッジを表示しない', () => {
  render(<EventCard event={{ ...sampleEvent, congestionRisk: 0 }} />)
  expect(screen.queryByText('空いている')).toBeNull()
})
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pnpm --filter web test src/components/EventCard.test.tsx
```

Expected: 新規テスト FAIL（バッジが未実装のため）

- [ ] **Step 3: EventCard.tsx を修正する**

`packages/web/src/components/EventCard.tsx` を以下に置き換える:

```typescript
import type { EventItem } from '../types'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'
import ShareButton from './ShareButton'

interface Props {
  event: EventItem
}

export default function EventCard({ event }: Props) {
  const shareUrl = `https://kannohi1.github.io/ariake-events?event=${event.id}`
  const facilityClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-100 text-slate-700 border border-slate-200'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center ${facilityClass}`}>
          {event.facility}
        </span>
        <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${categoryClass}`}>
          {categoryLabel}
        </span>
        {congestionInfo && (
          <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${congestionInfo.badgeClass}`}>
            {congestionInfo.label}
          </span>
        )}
      </div>
      <h2 className="text-base font-bold text-slate-900 leading-snug mb-1">
        {event.eventName}
      </h2>
      <p className="text-sm text-slate-500">
        {event.startDate === event.endDate
          ? event.startDate
          : `${event.startDate} 〜 ${event.endDate}`}
      </p>
      <a
        href={event.sourceURL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm text-primary-500 hover:text-primary-700"
      >
        公式サイト →
      </a>
      <ShareButton
        title={event.eventName}
        text={`${event.facility} | ${event.startDate}`}
        url={shareUrl}
      />
    </article>
  )
}
```

- [ ] **Step 4: テストを実行して pass を確認する**

```bash
pnpm --filter web test src/components/EventCard.test.tsx
```

Expected: 全テスト PASS（既存7件 + 新規4件 = 11件）

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/components/EventCard.tsx packages/web/src/components/EventCard.test.tsx
git commit -m "feat: add congestion risk badge to EventCard"
```

---

### Task 4: CalendarView に日別混雑度カラーバーを追加する（TDD）

**Files:**
- Modify: `packages/web/src/components/CalendarView.tsx`
- Modify: `packages/web/src/components/CalendarView.test.tsx`

**設計メモ:**
- カレンダーセルの底部に `h-0.5 rounded-full` のカラーバーを表示する
- その日にかかるイベント（startDate ≤ dateStr ≤ endDate）の `congestionRisk` 最大値を使う
- `getMaxCongestionRiskForDate()` ヘルパーを CalendarView.tsx 内に追加する
- スコアが 0 または null のみの日はバーを表示しない

- [ ] **Step 1: テストを先に追加する**

`packages/web/src/components/CalendarView.test.tsx` の末尾に追加:

```typescript
it('congestionRisk が 0.5 のイベントがある日にカラーバーが表示される', () => {
  const events = [makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: 0.5 })]
  const { container } = render(<CalendarView events={events} onResetFilters={vi.fn()} />)
  // bg-amber-400 クラスを持つ要素が存在する（やや混雑）
  const bar = container.querySelector('.bg-amber-400')
  expect(bar).not.toBeNull()
})

it('congestionRisk が null のイベントのみの日はカラーバーが表示されない', () => {
  const events = [makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: null })]
  const { container } = render(<CalendarView events={events} onResetFilters={vi.fn()} />)
  expect(container.querySelector('.bg-amber-400')).toBeNull()
  expect(container.querySelector('.bg-emerald-400')).toBeNull()
  expect(container.querySelector('.bg-orange-400')).toBeNull()
  expect(container.querySelector('.bg-rose-500')).toBeNull()
})

it('congestionRisk が 0.85 のイベントがある日に rose バーが表示される', () => {
  const events = [makeEvent({ startDate: '2026-03-18', endDate: '2026-03-18', congestionRisk: 0.85 })]
  const { container } = render(<CalendarView events={events} onResetFilters={vi.fn()} />)
  const bar = container.querySelector('.bg-rose-500')
  expect(bar).not.toBeNull()
})
```

- [ ] **Step 2: テストを実行して失敗を確認する**

```bash
pnpm --filter web test src/components/CalendarView.test.tsx
```

Expected: 新規テスト FAIL（バーが未実装のため）

- [ ] **Step 3: CalendarView.tsx を修正する**

`packages/web/src/components/CalendarView.tsx` に以下を追加・修正する:

**Step 3a: import に getCongestionInfo を追加する**

既存の import 行:
```typescript
import { CATEGORY_DOT_COLORS, CATEGORY_LABELS, FACILITY_COLORS } from '../lib/colorMap'
```

を以下に変更:
```typescript
import { CATEGORY_DOT_COLORS, CATEGORY_LABELS, FACILITY_COLORS, getCongestionInfo } from '../lib/colorMap'
```

**Step 3b: `getEventsForDate` の後に `getMaxCongestionRiskForDate` を追加する**

```typescript
function getMaxCongestionRiskForDate(events: EventItem[], dateStr: string): number {
  let max = 0
  for (const e of events) {
    if (e.startDate <= dateStr && e.endDate >= dateStr && e.congestionRisk != null) {
      max = Math.max(max, e.congestionRisk)
    }
  }
  return max
}
```

**Step 3c: カレンダーセルの JSX にカラーバーを追加する**

セル内の `categories.map(...)` ドット div の直後に以下を追加:

```typescript
const maxRisk = getMaxCongestionRiskForDate(events, dateStr)
const congestionInfo = getCongestionInfo(maxRisk)
```

（`const categories = ...` の直後あたりで計算する）

JSX の `<div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">` ドット div の直後に:

```tsx
{congestionInfo && (
  <div className={`h-0.5 rounded-full mt-0.5 ${congestionInfo.barClass}`} />
)}
```

**変更後のセル全体 JSX（参考）:**

```tsx
return (
  <button
    key={dateStr}
    onClick={() => hasEvents ? setSelectedDate(dateStr) : undefined}
    className={`bg-white min-h-[60px] p-1 text-left w-full ${isToday ? 'bg-primary-50' : ''} ${hasEvents ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
    data-today={isToday || undefined}
  >
    <span
      className={`text-xs font-medium block text-center leading-5 w-5 mx-auto rounded-full ${
        isToday ? 'bg-primary-500 text-white' : 'text-slate-700'
      }`}
    >
      {day}
    </span>
    <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
      {categories.map((cat) => (
        <span
          key={cat}
          className={`w-2 h-2 rounded-full inline-block ${
            CATEGORY_DOT_COLORS[cat as keyof typeof CATEGORY_DOT_COLORS] ?? 'bg-slate-400'
          }`}
          title={cat}
        />
      ))}
    </div>
    {congestionInfo && (
      <div className={`h-0.5 rounded-full mt-0.5 ${congestionInfo.barClass}`} />
    )}
  </button>
)
```

- [ ] **Step 4: テストを実行して pass を確認する**

```bash
pnpm --filter web test src/components/CalendarView.test.tsx
```

Expected: 全テスト PASS（既存テスト + 新規3件）

- [ ] **Step 5: 全テストを実行してリグレッションがないことを確認する**

```bash
pnpm --filter web test
```

Expected: 全件 PASS

- [ ] **Step 6: コミット + push**

```bash
git add packages/web/src/components/CalendarView.tsx packages/web/src/components/CalendarView.test.tsx
git commit -m "feat: add congestion risk bar to CalendarView cells"
git push
```

Expected: GitHub Actions が自動実行され、Web サイトに混雑度表示が反映される
