# Phase 8 M3: UI Polish spec

**日付**: 2026-04-03  
**対象ファイル**: `packages/web/src/app/HomeContent.tsx`, `packages/web/src/components/TodayView.tsx`

---

## 背景

本番サイト（kannohi1.github.io/ariake-events）を確認し、3点の改善を確定した。

---

## 変更1: 余白削減

**問題**: `<main className="max-w-6xl mx-auto">` により、1440px以上のモニターで両サイドに大きな余白が発生。

**修正**: `max-w-6xl mx-auto` を削除（`<main>` のみ）。

```diff
- <main className="max-w-6xl mx-auto">
+ <main>
```

ヘッダー・FilterBar は元々フルwidth。mainも揃える。

---

## 変更2: TodayView セクションヘッダー追加

**問題**: MonthView に「2026年4月」ナビゲーションヘッダーがあるのに、TodayView には何もなく唐突にカードが始まる。

**修正**: TodayView の上部に今日の日付ラベルを追加。

```tsx
// TodayView.tsx の return 内、<div className={gridClass}> の上に追加
<div className="px-4 py-3 flex items-center gap-2">
  <span className="text-base font-semibold text-slate-800">今日のイベント</span>
  <span className="text-sm text-slate-500">{today}</span>  {/* "2026-04-03" 形式 */}
</div>
```

`today` は既に `getTodayString()` で Props として渡されていないが、`TodayView` の Props に `today: string` を追加するか、コンポーネント内で `getTodayString()` を呼ぶ。
→ **コンポーネント内で `getTodayString()` を直接呼ぶ**（Props追加不要、シンプル）。

表示フォーマット: `"2026-04-03"` → `"2026年4月3日(金)"` に整形して表示。
整形は既存の `dateUtils` か `new Date().toLocaleDateString('ja-JP', {...})` を使う。

---

## 変更3: ヘッダーデザイン（案A）

**問題**: `有明イベント` + 日付テキストだけで視覚的に寂しい。

**修正**:
- 「有明」→ `text-primary-500`（オレンジ）
- 「イベント」→ `text-slate-900`（ダーク）
- 日付 → pill バッジ化（`bg-[#fff3ed] text-primary-500 rounded-full px-3 py-1`）

```diff
- <h1 className="text-xl font-bold tracking-tight text-slate-900">有明イベント</h1>
- <p className="text-sm font-medium text-primary-500">{dateLabel}</p>
+ <h1 className="text-xl font-bold tracking-tight">
+   <span className="text-primary-500">有明</span>
+   <span className="text-slate-900">イベント</span>
+ </h1>
+ <span className="text-sm font-semibold text-primary-500 bg-[#fff3ed] px-3 py-1 rounded-full">
+   {dateLabel}
+ </span>
```

---

## 変更対象ファイル

| ファイル | 変更 |
|---|---|
| `packages/web/src/app/HomeContent.tsx` | main の max-w-6xl 削除 + ヘッダーHTML変更 |
| `packages/web/src/components/TodayView.tsx` | セクションヘッダー追加 |

テスト変更: なし（ビジュアル変更のみ。既存テストへの影響なし）

---

## 検証

1. `pnpm --filter web dev` → localhost:3000 で確認
2. デスクトップ（1280px以上）: カードが全幅に広がること
3. 今日タブ: 「今日のイベント 2026年4月3日(金)」ヘッダーが表示されること
4. ヘッダー: 「有明」がオレンジ、日付がpill表示であること
5. モバイル（390px）: レイアウト崩れなし
