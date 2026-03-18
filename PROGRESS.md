# PROGRESS — ariake-events

> このファイルはセッション末に更新する。セッション開始時に最初に読む。

---

## 現在地

**Phase 2 / M1 — 未着手**

---

## 完了済み

- **Phase 1** (完了 2026-03-17): スクレイパー5施設、44テスト、CI日次cron稼働
- **ロードマップ策定** (完了 2026-03-18): `docs/ROADMAP.md` に確定版を記録

---

## 次にやること

**Phase 2 M1: 有明ガーデン `data-eventlabel` 対応**

```bash
# 現状の有明ガーデンのカテゴリ分類を確認
# packages/scraper/src/sources/ariakeGarden.ts のcategory判定ロジックを確認
# data-eventlabel の値一覧を fixtures/ariake-garden.html から抽出
```

手順:
1. `writing-plans` Skillで Phase 2 実装計画を立てる
2. `subagent-driven-development` で実行

---

## 未解決の問題・懸案

- [ ] Phase 4の混雑度推定ロジックは設計が未確定（施設キャパ × イベント種別 × 時間帯）
- [ ] TOYOTA ARENA TOKYOのHTMLフィクスチャは月ボタン押下後の状態を再現できていない（テストの制約として既知）

---

## 直近の判断メモ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-03-18 | WebはNext.js静的エクスポート + GitHub Pages | コストゼロ、CIと親和性高い |
| 2026-03-18 | MVPに混雑度は含めない | 推定ロジック設計が重く待てない |
| 2026-03-18 | カテゴリ拡充はPhase 3の前に実施 | フィルタUIの初日品質に直結 |
| 2026-03-18 | カレンダービューはMVP必須 | ユーザー判断 |

---

## セッション履歴（直近3件）

### 2026-03-18
- ロードマップ策定・確定（Phase 1〜4、マイルストーン設定）
- `docs/ROADMAP.md`、`PROGRESS.md` 作成
- 次: Phase 2 M1 開始

### 2026-03-17
- スクレイパー完全リビルド完了（173イベント）
- Toyota Arena月ボタン正規表現修正
- GitHub Actions Summary追加
- `update-fixtures` スクリプト追加
