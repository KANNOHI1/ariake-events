# Phase 8 M4: TransportView Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TransportView のヘッダーに交通機関ロゴを追加し、背景色を薄グレーに統一し、テーブルを全幅にする。

**Architecture:** `public/transport/` ディレクトリにロゴ画像を配置し、`TransportView.tsx` の `<thead>` 行の className とマークアップを変更する。テストは TDD 順（先にテスト追加 → RED → 実装 → GREEN）で進める。変更ファイルは 2 つのみ。

**Tech Stack:** Next.js 15, Tailwind CSS 3, TypeScript, Vitest + @testing-library/react

---

## File Map

| 操作 | パス | 内容 |
|---|---|---|
| Create dir | `packages/web/public/transport/` | ロゴ画像格納ディレクトリ |
| Download | `packages/web/public/transport/rinkai.svg` | りんかい線ロゴ |
| Download | `packages/web/public/transport/yurikamome.svg` | ゆりかもめロゴ |
| Download | `packages/web/public/transport/toei.svg` | 都バスロゴ |
| Download | `packages/web/public/transport/brt.png` | 東京BRTロゴ |
| Modify | `packages/web/src/components/TransportView.tsx` | ロゴマッピング追加、ヘッダー className 変更、`w-full` 追加 |
| Modify | `packages/web/src/components/TransportView.test.tsx` | 4テスト追加 |

---

## Chunk 1: ロゴDL + TransportView.tsx 改修

### Task 1: ロゴ画像のダウンロード

**Files:**
- Create dir: `packages/web/public/transport/`
- Download: `packages/web/public/transport/rinkai.svg`
- Download: `packages/web/public/transport/yurikamome.svg`
- Download: `packages/web/public/transport/toei.svg`
- Download: `packages/web/public/transport/brt.png`

- [ ] **Step 1: ディレクトリを作成してロゴを一括ダウンロード**

```bash
mkdir -p packages/web/public/transport
curl -L "https://upload.wikimedia.org/wikipedia/commons/e/e8/Rinkai_Line_symbol.svg" \
  -o packages/web/public/transport/rinkai.svg
curl -L "https://upload.wikimedia.org/wikipedia/commons/1/1e/Yurikamome_line_symbol.svg" \
  -o packages/web/public/transport/yurikamome.svg
curl -L "https://upload.wikimedia.org/wikipedia/commons/8/8a/Tokyo_Metropolitan_Bureau_of_Transportation_logo.svg" \
  -o packages/web/public/transport/toei.svg
curl -L "https://upload.wikimedia.org/wikipedia/commons/3/38/Tokyo_BRT_Logo.png" \
  -o packages/web/public/transport/brt.png
```

- [ ] **Step 2: ファイルが正しくダウンロードされたことを確認**

```bash
ls -lh packages/web/public/transport/
```

期待: 4ファイル（rinkai.svg, yurikamome.svg, toei.svg, brt.png）がすべて存在し、サイズが 0 でないこと

---

### Task 2: TransportView.tsx — ロゴマッピング定数 + ヘッダー行の改修

**Files:**
- Modify: `packages/web/src/components/TransportView.tsx`

- [ ] **Step 1: 既存テストが PASS していることを確認（ベースライン）**

```bash
pnpm --filter web exec vitest run
```

期待: 既存テスト全 PASS

- [ ] **Step 2: import 群の後・`function getNowString` の前にロゴマッピング定数を追加**

`packages/web/src/components/TransportView.tsx` の L4（`import { isHoliday, filterUpcoming } ...`）の直後に挿入:

```tsx
const ROUTE_LOGOS: Record<string, string> = {
  'りんかい線': '/transport/rinkai.svg',
  'ゆりかもめ': '/transport/yurikamome.svg',
  '都バス': '/transport/toei.svg',
  'BRT': '/transport/brt.png',
}
```

- [ ] **Step 3: 路線名ヘッダー行を置換 — ロゴ + 薄グレー背景**

現在:
```tsx
<tr>
  {routes.map((route) => (
    <th
      key={route.name}
      colSpan={route.directions.length}
      className="px-3 py-2 text-center font-bold bg-slate-800 text-white border border-slate-600"
    >
      {route.name}
    </th>
  ))}
</tr>
```

変更後:
```tsx
<tr>
  {routes.map((route) => (
    <th
      key={route.name}
      colSpan={route.directions.length}
      className="px-3 py-3 text-center bg-slate-50 border border-slate-200"
    >
      <div className="flex flex-col items-center gap-1">
        <img
          src={ROUTE_LOGOS[route.name]}
          alt={route.name}
          className="h-7 object-contain"
        />
        <span className="text-xs font-bold text-slate-800">{route.name}</span>
      </div>
    </th>
  ))}
</tr>
```

