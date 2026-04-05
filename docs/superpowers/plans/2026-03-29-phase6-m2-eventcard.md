# Phase 6 M2: EventCard 横長カード実装プラン

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** EventCard を縦長グラジエントカードから横長 Unsplash 写真カードに刷新する。

**Architecture:** `imageMap.ts` で Unsplash URL と選択ロジックを一元管理し、`EventCard.tsx` が左40%画像 / 右60%テキストの横長レイアウトを採用。カード全体を `<a>` で包み「公式サイト →」リンクを廃止。`colorMap.ts` の `FACILITY_GRADIENTS` は不要になるため削除。

**Tech Stack:** Next.js 15, Tailwind CSS 3, Vitest 3, @testing-library/react

---

## 事前確認（実装前に必ず読む）

### デザイン仕様
`docs/design/design-system.md` — カラーパレット / EventCard構造 / imageMap戦略 / Unsplash URLリストはここに確定済み。

### 現在の状態（変更不要なファイル）
- `packages/web/src/app/layout.tsx` — next/font で Public Sans + Noto Sans JP 設定済み（手を触れない）
- `packages/web/tailwind.config.ts` — `primary.500: '#ec5b13'`・fontFamily 設定済み（手を触れない）

### 変更対象ファイル
| ファイル | 変更種別 |
|---|---|
| `packages/web/src/lib/imageMap.ts` | **新規作成** |
| `packages/web/src/lib/imageMap.test.ts` | **新規作成** |
| `packages/web/src/components/EventCard.test.tsx` | 大幅更新（7境界条件） |
| `packages/web/src/components/EventCard.tsx` | 大幅更新（横長化） |
| `packages/web/src/lib/colorMap.ts` | FACILITY_GRADIENTS 削除 |

### テスト実行コマンド
```bash
pnpm --filter web test
pnpm --filter web test -- --run
```

---

## Chunk 1: imageMap.ts — URL定数と選択ロジック

### Task 1: imageMap.test.ts を書く（Red）

**Files:**
- Create: `packages/web/src/lib/imageMap.test.ts`

- [ ] **Step 1: テストファイルを作成する**

```typescript
// packages/web/src/lib/imageMap.test.ts
import { describe, it, expect } from 'vitest'
import { getImageUrl } from './imageMap'

describe('getImageUrl', () => {
  it('music カテゴリで Unsplash URL を返す', () => {
    const url = getImageUrl('music', 'event-001')
    expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/)
  })

  it('同じ eventId は常に同じ URL を返す（決定論的）', () => {
    const url1 = getImageUrl('sports', 'abc')
    const url2 = getImageUrl('sports', 'abc')
    expect(url1).toBe(url2)
  })

  it('eventId が異なれば異なる URL が返りうる', () => {
    // 3枚あるので同じになる場合もあるが、0/1/2 に対してそれぞれ確認
    const urls = ['a', 'b', 'c'].map(id => getImageUrl('music', id))
    // 少なくとも1種類の URL が含まれる（null でない）
    urls.forEach(url => {
      expect(url).toMatch(/images\.unsplash\.com/)
    })
  })

  it('other カテゴリは null を返す', () => {
    const url = getImageUrl('other', 'event-123')
    expect(url).toBeNull()
  })

  it('すべての非 other カテゴリで URL を返す', () => {
    const categories = ['music', 'sports', 'exhibition', 'kids', 'food', 'fashion', 'anime'] as const
    categories.forEach(cat => {
      const url = getImageUrl(cat, 'test')
      expect(url).not.toBeNull()
      expect(url).toMatch(/images\.unsplash\.com/)
    })
  })

  it('URL に ?w=300&h=200&fit=crop が含まれる', () => {
    const url = getImageUrl('music', 'test')
    expect(url).toContain('w=300')
    expect(url).toContain('h=200')
    expect(url).toContain('fit=crop')
  })
})
```

- [ ] **Step 2: テストが FAIL することを確認する**

```bash
pnpm --filter web test -- --run src/lib/imageMap.test.ts
```

