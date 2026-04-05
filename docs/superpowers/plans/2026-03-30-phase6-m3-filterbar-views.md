# Phase 6 M3: FilterBar / Views 全体刷新 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** FilterBar のカテゴリチップのアクティブ状態を Venue チップと統一し、TodayView / WeekView をグリッドからリスト表示（gap-3）に変更する。

**Architecture:** 全変更は CSS クラスのみ。ロジック変更なし。既存テストは全 PASS のまま維持。BottomNav は `text-primary-500`（= #ec5b13）で既に正しいため変更なし。

**Tech Stack:** Next.js 15 / React / Tailwind CSS 3 / Vitest 3

---

## Chunk 1: FilterBar カテゴリチップ アクティブ状態統一

### Task 1: FilterBar.tsx — category chip active class を bg-primary-500 text-white に統一

**Files:**
- Modify: `packages/web/src/components/FilterBar.tsx:46-65`

**現状と変更内容:**

現状（Category chips アクティブ）:
```
bg-primary-500/10 text-primary-500 border border-primary-500/20 font-bold
```

変更後（Venue chips と同一スタイル）:
```
bg-primary-500 text-white
```

- [ ] **Step 1: 既存テストがPASSすることを事前確認**

Run: `pnpm --filter web test -- --run`
Expected: 110/110 PASS

- [ ] **Step 2: FilterBar.tsx の category chip active class を修正**

`packages/web/src/components/FilterBar.tsx` の「すべて」チップ（line 48）を変更:
```tsx
// Before
? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 font-bold'
// After
? 'bg-primary-500 text-white'
```

`packages/web/src/components/FilterBar.tsx` の CATEGORIES.map チップ（line 59）を変更:
```tsx
// Before
? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 font-bold'
// After
? 'bg-primary-500 text-white'
```

- [ ] **Step 3: テスト実行**

Run: `pnpm --filter web test -- --run`
Expected: 110/110 PASS（FilterBar テストはクラス名を検証しないため変更不要）

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/FilterBar.tsx
git commit -m "fix: unify FilterBar category chip active style to bg-primary-500 text-white"
```

---

## Chunk 2: TodayView / WeekView リスト表示化

### Task 2: TodayView.tsx / WeekView.tsx — grid → flex-col gap-3

**Files:**
- Modify: `packages/web/src/components/TodayView.tsx:40`
- Modify: `packages/web/src/components/WeekView.tsx:31`

**変更内容:**

横長カード（左40%写真 / 右60%テキスト）は単一カラムのリスト表示が最適。
`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` → `flex flex-col gap-3`

- [ ] **Step 1: TodayView.tsx の container クラスを変更**

`packages/web/src/components/TodayView.tsx` line 40:
```tsx
// Before
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
// After
<div className="flex flex-col gap-3 p-4">
```

- [ ] **Step 2: WeekView.tsx の container クラスを変更**

`packages/web/src/components/WeekView.tsx` line 31:
```tsx
// Before
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
// After
<div className="flex flex-col gap-3 p-4">
```

- [ ] **Step 3: テスト実行**

Run: `pnpm --filter web test -- --run`
Expected: 110/110 PASS（TodayView / WeekView テストはクラス名を検証しないため変更不要）

- [ ] **Step 4: Commit**

```bash
git add packages/web/src/components/TodayView.tsx packages/web/src/components/WeekView.tsx
git commit -m "fix: switch TodayView/WeekView from grid to flex-col gap-3 for horizontal cards"
```

---

## Chunk 3: 最終確認・ドキュメント更新・push

### Task 3: 全テスト確認 + ROADMAP / PROGRESS 更新 + push

**Files:**
- Modify: `docs/ROADMAP.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: 全テスト最終確認**

Run: `pnpm --filter web test -- --run && pnpm --filter scraper test -- --run`
Expected: web 110/110 PASS, scraper 75/75 PASS

- [ ] **Step 2: ROADMAP.md の Phase 6 M3 を ✅ 完了 に更新**

`docs/ROADMAP.md` の Phase 6 M3 ステータスを:
```
🔄 進行中
```
→
```
✅ 完了 (2026-03-30)
```
に変更し、M4（検証・デプロイ）を「次にやること」に設定。

- [ ] **Step 3: PROGRESS.md 更新**

「現在地」を:
```
Phase 6 M3 完了 — FilterBar/Views 刷新・push済み。次: Phase 6 M4（検証・デプロイ）
```
に更新。

セッション履歴に追記:
```
### 2026-03-30（第11セッション）
- Phase 6 M3: FilterBar category chip 統一、TodayView/WeekView リスト表示化
  - FilterBar.tsx: category chip active → bg-primary-500 text-white
  - TodayView.tsx / WeekView.tsx: grid → flex-col gap-3
  - 110テスト全PASS
```

- [ ] **Step 4: ROADMAP + PROGRESS を 1 コミット**

```bash
git add docs/ROADMAP.md PROGRESS.md
git commit -m "docs: mark Phase 6 M3 complete, set M4 as next action"
```

- [ ] **Step 5: push**

```bash
git push
```

---

## 変更サマリ

| ファイル | 変更内容 |
|---|---|
| `packages/web/src/components/FilterBar.tsx` | category chip active: `bg-primary-500/10 text-primary-500 ...` → `bg-primary-500 text-white` |
| `packages/web/src/components/TodayView.tsx` | container: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` → `flex flex-col gap-3` |
| `packages/web/src/components/WeekView.tsx` | container: 同上 |
| `docs/ROADMAP.md` | M3 → ✅ 完了、M4 → 次 |
| `PROGRESS.md` | 現在地更新 |

**テスト変更: なし**（既存テストはクラス名を検証しないため全 PASS を維持）

**BottomNav.tsx: 変更なし**（`text-primary-500` = `#ec5b13` で既に設計仕様と一致）
