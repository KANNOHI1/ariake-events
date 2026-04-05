# Airbnb デザインリデザイン Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 有明イベントサイト全体を Airbnb デザインシステム（Rausch Red #ff385c・暖色カード・photography-first・3層シャドウ・20px丸み）に全面リデザインし、混雑バーを EventCard に追加する。

**Architecture:** Tailwind の `primary` カラーを Rausch Red に差し替え、FACILITY_COLORS / CATEGORY_COLORS を Airbnb パレットへ更新。EventCard に congestion progress bar を追加。Header・FilterBar・BottomNav のスタイルを Airbnb語彙に統一。

**Tech Stack:** Next.js 15 静的エクスポート、Tailwind CSS 3、Vitest + React Testing Library

---

## Chunk 1: バックアップ + デザイントークン

### Task 0: 現状バックアップ（git commit）

**Files:**
- (変更なし)

- [ ] **Step 1: 現在の状態をコミット**

```bash
git add -A
git commit -m "chore: backup before Airbnb redesign"
```

---

### Task 1: Tailwind カラートークン更新

**Files:**
- Modify: `packages/web/tailwind.config.ts`

Airbnb パレットに合わせて `primary` を Rausch Red に変更し、`near-black` / `rausch` を追加する。

- [ ] **Step 1: tailwind.config.ts を書き換える**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff0f3',
          100: '#ffd6de',
          400: '#ff6b83',
          500: '#ff385c',   // Rausch Red
          700: '#e00b41',   // Deep Rausch (pressed)
        },
        'near-black': '#222222',  // Airbnb primary text
      },
      fontFamily: {
        sans: [
          'Nunito',
          'var(--font-public-sans)',
          'var(--font-noto-sans-jp)',
          'Hiragino Sans',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '20px',   // Airbnb card radius
      },
      boxShadow: {
        'airbnb-card': 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
        'airbnb-card-hover': 'rgba(0,0,0,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 4px 12px, rgba(0,0,0,0.14) 0px 8px 20px',
        'airbnb-popover': 'rgba(0,0,0,0.08) 0px 4px 12px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: ビルドが通ることを確認**

```bash
pnpm --filter web build 2>&1 | tail -20
```
Expected: error なし（型エラーなし）

- [ ] **Step 3: コミット**

```bash
git add packages/web/tailwind.config.ts
git commit -m "feat(design): Airbnb カラートークン + シャドウ定義追加"
```

---

### Task 2: globals.css + layout.tsx フォント更新

**Files:**
- Modify: `packages/web/src/app/globals.css`
- Modify: `packages/web/src/app/layout.tsx`

Airbnb は白背景・Nunito（Airbnb Cereal VF 代替）を使用。

- [ ] **Step 1: layout.tsx に Nunito を追加**

```tsx
import { Nunito, Noto_Sans_JP } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  weight: ['400', '500', '700'],
})
```

`<body>` の className から `var(--font-public-sans)` を削除し `${nunito.variable}` を追加。背景を `bg-white` に変更：

```tsx
<body className={`${nunito.variable} ${notoSansJP.variable} bg-white font-sans antialiased`}>
```

- [ ] **Step 2: globals.css の背景色を白に更新**

`html { scrollbar-gutter: stable; }` の行はそのまま維持。
`body` の背景色指定があれば `background: #ffffff` に変更（なければ追加不要）。

- [ ] **Step 3: テスト確認**

```bash
pnpm --filter web test -- --reporter=verbose 2>&1 | tail -30
```

- [ ] **Step 4: コミット**

```bash
git add packages/web/src/app/layout.tsx packages/web/src/app/globals.css
git commit -m "feat(design): Nunito フォント追加、背景色を白に変更"
```

---

## Chunk 2: colorMap + EventCard

### Task 3: colorMap.ts Airbnb パレット更新 + congestion bar 対応

**Files:**
- Modify: `packages/web/src/lib/colorMap.ts`

Airbnb では施設バッジを Rausch Red ベースのピル（赤背景白文字）で統一し、カテゴリは暖色系パステルに変更。`getCongestionInfo` に `barColorClass`（progress bar 用 Tailwind bg クラス）を追加する。

- [ ] **Step 1: 失敗テストを書く**

`packages/web/src/lib/colorMap.test.ts`（新規）を作成：

```ts
import { describe, it, expect } from 'vitest'
import { getCongestionInfo } from './colorMap'

describe('getCongestionInfo - barColorClass', () => {
  it('score 0.5 → barColorClass が返る', () => {
    const info = getCongestionInfo(0.5)
    expect(info).not.toBeNull()
    expect(info!.barColorClass).toBeTruthy()
  })

  it('score null → null', () => {
    expect(getCongestionInfo(null)).toBeNull()
  })

  it('score 0 → null', () => {
    expect(getCongestionInfo(0)).toBeNull()
  })

  it('score 0.1 → barColorClass が空いている色 (emerald)', () => {
    const info = getCongestionInfo(0.1)
    expect(info!.barColorClass).toContain('emerald')
  })

  it('score 0.7 → barColorClass が混雑色 (orange)', () => {
    const info = getCongestionInfo(0.7)
    expect(info!.barColorClass).toContain('orange')
  })

  it('score 0.9 → barColorClass が非常に混雑色 (rose)', () => {
    const info = getCongestionInfo(0.9)
    expect(info!.barColorClass).toContain('rose')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm --filter web test -- colorMap --reporter=verbose 2>&1 | tail -20
```
Expected: `barColorClass` が undefined でテスト失敗

- [ ] **Step 3: colorMap.ts を更新**

`CongestionInfo` インターフェースに `barColorClass: string` を追加。
`getCongestionInfo` の各 return に `barColorClass` を追加：

```ts
export interface CongestionInfo {
  label: string
  imageBadgeClass: string
  badgeClass: string
  barClass: string       // CalendarView 用（既存）
  barColorClass: string  // EventCard progress bar 用（新規追加）
}

export const getCongestionInfo = (score: number | null | undefined): CongestionInfo | null => {
  if (score == null || score <= 0) return null
  if (score < 0.3) return {
    label: '空いている',
    imageBadgeClass: 'bg-emerald-500/90 text-white',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    barClass: 'bg-emerald-400',
    barColorClass: 'bg-emerald-400',
  }
  if (score < 0.6) return {
    label: 'やや混雑',
    imageBadgeClass: 'bg-amber-500/90 text-white',
    badgeClass: 'bg-amber-50 text-amber-700',
    barClass: 'bg-amber-400',
    barColorClass: 'bg-amber-400',
  }
  if (score < 0.8) return {
    label: '混雑',
    imageBadgeClass: 'bg-orange-600/90 text-white',
    badgeClass: 'bg-orange-50 text-orange-700',
    barClass: 'bg-orange-400',
    barColorClass: 'bg-orange-400',
  }
  return {
    label: '非常に混雑',
    imageBadgeClass: 'bg-rose-600/90 text-white',
    badgeClass: 'bg-rose-50 text-rose-700',
    barClass: 'bg-rose-500',
    barColorClass: 'bg-rose-500',
  }
}
```

FACILITY_COLORS を Airbnb スタイルに更新（赤系ピル）：

```ts
export const FACILITY_COLORS: Record<string, string> = {
  '有明ガーデン':         'bg-emerald-100 text-emerald-800 border border-emerald-200',
  '東京ガーデンシアター': 'bg-pink-100 text-pink-800 border border-pink-200',
  '有明アリーナ':         'bg-rose-100 text-rose-800 border border-rose-200',
  'TOYOTA ARENA TOKYO':  'bg-amber-100 text-amber-800 border border-amber-200',
  '東京ビッグサイト':     'bg-sky-100 text-sky-800 border border-sky-200',
}
```

CATEGORY_COLORS を Airbnb 暖色パステルに更新：

```ts
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  music:      'bg-violet-100 text-violet-800',
  sports:     'bg-green-100 text-green-800',
  exhibition: 'bg-blue-100 text-blue-800',
  kids:       'bg-pink-100 text-pink-800',
  food:       'bg-orange-100 text-orange-800',
  fashion:    'bg-fuchsia-100 text-fuchsia-800',
  anime:      'bg-cyan-100 text-cyan-800',
  other:      'bg-slate-100 text-slate-600',
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm --filter web test -- colorMap --reporter=verbose 2>&1 | tail -20
```
Expected: 全テスト PASS

- [ ] **Step 5: 全テスト確認**

```bash
pnpm --filter web test -- --reporter=verbose 2>&1 | tail -30
```
Expected: 全スイート PASS（CalendarView の barClass テストも通る）

- [ ] **Step 6: コミット**

```bash
git add packages/web/src/lib/colorMap.ts packages/web/src/lib/colorMap.test.ts
git commit -m "feat(design): colorMap Airbnb パレット更新 + barColorClass 追加"
```

---

### Task 4: EventCard.tsx Airbnb 化 + 混雑バー

**Files:**
- Modify: `packages/web/src/components/EventCard.tsx`
- Modify: `packages/web/src/components/EventCard.test.tsx`

カード外観を Airbnb スタイルへ：20px丸み・3層シャドウ・施設タグ大型化・カード下部に混雑 progress bar 追加。

- [ ] **Step 1: 失敗テスト追加**

`EventCard.test.tsx` の末尾に追加：

```tsx
it('congestionRisk=0.7 のとき progress bar が表示される', () => {
  const { container } = render(<EventCard event={{ ...musicEvent, congestionRisk: 0.7 }} />)
  const bar = container.querySelector('[data-testid="congestion-bar"]')
  expect(bar).not.toBeNull()
})

it('congestionRisk=0 のとき progress bar が表示されない', () => {
  const { container } = render(<EventCard event={{ ...musicEvent, congestionRisk: 0 }} />)
  const bar = container.querySelector('[data-testid="congestion-bar"]')
  expect(bar).toBeNull()
})

it('カードは rounded-2xl クラスを持つ', () => {
  const { container } = render(<EventCard event={musicEvent} />)
  const article = container.querySelector('article')
  expect(article?.className).toContain('rounded-2xl')
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm --filter web test -- EventCard --reporter=verbose 2>&1 | grep -E "PASS|FAIL|✓|×"
```
Expected: 新規3テストが FAIL

- [ ] **Step 3: EventCard.tsx を更新**

変更点：
1. `article` の `rounded-xl` → `rounded-2xl`
2. `shadow-sm` → `shadow-airbnb-card hover:shadow-airbnb-card-hover transition-shadow`
3. `rounded` バッジ → `rounded-full px-2.5` に変更
4. congestion progress bar を article 直後に追加

```tsx
'use client'
import { useState } from 'react'
import type { EventItem } from '../types'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS, getCongestionInfo } from '../lib/colorMap'
import { getImageUrl, getFacilityPhoto } from '../lib/imageMap'
import type { ViewMode } from './FilterBar'

interface Props {
  event: EventItem
  viewMode?: ViewMode
}

export default function EventCard({ event, viewMode = 'list' }: Props) {
  const [imgError, setImgError] = useState(false)
  const facilityBadgeClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-100 text-slate-700'
  const categoryClass = CATEGORY_COLORS[event.category] ?? 'bg-slate-100 text-slate-600'
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category
  const congestionInfo = getCongestionInfo(event.congestionRisk)
  const imageUrl = getImageUrl(event)
  const displaySrc = imgError ? getFacilityPhoto(event.facility) : imageUrl
  const isFacilityPhoto = !event.imageUrl || imgError

  const dateRange = event.startDate === event.endDate
    ? event.startDate
    : `${event.startDate} 〜 ${event.endDate}`

  const barPercent = event.congestionRisk != null && event.congestionRisk > 0
    ? Math.round(event.congestionRisk * 100)
    : null

  const imageArea = (
    <div className={`relative shrink-0 overflow-hidden bg-black ${viewMode === 'grid' ? 'w-full aspect-video' : 'w-[40%]'}`}>
      <img
        src={displaySrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-[200%] blur-sm opacity-70"
      />
      <img
        src={displaySrc}
        alt={event.eventName}
        className={`relative z-10 w-full h-full ${isFacilityPhoto ? 'object-cover' : 'object-contain'}`}
        onError={() => setImgError(true)}
      />
      {congestionInfo && (
        <span className={`absolute top-2 right-2 z-20 ${congestionInfo.imageBadgeClass} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
          {congestionInfo.label}
        </span>
      )}
    </div>
  )

  const textArea = (
    <div className="p-3 flex flex-col justify-center gap-1.5 min-w-0">
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${facilityBadgeClass}`}>
          {event.facility}
        </span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${categoryClass}`}>
          {categoryLabel}
        </span>
      </div>
      <h3 className={`text-sm font-bold leading-snug text-near-black ${viewMode === 'list' ? 'line-clamp-2' : ''}`}>
        {event.eventName}
      </h3>
      <p className="text-xs text-slate-500">📅 {dateRange}</p>
    </div>
  )

  return (
    <a
      href={event.sourceURL}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <article className={`rounded-2xl bg-white shadow-airbnb-card hover:shadow-airbnb-card-hover transition-shadow overflow-hidden ${viewMode === 'grid' ? 'flex flex-col' : 'flex h-28'}`}>
        {imageArea}
        {textArea}
      </article>
      {congestionInfo && barPercent !== null && (
        <div className="mt-1 px-1" data-testid="congestion-bar">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${congestionInfo.barColorClass}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>
      )}
    </a>
  )
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm --filter web test -- EventCard --reporter=verbose 2>&1 | grep -E "PASS|FAIL|✓|×"
```
Expected: 全テスト PASS

> **注意**: `text-near-black` は Tailwind カスタムカラー。`near-black: '#222222'` を tailwind.config.ts に追加済みであること（Task 1 で対応済み）。もし未解決なら `text-[#222222]` で代替。

- [ ] **Step 5: 全テスト確認**

```bash
pnpm --filter web test 2>&1 | tail -15
```

- [ ] **Step 6: コミット**

```bash
git add packages/web/src/components/EventCard.tsx packages/web/src/components/EventCard.test.tsx
git commit -m "feat(design): EventCard Airbnb化 + 混雑 progress bar 追加"
```

---

## Chunk 3: FilterBar + Header + BottomNav

### Task 5: FilterBar.tsx Airbnb スタイル更新

**Files:**
- Modify: `packages/web/src/components/FilterBar.tsx`

絞り込みチップを Airbnb 風ピル（active = Rausch Red、inactive = 白ボーダー）に変更。ポップオーバーの角丸・シャドウを Airbnb スタイルに更新。

- [ ] **Step 1: FilterBar.tsx を更新**

変更点は `CHIP_ACTIVE` / `CHIP_INACTIVE` のクラスと、ポップオーバーの `shadow` クラスのみ：

```tsx
const CHIP_BASE = 'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer'
const CHIP_ACTIVE = 'bg-primary-500 text-white'
const CHIP_INACTIVE = 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-white'
```

ポップオーバーの shadow クラスを変更：
```
shadow-[0_8px_32px_rgba(15,23,42,0.16)]
  →
shadow-airbnb-card-hover
```

フィルターボタンの `bg-[#f8f6f6]` コンテナ行を `bg-white border-b border-slate-100` に変更：
```tsx
// Before
<div className='bg-[#f8f6f6] px-4 py-3 flex items-center gap-3'>
// After
<div className='bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3'>
```

- [ ] **Step 2: テスト確認**

```bash
pnpm --filter web test -- FilterBar --reporter=verbose 2>&1 | tail -20
```
Expected: 全テスト PASS（FilterBar テストは CSS クラスに依存しない）

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/components/FilterBar.tsx
git commit -m "feat(design): FilterBar Airbnb チップ・ポップオーバースタイル更新"
```

---

### Task 6: FilterSheet.tsx Airbnb スタイル更新

**Files:**
- Modify: `packages/web/src/components/FilterSheet.tsx`

モバイル BottomSheet のチップスタイルを FilterBar と統一する。

- [ ] **Step 1: FilterSheet.tsx を読んで確認**

`packages/web/src/components/FilterSheet.tsx` の active/inactive チップクラスを確認し、FilterBar と同じ CHIP クラスに統一する。

- [ ] **Step 2: FilterSheet.tsx を更新**

active チップ: `bg-primary-500 text-white`
inactive チップ: `bg-white border border-slate-200 text-slate-600 hover:border-slate-400`

- [ ] **Step 3: テスト確認**

```bash
pnpm --filter web test -- FilterSheet --reporter=verbose 2>&1 | tail -20
```

- [ ] **Step 4: コミット**

```bash
git add packages/web/src/components/FilterSheet.tsx
git commit -m "feat(design): FilterSheet チップスタイル Airbnb 統一"
```

---

### Task 7: HomeContent.tsx ヘッダー Airbnb 化

**Files:**
- Modify: `packages/web/src/app/HomeContent.tsx`

ヘッダーを Airbnb スタイルに：高さを 80px 相当に拡大、ロゴの Rausch Red 強調、日付バッジのスタイル更新。背景を白に変更。

- [ ] **Step 1: ヘッダーブロックを更新**

```tsx
{/* Sticky header — Airbnb style */}
<header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
  <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 py-5">
    <h1 className="text-2xl font-bold tracking-tight">
      <span className="text-primary-500">有明</span>
      <span className="text-near-black">イベント</span>
    </h1>
    <span className="text-sm font-semibold text-primary-500 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
      {dateLabel}
    </span>
  </div>
</header>
```

背景 `bg-[#f8f6f6]` → `bg-white` に変更（全 div）：
```tsx
// Before
<div className="min-h-screen bg-[#f8f6f6] pb-20">
// After
<div className="min-h-screen bg-white pb-20">
```

ローディング表示の背景も更新：
```tsx
// Before
<div className="flex items-center justify-center min-h-screen text-slate-500">
// After（変更なし、text-slate-500 は適切）
```

- [ ] **Step 2: テスト確認**

```bash
pnpm --filter web test 2>&1 | tail -15
```

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/app/HomeContent.tsx
git commit -m "feat(design): ヘッダー Airbnb スタイル化（Rausch Red ロゴ・白背景）"
```

---

### Task 8: BottomNav.tsx Airbnb 化

**Files:**
- Modify: `packages/web/src/components/BottomNav.tsx`

背景・アクティブカラーを Airbnb に統一。

- [ ] **Step 1: BottomNav.tsx を更新**

```tsx
// nav 要素
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100">

// active 状態
active ? 'text-primary-500' : 'text-slate-400 hover:text-slate-600'
```

`bg-white/95 backdrop-blur-md` → `bg-white`（Airbnb はクリーン白）

- [ ] **Step 2: テスト確認**

```bash
pnpm --filter web test 2>&1 | tail -15
```

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/components/BottomNav.tsx
git commit -m "feat(design): BottomNav 白背景・Rausch Red アクティブカラー"
```

---

## Chunk 4: CalendarView 整合 + ドキュメント

### Task 9: CalendarView.tsx 白背景整合

**Files:**
- Modify: `packages/web/src/components/CalendarView.tsx`

CalendarView 内の `bg-[#f8f6f6]` をすべて `bg-white` または `bg-slate-50` に変更して、白背景テーマと整合させる。

- [ ] **Step 1: CalendarView.tsx の bg-[#f8f6f6] を検索**

```bash
grep -n "f8f6f6" packages/web/src/components/CalendarView.tsx
```

- [ ] **Step 2: 置換**

ナビバー: `bg-[#f8f6f6]` → `bg-white border-b border-slate-100`
サイドパネル: `bg-[#f8f6f6]` → `bg-slate-50`

- [ ] **Step 3: テスト確認**

```bash
pnpm --filter web test -- CalendarView --reporter=verbose 2>&1 | tail -20
```
Expected: 全テスト PASS

> CalendarView テストは `bg-[#f8f6f6]` クラスをクエリしていないため影響なし。

- [ ] **Step 4: コミット**

```bash
git add packages/web/src/components/CalendarView.tsx
git commit -m "feat(design): CalendarView 背景色を白テーマに整合"
```

---

### Task 10: MonthView / DayView 背景色整合

**Files:**
- Modify: `packages/web/src/components/MonthView.tsx`
- Modify: `packages/web/src/components/DayView.tsx`

`bg-[#f8f6f6]` をすべて `bg-white` か `bg-slate-50` に統一。

- [ ] **Step 1: 該当箇所を確認**

```bash
grep -n "f8f6f6" packages/web/src/components/MonthView.tsx packages/web/src/components/DayView.tsx
```

- [ ] **Step 2: 置換して統一**

セクションヘッダーや区切り背景は `bg-slate-50`、メイン背景は `bg-white` に変更。

- [ ] **Step 3: テスト確認**

```bash
pnpm --filter web test -- MonthView DayView --reporter=verbose 2>&1 | tail -20
```

- [ ] **Step 4: コミット**

```bash
git add packages/web/src/components/MonthView.tsx packages/web/src/components/DayView.tsx
git commit -m "feat(design): MonthView/DayView 背景色を白テーマに整合"
```

---

### Task 11: design-system.md 更新

**Files:**
- Modify: `docs/design/design-system.md`

Airbnb デザインシステムに合わせてドキュメントを更新。

- [ ] **Step 1: design-system.md のブランドカラーテーブルを更新**

```markdown
| トークン | 値 | 用途 |
|---|---|---|
| `primary` | `#ff385c` | アクティブ状態・CTA・強調（Rausch Red） |
| `background` | `#ffffff` | アプリ背景（純白） |
| `surface` | `#ffffff` | カード・モーダル背景 |
| `on-surface` | `#222222` | 本文テキスト（near-black） |
| `muted` | `#6a6a6a` | 補助テキスト |
```

設計原則の No-Line 原則も更新：
```
「境界は背景色の差 + 3層シャドウで表現（Airbnb shadow-airbnb-card）」
```

- [ ] **Step 2: コミット**

```bash
git add docs/design/design-system.md
git commit -m "docs: design-system.md Airbnb テーマに更新"
```

---

### Task 12: 最終確認 + push

- [ ] **Step 1: 全テスト通過確認**

```bash
pnpm --filter web test 2>&1 | tail -20
```
Expected: 全スイート PASS

- [ ] **Step 2: ビルド確認**

```bash
pnpm --filter web build 2>&1 | tail -10
```
Expected: エラーなし

- [ ] **Step 3: 開発サーバーで目視確認**

```bash
pnpm --filter web dev
```
ブラウザで http://localhost:3000 を開き、以下を確認：
- [ ] ヘッダーが白背景 + Rausch Red ロゴ
- [ ] EventCard に混雑バーが表示される（高リスクイベント）
- [ ] カードが 20px 丸み + 3層シャドウ
- [ ] フィルターチップが Rausch Red active
- [ ] BottomNav が白背景

- [ ] **Step 4: 最終 push**

```bash
git push origin main
```

---

## 使用 Skills

| Task | Skill |
|---|---|
| 全タスク（実装） | `codex` (workspace-write / gpt-5.4 / high) |
| 最終レビュー | `verification-before-completion` |

## 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `packages/web/tailwind.config.ts` | primary → Rausch Red、shadow-airbnb-* 追加 |
| `packages/web/src/app/layout.tsx` | Nunito フォント追加、bg-white |
| `packages/web/src/app/globals.css` | 背景白 |
| `packages/web/src/app/HomeContent.tsx` | ヘッダー Airbnb 化、bg-white |
| `packages/web/src/lib/colorMap.ts` | Airbnb パレット更新、barColorClass 追加 |
| `packages/web/src/lib/colorMap.test.ts` | barColorClass テスト新規追加 |
| `packages/web/src/components/EventCard.tsx` | rounded-2xl・3層shadow・congestion bar |
| `packages/web/src/components/EventCard.test.tsx` | congestion bar テスト追加 |
| `packages/web/src/components/FilterBar.tsx` | チップ・ポップオーバースタイル |
| `packages/web/src/components/FilterSheet.tsx` | チップスタイル統一 |
| `packages/web/src/components/BottomNav.tsx` | bg-white・Rausch Red active |
| `packages/web/src/components/CalendarView.tsx` | bg-white 統一 |
| `packages/web/src/components/MonthView.tsx` | bg-white 統一 |
| `packages/web/src/components/DayView.tsx` | bg-white 統一 |
| `docs/design/design-system.md` | Airbnb テーマに更新 |
