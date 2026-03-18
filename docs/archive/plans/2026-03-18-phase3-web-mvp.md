# Phase 3: Web MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 有明エリア5施設のイベント情報を可視化するNext.js静的サイトをGitHub Pagesで公開する。

**Architecture:** `packages/web/` をNext.js 15（`output: 'export'`）アプリとして構築。events.jsonはスクレイパーが毎日自動更新し、クライアント側でfetch・フィルタリングして表示する。フィルタ状態はURLパラメータ（`?facility=...&category=...`）に同期する。

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 3, TypeScript 5, Vitest 3 + React Testing Library, pnpm workspaces, GitHub Actions + GitHub Pages

**Spec:** `docs/superpowers/specs/2026-03-18-phase3-web-mvp-design.md`
**Design tokens:** `docs/design/design-tokens.md`

---

## Chunk 1: プロジェクトセットアップ + データ層

---

### Task 1: package.json + 設定ファイル群

**Files:**
- Modify: `packages/web/package.json`
- Create: `packages/web/next.config.ts`
- Create: `packages/web/tailwind.config.ts`
- Create: `packages/web/postcss.config.js`
- Create: `packages/web/tsconfig.json`
- Create: `packages/web/vitest.config.ts`
- Create: `packages/web/src/app/globals.css`
- Create: `packages/web/src/test/setup.ts`

- [ ] **Step 1: package.json を書き換える**

```json
{
  "name": "web",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.0",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: next.config.ts を作成する**

```ts
import type { NextConfig } from 'next'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const config: NextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
}

export default config
```

- [ ] **Step 3: tailwind.config.ts を作成する**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f5ff',
          100: '#dde8ff',
          200: '#c0d4ff',
          300: '#95b6ff',
          400: '#6492ff',
          500: '#2b70ef',
          600: '#2250df',
          700: '#1a40b5',
          800: '#13318d',
          900: '#0e266a',
          950: '#07194e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 4: postcss.config.js を作成する**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: tsconfig.json を作成する**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: vitest.config.ts を作成する**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

- [ ] **Step 7: src/app/globals.css を作成する**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .text-body {
    color: #3d4b5f;
  }
}
```

- [ ] **Step 8: src/test/setup.ts を作成する**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 9: 依存関係をインストールする（ルートから実行）**

```bash
# モノレポのルートから実行する（workspace リンクを正しく解決するため）
pnpm install
```

Expected: `packages/web/node_modules/` が作成されエラーなし

**basePath 環境変数の設定方針:**
- 開発時（`pnpm --filter web dev`）: `NEXT_PUBLIC_BASE_PATH` 未設定 = `''` → `http://localhost:3000/events.json` を参照
- ローカルビルド確認: `NEXT_PUBLIC_BASE_PATH=/ariake-events pnpm --filter web build`
- CI（GitHub Actions）: `env: NEXT_PUBLIC_BASE_PATH: /ariake-events` を build ステップに設定（Task 12 で追加）

- [ ] **Step 10: コミット**

```bash
git add packages/web/package.json packages/web/next.config.ts packages/web/tailwind.config.ts packages/web/postcss.config.js packages/web/tsconfig.json packages/web/vitest.config.ts packages/web/src/app/globals.css packages/web/src/test/setup.ts
git commit -m "chore(web): Next.js 15 + Tailwind + Vitest セットアップ"
```

---

### Task 2: 型定義 + テスト基盤確認

**Files:**
- Create: `packages/web/src/types.ts`
- Create: `packages/web/src/test/types.test.ts`

- [ ] **Step 1: テストを書く**

`packages/web/src/test/types.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { FACILITIES, CATEGORIES } from '@/types'

describe('定数', () => {
  it('FACILITIES に5施設が定義されている', () => {
    expect(FACILITIES).toHaveLength(5)
    expect(FACILITIES).toContain('有明ガーデン')
    expect(FACILITIES).toContain('東京ビッグサイト')
  })

  it('CATEGORIES に8カテゴリが定義されている', () => {
    expect(CATEGORIES).toHaveLength(8)
    expect(CATEGORIES).toContain('music')
    expect(CATEGORIES).toContain('other')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
pnpm --filter web test
```

Expected: FAIL with "Cannot find module '@/types'"

- [ ] **Step 3: types.ts を作成する**

```ts
export type EventCategory =
  | 'music'
  | 'sports'
  | 'exhibition'
  | 'kids'
  | 'food'
  | 'fashion'
  | 'anime'
  | 'other'

export const FACILITIES = [
  '有明ガーデン',
  '東京ガーデンシアター',
  '有明アリーナ',
  'TOYOTA ARENA TOKYO',
  '東京ビッグサイト',
] as const

export type Facility = (typeof FACILITIES)[number]

export const CATEGORIES: EventCategory[] = [
  'music', 'sports', 'exhibition', 'kids',
  'food', 'fashion', 'anime', 'other',
]

export interface EventItem {
  id: string
  eventName: string
  facility: string        // "有明ガーデン" 等
  category: EventCategory
  startDate: string       // "YYYY-MM-DD"
  endDate: string         // "YYYY-MM-DD"
  sourceURL: string
  lastUpdated: string
  // Phase 4用フィールド（UIでは無視）
  peakTimeStart?: null
  peakTimeEnd?: null
  estimatedAttendees?: null
  congestionRisk?: null
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
pnpm --filter web test
```

Expected: PASS (2 tests)

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/types.ts packages/web/src/test/types.test.ts
git commit -m "feat(web): EventItem型定義・施設/カテゴリ定数"
```

---

### Task 3: lib/dateUtils.ts

**Files:**
- Create: `packages/web/src/lib/dateUtils.ts`
- Create: `packages/web/src/lib/dateUtils.test.ts`

- [ ] **Step 1: テストを書く**

```ts
import { describe, it, expect } from 'vitest'
import { isEventOnDate, isEventInRange } from '@/lib/dateUtils'

