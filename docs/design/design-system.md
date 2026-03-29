# ariake-events デザインシステム v2

> Phase 6 UIリデザイン（2026-03-29〜）で確定した設計。
> Web UI を生成・修正するときは必ずこのファイルを参照すること。
> リファレンス: https://stitch.withgoogle.com/projects/7599240322536651962

---

## 設計原則

1. **モバイルファースト** — 390px幅を基準に設計。Stitch RIGHTスクリーン準拠。
2. **ライトモードのみ** — ダークモード対応なし。`dark:` クラスは使わない。
3. **情報密度優先** — 横長カードで1画面あたりの情報量を最大化。
4. **カード全体クリック** — 「公式サイト →」リンクテキスト不要。カード自体が公式リンク。
5. **No-Line原則** — 境界は背景色の差で表現。1px solid ボーダーは最小限に。

---

## カラーパレット

### ブランドカラー

| トークン | 値 | 用途 |
|---|---|---|
| `primary` | `#ec5b13` | アクティブ状態・CTA・強調 |
| `background` | `#f8f6f6` | アプリ背景（ページ全体） |
| `surface` | `#ffffff` | カード・モーダル背景 |
| `on-surface` | `#1a1a1a` | 本文テキスト |
| `muted` | `#6b7280` | 補助テキスト（日付など） |

### 施設カラー（バッジ用）

| 施設 | bg | text |
|---|---|---|
| 有明ガーデン | `bg-emerald-50` | `text-emerald-700` |
| 東京ガーデンシアター | `bg-pink-50` | `text-pink-700` |
| 有明アリーナ | `bg-sky-50` | `text-sky-700` |
| TOYOTA ARENA TOKYO | `bg-amber-50` | `text-amber-700` |
| 東京ビッグサイト | `bg-blue-50` | `text-blue-700` |

### カテゴリカラー（バッジ用）

| カテゴリ | bg | text |
|---|---|---|
| music | `bg-indigo-50` | `text-indigo-700` |
| sports | `bg-emerald-50` | `text-emerald-700` |
| exhibition | `bg-purple-50` | `text-purple-700` |
| kids | `bg-pink-50` | `text-pink-700` |
| food | `bg-orange-50` | `text-orange-700` |
| fashion | `bg-fuchsia-50` | `text-fuchsia-700` |
| anime | `bg-cyan-50` | `text-cyan-700` |
| other | `bg-slate-100` | `text-slate-600` |

### 混雑バッジカラー（画像オーバーレイ用）

| レベル | ラベル | imageBadgeClass |
|---|---|---|
| < 0.3 | 空いている | `bg-emerald-500/90 text-white` |
| 0.3〜0.6 | やや混雑 | `bg-amber-500/90 text-white` |
| 0.6〜0.8 | 混雑 | `bg-orange-600/90 text-white` |
| ≥ 0.8 | 非常に混雑 | `bg-rose-600/90 text-white` |

---

## タイポグラフィ

| 種別 | フォント | 読み込み |
|---|---|---|
| 見出し・UI | **Public Sans** | Google Fonts |
| 日本語全般 | **Noto Sans JP** | Google Fonts |

```
font-family: 'Public Sans', 'Noto Sans JP', sans-serif
```

> `layout.tsx` の `<head>` に Google Fonts リンクを追加する。
> `tailwind.config.ts` の `fontFamily.sans` を更新する。

---

## EventCard（横長カード）

### 構造

```
<a href={sourceURL} target="_blank">  ← カード全体リンク
  <article class="flex rounded-xl bg-white shadow-sm overflow-hidden">

    <!-- 左 40%: 画像エリア -->
    <div class="relative w-[40%] shrink-0">
      <img src={imageUrl} class="w-full h-full object-cover" />
      <!-- 混雑バッジ（congestionRisk が null / undefined / 0 の場合は非表示） -->
      {congestionRisk > 0 && (
        <span class="absolute top-2 right-2 ... rounded-full backdrop-blur-sm">
          {congestionInfo.label}
        </span>
      )}
    </div>

    <!-- 右 60%: テキストエリア -->
    <div class="p-3 flex flex-col justify-center gap-1.5">
      <div class="flex flex-wrap gap-1.5">
        <span class="badge [施設カラー]">{facility}</span>
        <span class="badge [カテゴリカラー]">{categoryLabel}</span>
      </div>
      <h3 class="text-sm font-bold leading-snug">{eventName}</h3>
      <p class="text-xs text-muted">📅 {dateRange}</p>
    </div>

  </article>
</a>
```

### ビューモード

