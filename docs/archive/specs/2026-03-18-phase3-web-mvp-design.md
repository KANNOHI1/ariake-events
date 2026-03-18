# Phase 3: Web MVP — 設計ドキュメント

> ariake-events Phase 3 WEB MVP の確定設計。実装subagentへの指示書として使用する。

---

## ゴール

有明エリア5施設のイベント情報（173件）を日次自動更新で可視化するWebサイトを GitHub Pages で公開する。

**対象ユーザー:**
- イベント参加者: 心構えのために事前に何がいつあるか確認する
- 周辺居住者: 混雑を避けるために今週末の状況を把握する

---

## 技術スタック

| 項目 | 選定 |
|---|---|
| フレームワーク | Next.js 15（静的エクスポート `output: 'export'`） |
| スタイリング | Tailwind CSS（melta-ui.md + design-tokens.md 準拠） |
| ホスティング | GitHub Pages（`kannohi1.github.io/ariake-events`） |
| データ | `packages/web/public/events.json`（日次自動更新済み） |
| テスト | Vitest + React Testing Library |
| 状態管理 | React useState + useSearchParams（外部ライブラリなし） |

---

## ディレクトリ構成

```
packages/web/
├── public/
│   └── events.json          ← スクレイパー出力（変更なし）
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← フォント・メタデータ・OGP設定（静的OGP画像を参照）
│   │   └── page.tsx         ← メインページ（ビュー切替 + フィルタ）
│   ├── components/
│   │   ├── FilterBar.tsx    ← 施設・カテゴリフィルタ（sticky）
│   │   ├── ViewTabs.tsx     ← 今日/今週/カレンダー タブ
│   │   ├── EventCard.tsx    ← イベントカード
│   │   ├── CalendarView.tsx ← 月グリッドカレンダー
│   │   ├── TodayView.tsx    ← 今日のイベント一覧
│   │   ├── WeekView.tsx     ← 今週のイベント一覧
│   │   └── ShareButton.tsx  ← Web Share API + OGPカード
│   ├── lib/
│   │   ├── events.ts        ← events.json 読み込み・型定義
│   │   ├── filter.ts        ← フィルタリングロジック
│   │   └── dateUtils.ts     ← 今日/今週判定ユーティリティ
│   └── types.ts             ← EventItem型（scraper側と共有）
├── next.config.ts
├── package.json
└── tailwind.config.ts
```

---

## Section 1: 情報アーキテクチャ

### 3ビュー構成

| ビュー | 用途 | 表示範囲 |
|---|---|---|
| **今日** | 今日開催のイベントを即確認 | `startDate <= today <= endDate` |
| **今週** | 週末の計画立案 | 今日〜7日後 |
| **カレンダー** | 月単位でイベント分布を把握 | 表示月の全イベント（月グリッド） |

### ページレイアウト

```
┌─────────────────────────────────────────┐
│  Ariake Events          [ヘッダー]       │
├─────────────────────────────────────────┤
│  [今日] [今週] [カレンダー]  ← sticky   │
│  ○有明ガーデン ○ガーデンシアター ...    │
│  ○music ○sports ○exhibition ...        │
├─────────────────────────────────────────┤
│                                         │
│  [イベントカード] [イベントカード]       │
│  [イベントカード] [イベントカード]       │
│        （または月グリッド）              │
└─────────────────────────────────────────┘
```

---

## Section 2: ビジュアルデザインシステム

詳細は `docs/design/color-system.md` と `docs/design/design-tokens.md` を参照（両ファイルとも存在確認済み）。

### 施設カラー（バッジ: rounded-full）

| 施設 | クラス |
|---|---|
| 有明ガーデン | `bg-emerald-100 text-emerald-700 border-emerald-200` |
| 東京ガーデンシアター | `bg-violet-100 text-violet-700 border-violet-200` |
| 有明アリーナ | `bg-sky-100 text-sky-700 border-sky-200` |
| TOYOTA ARENA TOKYO | `bg-amber-100 text-amber-700 border-amber-200` |
| 東京ビッグサイト | `bg-rose-100 text-rose-700 border-rose-200` |

### カテゴリカラー（タグ: rounded-md）

| カテゴリ | クラス |
|---|---|
| music | `bg-violet-100 text-violet-700` |
| sports | `bg-emerald-100 text-emerald-700` |
| exhibition | `bg-amber-100 text-amber-700` |
| kids | `bg-pink-100 text-pink-700` |
| food | `bg-orange-100 text-orange-700` |
| fashion | `bg-fuchsia-100 text-fuchsia-700` |
| anime | `bg-cyan-100 text-cyan-700` |
| other | `bg-slate-100 text-slate-600` |

### 禁止パターン（melta-ui 継承）

- `border-l-4` / `border-t-4` によるカラーバー ❌
- `bg-blue-*` / `bg-indigo-*` ❌ → `primary-*` を使う
- 色のみでカテゴリを表現 ❌ → テキストラベル必須

---

## Section 3: データ・フィルタ設計

### データフロー

