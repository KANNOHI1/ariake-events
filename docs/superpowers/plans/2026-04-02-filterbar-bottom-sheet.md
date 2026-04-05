# FilterBar Bottom Sheet 化 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** FilterBar の施設・カテゴリチップ2行レイアウトをBottom Sheet方式に置き換え、モバイル（390px）での操作性を抜本的に改善する。

**Architecture:** `FilterBar.tsx` をコンパクトヘッダー（絞り込みボタン + グリッドトグル）に改修し、新規 `FilterSheet.tsx` コンポーネントで施設・カテゴリ選択UIを下からスライドするシートとして実装する。Props は親コンポーネント（page.tsx）への破壊的変更ゼロ。アニメーションは CSS transform のみ、外部ライブラリ不要。

**Tech Stack:** Next.js 15 (App Router, 静的エクスポート), React 19, TypeScript, Tailwind CSS 3, Vitest 3, @testing-library/react, createPortal (SSR対応あり)

---

## ファイルマップ

| ファイル | 種別 | 変更内容 |
|---|---|---|
| `packages/web/src/components/FilterSheet.tsx` | **新規作成** | Bottom Sheet本体（Backdrop + パネル + チップ群） |
| `packages/web/src/components/FilterBar.tsx` | **改修** | コンパクトヘッダー化、FilterSheet呼び出し |
| `packages/web/src/components/FilterBar.test.tsx` | **全面更新** | 新UI向けテスト（8件→14件） |
| `packages/web/src/components/FilterSheet.test.tsx` | **新規作成** | FilterSheet単体テスト |

**変更しないファイル:**
- `packages/web/src/lib/filter.ts` — FilterState型はそのまま
- `packages/web/src/types.ts` — FACILITIES, CATEGORIES はそのまま
- `packages/web/src/lib/colorMap.ts` — CATEGORY_LABELS はそのまま
- `packages/web/src/app/page.tsx` — Props呼び出し側は変更なし
- `packages/web/tailwind.config.ts` — 新クラスは既存設定で対応可

---

## Chunk 1: FilterSheet コンポーネント実装

### Task 1: FilterSheet.test.tsx を先に書く（TDD）

**Files:**
- Create: `packages/web/src/components/FilterSheet.test.tsx`

**前提知識:**
- `createPortal` を使うため、テスト環境では `document.body` にマウントされる
- `isOpen=false` の状態ではシートは非表示（DOMには存在するがvisually hidden）
- Vitest + Testing Library の `@testing-library/jest-dom` が設定済み（vitest.setup.ts 参照）

- [ ] **Step 1: FilterSheet.test.tsx を作成**

```tsx
// packages/web/src/components/FilterSheet.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterSheet from './FilterSheet'

const defaultProps = {
  isOpen: false,
  onClose: vi.fn(),
  filters: { facility: null, category: null },
  onSetFacility: vi.fn(),
  onSetCategory: vi.fn(),
}

describe('FilterSheet', () => {
  it('シートが閉じているとき施設チップが表示されない', () => {
    render(<FilterSheet {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('有明ガーデン')).not.toBeInTheDocument()
  })

  it('シートが開いているとき「施設」セクションが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByText('施設')).toBeInTheDocument()
  })

  it('シートが開いているとき「すべての施設」チップが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByRole('button', { name: 'すべての施設' })).toBeInTheDocument()
  })

  it('シートが開いているとき5施設チップが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByRole('button', { name: '有明ガーデン' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '東京ガーデンシアター' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '有明アリーナ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TOYOTA ARENA TOKYO' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '東京ビッグサイト' })).toBeInTheDocument()
  })

  it('シートが開いているとき「カテゴリ」セクションが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
  })

  it('シートが開いているとき8カテゴリチップが表示される', () => {
    render(<FilterSheet {...defaultProps} isOpen={true} />)
    expect(screen.getByRole('button', { name: 'ミュージック' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'スポーツ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '展示・展覧' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キッズ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'フード' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ファッション' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アニメ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'その他' })).toBeInTheDocument()
  })

  it('施設チップクリック → onSetFacility が呼ばれる', () => {
    const onSetFacility = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onSetFacility={onSetFacility} />)
    fireEvent.click(screen.getByRole('button', { name: '有明ガーデン' }))
    expect(onSetFacility).toHaveBeenCalledWith('有明ガーデン')
  })

  it('「すべての施設」クリック → onSetFacility(null) が呼ばれる', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterSheet
        {...defaultProps}
        isOpen={true}
        onSetFacility={onSetFacility}
        filters={{ facility: '有明ガーデン', category: null }}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'すべての施設' }))
    expect(onSetFacility).toHaveBeenCalledWith(null)
  })

  it('カテゴリチップクリック → onSetCategory が呼ばれる', () => {
    const onSetCategory = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onSetCategory={onSetCategory} />)
    fireEvent.click(screen.getByRole('button', { name: 'ミュージック' }))
    expect(onSetCategory).toHaveBeenCalledWith('music')
  })

  it('✕ ボタンクリック → onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'シートを閉じる' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Backdrop クリック → onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<FilterSheet {...defaultProps} isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('filter-sheet-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('アクティブ施設チップに bg-primary-500 クラスが付く', () => {
    render(
      <FilterSheet
        {...defaultProps}
        isOpen={true}
        filters={{ facility: '有明ガーデン', category: null }}
      />
    )
    const chip = screen.getByRole('button', { name: '有明ガーデン' })
    expect(chip.className).toContain('bg-primary-500')
  })
})
```

