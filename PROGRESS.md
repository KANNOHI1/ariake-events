# PROGRESS — ariake-events

> このファイルはセッション末に更新する。セッション開始時に最初に読む。

---

## 現在地

**Phase 3 / 実装完了 — GitHub Pages デプロイ待ち（手動設定1回）**

---

## 完了済み

- **Phase 1** (完了 2026-03-17): スクレイパー5施設、58テスト、CI日次cron稼働
- **ロードマップ策定** (完了 2026-03-18): `docs/ROADMAP.md` に確定版を記録
- **Phase 2** (完了 2026-03-18): カテゴリ分類拡充
  - 新カテゴリ: kids(4), food(4), anime(2), fashion(1)
  - 既存拡張: music +12, sports +18, exhibition +12
  - other: 73件 → 20件
  - CI確認済み ✅
- **Phase 3** (完了 2026-03-18): Web MVP 全12タスク実装完了
  - Next.js 15 静的エクスポート + Tailwind CSS 3 + Vitest 3
  - 3ビュー: 今日 / 今週 / カレンダー（月グリッド）
  - 施設5 × カテゴリ8 フィルタ（URL同期・シェア可能）
  - ShareButton: Web Share API + clipboard fallback
  - GitHub Actions: peaceiris/actions-gh-pages@v4 でデプロイ自動化
  - テスト: 72/72 passing、ビルド: クリーン静的エクスポート

---

## 次にやること

**GitHub Pages 有効化（1回限りの手動操作）:**

1. GitHub リポジトリ → Settings → Pages
2. Source: "Deploy from a branch" → branch: `gh-pages` → `/`
3. Save → 次回 CI 実行時に `kannohi1.github.io/ariake-events` でサイト公開

**その後 Phase 4 (混雑度可視化) へ:**
- 設計メモ: `docs/ROADMAP.md` の Phase 4 セクション参照
- 推定ロジック設計が先決（施設キャパ × イベント種別 × 時間帯）

---

## 未解決の問題・懸案

- [ ] `other` 20件のうち一部（レディースアパレル販売等）は ariakeGarden がラベルのみを mapCategory に渡す設計上の制約。タイトルフォールバックで解消できるがPhase 2スコープ外
- [ ] Phase 4の混雑度推定ロジックは設計が未確定（施設キャパ × イベント種別 × 時間帯）
- [ ] TOYOTA ARENA TOKYOのHTMLフィクスチャは月ボタン押下後の状態を再現できていない（テストの制約として既知）
- [ ] ogp.png は1×1プレースホルダー — Phase 3後半またはPhase 4で実デザイン画像に差替え推奨

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