```
events.json（静的JSON）
  ↓ fetch on mount（useEffect内）
    URL: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/events.json`
    → basePath '/ariake-events' を考慮。環境変数で制御。
  ↓ useMemo でフィルタリング（施設 × カテゴリ × ビュー期間）
  → EventCard / CalendarView に渡す
```

**events.json フィールド一覧（UIで使うもの）:**

```ts
interface EventItem {
  id: string           // シェアURL生成に使用
  eventName: string    // カード表示
  facility: string     // 日本語: "有明ガーデン" 等
  category: EventCategory
  startDate: string    // "YYYY-MM-DD"
  endDate: string      // "YYYY-MM-DD"
  sourceURL: string    // 公式サイトリンク
  // 以下はPhase 4用。UIでは無視する（表示しない）
  peakTimeStart: null
  peakTimeEnd: null
  estimatedAttendees: null
  congestionRisk: null
  lastUpdated: string
}
```

**型共有方針:** `packages/scraper/src/types.ts` から相対パスでインポートせず、`packages/web/src/types.ts` に UI用型を独立定義する（Phase 4まではフィールドが変わらないため重複許容）。

### フィルタ仕様

- **初期状態**: 施設5つ・カテゴリ8つ 全選択（全件表示）
- **操作**: チップをタップ → 個別トグル
- **URL同期**: `?facility=ariakeGarden,ariakeArena&category=music,sports`
  - ページロード時にURLパラメータを読み込んでフィルタ状態を復元
  - フィルタ変更時にURLを更新（ブラウザ履歴に積まない: `replaceState`）
  - **実装注意**: Next.js 15 + `output: 'export'` で `useSearchParams` を使う場合、`<Suspense>` でラップ必須。`page.tsx` 内で `<Suspense fallback={<Loading />}>` に包むこと。
- **全解除**: 「すべて解除」ボタン → 空表示
- **全選択**: 「すべて選択」ボタン → 全件復帰
- **空状態**: 「条件に一致するイベントがありません」+ 「フィルタをリセット」ボタン

### ビュー別ソート

| ビュー | ソート |
|---|---|
| 今日 | 施設定義順（有明ガーデン→ガーデンシアター→有明アリーナ→TOYOTA→ビッグサイト） |
| 今週 | 開始日昇順 |
| カレンダー | 日付順（月グリッド内） |

**施設ソート定義順（facility フィールド値）:**
1. `"有明ガーデン"`
2. `"東京ガーデンシアター"`
3. `"有明アリーナ"`
4. `"TOYOTA ARENA TOKYO"`
5. `"東京ビッグサイト"`

### シェア機能

**イベントシェア（Web Share API）:**
- EventCardに「シェア」ボタン配置
- `navigator.share({ title, text, url })` を呼び出す
- URL: `kannohi1.github.io/ariake-events?event={eventId}`
- フォールバック: `navigator.clipboard.writeText(url)` + 「コピーしました」トースト

**OGPカード（静的メタタグ方式）:**
- `output: 'export'` の制約により、next/og の動的画像生成は使用不可
- 代替: `layout.tsx` にサイト共通OGP画像（静的PNG）を設定
- イベント個別ページは `<title>` と `<meta description>` でイベント名・施設・日程を出力
- SNS/LINEに貼ると: タイトル + 説明文 + 共通OGP画像が展開される
- アーティスト画像は使用しない（著作権・肖像権の問題）
- **将来拡張**: 静的ホスティングからVercel等に移行した際に next/og でイベント別画像を生成可能

---

## Section 4: デプロイ設計

### ディレクトリ方針

`packages/web/` を Next.js アプリ化する（新ディレクトリ作成なし）。
理由: events.jsonの場所変更ゼロ、CIパイプライン変更最小。

### GitHub Actions 更新方針

既存の `.github/workflows/scrape.yml` にビルド + デプロイステップを追加:

```yaml
# scrape.yml に追加するステップ（概要）
- name: Build Next.js
  run: pnpm --filter web build

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: packages/web/out
```

### 静的エクスポート設定

```ts
// next.config.ts
const config = {
  output: 'export',
  basePath: '/ariake-events',
  images: { unoptimized: true },
}
```

---

## マイルストーン

| # | 内容 |
|---|---|
| M1 | Next.js セットアップ + events.json 読み込み確認（ローカル） |
| M2 | イベント一覧ページ（施設・カテゴリフィルタ + URL同期） |
| M3 | カレンダービュー（月グリッド + カテゴリドット） |
| M4 | シェア機能（Web Share API + OGPカード） |
| M5 | GitHub Pages デプロイ → 公開 |

---

## スコープ外（明示的に除外）

| 項目 | 理由 |
|---|---|
| 混雑度表示 | Phase 4で実装。推定ロジック設計が重い |
| お気に入りアーティスト通知 | Phase 5候補。バックエンド必須 |
| チケット価格データ | スクレイパー未対応。Phase 5候補 |
| チケット風画像生成（アプリ内） | Phase 5候補。Canvas実装コスト高 |
| 交通オプション・退避場所情報 | Phase 4/5候補（ROADMAP.md記録済み） |
| ユーザー認証・ログイン | 静的サイトのスコープ外 |
