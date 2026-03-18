# ariake-events ロードマップ

**ゴール**: 有明エリアのイベント情報と混雑度を可視化するWEBサイトをリリースする
**対象ユーザー**: イベント参加者（心構え）・周辺居住者（覚悟）
**確定日**: 2026-03-18

---

## フェーズ構成

### Phase 1 ✅ スクレイパー基盤（完了 2026-03-17）
5施設173イベント、44テスト、GitHub Actions日次cron稼働中

**成果物:**
- `packages/scraper/` — 5施設スクレイパー（Playwright + Cheerio）
- `packages/web/public/events.json` — 日次自動更新
- `.github/workflows/scrape.yml` — 日次cron + GitHub Actions Summary

---

### Phase 2: カテゴリ分類拡充 ✅ 完了 (2026-03-18)

| # | マイルストーン | 状態 |
|---|---|---|
| M1 | 有明ガーデン `data-eventlabel` 対応（kids/food/fashion等） | ✅ |
| M2 | 全施設キーワード辞書拡張（other削減） | ✅ |
| M3 | テスト更新・CI確認 | ✅ |

**結果** (2026-03-18):
- music: 72件 (+12)
- exhibition: 47件 (+12)
- sports: 23件 (+18)
- kids: 4件（新）
- food: 4件（新）
- anime: 2件（新）
- fashion: 1件（新）
- other: 20件（73→20）

---

### Phase 3: WEB MVP ✅ 完了 (2026-03-18)

**完了基準**: GitHub Pages公開、施設・カテゴリフィルタ稼働、カレンダービュー表示

| # | マイルストーン | 状態 |
|---|---|---|
| M1 | Next.js セットアップ + events.json 読み込み確認（ローカル） | ✅ |
| M2 | イベント一覧ページ（施設フィルタ・カテゴリフィルタ） | ✅ |
| M3 | カレンダービュー（月別イベント表示） | ✅ |
| M4 | GitHub Pages デプロイ → 公開 | ✅ |

**成果物:**
- `packages/web/` — Next.js 15 静的エクスポート + Tailwind CSS 3
- 3ビュー: 今日 / 今週 / カレンダー（月グリッド）
- 施設5 × カテゴリ8 フィルタ（URL同期・シェア可能）
- drag-to-dismiss モーダル（タッチ対応）
- テスト: 72/72 passing、URL: kannohi1.github.io/ariake-events

**技術スタック:**
- Next.js（静的エクスポート）
- Tailwind CSS（`docs/melta-ui.md` 準拠）
- GitHub Pages
- CIはscrape.ymlにビルド+デプロイステップを追加

---

### Phase 4: 混雑度可視化

**完了基準**: congestionRisk表示、過去データ蓄積開始

| # | マイルストーン | 状態 |
|---|---|---|
| M1 | 施設キャパシティデータ整備 + 推定ロジック設計 | 未着手 |
| M2 | congestionRisk計算実装（スクレイパー側） | 未着手 |
| M3 | WEBサイトに混雑度表示UI追加 | 未着手 |
| M4 | 過去データ蓄積の仕組み（履歴JSON） | 未着手 |

**Phase 4 設計メモ（ドメイン知識）:**
- 混雑インパクトは時間帯で異なる
  - 昼のイベント重複（ガーデンシアター × アリーナ等）: 有明ガーデン駐車場・フードコートに直撃
  - 夜のビッグネームライブ: 駐車場・フードコートへの影響は比較的小（終演後の離脱が主）
- 将来的に表示したい情報（Phase 4以降の候補）
  - 交通オプション: りんかい線・ゆりかもめ・BRT・バス（時刻表/混雑目安）
  - 有明ガーデン駐車場・フードコートの混雑予報
  - 混雑時の退避場所候補（エリア内のカフェ・公園等）

---

## 設計上の確定判断

| 決定事項 | 内容 | 理由 |
|---|---|---|
| Webホスティング | GitHub Pages（Next.js静的エクスポート） | 追加コストゼロ、CIと親和性高い |
| MVPスコープ | 混雑度なしでリリース | 推定ロジック設計が重く、待つとリリースが遠のく |
| カテゴリ拡充タイミング | Phase 3（Web）の前に実施 | フィルタUIの初日品質に直結 |
| カレンダービュー | Phase 3に必須 | ユーザー確定事項 |
| Google検索による分類 | 採用しない | 実装コスト高、Otherでも十分 |

---

## Skills活用マップ

| Phase | 主要Skills |
|---|---|
| Phase 2 | `writing-plans` → `subagent-driven-development` |
| Phase 3 M1-2 | `brainstorming` → `writing-plans` → `frontend-design` → `subagent-driven-development` |
| Phase 3 M3 | `data-visualization` → `frontend-design` |
| Phase 3 M4 | `finishing-a-development-branch` → `ship` |
| Phase 4 M1 | `brainstorming` → `writing-plans` |
| Phase 4 M2-3 | `subagent-driven-development` / `dispatching-parallel-agents` |
