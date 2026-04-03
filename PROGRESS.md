# PROGRESS — ariake-events

> このファイルはセッション末に更新する。セッション開始時に最初に読む。

---

## 現在地

**Phase 8 M4 完了 — 交通ページリデザイン（ロゴ・薄グレーヘッダー・w-full）push済み

---

## 完了済み

- **Phase 1** (完了 2026-03-17): スクレイパー5施設、58テスト、CI日次cron稼働
- **ロードマップ策定** (完了 2026-03-18): `docs/ROADMAP.md` に確定版を記録
- **Phase 2** (完了 2026-03-18): カテゴリ分類拡充
  - 新カテゴリ: kids(4), food(4), anime(2), fashion(1)
  - 既存拡張: music +12, sports +18, exhibition +12
  - other: 73件 → 20件
  - CI確認済み ✅
- **Phase 4 M1** (完了 2026-03-19): congestionRisk アルゴリズム設計確定
  - 設計spec: `docs/archive/specs/2026-03-19-phase4-congestion-design.md`
  - 施設定数5施設・カテゴリ係数8種・MAX_POSSIBLE_SCORE=0.74確定
- **Phase 4 M3** (完了 2026-03-19): Web UI に混雑度表示追加
  - EventCard: 混雑度バッジ（空いている/やや混雑/混雑/非常に混雑）
  - CalendarView: 日別カラーバー（emerald/amber/orange/rose）
  - getCongestionInfo() を colorMap.ts に追加（一元管理）
  - 90テスト全 PASS、push済み（6dd9b36）
- **Phase 4 M3補完** (完了 2026-03-19): CalendarViewモーダル内に混雑度バッジ追加
  - data-date 属性追加、getCongestionInfo() バッジをモーダル内イベント行に表示
  - 92テスト全 PASS、push済み（2bd03b5）
- **Phase 4 M4** (完了 2026-03-19): 過去データ蓄積（履歴JSON）
  - getDailyScores() を congestion.ts に追加（buildDailyFacilityMap + normalizeDailyScores 抽出）
  - index.ts で congestion-scores.json に日次スコア追記（90日ローリング）
  - scrape.yml: history/ ディレクトリをコミット対象に追加
  - 75スクレイパーテスト全 PASS、push済み（4928812）
- **Phase 4 M2** (完了 2026-03-19): スクレイパー側 congestionRisk 計算実装
  - `packages/scraper/src/lib/congestion.ts` 新規（calcFacilityScore, applyCongestionRisk）
  - 71テスト全 PASS、push済み（7b9b971）
  - 次 CI 実行時に events.json の全イベントに congestionRisk が付く
- **Phase 3** (完了 2026-03-18): Web MVP 全12タスク実装完了
  - Next.js 15 静的エクスポート + Tailwind CSS 3 + Vitest 3
  - 3ビュー: 今日 / 今週 / カレンダー（月グリッド）
  - 施設5 × カテゴリ8 フィルタ（URL同期・シェア可能）
  - ShareButton: Web Share API + clipboard fallback
  - GitHub Actions: peaceiris/actions-gh-pages@v4 でデプロイ自動化
  - テスト: 72/72 passing、ビルド: クリーン静的エクスポート

---

## 完了済み（追記）

- **Phase 5 M1** (完了 2026-03-19): 交通タブ実装
  - 4路線（りんかい線・ゆりかもめ・都バス・BRT）静的時刻表
  - 現在時刻以降を自動フィルタ、平日/土休日自動判定
  - next/dynamic ssr:false でNext.js 15 RSC bundlerバグ回避
  - .github/workflows/timetable-reminder.yml: 毎年3/1・10/1にダイヤ改正Issue自動作成
  - 107テスト全 PASS、push済み (b7a1a14)

## 完了済み（追記2）

- **Phase 7 M1** (完了 2026-03-30): ビュー切替トグル
  - FilterBar右上に ☰/⊞ ボタン追加、ViewMode型（list/grid）、localStorage保存
- **Phase 7 M2** (完了 2026-03-30): 月リストビュー
  - WeekView廃止 → MonthView新規（← YYYY年M月 → ナビゲーション）
  - BottomNav/ViewTabs: week→month置換
- **Phase 7 M3** (完了 2026-03-30): 実画像実装
  - EventItem に imageUrl フィールド追加（scraper/web両方）
  - TOYOTA ARENA / ビッグサイト: リスティングページから img src 抽出
  - 有明ガーデン / ガーデンシアター / 有明アリーナ: 施設建物写真にフォールバック
  - Picsum Photos 全廃、`public/facilities/` に5施設実写真配置
  - テスト: 78/78（scraper）、112/112（web）

## 完了済み（追記3）

- **Phase 8 M1** (完了 2026-04-02): FilterBar Bottom Sheet化
  - FilterSheet.tsx 新規作成（createPortal + SSR対応 + CSS transition）
  - FilterBar.tsx をコンパクトヘッダー化（絞り込みボタン + バッジ + アクティブラベル）
  - テスト: 16スイート 123/123 PASS、push済み
  - 計画書: docs/superpowers/plans/2026-04-02-filterbar-bottom-sheet.md