describe('isEventOnDate', () => {
  it('日付が期間内なら true', () => {
    expect(isEventOnDate('2026-03-01', '2026-03-31', '2026-03-15')).toBe(true)
  })
  it('startDate と同じなら true', () => {
    expect(isEventOnDate('2026-03-15', '2026-03-31', '2026-03-15')).toBe(true)
  })
  it('endDate と同じなら true', () => {
    expect(isEventOnDate('2026-03-01', '2026-03-15', '2026-03-15')).toBe(true)
  })
  it('startDate より前なら false', () => {
    expect(isEventOnDate('2026-03-15', '2026-03-31', '2026-03-14')).toBe(false)
  })
  it('endDate より後なら false', () => {
    expect(isEventOnDate('2026-03-01', '2026-03-14', '2026-03-15')).toBe(false)
  })
})

describe('isEventInRange', () => {
  it('イベントが期間と重なるなら true', () => {
    expect(isEventInRange('2026-03-10', '2026-03-20', '2026-03-15', '2026-03-25')).toBe(true)
  })
  it('イベントが完全に期間内なら true', () => {
    expect(isEventInRange('2026-03-15', '2026-03-18', '2026-03-14', '2026-03-20')).toBe(true)
  })
  it('イベントが期間より前なら false', () => {
    expect(isEventInRange('2026-03-01', '2026-03-10', '2026-03-15', '2026-03-25')).toBe(false)
  })
  it('イベントが期間より後なら false', () => {
    expect(isEventInRange('2026-03-20', '2026-03-25', '2026-03-01', '2026-03-10')).toBe(false)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
pnpm --filter web test
```

Expected: FAIL

- [ ] **Step 3: dateUtils.ts を実装する**

```ts
/** 今日の日付を "YYYY-MM-DD" 形式で返す（JST基準） */
export function getTodayString(): string {
  // toISOString() は UTC なので JST ではズレる。toLocaleDateString で JST を明示する。
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
}

/** 今日から N 日後の日付を "YYYY-MM-DD" 形式で返す（JST基準） */
export function getDateAfterDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
}

/** イベントが指定の日付に開催されているか */
export function isEventOnDate(
  startDate: string,
  endDate: string,
  date: string,
): boolean {
  return startDate <= date && date <= endDate
}

/** イベントが [from, to] の期間と重なるか */
export function isEventInRange(
  startDate: string,
  endDate: string,
  from: string,
  to: string,
): boolean {
  return startDate <= to && endDate >= from
}

/** "YYYY-MM-DD" を "M月D日(曜)" 形式に変換する */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`
}

/** startDate と endDate が同じなら "M月D日(曜)" を返す。違えば "M月D日〜M月D日" を返す */
export function formatDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDate(startDate)
  return `${formatDate(startDate)}〜${formatDate(endDate)}`
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
pnpm --filter web test
```

Expected: PASS (9 tests)

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/lib/dateUtils.ts packages/web/src/lib/dateUtils.test.ts
git commit -m "feat(web): dateUtils — 日付範囲判定・フォーマット"
```

---

### Task 4: lib/filter.ts

**Files:**
- Create: `packages/web/src/lib/filter.ts`
- Create: `packages/web/src/lib/filter.test.ts`

- [ ] **Step 1: テストを書く**

```ts
import { describe, it, expect } from 'vitest'
import {
  getDefaultFilters,
  filterEvents,
  parseFiltersFromParams,
  filtersToParams,
} from '@/lib/filter'
import type { EventItem } from '@/types'

const mockEvents: EventItem[] = [
  { id: '1', eventName: 'Concert A', facility: '有明アリーナ', category: 'music',
    startDate: '2026-03-20', endDate: '2026-03-20', sourceURL: '', lastUpdated: '' },
  { id: '2', eventName: 'Exhibition B', facility: '東京ビッグサイト', category: 'exhibition',
    startDate: '2026-03-21', endDate: '2026-03-25', sourceURL: '', lastUpdated: '' },
  { id: '3', eventName: 'Sports C', facility: '有明アリーナ', category: 'sports',
    startDate: '2026-03-22', endDate: '2026-03-22', sourceURL: '', lastUpdated: '' },
]

describe('getDefaultFilters', () => {
  it('5施設・8カテゴリすべて選択済みで返す', () => {
    const f = getDefaultFilters()
    expect(f.facilities).toHaveLength(5)
    expect(f.categories).toHaveLength(8)
  })
})

describe('filterEvents', () => {
  it('全選択なら全件返す', () => {
    expect(filterEvents(mockEvents, getDefaultFilters())).toHaveLength(3)
  })
  it('施設フィルタで絞り込む', () => {
    const f = { ...getDefaultFilters(), facilities: ['有明アリーナ'] }
    expect(filterEvents(mockEvents, f)).toHaveLength(2)
  })
  it('カテゴリフィルタで絞り込む', () => {
    const f = { ...getDefaultFilters(), categories: ['music'] as any }
    const result = filterEvents(mockEvents, f)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
  it('施設もカテゴリも空なら0件', () => {
    const f = { facilities: [], categories: [] as any }
    expect(filterEvents(mockEvents, f)).toHaveLength(0)
  })
})

describe('parseFiltersFromParams', () => {
  it('facility パラメータを配列に変換する', () => {
    const p = new URLSearchParams('facility=有明アリーナ,東京ビッグサイト')
    expect(parseFiltersFromParams(p).facilities).toEqual(['有明アリーナ', '東京ビッグサイト'])
  })
  it('category パラメータを配列に変換する', () => {
    const p = new URLSearchParams('category=music,sports')
    expect(parseFiltersFromParams(p).categories).toEqual(['music', 'sports'])
  })
  it('パラメータなしなら空オブジェクトを返す', () => {
    expect(parseFiltersFromParams(new URLSearchParams())).toEqual({})
  })
})

describe('filtersToParams', () => {
  it('デフォルト状態なら空文字列を返す（URLを汚さない）', () => {
    expect(filtersToParams(getDefaultFilters())).toBe('')
  })
  it('絞り込み状態なら ?facility=... を返す', () => {
    const f = { ...getDefaultFilters(), facilities: ['有明アリーナ'] }
    expect(filtersToParams(f)).toContain('facility=')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
pnpm --filter web test
```

Expected: FAIL

- [ ] **Step 3: filter.ts を実装する**

```ts
import { FACILITIES, CATEGORIES } from '@/types'
import type { EventCategory, EventItem } from '@/types'

export interface FilterState {
  facilities: string[]
  categories: EventCategory[]
}

export function getDefaultFilters(): FilterState {
  return {
    facilities: [...FACILITIES],
    categories: [...CATEGORIES],
  }
}

export function filterEvents(events: EventItem[], filters: FilterState): EventItem[] {
  return events.filter(
    (e) =>
      filters.facilities.includes(e.facility) &&
      filters.categories.includes(e.category),
  )
}

export function parseFiltersFromParams(params: URLSearchParams): Partial<FilterState> {
  const result: Partial<FilterState> = {}

  const facility = params.get('facility')
  if (facility) result.facilities = facility.split(',').filter(Boolean)

  const category = params.get('category')
  if (category) result.categories = category.split(',').filter(Boolean) as EventCategory[]

  return result
}

export function filtersToParams(filters: FilterState): string {
  const defaults = getDefaultFilters()
  const params = new URLSearchParams()

  const facilityChanged =
    filters.facilities.length !== defaults.facilities.length ||
    filters.facilities.some((f) => !defaults.facilities.includes(f))
  if (facilityChanged) params.set('facility', filters.facilities.join(','))

  const categoryChanged =
    filters.categories.length !== defaults.categories.length ||
    filters.categories.some((c) => !defaults.categories.includes(c))
  if (categoryChanged) params.set('category', filters.categories.join(','))

  const str = params.toString()
  return str ? `?${str}` : ''
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
pnpm --filter web test
```

Expected: PASS (11 tests)

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/lib/filter.ts packages/web/src/lib/filter.test.ts
git commit -m "feat(web): filterEvents・URLパラメータ同期ロジック"
```

---

### Task 5: lib/events.ts + layout.tsx + 最小 page.tsx

**Files:**
- Create: `packages/web/src/lib/events.ts`
- Create: `packages/web/src/app/layout.tsx`
- Create: `packages/web/src/app/page.tsx`（最小構成）

- [ ] **Step 1: lib/events.ts を作成する**

```ts
import type { EventItem } from '@/types'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export async function fetchEvents(): Promise<EventItem[]> {
  const res = await fetch(`${BASE_PATH}/events.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
  return res.json()
}
```

- [ ] **Step 2: layout.tsx を作成する**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ariake Events — 有明エリアイベント情報',
  description: '有明エリア5施設（有明ガーデン・東京ガーデンシアター・有明アリーナ・TOYOTA ARENA TOKYO・東京ビッグサイト）のイベント情報をまとめて確認。',
  openGraph: {
    title: 'Ariake Events — 有明エリアイベント情報',
    description: '有明エリア5施設のイベントをまとめてチェック。今日・今週・月別カレンダーで確認できます。',
    url: 'https://kannohi1.github.io/ariake-events',
    siteName: 'Ariake Events',
    images: [{ url: '/ariake-events/ogp.png', width: 1200, height: 630 }],
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen font-sans">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: 最小 page.tsx を作成する（イベント件数だけ表示）**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { fetchEvents } from '@/lib/events'
import type { EventItem } from '@/types'

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Ariake Events</h1>
      {loading ? (
        <p className="text-slate-500">読み込み中...</p>
      ) : (
        <p className="text-body">{events.length}件のイベント</p>
      )}
    </main>
  )
}
```

- [ ] **Step 4: events.json の存在を確認する**

```bash
ls packages/web/public/events.json
```

Expected: ファイルが存在する。なければスクレイパーを一度実行してから進む:
```bash
pnpm --filter scraper start
```

- [ ] **Step 5: ローカルで動作確認する**

```bash
pnpm --filter web dev
```

Expected: `http://localhost:3000` でページが表示され「173件のイベント」（または類似の件数）が出ること

- [ ] **Step 6: ビルドが通ることを確認する**

```bash
NEXT_PUBLIC_BASE_PATH=/ariake-events pnpm --filter web build
```

Expected: `packages/web/out/` が生成されエラーなし

- [ ] **Step 7: コミット**

```bash
git add packages/web/src/lib/events.ts packages/web/src/app/layout.tsx packages/web/src/app/page.tsx
git commit -m "feat(web): events.json fetch + 最小ページ表示確認"
```

---

## Chunk 2: コアUIコンポーネント + フィルタ

---

### Task 6: EventCard.tsx

**Files:**
- Create: `packages/web/src/components/EventCard.tsx`
- Create: `packages/web/src/components/EventCard.test.tsx`
- Create: `packages/web/src/lib/colorMap.ts`

**colorMap.ts の役割:** 施設名・カテゴリ名 → Tailwindクラスのマッピング。コンポーネントに直接クラス文字列を書かず、ここを唯一の定義箇所にする。

- [ ] **Step 1: テストを書く**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EventCard } from '@/components/EventCard'
import type { EventItem } from '@/types'

const mockEvent: EventItem = {
  id: 'test-1',
  eventName: 'Mrs. GREEN APPLE TOUR 2026',
  facility: '有明アリーナ',
  category: 'music',
  startDate: '2026-05-03',
  endDate: '2026-05-04',
  sourceURL: 'https://example.com',
  lastUpdated: '2026-03-18T00:00:00Z',
}

describe('EventCard', () => {
  it('イベント名を表示する', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByText('Mrs. GREEN APPLE TOUR 2026')).toBeInTheDocument()
  })

  it('施設名を表示する', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByText('有明アリーナ')).toBeInTheDocument()
  })

  it('カテゴリタグを表示する', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByText('music')).toBeInTheDocument()
  })

  it('日付範囲を表示する', () => {
    render(<EventCard event={mockEvent} />)
    // formatDateRange の出力を含むテキストが存在する
    expect(screen.getByText(/5月3日/)).toBeInTheDocument()
  })

  it('公式サイトリンクを持つ', () => {
    render(<EventCard event={mockEvent} />)
    const link = screen.getByRole('link', { name: /公式サイト/ })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
pnpm --filter web test
```

Expected: FAIL

- [ ] **Step 3: colorMap.ts を作成する**

```ts
import type { EventCategory } from '@/types'

export const FACILITY_COLORS: Record<string, string> = {
  '有明ガーデン':       'bg-emerald-100 text-emerald-700 border border-emerald-200',
  '東京ガーデンシアター': 'bg-violet-100  text-violet-700  border border-violet-200',
  '有明アリーナ':       'bg-sky-100     text-sky-700     border border-sky-200',
  'TOYOTA ARENA TOKYO': 'bg-amber-100   text-amber-700   border border-amber-200',
  '東京ビッグサイト':   'bg-rose-100    text-rose-700    border border-rose-200',
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  music:      'bg-violet-100  text-violet-700',
  sports:     'bg-emerald-100 text-emerald-700',
  exhibition: 'bg-amber-100   text-amber-700',
  kids:       'bg-pink-100    text-pink-700',
  food:       'bg-orange-100  text-orange-700',
  fashion:    'bg-fuchsia-100 text-fuchsia-700',
  anime:      'bg-cyan-100    text-cyan-700',
  other:      'bg-slate-100   text-slate-600',
}

export const CATEGORY_DOT_COLORS: Record<EventCategory, string> = {
  music:      'bg-violet-500',
  sports:     'bg-emerald-500',
  exhibition: 'bg-amber-500',
  kids:       'bg-pink-500',
  food:       'bg-orange-500',
  fashion:    'bg-fuchsia-500',
  anime:      'bg-cyan-500',
  other:      'bg-slate-400',
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music:      'music',
  sports:     'sports',
  exhibition: 'exhibition',
  kids:       'kids',
  food:       'food',
  fashion:    'fashion',
  anime:      'anime',
  other:      'other',
}
```

- [ ] **Step 4: EventCard.tsx を実装する**

```tsx
import { formatDateRange } from '@/lib/dateUtils'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/colorMap'
import type { EventItem } from '@/types'

interface Props {
  event: EventItem
}

export function EventCard({ event }: Props) {
  const facilityClass = FACILITY_COLORS[event.facility] ?? 'bg-slate-100 text-slate-600 border border-slate-200'
  const categoryClass = CATEGORY_COLORS[event.category]

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-150">
      {/* カテゴリタグ + 施設バッジ */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`${categoryClass} rounded-md px-1.5 py-0.5 text-xs font-medium`}>
          {CATEGORY_LABELS[event.category]}
        </span>
        <span className={`${facilityClass} rounded-full px-2 py-0.5 text-xs font-medium`}>
          {event.facility}
        </span>
      </div>

      {/* イベント名 */}
      <h2 className="text-base font-bold text-slate-900 leading-snug mb-1">
        {event.eventName}
      </h2>

      {/* 日付 */}
      <p className="text-sm text-slate-500 mb-3">
        {formatDateRange(event.startDate, event.endDate)}
      </p>

      {/* 公式サイトリンク */}
      <a
        href={event.sourceURL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary-500 hover:text-primary-700 font-medium"
      >
        公式サイト →
      </a>
    </article>
  )
}
```

- [ ] **Step 5: テストが通ることを確認する**

```bash
pnpm --filter web test
```

Expected: PASS (5 tests + 前タスクの tests)

- [ ] **Step 6: コミット**

```bash
git add packages/web/src/components/EventCard.tsx packages/web/src/components/EventCard.test.tsx packages/web/src/lib/colorMap.ts
git commit -m "feat(web): EventCard コンポーネント"
```

---

### Task 7: FilterBar.tsx

**Files:**
- Create: `packages/web/src/components/FilterBar.tsx`
- Create: `packages/web/src/components/FilterBar.test.tsx`

- [ ] **Step 1: テストを書く**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterBar } from '@/components/FilterBar'
import { getDefaultFilters } from '@/lib/filter'

describe('FilterBar', () => {
  it('施設チップを5つ表示する', () => {
    render(
      <FilterBar
        filters={getDefaultFilters()}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onClearAll={vi.fn()}
      />
    )
    const facilityNames = ['有明ガーデン', '東京ガーデンシアター', '有明アリーナ', 'TOYOTA ARENA TOKYO', '東京ビッグサイト']
    facilityNames.forEach((name) => expect(screen.getByText(name)).toBeInTheDocument())
  })

  it('カテゴリチップを8つ表示する', () => {
    render(
      <FilterBar
        filters={getDefaultFilters()}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onClearAll={vi.fn()}
      />
    )
    const categories = ['music', 'sports', 'exhibition', 'kids', 'food', 'fashion', 'anime', 'other']
    categories.forEach((cat) => expect(screen.getByText(cat)).toBeInTheDocument())
  })

  it('施設チップクリックで onToggleFacility が呼ばれる', async () => {
    const onToggleFacility = vi.fn()
    render(
      <FilterBar
        filters={getDefaultFilters()}
        onToggleFacility={onToggleFacility}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onClearAll={vi.fn()}
      />
    )
    await userEvent.click(screen.getByText('有明アリーナ'))
    expect(onToggleFacility).toHaveBeenCalledWith('有明アリーナ')
  })

  it('未選択の施設チップは bg-white クラスを持つ', () => {
    const filters = { ...getDefaultFilters(), facilities: [] }
    render(
      <FilterBar
        filters={filters}
        onToggleFacility={vi.fn()}
        onToggleCategory={vi.fn()}
        onSelectAll={vi.fn()}
        onClearAll={vi.fn()}
      />
    )
    const chip = screen.getByRole('button', { name: '有明ガーデン' })
    expect(chip).toHaveClass('bg-white')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
pnpm --filter web test
```

- [ ] **Step 3: FilterBar.tsx を実装する**

```tsx
import { FACILITIES, CATEGORIES } from '@/types'
import { FACILITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/colorMap'
import type { FilterState } from '@/lib/filter'
import type { EventCategory } from '@/types'

interface Props {
  filters: FilterState
  onToggleFacility: (facility: string) => void
  onToggleCategory: (category: EventCategory) => void
  onSelectAll: () => void
  onClearAll: () => void
}

export function FilterBar({
  filters,
  onToggleFacility,
  onToggleCategory,
  onSelectAll,
  onClearAll,
}: Props) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 space-y-2">
      {/* 施設フィルタ */}
      <div className="flex flex-wrap items-center gap-2">
        {FACILITIES.map((facility) => {
          const active = filters.facilities.includes(facility)
          return (
            <button
              key={facility}
              onClick={() => onToggleFacility(facility)}
              className={
                active
                  ? `${FACILITY_COLORS[facility]} rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer`
                  : 'bg-white border border-slate-200 text-slate-500 rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-gray-50'
              }
            >
              {facility}
            </button>
          )
        })}
      </div>

      {/* カテゴリフィルタ */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((category) => {
          const active = filters.categories.includes(category)
          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={
                active
                  ? `${CATEGORY_COLORS[category]} rounded-md px-1.5 py-0.5 text-xs font-medium cursor-pointer`
                  : 'bg-white border border-slate-200 text-slate-500 rounded-md px-1.5 py-0.5 text-xs font-medium cursor-pointer hover:bg-gray-50'
              }
            >
              {CATEGORY_LABELS[category]}
            </button>
          )
        })}

        {/* 全選択 / 全解除 */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-primary-500 hover:text-primary-700 font-medium cursor-pointer"
          >
            すべて選択
          </button>
          <button
            onClick={onClearAll}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
          >
            すべて解除
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
pnpm --filter web test
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/components/FilterBar.tsx packages/web/src/components/FilterBar.test.tsx
git commit -m "feat(web): FilterBar — 施設/カテゴリフィルタUI"
```

---

### Task 8: ViewTabs + TodayView + WeekView

**Files:**
- Create: `packages/web/src/components/ViewTabs.tsx`
- Create: `packages/web/src/components/TodayView.tsx`
- Create: `packages/web/src/components/WeekView.tsx`
- Create: `packages/web/src/components/TodayView.test.tsx`

- [ ] **Step 1: テストを書く**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodayView } from '@/components/TodayView'
import type { EventItem } from '@/types'

// dateUtils の getTodayString を固定値に差し替える
vi.mock('@/lib/dateUtils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/dateUtils')>()
  return { ...mod, getTodayString: () => '2026-03-20' }
})

const events: EventItem[] = [
  { id: '1', eventName: 'Today Event', facility: '有明アリーナ', category: 'music',
    startDate: '2026-03-20', endDate: '2026-03-20', sourceURL: '', lastUpdated: '' },
  { id: '2', eventName: 'Future Event', facility: '東京ビッグサイト', category: 'exhibition',
    startDate: '2026-03-25', endDate: '2026-03-30', sourceURL: '', lastUpdated: '' },
  { id: '3', eventName: 'Long Event', facility: '有明ガーデン', category: 'food',
    startDate: '2026-03-01', endDate: '2026-03-31', sourceURL: '', lastUpdated: '' },
]

describe('TodayView', () => {
  it('今日開催のイベントのみ表示する', () => {
    render(<TodayView events={events} />)
    expect(screen.getByText('Today Event')).toBeInTheDocument()
    expect(screen.getByText('Long Event')).toBeInTheDocument()
    expect(screen.queryByText('Future Event')).not.toBeInTheDocument()
  })

  it('0件のとき空状態メッセージを表示する', () => {
    render(<TodayView events={[]} />)
    expect(screen.getByText(/条件に一致するイベントがありません/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
pnpm --filter web test
```

- [ ] **Step 3: ViewTabs.tsx を作成する**

```tsx
export type ViewType = 'today' | 'week' | 'calendar'

interface Props {
  activeView: ViewType
  onChangeView: (view: ViewType) => void
}

const TABS: { key: ViewType; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '今週' },
  { key: 'calendar', label: 'カレンダー' },
]

export function ViewTabs({ activeView, onChangeView }: Props) {
  return (
    <div className="flex gap-1 px-4 pt-2">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChangeView(key)}
          className={
            activeView === key
              ? 'px-4 py-2 text-sm font-medium text-primary-500 border-b-2 border-primary-500 cursor-pointer'
              : 'px-4 py-2 text-sm font-medium text-slate-500 border-b-2 border-transparent hover:text-slate-700 cursor-pointer'
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: TodayView.tsx を作成する**

```tsx
import { EventCard } from '@/components/EventCard'
import { getTodayString, isEventOnDate } from '@/lib/dateUtils'
import { FACILITIES } from '@/types'
import type { EventItem } from '@/types'

const FACILITY_ORDER = [...FACILITIES]

interface Props {
  events: EventItem[]
  onResetFilters: () => void
}

export function TodayView({ events, onResetFilters }: Props) {
  const today = getTodayString()
  const todayEvents = events
    .filter((e) => isEventOnDate(e.startDate, e.endDate, today))
    .sort(
      (a, b) =>
        FACILITY_ORDER.indexOf(a.facility as any) -
        FACILITY_ORDER.indexOf(b.facility as any),
    )

  if (todayEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-2">条件に一致するイベントがありません</p>
        <button
          onClick={onResetFilters}
          className="text-sm text-primary-500 hover:text-primary-700 font-medium cursor-pointer"
        >
          フィルタをリセット
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {todayEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: WeekView.tsx を作成する**

```tsx
import { EventCard } from '@/components/EventCard'
import { getTodayString, getDateAfterDays, isEventInRange } from '@/lib/dateUtils'
import type { EventItem } from '@/types'

interface Props {
  events: EventItem[]
  onResetFilters: () => void
}

export function WeekView({ events, onResetFilters }: Props) {
  const today = getTodayString()
  const weekEnd = getDateAfterDays(7)
  const weekEvents = events
    .filter((e) => isEventInRange(e.startDate, e.endDate, today, weekEnd))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  if (weekEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-2">条件に一致するイベントがありません</p>
        <button
          onClick={onResetFilters}
          className="text-sm text-primary-500 hover:text-primary-700 font-medium cursor-pointer"
        >
          フィルタをリセット
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {weekEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

- [ ] **Step 6: テストが通ることを確認する**

```bash
pnpm --filter web test
```

Expected: PASS

- [ ] **Step 7: コミット**

```bash
git add packages/web/src/components/ViewTabs.tsx packages/web/src/components/TodayView.tsx packages/web/src/components/WeekView.tsx packages/web/src/components/TodayView.test.tsx
git commit -m "feat(web): ViewTabs + TodayView + WeekView"
```

---

### Task 9: page.tsx 完成（フィルタ状態 + URL同期）

**Files:**
- Modify: `packages/web/src/app/page.tsx`

- [ ] **Step 1: page.tsx を完成させる**

```tsx
'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchEvents } from '@/lib/events'
import { getDefaultFilters, filterEvents, parseFiltersFromParams, filtersToParams } from '@/lib/filter'
import { FilterBar } from '@/components/FilterBar'
import { ViewTabs } from '@/components/ViewTabs'
import { TodayView } from '@/components/TodayView'
import { WeekView } from '@/components/WeekView'
import type { EventItem, EventCategory } from '@/types'
import type { FilterState } from '@/lib/filter'
import type { ViewType } from '@/components/ViewTabs'

function AppContent() {
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewType>('today')
  const [filters, setFilters] = useState<FilterState>(() => {
    const parsed = parseFiltersFromParams(searchParams)
    return { ...getDefaultFilters(), ...parsed }
  })

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  // filters が変わるたびに URL を同期する（side effect をハンドラに持ち込まない）
  useEffect(() => {
    const qs = filtersToParams(filters)
    window.history.replaceState(null, '', qs || window.location.pathname)
  }, [filters])

  const toggleFacility = useCallback((facility: string) => {
    setFilters((prev) =>
      prev.facilities.includes(facility)
        ? { ...prev, facilities: prev.facilities.filter((f) => f !== facility) }
        : { ...prev, facilities: [...prev.facilities, facility] },
    )
  }, [])

  const toggleCategory = useCallback((category: EventCategory) => {
    setFilters((prev) =>
      prev.categories.includes(category)
        ? { ...prev, categories: prev.categories.filter((c) => c !== category) }
        : { ...prev, categories: [...prev.categories, category] },
    )
  }, [])

  const selectAll = useCallback(() => setFilters(getDefaultFilters()), [])
  const clearAll = useCallback(() => setFilters({ facilities: [], categories: [] }), [])

  const filteredEvents = useMemo(
    () => filterEvents(events, filters),
    [events, filters],
  )

  return (
    <div>
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">Ariake Events</h1>
        <p className="text-xs text-slate-500">有明エリアのイベント情報</p>
      </header>

      {/* タブ + フィルタ（sticky） */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <ViewTabs activeView={activeView} onChangeView={setActiveView} />
        <FilterBar
          filters={filters}
          onToggleFacility={toggleFacility}
          onToggleCategory={toggleCategory}
          onSelectAll={selectAll}
          onClearAll={clearAll}
        />
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-slate-500">読み込み中...</p>
          </div>
        ) : (
          <>
            {activeView === 'today' && <TodayView events={filteredEvents} onResetFilters={selectAll} />}
            {activeView === 'week' && <WeekView events={filteredEvents} onResetFilters={selectAll} />}
            {activeView === 'calendar' && (
              <p className="text-slate-500 text-center py-16">カレンダービューは近日公開</p>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-500">読み込み中...</div>}>
      <AppContent />
    </Suspense>
  )
}
```

- [ ] **Step 2: ローカルで動作確認する**

```bash
pnpm --filter web dev
```

確認項目:
- 今日/今週タブが切り替わること
- フィルタチップのトグルが動くこと
- URLが `?facility=...` に変わること
- URLをコピーして新しいタブで開くとフィルタ状態が復元されること

- [ ] **Step 3: ビルドが通ることを確認する**

```bash
pnpm --filter web build
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add packages/web/src/app/page.tsx
git commit -m "feat(web): メインページ — フィルタ + URL同期 + ビュー切替"
```

---

## Chunk 3: カレンダー + シェア + デプロイ

---

### Task 10: CalendarView.tsx

**Files:**
- Create: `packages/web/src/components/CalendarView.tsx`
- Create: `packages/web/src/components/CalendarView.test.tsx`

カレンダーは月グリッド（7列 × 最大6行）。各セルに当日のイベントを最大3ドット表示し、4件以上は `+N` で示す。今日のセルは `bg-primary-50` でハイライト。月ナビゲーション（前月/次月）を持つ。

- [ ] **Step 1: テストを書く**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CalendarView } from '@/components/CalendarView'
import type { EventItem } from '@/types'

vi.mock('@/lib/dateUtils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/dateUtils')>()
  return { ...mod, getTodayString: () => '2026-03-20' }
})

const events: EventItem[] = [
  { id: '1', eventName: 'Concert', facility: '有明アリーナ', category: 'music',
    startDate: '2026-03-20', endDate: '2026-03-20', sourceURL: '', lastUpdated: '' },
  { id: '2', eventName: 'Exhibition', facility: '東京ビッグサイト', category: 'exhibition',
    startDate: '2026-03-22', endDate: '2026-03-25', sourceURL: '', lastUpdated: '' },
]

describe('CalendarView', () => {
  it('現在の年月を表示する', () => {
    render(<CalendarView events={events} />)
    expect(screen.getByText(/2026年3月/)).toBeInTheDocument()
  })

  it('前月/次月ボタンが存在する', () => {
    render(<CalendarView events={events} />)
    expect(screen.getByRole('button', { name: /前月/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /次月/ })).toBeInTheDocument()
  })

  it('次月ボタンで月が進む', async () => {
    render(<CalendarView events={events} />)
    await userEvent.click(screen.getByRole('button', { name: /次月/ }))
    expect(screen.getByText(/2026年4月/)).toBeInTheDocument()
  })

  it('今日の日付セルに特別なマーキングがある', () => {
    const { container } = render(<CalendarView events={events} />)
    // 今日（20日）のセルが bg-primary-50 を持つ
    const todayCell = container.querySelector('[data-today="true"]')
    expect(todayCell).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
pnpm --filter web test
```

- [ ] **Step 3: CalendarView.tsx を実装する**

```tsx
'use client'

import { useState, useMemo } from 'react'
import { getTodayString, isEventOnDate } from '@/lib/dateUtils'
import { CATEGORY_DOT_COLORS } from '@/lib/colorMap'
import type { EventItem, EventCategory } from '@/types'

interface Props {
  events: EventItem[]
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// toISOString() は UTC 日付を返すため、ローカル日付を直接文字列化する
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DAY_HEADERS = ['日', '月', '火', '水', '木', '金', '土']

export function CalendarView({ events }: Props) {
  const today = getTodayString()
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const days = useMemo(() => getDaysInMonth(year, month), [year, month])

  // 月の最初の曜日（0=日）だけ先頭に空セルを追加
  const startOffset = days[0].getDay()

  // 日付ごとのイベントマップ
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {}
    days.forEach((d) => {
      const ds = toDateStr(d)
      map[ds] = events.filter((e) => isEventOnDate(e.startDate, e.endDate, ds))
    })
    return map
  }, [events, days])

  return (
    <div>
      {/* 月ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          aria-label="前月"
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-gray-50 cursor-pointer"
        >
          ‹
        </button>
        <h2 className="text-base font-bold text-slate-900">
          {year}年{month + 1}月
        </h2>
        <button
          onClick={nextMonth}
          aria-label="次月"
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-700 hover:bg-gray-50 cursor-pointer"
        >
          ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
        {/* 先頭の空セル */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50 min-h-[64px]" />
        ))}

        {days.map((d) => {
          const ds = toDateStr(d)
          const isToday = ds === today
          const dayEvents = eventsByDate[ds] ?? []
          const visibleDots = dayEvents.slice(0, 3)
          const extraCount = dayEvents.length - 3

          return (
            <div
              key={ds}
              data-today={isToday || undefined}
              className={`min-h-[64px] p-1 ${isToday ? 'bg-primary-50' : 'bg-white'}`}
            >
              <p className={`text-xs font-medium mb-1 ${isToday ? 'text-primary-500' : 'text-slate-700'}`}>
                {d.getDate()}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {visibleDots.map((e) => (
                  <span
                    key={e.id}
                    title={e.eventName}
                    className={`w-2 h-2 rounded-full inline-block ${CATEGORY_DOT_COLORS[e.category]}`}
                  />
                ))}
                {extraCount > 0 && (
                  <span className="text-[10px] text-slate-400 leading-none">+{extraCount}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: page.tsx の CalendarView プレースホルダーを差し替える**

`packages/web/src/app/page.tsx` の `activeView === 'calendar'` の部分を:

```tsx
{activeView === 'calendar' && <CalendarView events={filteredEvents} />}
```

に変更する。importも追加:
```tsx
import { CalendarView } from '@/components/CalendarView'
```

- [ ] **Step 5: テストが通ることを確認する**

```bash
pnpm --filter web test
```

Expected: PASS

- [ ] **Step 6: ローカルで動作確認する**

```bash
pnpm --filter web dev
```

確認: カレンダータブでグリッドが表示され、イベントがドットで表示されること

- [ ] **Step 7: コミット**

```bash
git add packages/web/src/components/CalendarView.tsx packages/web/src/components/CalendarView.test.tsx packages/web/src/app/page.tsx
git commit -m "feat(web): CalendarView — 月グリッド + カテゴリドット"
```

---

### Task 11: ShareButton.tsx + OGPメタタグ

**Files:**
- Create: `packages/web/src/components/ShareButton.tsx`
- Modify: `packages/web/src/components/EventCard.tsx`
- Create: `packages/web/public/ogp.png`（プレースホルダー画像 — 1200×630px）

**注意:** OGP画像は `packages/web/public/ogp.png` に静的PNGを配置する。ファイルが存在しない場合、Next.jsビルドは通るがSNSでのプレビューが出ない。後で差し替え可能。

- [ ] **Step 1: ShareButton.tsx を作成する**

```tsx
'use client'

import { useState } from 'react'

interface Props {
  title: string
  text: string
  url: string
}

export function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // キャンセルは無視
      }
    } else {
      // フォールバック: クリップボードにコピー（HTTPS または localhost でのみ動作）
      await navigator.clipboard?.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
    >
      {copied ? 'コピーしました ✓' : 'シェア'}
    </button>
  )
}
```

- [ ] **Step 2: EventCard.tsx に ShareButton を追加する**

EventCard.tsx の「公式サイトリンク」の隣に ShareButton を追加:

```tsx
// EventCard.tsx の import に追加
import { ShareButton } from '@/components/ShareButton'

// カード内のリンク部分を以下に差し替える
<div className="flex items-center justify-between">
  <a
    href={event.sourceURL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-primary-500 hover:text-primary-700 font-medium"
  >
    公式サイト →
  </a>
  <ShareButton
    title={event.eventName}
    text={`${event.facility} | ${event.startDate}`}
    url={`https://kannohi1.github.io/ariake-events?event=${event.id}`}
  />
</div>
```

- [ ] **Step 3: OGP画像のプレースホルダーを作成する**

`packages/web/public/ogp.png` に 1200×630 の PNG を配置する。
今は真っ白または単色でOK。後でデザインを差し替える。

Bashで最小PNG（1x1 白）を作成する（ImageMagickがない場合はファイルをSkip、後でGitHub上で追加する）:

```bash
# ImageMagickがあれば:
convert -size 1200x630 xc:"#2b70ef" packages/web/public/ogp.png
# なければ: packages/web/public/ にダミーの ogp.png を手動で配置する
```

- [ ] **Step 4: ビルドとテストが通ることを確認する**

```bash
pnpm --filter web test
pnpm --filter web build
```

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/components/ShareButton.tsx packages/web/src/components/EventCard.tsx packages/web/public/ogp.png
git commit -m "feat(web): ShareButton — Web Share API + フォールバックコピー + OGPメタタグ"
```

---

### Task 12: GitHub Actions + GitHub Pages デプロイ

**Files:**
- Modify: `.github/workflows/scrape.yml`
- Create: `packages/web/.env.production`

- [ ] **Step 1: GitHub Pages の Source を事前設定する（CI前に必須）**

GitHub リポジトリの Settings → Pages で:
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `/ (root)`

に設定する。この設定がないとデプロイ後もサイトが公開されない。
`gh-pages` ブランチはまだ存在しなくてもOK（初回 CI で自動作成される）。

- [ ] **Step 2: .env.production を作成する**

```
NEXT_PUBLIC_BASE_PATH=/ariake-events
```

**注意:** このファイルはシークレットを含まないためコミット対象。
`.gitignore` に `.env.production` が含まれていないことを確認してからコミットする:
```bash
grep "env.production" packages/web/.gitignore 2>/dev/null || echo "gitignoreに記載なし — コミット可"
```

- [ ] **Step 3: scrape.yml を更新する**

既存の `scrape.yml` の末尾（`git push` の後）に以下のステップを追加する:

```yaml
      - name: Setup pnpm for web build
        # すでに pnpm セットアップ済みのためスキップ可
        run: echo "pnpm already set up"

      - name: Install web dependencies
        run: pnpm --filter web install

      - name: Build Next.js
        env:
          NEXT_PUBLIC_BASE_PATH: /ariake-events
        run: pnpm --filter web build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: packages/web/out
          force_orphan: true
```

また、ジョブの `permissions` に `pages: write` を追加する:

```yaml
permissions:
  contents: write
  pages: write
```

- [ ] **Step 4: ローカルでビルドが通ることを確認する**

```bash
NEXT_PUBLIC_BASE_PATH=/ariake-events pnpm --filter web build
```

Expected: `packages/web/out/` に静的ファイルが生成される

- [ ] **Step 5: コミットしてプッシュ（CI トリガー）**

```bash
git add .github/workflows/scrape.yml packages/web/.env.production
git commit -m "feat(web): GitHub Pages デプロイ — scrape.yml に build+deploy ステップ追加"
git push
```

- [ ] **Step 6: GitHub Actions の実行を確認する**

GitHub リポジトリの Actions タブで workflow の実行を確認する。
成功すれば `https://kannohi1.github.io/ariake-events` でサイトが公開される。

---

## 完成チェックリスト

- [ ] `pnpm --filter web test` が全て PASS
- [ ] `pnpm --filter web build` がエラーなし
- [ ] `https://kannohi1.github.io/ariake-events` でページが表示される
- [ ] 今日/今週/カレンダーのタブが切り替わる
- [ ] 施設・カテゴリフィルタが動作する
- [ ] フィルタ変更でURLが更新される
- [ ] URLをコピーして新タブで開くとフィルタ状態が復元される
- [ ] イベントカードのシェアボタンが動作する
- [ ] モバイル（375px）でレイアウトが崩れない