期待: `Cannot find module './imageMap'` エラー

---

### Task 2: imageMap.ts を実装する（Green）

**Files:**
- Create: `packages/web/src/lib/imageMap.ts`

- [ ] **Step 3: imageMap.ts を作成する**

```typescript
// packages/web/src/lib/imageMap.ts
import type { EventCategory } from '../types'

const BASE = 'https://images.unsplash.com/photo-'
const PARAMS = '?w=300&h=200&fit=crop'

const CATEGORY_IMAGES: Record<Exclude<EventCategory, 'other'>, [string, string, string]> = {
  music:      ['1493225457124-a3eb161ffa5f', '1429962714451-bb934ecdc4ec', '1501386760234-c2f1b64d4d8f'],
  sports:     ['1571019613454-1cb2f99b2d8b', '1461896836934-ffe607ba8211', '1547347298-4074ad3086f0'],
  exhibition: ['1540575467063-178a50c2df87', '1578662996442-48f60103fc96', '1565035010268-a3816f98589a'],
  kids:       ['1503454537195-1f28bea0f5cc', '1515488042361-ee00e0ddd4e4', '1476703993599-0035a21b9fc3'],
  food:       ['1414235077428-338989a2e8c0', '1504674900247-0877df9cc836', '1555396273-367ea4eb4db5'],
  fashion:    ['1558769132-cb1aea458c5e', '1509631179647-0177331693ae', '1483985988355-763728e1cdc6'],
  anime:      ['1578632767115-351597cf2a57', '1612198188060-c7c2a3b66eae', '1560169897-fc0cdbdfa4d5'],
}

/**
 * Returns a deterministic Unsplash image URL for the given category and eventId.
 * Returns null for the 'other' category (no photo, use icon instead).
 */
export function getImageUrl(category: EventCategory, eventId: string): string | null {
  if (category === 'other') return null
  const photos = CATEGORY_IMAGES[category]
  const seed = [...eventId].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 3
  return `${BASE}${photos[seed]}${PARAMS}`
}
```

- [ ] **Step 4: テストが PASS することを確認する**

```bash
pnpm --filter web test -- --run src/lib/imageMap.test.ts
```

期待: 6 tests PASS

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/lib/imageMap.ts packages/web/src/lib/imageMap.test.ts
git commit -m "feat: add imageMap.ts with getImageUrl() for Unsplash photo selection"
```

---

## Chunk 2: EventCard — テスト更新（Red）

### Task 3: EventCard.test.tsx を 7 境界条件で置き換える

**Files:**
- Modify: `packages/web/src/components/EventCard.test.tsx`

- [ ] **Step 1: テストファイルを新しい仕様で上書きする**

```typescript
// packages/web/src/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventCard from './EventCard'
import type { EventItem } from '../types'

const musicEvent: EventItem = {
  id: 'test-001',
  eventName: 'テストコンサート',
  facility: '有明アリーナ',
  category: 'music',
  startDate: '2026-03-20',
  endDate: '2026-03-21',
  sourceURL: 'https://example.com/event',
  lastUpdated: '2026-03-18',
}