- [ ] **Step 2: テストを実行してすべて FAIL することを確認**

```bash
pnpm --filter web test -- --run --reporter=verbose src/components/FilterSheet.test.tsx
```

Expected: `FilterSheet.tsx が存在しないためエラー` または全件 FAIL

---

### Task 2: FilterSheet.tsx を実装する

**Files:**
- Create: `packages/web/src/components/FilterSheet.tsx`

**実装上の注意:**
- `createPortal` は SSR（Next.js静的エクスポート）では使えない。`useEffect` で `mounted` フラグを管理し、`mounted === true` のときだけ Portal を描画する
- アニメーション: `isOpen` に応じて `translateY(100%)` ↔ `translateY(0)` を CSS transition で切り替える
- `pointer-events-none` で非表示時のクリックイベントを無効化する

- [ ] **Step 3: FilterSheet.tsx を作成**

```tsx
// packages/web/src/components/FilterSheet.tsx
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FACILITIES, CATEGORIES } from '../types'
import { CATEGORY_LABELS } from '../lib/colorMap'
import type { FilterState } from '../lib/filter'
import type { EventCategory } from '../types'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onSetFacility: (facility: string | null) => void
  onSetCategory: (category: EventCategory | null) => void
}

export default function FilterSheet({
  isOpen,
  onClose,
  filters,
  onSetFacility,
  onSetCategory,
}: FilterSheetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const chipBase = 'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer'
  const chipActive = 'bg-primary-500 text-white'
  const chipInactive = 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'

  const content = (
    <>
      {/* Backdrop */}
      <div
        data-testid="filter-sheet-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sheet panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">絞り込み</h2>
          <button
            onClick={onClose}
            aria-label="シートを閉じる"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* 施設セクション */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">施設</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSetFacility(null)}
                className={`${chipBase} ${filters.facility === null ? chipActive : chipInactive}`}
              >
                すべての施設
              </button>
              {FACILITIES.map((f) => (
                <button
                  key={f}
                  onClick={() => onSetFacility(f)}
                  className={`${chipBase} ${filters.facility === f ? chipActive : chipInactive}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* カテゴリセクション */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">カテゴリ</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSetCategory(null)}
                className={`${chipBase} ${filters.category === null ? chipActive : chipInactive}`}
              >
                すべて
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => onSetCategory(c)}
                  className={`${chipBase} ${filters.category === c ? chipActive : chipInactive}`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safe area spacer for iPhone home indicator */}
        <div className="h-safe-bottom pb-4" />
      </div>
    </>
  )

  return createPortal(content, document.body)
}
```

- [ ] **Step 4: FilterSheet テストを再実行してすべて PASS することを確認**

```bash
pnpm --filter web test -- --run --reporter=verbose src/components/FilterSheet.test.tsx
```

Expected: 全件 PASS

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/components/FilterSheet.tsx packages/web/src/components/FilterSheet.test.tsx
git commit -m "feat: add FilterSheet bottom sheet component"
```

