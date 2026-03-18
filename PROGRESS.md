# PROGRESS — ariake-events

> このファイルはセッション末に更新する。セッション開始時に最初に読む。

---

## 現在地

**Phase 4 M3 完了 — EventCard混雑度バッジ + CalendarView カラーバー push済み**

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

## 次にやること

**Phase 4 M4: 過去データ蓄積（履歴JSON）の仕組み** — 未着手

**または CalendarView モーダル内バッジ追加（M3補完）:**
- モーダル内のイベント詳細カードに混雑度バッジが未表示（M3スコープ外だったため）
- 必要であれば単独タスクとして対応可能

---

## 未解決の問題・懸案

- [ ] `other` 20件のうち一部（レディースアパレル販売等）は ariakeGarden がラベルのみを mapCategory に渡す設計上の制約。タイトルフォールバックで解消できるがPhase 2スコープ外
- [x] ~~Phase 4の混雑度推定ロジックは設計が未確定~~ → M1-M3で完了
- [ ] Phase 4 M4: 過去データ蓄積（履歴JSON）の仕組み 未着手
- [ ] CalendarView モーダル内のイベント詳細に混雑度バッジが未表示（M3仕様外）
- [ ] TOYOTA ARENA TOKYOのHTMLフィクスチャは月ボタン押下後の状態を再現できていない（テストの制約として既知）
- [x] ~~ogp.png は1×1プレースホルダー~~ → 2026-03-19 ogp.png・favicon一式を実装済み
- [ ] Phase 4 M3: congestionRisk のUI表示（EventCard バッジ + カレンダー日別色）未着手
- [ ] Phase 4 M4: 過去データ蓄積（履歴JSON）の仕組み 未着手

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
  - plan: `docs/superpowers/plans/2026-03-19-phase4-congestion-risk.md`
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