describe('EventCard', () => {
  // 1. カード全体がリンク
  it('カード全体が sourceURL へのリンクになっている', () => {
    render(<EventCard event={musicEvent} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/event')
    expect(link).toHaveAttribute('target', '_blank')
  })

  // 2. 施設バッジ
  it('施設バッジが表示される', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByText('有明アリーナ')).toBeInTheDocument()
  })

  // 3. カテゴリバッジ（日本語ラベル）
  it('カテゴリバッジが日本語ラベルで表示される', () => {
    render(<EventCard event={musicEvent} />)
    expect(screen.getByText('ミュージック')).toBeInTheDocument()
  })

  // 4. 混雑バッジ非表示（congestionRisk=0）
  it('congestionRisk=0 のとき混雑バッジが表示されない', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: 0 }} />)
    expect(screen.queryByText('空いている')).toBeNull()
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
    expect(screen.queryByText('非常に混雑')).toBeNull()
  })

  // 5. 混雑バッジ表示（congestionRisk=0.5）
  it('congestionRisk=0.5 のとき「やや混雑」バッジが表示される', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: 0.5 }} />)
    expect(screen.getByText('やや混雑')).toBeInTheDocument()
  })

  // 6. other カテゴリ: img なし、event アイコンあり
  it('other カテゴリのとき img を描画せず event アイコンを描画する', () => {
    const otherEvent: EventItem = { ...musicEvent, category: 'other' }
    render(<EventCard event={otherEvent} />)
    expect(screen.queryByRole('img')).toBeNull()
    // Material Symbols の event アイコンが描画されること
    // textContent は JSX のインデント込みになるので trim() して比較する
    const icon = document.querySelector('.material-symbols-outlined')
    expect(icon).not.toBeNull()
    expect(icon?.textContent?.trim()).toBe('event')
  })

  // 7. 非 other カテゴリ: img の src が Unsplash URL
  it('music カテゴリのとき img src が images.unsplash.com を含む', () => {
    render(<EventCard event={musicEvent} />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('images.unsplash.com')
  })

  // 追加: congestionRisk=null のときバッジが表示されない
  it('congestionRisk が null のとき混雑バッジが表示されない', () => {
    render(<EventCard event={{ ...musicEvent, congestionRisk: null }} />)
    expect(screen.queryByText('空いている')).toBeNull()
    expect(screen.queryByText('やや混雑')).toBeNull()
    expect(screen.queryByText('混雑')).toBeNull()
    expect(screen.queryByText('非常に混雑')).toBeNull()
  })
})
```

- [ ] **Step 2: テストが FAIL することを確認する**

```bash
pnpm --filter web test -- --run src/components/EventCard.test.tsx
```

期待: 複数テスト FAIL（現行コンポーネントは縦長カード）

---

## Chunk 3: EventCard — 実装（Green）

### Task 4: EventCard.tsx を横長カードに書き換える

**Files:**
- Modify: `packages/web/src/components/EventCard.tsx`

- [ ] **Step 1: EventCard.tsx を書き換える**

```typescript
// packages/web/src/components/EventCard.tsx
import type { EventItem } from '../types'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'
import { getImageUrl } from '../lib/imageMap'

interface Props {
  event: EventItem
}