- [ ] **Step 4: 最寄り駅行の className を変更**

現在:
```tsx
className="px-3 py-1 text-center text-xs text-slate-400 bg-slate-900 border border-slate-700"
```

変更後:
```tsx
className="px-3 py-1 text-center text-xs text-slate-500 bg-slate-100 border border-slate-200"
```

- [ ] **Step 5: 徒歩分数行の className を変更**

現在:
```tsx
className="px-3 py-1 text-center text-xs text-slate-500 bg-slate-900 border border-slate-700"
```

変更後:
```tsx
className="px-3 py-1 text-center text-xs text-slate-400 bg-slate-100 border border-slate-200"
```

- [ ] **Step 6: 方面名行の className を変更**

現在:
```tsx
className="px-3 py-1.5 text-center text-xs font-medium bg-slate-700 text-slate-200 border border-slate-600"
```

変更後:
```tsx
className="px-3 py-1.5 text-center text-xs font-medium bg-slate-200 text-slate-700 border border-slate-300"
```

- [ ] **Step 7: `<table>` タグに `w-full` クラスを追加**

現在:
```tsx
<table className="border-collapse text-sm whitespace-nowrap">
```

変更後:
```tsx
<table className="border-collapse text-sm whitespace-nowrap w-full">
```

- [ ] **Step 8: 既存テストが引き続き PASS することを確認**

```bash
pnpm --filter web exec vitest run
```

期待: 既存テスト全 PASS

- [ ] **Step 9: コミット**

```bash
git add packages/web/public/transport/ packages/web/src/components/TransportView.tsx
git commit -m "feat: transport header redesign - logos, light gray bg, w-full table"
```

---

## Chunk 2: テスト更新 + 検証

### Task 3: TransportView.test.tsx に 4 テストを追加

**Files:**
- Modify: `packages/web/src/components/TransportView.test.tsx`

- [ ] **Step 1: `describe` ブロック末尾に 4 テストを追加**

`packages/web/src/components/TransportView.test.tsx` の `describe('TransportView', () => {` ブロック内、最後の `it('shows weekday schedule on weekday', ...)` ブロックの直後、外側の `})` の直前に挿入:

```tsx
  it('renders logo images for all 4 routes', () => {
    render(<TransportView />)
    expect(screen.getByRole('img', { name: 'りんかい線' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'ゆりかもめ' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '都バス' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'BRT' })).toBeInTheDocument()
  })

  it('logo for りんかい線 has correct src', () => {
    render(<TransportView />)
    const img = screen.getByRole('img', { name: 'りんかい線' })
    expect(img).toHaveAttribute('src', '/transport/rinkai.svg')
  })

  it('renders header cells with light gray background class', () => {
    const { container } = render(<TransportView />)
    const headerCells = container.querySelectorAll('th')
    const routeHeaders = Array.from(headerCells).filter(th =>
      th.classList.contains('bg-slate-50')
    )
    expect(routeHeaders.length).toBe(4) // 4路線分
  })

  it('table has w-full class', () => {
    const { container } = render(<TransportView />)
    const table = container.querySelector('table')
    expect(table).toHaveClass('w-full')
  })
```

- [ ] **Step 2: テストを実行して 9 テスト全 PASS になることを確認**

```bash
pnpm --filter web exec vitest run
```

期待: **9テスト全 PASS**（既存 5 + 新規 4）

もし新規テストが FAIL する場合は以下を確認:
- `<img>` の `alt` 属性が `route.name`（`'りんかい線'` 等）と完全一致しているか
- `ROUTE_LOGOS` のキーが `timetable` の `name` フィールドと一致しているか
- `<table>` タグに `w-full` が追加されているか
- 路線名 `<th>` に `bg-slate-50` が付いているか（4セル = 4路線分）

- [ ] **Step 3: ビルドが通ることを確認**

```bash
pnpm --filter web build
```

期待: エラーなし

- [ ] **Step 4: コミット**

```bash
git add packages/web/src/components/TransportView.test.tsx
git commit -m "test: add 4 tests for TransportView logo, light bg, w-full"
```

---

## 最終確認

- [ ] `pnpm --filter web exec vitest run` — 9テスト全 PASS
- [ ] `pnpm --filter web build` — ビルド成功
- [ ] `pnpm --filter web dev` → `localhost:3000` で目視確認
  - 交通タブ: 各路線ヘッダーにロゴ画像が表示される
  - 交通タブ: ヘッダー行が白/薄グレー系に統一されている（濃紺なし）
  - 交通タブ: テーブルが main コンテナ幅いっぱいに広がっている
- [ ] `git push origin main`
- [ ] PROGRESS.md + ROADMAP.md を更新してコミット
