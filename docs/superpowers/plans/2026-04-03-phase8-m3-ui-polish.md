# Phase 8 M3: UI Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** デスクトップ余白削減・TodayViewセクションヘッダー追加・ヘッダーバイカラー化の3点をUIに適用する。

**Architecture:** HomeContent.tsx（ヘッダーHTML + mainタグ）とTodayView.tsx（セクションヘッダー追加）の2ファイルのみ変更。テスト変更なし（ビジュアルのみ）。

**Tech Stack:** Next.js 15, Tailwind CSS 3, TypeScript

---

## Chunk 1: HomeContent.tsx の3変更

### Task 1: main タグの max-w-6xl 削除（余白削減）

**Files:**
- Modify: `packages/web/src/app/HomeContent.tsx:119`

- [ ] **Step 1: 変更を適用**

```diff
- <main className="max-w-6xl mx-auto">
+ <main>
```

- [ ] **Step 2: テスト実行（既存テストが壊れていないことを確認）**

```bash
pnpm --filter web exec vitest run
```

期待: 全テスト PASS

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/app/HomeContent.tsx
git commit -m "fix: remove max-w-6xl constraint from main to eliminate desktop whitespace"
```

---

### Task 2: ヘッダータイトル バイカラー化

**Files:**
- Modify: `packages/web/src/app/HomeContent.tsx:104`

- [ ] **Step 1: h1 を変更**

現在 (L104):
```tsx
<h1 className="text-xl font-bold tracking-tight text-slate-900">有明イベント</h1>
```

変更後:
```tsx
<h1 className="text-xl font-bold tracking-tight">
  <span className="text-primary-500">有明</span>
  <span className="text-slate-900">イベント</span>
</h1>
```

- [ ] **Step 2: テスト実行**

```bash
pnpm --filter web exec vitest run
```

期待: 全テスト PASS

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/app/HomeContent.tsx
git commit -m "feat: bicolor header title - 有明 in primary orange"
```

---

### Task 3: 日付テキスト → pill バッジ化

**Files:**
- Modify: `packages/web/src/app/HomeContent.tsx:105`

- [ ] **Step 1: 日付要素を変更**

現在 (L105):
```tsx
<p className="text-sm font-medium text-primary-500">{dateLabel}</p>
```

変更後:
```tsx
<span className="text-sm font-semibold text-primary-500 bg-[#fff3ed] px-3 py-1 rounded-full">
  {dateLabel}
</span>
```

- [ ] **Step 2: テスト実行**

```bash
pnpm --filter web exec vitest run
```

期待: 全テスト PASS

- [ ] **Step 3: コミット**

```bash
git add packages/web/src/app/HomeContent.tsx
git commit -m "feat: date label styled as pill badge in header"
```

---

## Chunk 2: TodayView.tsx セクションヘッダー追加

### Task 4: 今日のイベント セクションヘッダー追加

**Files:**
- Modify: `packages/web/src/components/TodayView.tsx`

- [ ] **Step 1: インポートを追加（既に使われていなければ）**

ファイル冒頭の imports を確認。`getTodayString` は既にインポート済みか確認する。
未インポートなら追加:
```tsx
import { getTodayString } from '../lib/dateUtils'
```

- [ ] **Step 2: コンポーネント内で日付ラベルを生成**

`sortByFacility` 呼び出し直後（L25付近）に追加:
```tsx
const todayLabel = new Date().toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})
```

- [ ] **Step 3: return 内にセクションヘッダーを追加**

`<div className={gridClass}>` の直前に挿入:
```tsx
<div className="px-4 pt-3 pb-1 flex items-baseline gap-2">
  <span className="text-base font-semibold text-slate-800">今日のイベント</span>
  <span className="text-sm text-slate-500">{todayLabel}</span>
</div>
```

空状態（`sorted.length === 0`）の return には追加しない（空状態は独立したUIのため）。

- [ ] **Step 4: テスト実行**

```bash
pnpm --filter web exec vitest run
```

期待: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/components/TodayView.tsx
git commit -m "feat: add today section header with date label to TodayView"
```

---

## 最終確認

- [ ] `pnpm --filter web exec vitest run` — 全テスト PASS
- [ ] `pnpm --filter web build` — ビルド成功
- [ ] `pnpm --filter web dev` → localhost:3000 で目視確認
  - デスクトップ（1440px+）: カードが全幅に広がっていること
  - 今日タブ: 「今日のイベント 2026年4月3日(金)」ヘッダーが表示されること
  - ヘッダー: 「有明」がオレンジ、日付がpill表示であること
  - モバイル（390px）: 崩れなし
- [ ] `git push origin main`
- [ ] PROGRESS.md + ROADMAP.md を更新してコミット
