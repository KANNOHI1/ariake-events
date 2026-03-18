# ariake-events デザイントークン

> color-system.md のカラー定義をTailwindクラス名にマッピングしたもの。
> 実装subagentはこのファイルを参照してクラス名を決める。生のカラー値を直接書かない。

---

## Tier 1: グローバルトークン（Tailwindスケール参照）

```
-- Color: Primary (melta-ui 既定) --
color-primary-50:  bg-primary-50   / #f0f5ff
color-primary-100: bg-primary-100  / #dde8ff
color-primary-400: bg-primary-400  / #6492ff   ← アクセント
color-primary-500: bg-primary-500  / #2b70ef   ← CTA
color-primary-700: bg-primary-700  / #1a40b5   ← hover

-- Color: Neutral --
color-page-bg:     bg-gray-50
color-surface:     bg-white
color-border:      border-slate-200
color-text-head:   text-slate-900
color-text-body:   #3d4b5f  (text-body)
color-text-muted:  text-slate-500
```

---

## Tier 2: エイリアストークン（セマンティック）

### Surface（背景レイヤー）

| トークン名 | Tailwindクラス | 用途 |
|---|---|---|
| `surface-page` | `bg-gray-50` | ページ全体の背景 |
| `surface-card` | `bg-white` | カード・モーダル背景 |
| `surface-today` | `bg-primary-50` | カレンダーの「今日」セル |
| `surface-selected` | `bg-primary-500` | 選択済みフィルタ・アクティブ状態 |

### Text（テキスト）

| トークン名 | Tailwindクラス | 用途 |
|---|---|---|
| `text-heading` | `text-slate-900 font-bold` | ページタイトル・カード見出し |
| `text-body` | `text-[#3d4b5f]` | 本文・説明文 |
| `text-muted` | `text-slate-500` | 日時・補足情報 |
| `text-on-primary` | `text-white` | primary背景上のテキスト |
| `text-link` | `text-primary-500 hover:text-primary-700` | リンク |

### Border（ボーダー）

| トークン名 | Tailwindクラス | 用途 |
|---|---|---|
| `border-default` | `border border-slate-200` | カード・入力欄 |
| `border-focus` | `ring-2 ring-primary-500/50` | フォーカスリング |

### Interactive（操作要素）

| トークン名 | Tailwindクラス | 用途 |
|---|---|---|
| `chip-default` | `bg-white border border-slate-200 text-slate-700 hover:bg-gray-50` | 未選択フィルタチップ |
| `chip-active` | `bg-primary-500 border-primary-500 text-white` | 選択済みフィルタチップ |

---

## Tier 3: コンポーネントトークン

### 施設バッジ（rounded-full）

```
facility-ariakeGarden:         bg-emerald-100 text-emerald-700 border border-emerald-200
facility-tokyoGardenTheatre:   bg-violet-100  text-violet-700  border border-violet-200
facility-ariakeArena:          bg-sky-100     text-sky-700     border border-sky-200
facility-toyotaArenaTokyo:     bg-amber-100   text-amber-700   border border-amber-200
facility-tokyoBigSight:        bg-rose-100    text-rose-700    border border-rose-200

共通クラス（追加）: rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1
```

### カテゴリタグ（rounded-md）

```
category-music:      bg-violet-100  text-violet-700   ● bg-violet-500
category-sports:     bg-emerald-100 text-emerald-700  ● bg-emerald-500
category-exhibition: bg-amber-100   text-amber-700    ● bg-amber-500
category-kids:       bg-pink-100    text-pink-700     ● bg-pink-500
category-food:       bg-orange-100  text-orange-700   ● bg-orange-500
category-fashion:    bg-fuchsia-100 text-fuchsia-700  ● bg-fuchsia-500
category-anime:      bg-cyan-100    text-cyan-700     ● bg-cyan-500
category-other:      bg-slate-100   text-slate-600    ● bg-slate-400

共通クラス（追加）: rounded-md px-1.5 py-0.5 text-xs font-medium
```

### カレンダードット（イベント表示）

```
dot-music:      bg-violet-500
dot-sports:     bg-emerald-500
dot-exhibition: bg-amber-500
dot-kids:       bg-pink-500
dot-food:       bg-orange-500
dot-fashion:    bg-fuchsia-500
dot-anime:      bg-cyan-500
dot-other:      bg-slate-400

共通クラス: w-2 h-2 rounded-full inline-block
```

### カード

```
card-base: bg-white rounded-xl border border-slate-200 p-4 shadow-sm
card-hover: hover:shadow-md transition-shadow duration-150
```

### ボタン

```
btn-primary: inline-flex items-center justify-center gap-2 h-10 px-4 text-[1rem] font-medium
             bg-primary-500 text-white rounded-lg hover:bg-primary-700 cursor-pointer
btn-sub:     inline-flex items-center justify-center gap-2 h-10 px-4 text-[1rem] font-medium
             bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-gray-50 cursor-pointer
```

---

## スペーシングトークン（4pxグリッド）

```
space-1:  4px   (p-1 / m-1)
space-2:  8px   ← 推奨基本単位 (p-2 / m-2)
space-3:  12px
space-4:  16px  ← コンポーネント内パディング基準 (p-4)
space-6:  24px  ← カード間マージン (gap-6)
space-8:  32px  ← セクション間 (py-8)
space-12: 48px  ← ページ上下パディング (py-12)
```

---

## タイポグラフィトークン

```
font-family: Inter, Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, sans-serif

font-size-xs:   text-xs   / 12px  ← バッジ・タグ
font-size-sm:   text-sm   / 14px  ← 補足情報
font-size-base: text-base / 16px  ← 本文
font-size-lg:   text-lg   / 18px  ← カード見出し
font-size-xl:   text-xl   / 20px  ← セクション見出し
font-size-3xl:  text-3xl  / 30px  ← ページ見出し

font-weight-medium: font-medium (500)
font-weight-bold:   font-bold   (700)

line-height-body: leading-relaxed
```

---

## ボーダー半径トークン

```
radius-sm:  rounded-md   / 6px   ← カテゴリタグ
radius-md:  rounded-lg   / 8px   ← ボタン・入力欄
radius-lg:  rounded-xl   / 12px  ← カード
radius-full: rounded-full        ← 施設バッジ・ドット
```

---

## モーショントークン

```
duration-fast:   duration-150  ← hover, フィルタチップ切替
duration-base:   duration-200  ← カード展開
duration-slow:   duration-300  ← ビュー切替（今日/今週/カレンダー）

easing-default:  ease-in-out
transition-shadow: transition-shadow
transition-colors: transition-colors
```

---

## 実装チェックリスト（subagent用）

- [ ] 生のhex値を直接 `style=` に書いていない
- [ ] `bg-blue-*` / `bg-indigo-*` を使っていない（`primary-*` に変換済み）
- [ ] `border-l-4` / `border-t-4` によるカラーバーを使っていない
- [ ] カテゴリはタグ（テキスト付き）+ ドット（●）で表現している（色のみに頼っていない）
- [ ] 施設バッジは `rounded-full`、カテゴリタグは `rounded-md` で区別されている
- [ ] フィルタチップは `chip-default` / `chip-active` パターンを使っている