- **リスト表示（デフォルト）**: `flex` 横長カード（左40%画像 / 右60%テキスト）
- **グリッド表示**: `flex flex-col` 縦型カード（上: aspect-video画像 / 下: テキスト）
- FilterBar右上の ☰/⊞ トグルで切替。localStorage に保存。

### 廃止

- `FACILITY_GRADIENTS` — 削除（実画像/施設写真に置き換え）
- 「公式サイト →」リンク — 削除（カード全体がリンク）
- Picsum Photos / Unsplash ランダム画像 — 削除（実画像に置き換え）

### EventCard.test.tsx — 検証要件

以下の境界条件を必ずテストすること:

1. **カード全体がリンク** — `<a>` の `href` が `sourceURL` と一致すること
2. **施設バッジ表示** — 施設名がバッジとして表示されること
3. **カテゴリバッジ表示** — カテゴリラベルがバッジとして表示されること
4. **混雑バッジ非表示** — `congestionRisk=0` のとき混雑バッジが描画されないこと
5. **混雑バッジ表示** — `congestionRisk=0.5` のとき適切なラベルが表示されること
6. **施設写真フォールバック** — `imageUrl` なしのとき施設写真パスが `src` に設定されること
7. **実画像表示** — `imageUrl` ありのとき実画像URLが `src` に設定されること

---

## 画像戦略（imageMap.ts）

### 方針

実画像優先・施設写真フォールバックの2段階:

1. **`event.imageUrl`** — スクレイパーがリスティングページから取得した実画像URL
2. **施設写真** — `public/facilities/` に配置した各施設の建物写真

`getImageUrl(event)` でイベントオブジェクトから画像URLを返す。
`getFacilityPhoto(facility)` で施設写真パスを返す（onErrorフォールバック用）。

### 画像取得状況（施設別）

| 施設 | ソース | 方法 |
|---|---|---|
| TOYOTA ARENA TOKYO | リスティングページ実画像 | Cheerio: `li.bg-gray-f5 img` src |
| 東京ビッグサイト | リスティングページサムネイル | Cheerio: `article.lyt-event-01 img` src |
| 有明ガーデン | 静的施設写真（Wikimedia Commons） | `/facilities/ariake-garden.jpg` |
| 東京ガーデンシアター | 静的施設写真（公式サイト） | `/facilities/tokyo-garden-theater.webp` |
| 有明アリーナ | 静的施設写真（公式サイト） | `/facilities/ariake-arena.jpg` |

### ファイル配置

```
packages/web/src/lib/imageMap.ts        ← getImageUrl() + getFacilityPhoto()
packages/web/public/facilities/         ← 5施設の建物写真
  ariake-garden.jpg                       Wikimedia Commons (CC)
  tokyo-garden-theater.webp               公式サイト
  ariake-arena.jpg                        公式サイト
  toyota-arena.jpg                        公式サイト OGP
  tokyo-bigsight.jpg                      公式サイト
```

### 画像読み込み失敗時

`onError` で `imgError` state を true にし、`getFacilityPhoto()` にフォールバック。
全カテゴリ共通で施設写真が表示される（ランダム画像やアイコンプレースホルダーは使用しない）。

---

## コンポーネント変更一覧

### `tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      primary: '#ec5b13',
      background: '#f8f6f6',
    },
    fontFamily: {
      sans: ['Public Sans', 'Noto Sans JP', 'sans-serif'],
    },
  },
}
```

### `layout.tsx`

```html
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet"/>
```

### `FilterBar.tsx`

- アクティブチップ: `bg-primary text-white`
- 非アクティブ: `bg-white border border-slate-200 text-slate-600`

### `BottomNav.tsx`

- アクティブ状態: `text-primary` → `text-[#ec5b13]`（または `text-primary`）
- 変更最小限

### `colorMap.ts`

- `FACILITY_GRADIENTS` を削除
- 他は維持

---

## ファイル変更サマリー

| ファイル | 変更種別 |
|---|---|
| `packages/web/src/lib/imageMap.ts` | **新規作成** |
| `packages/web/src/components/EventCard.tsx` | 大幅変更（横長化） |
| `packages/web/src/lib/colorMap.ts` | FACILITY_GRADIENTS削除 |
| `packages/web/src/app/layout.tsx` | フォント追加 |
| `packages/web/tailwind.config.ts` | primary色・フォント更新 |
| `packages/web/src/components/FilterBar.tsx` | アクティブ色変更 |
| `packages/web/src/components/BottomNav.tsx` | アクティブ色変更 |
| `packages/web/src/components/EventCard.test.tsx` | テスト更新 |

---

## 参照ドキュメント

- `docs/ROADMAP.md` — Phase 6 進捗管理
- `PROGRESS.md` — セッション間の状態管理
- Stitch: https://stitch.withgoogle.com/projects/7599240322536651962
