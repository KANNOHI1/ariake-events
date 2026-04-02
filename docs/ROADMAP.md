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
| M1 | 施設キャパシティデータ整備 + 推定ロジック設計 | ✅ 完了 (2026-03-19) |
| M2 | congestionRisk計算実装（スクレイパー側） | ✅ 完了 (2026-03-19) |
| M3 | WEBサイトに混雑度表示UI追加 | ✅ 完了 (2026-03-19) |
| M4 | 過去データ蓄積の仕組み（履歴JSON） | ✅ 完了 (2026-03-19) |

**M1-M4 成果物 (2026-03-19):**
- 設計spec: `docs/archive/specs/2026-03-19-phase4-congestion-design.md`
- `packages/scraper/src/lib/congestion.ts` — calcFacilityScore, applyCongestionRisk, getDailyScores（5施設・8カテゴリ）
- EventCard: 混雑度バッジ（空いている/やや混雑/混雑/非常に混雑）
- CalendarView: 日別カラーバー（emerald/amber/orange/rose）+ モーダル内バッジ
- `packages/web/public/history/congestion-scores.json` — 日次スコア蓄積（90日ローリング）
- テスト: 92/92 passing（web）、75/75 passing（scraper）

**Phase 4 設計メモ（ドメイン知識）:**
- 混雑インパクトは時間帯で異なる
  - 昼のイベント重複（ガーデンシアター × アリーナ等）: 有明ガーデン駐車場・フードコートに直撃
  - 夜のビッグネームライブ: 駐車場・フードコートへの影響は比較的小（終演後の離脱が主）
- 将来的に表示したい情報（Phase 4以降の候補）
  - 交通オプション: りんかい線・ゆりかもめ・BRT・バス（時刻表/混雑目安）
  - 有明ガーデン駐車場・フードコートの混雑予報
  - 混雑時の退避場所候補（エリア内のカフェ・公園等）

### Phase 5: 交通タブ ✅ 完了 (2026-03-19)

**完了基準**: 有明エリア共通の交通時刻表タブ表示、現在時刻以降の便を自動フィルタ

| # | マイルストーン | 状態 |
|---|---|---|
| M1 | 交通タブ設計・実装（りんかい線・ゆりかもめ・都バス・BRT） | ✅ 完了 (2026-03-19) |

**M1 成果物 (2026-03-19):**
- 設計spec: `docs/archive/specs/2026-03-19-transport-tab-design.md`
- 実装plan: `docs/archive/plans/2026-03-19-transport-tab.md`
- `packages/web/src/data/timetable.ts` — 4路線・平日/土休日静的データ
- `packages/web/src/lib/timetableUtils.ts` — 平日/土休日判定・時刻フィルタ
- `packages/web/src/components/TransportView.tsx` — 横スクロールテーブル（next/dynamic ssr:false）
- `packages/web/src/components/ViewTabs.tsx` — 「交通」タブ追加
- `.github/workflows/timetable-reminder.yml` — 毎年3/1・10/1にダイヤ改正Issueを自動作成
- テスト: 107/107 passing

---

### Phase 6: UI リデザイン ✅ 完了 (2026-03-30)

**完了基準**: Stitch モックに基づく全コンポーネント刷新・GitHub Pages 反映

| # | マイルストーン | 状態 |
|---|---|---|
| M0 | プロジェクト整理・ハウスキーピング | ✅ 完了 (2026-03-29) |
| M1 | デザイン確定（design-system.md 作成） | ✅ 完了 (2026-03-29) |
| M2 | EventCard 横長カード実装 | ✅ 完了 (2026-03-29) |
| M3 | 全体レイアウト刷新（FilterBar / BottomNav / Views） | ✅ 完了 (2026-03-30) |
| M4 | 検証・デプロイ（GitHub Pages 実機確認） | ✅ 完了 (2026-03-30) |

**設計確定事項 (2026-03-29):**
- ベース: Stitch RIGHT スクリーン（モバイルファースト）
- プライマリカラー: `#ec5b13`（オレンジ）
- カード形式: 横長（左: 施設カラー×カテゴリアイコン、右: テキスト情報）
- カード全体クリック → 公式サイト（「公式サイト」リンクテキスト不要）
- デザインリファレンス: https://stitch.withgoogle.com/projects/7599240322536651962

---

### Phase 7: UX改善 ✅ 完了 (2026-03-30)

**完了基準**: 実画像表示、ビュー切替、月リスト表示

| # | マイルストーン | 状態 |
|---|---|---|
| M1 | ビュー切替トグル（☰リスト / ⊞グリッド） | ✅ 完了 (2026-03-30) |
| M2 | 今週ビュー → 月リストビューに置換 | ✅ 完了 (2026-03-30) |
| M3 | 実画像実装（スクレイピング + 施設写真フォールバック） | ✅ 完了 (2026-03-30) |

**M1-M3 成果物 (2026-03-30):**
- FilterBar右上に ☰/⊞ トグルボタン追加、localStorage保存
- MonthView: ← YYYY年M月 → ナビゲーション付き月リスト表示
- TOYOTA ARENA / ビッグサイト: リスティングページから実画像URL抽出（imageUrlフィールド追加）
- 有明ガーデン / ガーデンシアター / 有明アリーナ: 施設建物写真にフォールバック
- Picsum Photos ランダム画像を全廃、`public/facilities/` に5施設の実写真配置
- テスト: 78/78 passing（scraper）、112/112 passing（web）

---

### Phase 8: モバイルUX強化 ✅ 完了 (2026-04-03)

**完了基準**: フィルタUI改善、グリッドビュー高視認性化、UIポリッシュ

| # | マイルストーン | 状態 |
|---|---|---|
| M1 | FilterBar Bottom Sheet化 | ✅ 完了 (2026-04-02) |
| M2 | Masonry グリッドレイアウト | ✅ 完了 (2026-04-03) |
| M3 | UI Polish（余白・ヘッダー・セクションヘッダー） | ✅ 完了 (2026-04-03) |

**M1 成果物 (2026-04-02):**
- FilterSheet.tsx 新規作成（createPortal + SSR対応 + CSS transition）
- FilterBar.tsx コンパクトヘッダー化（絞り込みボタン + バッジ + アクティブラベル）
- テスト: 16スイート 123/123 PASS

**M2 成果物 (2026-04-03):**
- TodayView / MonthView: `grid grid-cols-2` → `columns-2 lg:columns-3 xl:columns-4`（CSS columns）
- EventCard: `break-inside-avoid mb-3`・grid時 `line-clamp-2` 除去
- ゼロ依存（npm追加なし）、SSR/静的エクスポート完全対応
- テスト: 16スイート 127/127 PASS

**M3 成果物 (2026-04-03):**
- HomeContent: `max-w-5xl mx-auto` でデスクトップ余白適正化
- ヘッダーバイカラー: 「有明」→ primary-500（オレンジ）、「イベント」→ slate-900
- 日付 pill バッジ: `bg-[#fff3ed] rounded-full px-3 py-1`
- TodayView セクションヘッダー: 「今日のイベント + 日付」追加
- テスト: 17スイート 127/127 PASS

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
