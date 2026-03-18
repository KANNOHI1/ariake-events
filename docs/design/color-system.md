# ariake-events カラーシステム

> melta-ui.md 準拠。subagentへの実装指示にこのファイルを渡すこと。

---

## 制約（melta-ui から継承）

- カード左端・上部のカラーバー（`border-l-4` / `border-t-4`）**禁止**
- 生の `bg-blue-*` / `bg-indigo-*` **禁止** → `primary-*` を使う
- 1Viewに使う色は**3色まで**（背景・アクセント・テキスト）
- WCAG 2.1 AA 準拠（テキスト 4.5:1以上、UIコンポーネント 3:1以上）
- 色だけで情報を伝えない → アイコン/テキストを必ず併用

---

## Layer 1: ブランドパレット（melta-ui 既定）

```
primary-50:  #f0f5ff   ← 背景のごく薄いtint
primary-100: #dde8ff
primary-200: #c0d4ff
primary-300: #95b6ff
primary-400: #6492ff   ← メインアクセント（有明ガーデンのブランドカラーとも重複するが UI優先）
primary-500: #2b70ef   ← CTAボタン
primary-600: #2250df
primary-700: #1a40b5
primary-800: #13318d
primary-900: #0e266a
primary-950: #07194e
```

---

## Layer 2: ニュートラルパレット（Tailwind slate）

```
ページ背景:   bg-gray-50  (#f9fafb)
カード背景:   bg-white    (#ffffff)
ボーダー:     border-slate-200 (#e2e8f0)
本文:         #3d4b5f  (text-body クラス、melta-ui 既定)
見出し:       text-slate-900 (#0f172a)
サブテキスト: text-slate-500 (#64748b)
```

---

## Layer 3: 施設カラー（5施設）

施設カラーは**フィルタチップ・イベントカード上の施設バッジ**に使用する。
実装パターン: `bg-{color}-100 text-{color}-700 border border-{color}-200 rounded-full px-2 py-0.5 text-xs`

| 施設 | キー | bg | text | border | コントラスト比 |
|---|---|---|---|---|---|
| 有明ガーデン | `ariakeGarden` | `emerald-100` (#d1fae5) | `emerald-700` (#047857) | `emerald-200` | **5.2:1** ✅ |
| 東京ガーデンシアター | `tokyoGardenTheatre` | `violet-100` (#ede9fe) | `violet-700` (#6d28d9) | `violet-200` | **5.8:1** ✅ |
| 有明アリーナ | `ariakeArena` | `sky-100` (#e0f2fe) | `sky-700` (#0369a1) | `sky-200` | **5.9:1** ✅ |
| TOYOTA ARENA TOKYO | `toyotaArenaTokyo` | `amber-100` (#fef3c7) | `amber-700` (#b45309) | `amber-200` | **4.9:1** ✅ |
| 東京ビッグサイト | `tokyoBigSight` | `rose-100` (#ffe4e6) | `rose-700` (#be123c) | `rose-200` | **5.4:1** ✅ |

---

## Layer 4: カテゴリカラー（8カテゴリ）

カテゴリカラーは**イベントカードの左上ドット + カテゴリタグ**に使用する。
カレンダービューでは**ドット（●）または細いアンダーライン**でカテゴリを示す。
実装パターン: `bg-{color}-100 text-{color}-700 rounded-md px-1.5 py-0.5 text-xs font-medium`

| カテゴリ | bg | text | ドット色 | コントラスト比 |
|---|---|---|---|---|
| music | `violet-100` | `violet-700` | `bg-violet-500` | **5.8:1** ✅ |
| sports | `emerald-100` | `emerald-700` | `bg-emerald-500` | **5.2:1** ✅ |
| exhibition | `amber-100` | `amber-700` | `bg-amber-500` | **4.9:1** ✅ |
| kids | `pink-100` | `pink-700` | `bg-pink-500` | **5.1:1** ✅ |
| food | `orange-100` | `orange-700` | `bg-orange-500` | **4.6:1** ✅ |
| fashion | `fuchsia-100` | `fuchsia-700` | `bg-fuchsia-500` | **5.3:1** ✅ |
| anime | `cyan-100` | `cyan-700` | `bg-cyan-500` | **5.0:1** ✅ |
| other | `slate-100` | `slate-600` | `bg-slate-400` | **4.6:1** ✅ |

> **施設カラーとカテゴリカラーの重複**: `emerald` が ariakeGarden と sports で重複している。
> 施設バッジとカテゴリタグは視覚的に異なるコンポーネントで使用するため許容する。
> （施設バッジ = rounded-full, カテゴリタグ = rounded-md で形状で区別）

---

## Layer 5: セマンティックカラー

| 用途 | bg | text | border | 用途例 |
|---|---|---|---|---|
| success | `emerald-50` | `emerald-700` | `emerald-200` | イベント取得成功通知 |
| warning | `amber-50` | `amber-700` | `amber-200` | 混雑注意（Phase 4） |
| error | `rose-50` | `rose-700` | `rose-200` | データ取得失敗 |
| info | `sky-50` | `sky-700` | `sky-200` | 一般的なお知らせ |

---

## 禁止・注意事項

| 禁止 | 理由 |
|---|---|
| カード左端 `border-l-4 border-violet-500` | melta-ui 禁止パターン |
| カード上部 `border-t-4` | melta-ui 禁止パターン |
| `bg-blue-*` / `bg-indigo-*` | `primary-*` を使うこと |
| カラーのみでカテゴリを表現 | アイコンまたはテキストラベル必須 |
| 1View に4色以上 | melta-ui 3色ルール |

---

## カラー使用コンテキスト早見表

```
イベントカード
├── カテゴリタグ (rounded-md)    → カテゴリカラー
├── 施設バッジ (rounded-full)    → 施設カラー
├── タイトル                     → text-slate-900
├── 日付・時刻                   → text-slate-500
└── カード背景                   → bg-white / border-slate-200

カレンダービュー
├── 日付セル背景（今日）          → bg-primary-50
├── イベントドット ●             → カテゴリカラー（bg-{color}-500）
└── イベント多数時               → +N件 (text-slate-500)

フィルタチップ（未選択）         → bg-white border-slate-200 text-slate-700
フィルタチップ（選択済み）        → bg-primary-500 text-white border-primary-500
```