---

## Chunk 2: FilterBar 改修

### Task 3: FilterBar.test.tsx を全面更新する（TDD）

**Files:**
- Modify: `packages/web/src/components/FilterBar.test.tsx`

**変更理由:** 旧テストは「チップが直接DOMにある」ことを前提としているが、新UIではチップはシート内に移動するため全件を書き直す。

- [ ] **Step 6: FilterBar.test.tsx を以下に全置換**

```tsx
// packages/web/src/components/FilterBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'

const defaultFilters = { facility: null, category: null }
const defaultViewProps = { viewMode: 'list' as const, onToggleViewMode: vi.fn() }

describe('FilterBar', () => {
  it('「絞り込み」ボタンが表示される', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByRole('button', { name: /絞り込み/ })).toBeInTheDocument()
  })

  it('フィルター未選択時はバッジが表示されない', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.queryByTestId('filter-badge')).not.toBeInTheDocument()
  })

  it('施設のみ選択時にバッジ「1」が表示される', () => {
    render(
      <FilterBar
        filters={{ facility: '有明ガーデン', category: null }}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByTestId('filter-badge')).toHaveTextContent('1')
  })

  it('施設+カテゴリ選択時にバッジ「2」が表示される', () => {
    render(
      <FilterBar
        filters={{ facility: '有明ガーデン', category: 'music' }}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByTestId('filter-badge')).toHaveTextContent('2')
  })

  it('「絞り込み」ボタンクリックでシートが開く', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /絞り込み/ }))
    expect(screen.getByText('施設')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
  })

  it('グリッドトグルボタンが表示される', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    expect(screen.getByRole('button', { name: 'グリッド表示に切り替え' })).toBeInTheDocument()
  })

  it('グリッドトグルクリック → onToggleViewMode が呼ばれる', () => {
    const onToggleViewMode = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={vi.fn()}
        viewMode="list"
        onToggleViewMode={onToggleViewMode}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'グリッド表示に切り替え' }))
    expect(onToggleViewMode).toHaveBeenCalledOnce()
  })

  it('シート内で施設チップクリック → onSetFacility が呼ばれる', () => {
    const onSetFacility = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={onSetFacility}
        onSetCategory={vi.fn()}
        {...defaultViewProps}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /絞り込み/ }))
    fireEvent.click(screen.getByRole('button', { name: '有明ガーデン' }))
    expect(onSetFacility).toHaveBeenCalledWith('有明ガーデン')
  })

  it('シート内でカテゴリチップクリック → onSetCategory が呼ばれる', () => {
    const onSetCategory = vi.fn()
    render(
      <FilterBar
        filters={defaultFilters}
        onSetFacility={vi.fn()}
        onSetCategory={onSetCategory}
        {...defaultViewProps}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /絞り込み/ }))
    fireEvent.click(screen.getByRole('button', { name: 'ミュージック' }))
    expect(onSetCategory).toHaveBeenCalledWith('music')
  })
})
```

- [ ] **Step 7: テストを実行して FAIL することを確認**

```bash
pnpm --filter web test -- --run --reporter=verbose src/components/FilterBar.test.tsx
```

Expected: 新テストが FAIL（FilterBar はまだ旧実装）

---

### Task 4: FilterBar.tsx を改修する

**Files:**
- Modify: `packages/web/src/components/FilterBar.tsx`

**変更概要:**
- 2行チップレイアウトを削除
- `isSheetOpen` ローカルstateを追加
- 「絞り込み」ボタン（バッジ付き）を追加
- `FilterSheet` をimportして呼び出す

- [ ] **Step 8: FilterBar.tsx を以下に全置換**

