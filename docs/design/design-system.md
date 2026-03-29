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

### 廃止

- `FACILITY_GRADIENTS` — 削除（画像エリアはUnsplash写真に置き換え）
- 「公式サイト →」リンク — 削除（カード全体がリンク）

### EventCard.test.tsx — 検証要件

以下の境界条件を必ずテストすること:

1. **カード全体がリンク** — `<a>` の `href` が `sourceURL` と一致すること
2. **施設バッジ表示** — 施設名がバッジとして表示されること
3. **カテゴリバッジ表示** — カテゴリラベルがバッジとして表示されること
4. **混雑バッジ非表示** — `congestionRisk=0` のとき混雑バッジが描画されないこと
5. **混雑バッジ表示** — `congestionRisk=0.5` のとき適切なラベルが表示されること
6. **other カテゴリ** — `category="other"` のとき `<img>` を描画せず `event` アイコンを描画すること
7. **画像 src** — 非 `other` カテゴリのとき `<img>` の `src` が Unsplash URL（`images.unsplash.com` 含む）であること

---

## 画像戦略（imageMap.ts）

### 方針

- 7カテゴリ × 3枚の Unsplash URL を定数として管理
- `other` はカテゴリアイコン（Material Symbols）のみ（画像なし）
- `getImageUrl(category, eventId)` でイベントIDから決定論的に1枚選択
  - 同じ eventId → 常に同じ画像（表示の一貫性）
  - シード: `eventId の文字コード合計 % 3`

### 画像スタイル

ドラマチック系（暗め・高コントラスト・ステージ照明感）の写真。
将来 Nano Banana Pro で生成した画像に差し替え可能。

### ファイル配置

```
packages/web/src/lib/imageMap.ts   ← URL定数 + getImageUrl()
```

### カテゴリ別 Unsplash URL（各3枚）

URLフォーマット: `https://images.unsplash.com/photo-{ID}?w=300&h=200&fit=crop`

例（music 1枚目）: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop`

| カテゴリ | 画像1 ID | 画像2 ID | 画像3 ID |
|---|---|---|---|
| music | `1493225457124-a3eb161ffa5f` | `1429962714451-bb934ecdc4ec` | `1501386760234-c2f1b64d4d8f` |
| sports | `1571019613454-1cb2f99b2d8b` | `1461896836934-ffe607ba8211` | `1547347298-4074ad3086f0` |
| exhibition | `1540575467063-178a50c2df87` | `1578662996442-48f60103fc96` | `1565035010268-a3816f98589a` |
| kids | `1503454537195-1f28bea0f5cc` | `1515488042361-ee00e0ddd4e4` | `1476703993599-0035a21b9fc3` |
| food | `1414235077428-338989a2e8c0` | `1504674900247-0877df9cc836` | `1555396273-367ea4eb4db5` |
| fashion | `1558769132-cb1aea458c5e` | `1509631179647-0177331693ae` | `1483985988355-763728e1cdc6` |
| anime | `1578632767115-351597cf2a57` | `1612198188060-c7c2a3b66eae` | `1560169897-fc0cdbdfa4d5` |

### `other` カテゴリの画像エリア

左40%エリアを **`bg-slate-100` 背景 + Material Symbols `event` アイコン中央配置** で表示。
画像なし、Unsplash不使用。幅・高さは他カテゴリと同一（flex で自動伸縮）。

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