- **Phase 8 M2** (完了 2026-04-03): Masonry グリッドレイアウト
  - TodayView / MonthView: CSS Grid → CSS columns（`columns-2 lg:columns-3 xl:columns-4 gap-x-3`）
  - EventCard: `break-inside-avoid mb-3`・grid時 `line-clamp-2` 除去
  - ゼロ依存・SSR/静的エクスポート完全対応
  - テスト: 16スイート 127/127 PASS、push済み

- **Phase 8 M3** (完了 2026-04-03): UI Polish
  - HomeContent: `max-w-5xl mx-auto` でデスクトップ余白適正化
  - ヘッダーバイカラー: 「有明」→ primary-500（オレンジ）、「イベント」→ slate-900
  - 日付 pill バッジ: `bg-[#fff3ed] rounded-full px-3 py-1`
  - TodayView セクションヘッダー: 「今日のイベント + 日付」
  - テスト: 17スイート 127/127 PASS、push済み（7f835e0）

- **Phase 8 M4** (完了 2026-04-03): 交通ページリデザイン
  - 各路線ロゴ画像追加（Wikimedia Commons / Public Domain）
  - ヘッダー濃紺 → 薄グレー（bg-slate-50/100/200）でデザイン統一
  - `<table>` に `w-full` 追加でコンテナ幅統一
  - ヘッダー・FilterBar内コンテンツも `max-w-5xl mx-auto` に揃える
  - テスト: 17スイート 131/131 PASS、push済み（ab6b4e3）

## 次にやること

- Phase 8 M5 候補: 絞り込みドロップダウン化（FilterBarのデスクトップUX改善）
- Phase 8 M6 候補: 「今日」→「日」ページ化（日付ナビゲーション追加）
- カレンダーページのグリッド幅問題（内部レイアウト見直し）
- サイトタイトルデザイン刷新（ユーザー主導でアイデア出し予定）

---

## 未解決の問題・懸案

- [ ] `other` 20件のうち一部（レディースアパレル販売等）は ariakeGarden がラベルのみを mapCategory に渡す設計上の制約。タイトルフォールバックで解消できるがPhase 2スコープ外
- [x] ~~Phase 4の混雑度推定ロジックは設計が未確定~~ → M1-M3で完了
- [x] ~~Phase 4 M4: 過去データ蓄積（履歴JSON）の仕組み~~ → 2026-03-19 完了
- [x] ~~CalendarView モーダル内のイベント詳細に混雑度バッジが未表示~~ → 2026-03-19 完了
- [ ] TOYOTA ARENA TOKYOのHTMLフィクスチャは月ボタン押下後の状態を再現できていない（テストの制約として既知）
- [x] ~~ogp.png は1×1プレースホルダー~~ → 2026-03-19 ogp.png・favicon一式を実装済み
- [x] ~~Phase 4 M3: congestionRisk のUI表示~~ → 2026-03-19 完了（EventCard バッジ + CalendarView カラーバー）

---

## 直近の判断メモ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-03-18 | WebはNext.js静的エクスポート + GitHub Pages | コストゼロ、CIと親和性高い |
| 2026-03-18 | MVPに混雑度は含めない | 推定ロジック設計が重く待てない |
| 2026-03-18 | カテゴリ拡充はPhase 3の前に実施 | フィルタUIの初日品質に直結 |
| 2026-03-18 | カレンダービューはMVP必須 | ユーザー判断 |
| 2026-03-18 | other目標≤15 → 実績20件。正当なother（PR/キャンペーン/未判定）で許容範囲 | 73→20で十分 |
| 2026-03-18 | next.config.ts に trailingSlash: true 追加 | GitHub Pages で404防止 |

---

## セッション履歴（直近3件）

### 2026-03-30（第13セッション）
- Phase 7 M1-M3: UX改善（ビュー切替・月リスト・実画像）
  - FilterBar: ☰/⊞ ビュー切替トグル追加（localStorage保存）
  - WeekView → MonthView 置換（月ナビゲーション付きリスト）
  - Picsum全廃 → TOYOTA ARENA/ビッグサイトは実画像スクレイピング、他3施設は施設写真フォールバック
  - imageUrl フィールド追加（scraper EventItem + web EventItem）
  - public/facilities/ に5施設の建物写真配置
  - design-system.md 画像戦略セクション全面更新
  - テスト: 78/78（scraper）、112/112（web）、push済み（4f76fba）

### 2026-03-30（第12セッション）
- Phase 6 M4: 検証・デプロイ（GitHub Pages 実機確認）
  - Playwright でデスクトップ（1280px）・モバイル（390px iPhone相当）確認
  - 横長カード・FilterBar チップ・BottomNav・URL同期すべて正常
  - ROADMAP.md: Phase 6 ✅ 完了、PROGRESS.md 更新・push済み