```tsx
// packages/web/src/components/FilterBar.tsx
'use client'

import { useState } from 'react'
import { CATEGORY_LABELS } from '../lib/colorMap'
import type { FilterState } from '../lib/filter'
import type { EventCategory } from '../types'
import FilterSheet from './FilterSheet'

export type ViewMode = 'list' | 'grid'

interface Props {
  filters: FilterState
  onSetFacility: (facility: string | null) => void
  onSetCategory: (category: EventCategory | null) => void
  viewMode: ViewMode
  onToggleViewMode: () => void
}

export default function FilterBar({
  filters,
  onSetFacility,
  onSetCategory,
  viewMode,
  onToggleViewMode,
}: Props) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const activeCount =
    (filters.facility !== null ? 1 : 0) +
    (filters.category !== null ? 1 : 0)

  // アクティブフィルターの表示ラベル
  const activeLabel = [
    filters.facility,
    filters.category !== null ? CATEGORY_LABELS[filters.category] : null,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <>
      <div className="bg-[#f8f6f6] px-4 py-3 flex items-center gap-3">
        {/* 絞り込みボタン */}
        <button
          onClick={() => setIsSheetOpen(true)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeCount > 0
              ? 'bg-primary-500 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            tune
          </span>
          絞り込み
          {activeCount > 0 && (
            <span
              data-testid="filter-badge"
              className="bg-white text-primary-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {activeCount}
            </span>
          )}
        </button>

        {/* アクティブフィルターラベル */}
        {activeLabel && (
          <span className="text-sm text-slate-500 truncate flex-1">{activeLabel}</span>
        )}

        <div className="ml-auto">
          {/* グリッドトグル */}
          <button
            onClick={onToggleViewMode}
            aria-label={viewMode === 'list' ? 'グリッド表示に切り替え' : 'リスト表示に切り替え'}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary-500 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {viewMode === 'list' ? 'grid_view' : 'view_list'}
            </span>
          </button>
        </div>
      </div>

      <FilterSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        filters={filters}
        onSetFacility={onSetFacility}
        onSetCategory={onSetCategory}
      />
    </>
  )
}
```

- [ ] **Step 9: FilterBar テストをすべて実行して PASS することを確認**

```bash
pnpm --filter web test -- --run --reporter=verbose src/components/FilterBar.test.tsx
```

Expected: 全件 PASS

- [ ] **Step 10: web 全テストを実行して既存テストが壊れていないことを確認**

```bash
pnpm --filter web test -- --run
```

Expected: 全件 PASS（テスト数が増加しているはず）

- [ ] **Step 11: ビルド確認**

```bash
pnpm --filter web build
```

Expected: エラーなし、静的エクスポート成功

- [ ] **Step 12: コミット & push**

```bash
git add packages/web/src/components/FilterBar.tsx \
        packages/web/src/components/FilterBar.test.tsx \
        packages/web/src/components/FilterSheet.tsx \
        packages/web/src/components/FilterSheet.test.tsx
git commit -m "feat: replace FilterBar chip rows with Bottom Sheet (Phase 8 M1)"
git push
```

---

## チェックリスト（完了基準）

- [ ] `FilterSheet.test.tsx` 全件 PASS
- [ ] `FilterBar.test.tsx` 全件 PASS
- [ ] `pnpm --filter web test -- --run` で全スイート PASS
- [ ] `pnpm --filter web build` でビルド成功
- [ ] GitHub Pages CI が green
- [ ] モバイル（390px）で「絞り込み」ボタン → シートが出る
- [ ] デスクトップ（1280px）でも正常動作

---

## トラブルシューティング

**`createPortal` が SSR でエラーになる場合:**
`FilterSheet` 内の `mounted` フラグが正しく機能しているか確認。`useEffect` が実行される前は `null` を返すので SSR は問題ない。もしエラーが出る場合は `FilterSheet` に `'use client'` ディレクティブがあることを確認。

**テストで `createPortal` が `document.body` 外に描画される場合:**
Testing Library は `document.body` をデフォルトの `container` として使うので、Portal は自動的にスキャン対象に含まれる。特別な設定は不要。

**`material-symbols-outlined` アイコンが表示されない場合:**
`packages/web/src/app/layout.tsx` に Google Fonts の Material Symbols リンクがあることを確認。テスト環境では文字列として描画されるので問題ない。

**Tailwind `primary-500` クラスが効かない場合:**
`packages/web/tailwind.config.ts` を確認。`primary` は `'#ec5b13'` として設定済み。もし `primary-500` が未定義なら `primary` に修正する（または tailwind.config.ts で `primary: { 500: '#ec5b13' }` に変更）。

---
最終更新: 2026-04-02