export default function EventCard({ event }: Props) {
  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-50 text-slate-700'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)
  const imageUrl = getImageUrl(event.category, event.id)

  const dateRange = event.startDate === event.endDate
    ? event.startDate
    : `${event.startDate} 〜 ${event.endDate}`

  return (
    <a
      href={event.sourceURL}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <article className="flex rounded-xl bg-white shadow-sm overflow-hidden">

        {/* 左 40%: 画像エリア */}
        <div className="relative w-[40%] shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.eventName}
              className="w-full h-full object-cover"
            />
          ) : (
            /* other カテゴリ: bg-slate-100 + event アイコン */
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '40px' }}>
                event
              </span>
            </div>
          )}

          {/* 混雑バッジ（congestionRisk > 0 のときのみ） */}
          {congestionInfo && (
            <span className={`absolute top-2 right-2 ${congestionInfo.imageBadgeClass} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
              {congestionInfo.label}
            </span>
          )}
        </div>

        {/* 右 60%: テキストエリア */}
        <div className="p-3 flex flex-col justify-center gap-1.5 min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${facilityBadgeClass}`}>
              {event.facility}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${categoryClass}`}>
              {categoryLabel}
            </span>
          </div>
          <h3 className="text-sm font-bold leading-snug text-slate-900">
            {event.eventName}
          </h3>
          <p className="text-xs text-slate-500">📅 {dateRange}</p>
        </div>

      </article>
    </a>
  )
}
```

- [ ] **Step 2: テストが PASS することを確認する**

```bash
pnpm --filter web test -- --run src/components/EventCard.test.tsx
```

期待: 7 tests PASS

---

### Task 5: colorMap.ts から FACILITY_GRADIENTS を削除する

**Files:**
- Modify: `packages/web/src/lib/colorMap.ts`

- [ ] **Step 1: FACILITY_GRADIENTS の定義を削除する**

`colorMap.ts` の以下のブロックを丸ごと削除する（11〜19行目）:

```typescript
/** Gradient classes for EventCard hero image area */
export const FACILITY_GRADIENTS: Record<string, string> = {
  '有明ガーデン': 'bg-gradient-to-br from-green-400 to-green-600',
  '東京ガーデンシアター': 'bg-gradient-to-br from-pink-400 to-rose-600',
  '有明アリーナ': 'bg-gradient-to-br from-sky-400 to-blue-600',
  'TOYOTA ARENA TOKYO': 'bg-gradient-to-br from-amber-400 to-orange-500',
  '東京ビッグサイト': 'bg-gradient-to-br from-blue-500 to-indigo-700',
}
```

`EventCard.tsx` の import から `FACILITY_GRADIENTS` が既に除かれていることを確認する。

- [ ] **Step 2: 全テストが PASS することを確認する**

```bash
pnpm --filter web test -- --run
```

期待: 全テスト PASS（107件以上）。FACILITY_GRADIENTS の参照が残っていれば TypeScript エラーが出るので確認すること。

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/components/EventCard.tsx \
        packages/web/src/components/EventCard.test.tsx \
        packages/web/src/lib/colorMap.ts
git commit -m "feat: Phase 6 M2 — EventCard horizontal layout with Unsplash photos"
```

---

## Chunk 4: マイルストーン完了処理

### Task 6: ROADMAP.md と PROGRESS.md を更新して push する

**Files:**
- Modify: `docs/ROADMAP.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: ROADMAP.md の Phase 6 M2 ステータスを更新する**

`docs/ROADMAP.md` の Phase 6 M2 の行を `✅ 完了 (2026-03-29)` に変更する。

- [ ] **Step 2: PROGRESS.md を更新する**

`PROGRESS.md` の以下を更新する:

1. **現在地** を「Phase 6 M2 完了 — 次: Phase 6 M3 FilterBar / BottomNav / Views 刷新」に変更
2. **完了済み** に Phase 6 M2 の記録を追記:
   ```
   - **Phase 6 M2** (完了 2026-03-29): EventCard 横長カード実装
     - `packages/web/src/lib/imageMap.ts` 新規作成（7カテゴリ×3枚 Unsplash URL、getImageUrl()）
     - `packages/web/src/components/EventCard.tsx` 横長カード化（左40%写真/右60%テキスト）
     - `packages/web/src/lib/colorMap.ts` FACILITY_GRADIENTS 削除
     - テスト全PASS、push済み
   ```
3. **次にやること** を Phase 6 M3 の内容に更新:
   ```
   **Phase 6 M3: FilterBar / BottomNav / Views 全体刷新**
   - FilterBar.tsx: アクティブチップ bg-primary text-white
   - BottomNav.tsx: アクティブ状態 text-primary（text-[#ec5b13]）
   - TodayView / WeekView: カード間 gap-3 でリスト表示
   ```

- [ ] **Step 3: コミット + push**

```bash
git add docs/ROADMAP.md PROGRESS.md
git commit -m "docs: mark Phase 6 M2 complete, set M3 as next action"
git push
```

---

## 完了チェックリスト

実装終了後に確認:

- [ ] `pnpm --filter web test -- --run` が全 PASS
- [ ] EventCard が横長レイアウト（左40%写真 / 右60%テキスト）
- [ ] `other` カテゴリが `event` アイコン表示（img なし）
- [ ] カード全体が `<a>` リンク（「公式サイト →」テキストなし）
- [ ] FACILITY_GRADIENTS が colorMap.ts に存在しない（grep で確認）
- [ ] ROADMAP.md の M2 が ✅ 完了
- [ ] PROGRESS.md の現在地が M3 を指している
- [ ] push 済み