### 2026-03-30（第11セッション）
- Phase 6 M3: FilterBar/Views 全体刷新
  - FilterBar.tsx: category chip active → `bg-primary-500 text-white`（venue chips と統一）
  - TodayView.tsx / WeekView.tsx: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` → `flex flex-col gap-3`
  - 110テスト全PASS、push済み

### 2026-03-29（第10セッション）
- Phase 6 M2: EventCard 横長カード実装
  - `packages/web/src/lib/imageMap.ts` 新規作成（7カテゴリ×3枚 Unsplash URL、getImageUrl()）
  - `packages/web/src/components/EventCard.tsx` 横長カード化（左40%写真/右60%テキスト）
  - `packages/web/src/lib/colorMap.ts` FACILITY_GRADIENTS 削除
  - EventCard.test.tsx: 8境界条件に刷新（カード全体リンク・other=img無し・Unsplash URL・congestionRisk null/0）
  - 110テスト全PASS、push済み (de30702)

### 2026-03-29（第9セッション）
- Phase 6 M0: ハウスキーピング完了
  - output/ を .gitignore に追加
  - 旧デザインドキュメント削除（melta-ui.md / color-system.md / design-tokens.md）
  - CLAUDE.md・ROADMAP.md・PROGRESS.md 更新、push済み（a633b23）
- Phase 6 M1: デザインシステム確定
  - `docs/design/design-system.md` 新規作成（カラーパレット・EventCard構造・imageMap戦略）
  - brainstorming スキルで全デザイン決定（Stitch RIGHT準拠・横長カード・アプローチA）
  - colorMap.ts の imageBadgeClass に text-white 追加
  - spec review ループ通過、107テスト全PASS、push済み（93cc807）

### 2026-03-19（第8セッション）
- Phase 5 M1: 交通タブ実装（brainstorming → writing-plans → subagent-driven-development）
  - timetable.ts・timetableUtils.ts・TransportView.tsx 新規
  - next/dynamic ssr:false でCI build failure (RSC bundlerバグ) を解消
  - page.test.tsx: waitFor 追加でdynamic importの非同期解決に対応
  - 107テスト全 PASS、push済み (b7a1a14)

### 2026-03-19（第7セッション）
- Phase 4 M3: Web UI 混雑度表示実装（subagent-driven-development）
  - Task1〜4完了、push済み（6dd9b36）
  - getCongestionInfo() を colorMap.ts に追加
  - EventCard 混雑度バッジ追加
  - CalendarView 日別カラーバー追加
  - 90テスト全 PASS

### 2026-03-19（第6セッション）
- Phase 4 M1: congestionRisk アルゴリズム設計確定（brainstorming + writing-plans）
  - spec: `docs/archive/specs/2026-03-19-phase4-congestion-design.md`
  - plan: `docs/archive/plans/2026-03-19-phase4-congestion-risk.md`
- Phase 4 M2: congestionRisk計算実装（subagent-driven-development）
  - Task1〜6完了、6コミット、push済み（7b9b971）
  - 実装: `packages/scraper/src/lib/congestion.ts`（calcFacilityScore, applyCongestionRisk）
  - 全71テスト PASS
- ogp.png・favicon一式追加（web-asset-generator）
- docs/整理（archive/specs, archive/plans 構造化）

### 2026-03-18（第5セッション）
- CalendarView drag-to-dismiss: fly-off アニメーション修正（80px超で画面外まで滑り出てから閉じる）
- docs/ 整理: Phase 1時代の古いドキュメント4件削除（PROJECT_OVERVIEW / TECHNICAL_SPEC / SETUP / CONTRIBUTING）
  - 完了済み plans/specs を docs/archive/ に移動
  - docs/melta-ui.md → docs/design/melta-ui.md に移動
  - README / TROUBLESHOOTING / GITHUB_ACTIONS_GUIDE / CLAUDE.md のパス参照を更新
  - packages/web/.gitignore に .next/ out/ を追加
- push済み（ee6acf2）

### 2026-03-18（第4セッション）
- drag-to-dismiss モーダル実装（isTouching フラグ + transition制御）
- push済み（c181a42）

### 2026-03-18（第3セッション）
- Phase 3 全12タスク実装完了（subagent-driven-development）
  - Task 1-5: セットアップ + データ層（types, dateUtils, filter, events, layout）
  - Task 6-9: UIコンポーネント（colorMap, EventCard, FilterBar, ViewTabs, TodayView, WeekView, page.tsx）
  - Task 10-12: CalendarView, ShareButton, GitHub Pages デプロイ設定
  - テスト: 72/72 passing、ビルド: clean
- コード品質修正: trailingSlash, vitest/globals types, invalid start script 除去
- 次: GitHub Pages 手動有効化 → Phase 4 設計

### 2026-03-18（第2セッション）
- Phase 3 設計完了
  - spec: `docs/superpowers/specs/2026-03-18-phase3-web-mvp-design.md`
  - plan: `docs/superpowers/plans/2026-03-18-phase3-web-mvp.md`（12件レビュー修正済み）

### 2026-03-18（第1セッション）
- ロードマップ策定・確定（Phase 1〜4、マイルストーン設定）
- Phase 2 全実装完了: カテゴリ拡充 73→20件、58テスト
- CI確認済み → Phase 3開始待ち
