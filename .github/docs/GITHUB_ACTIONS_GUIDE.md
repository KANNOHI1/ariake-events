# GitHub Actions 運用ガイド

## ワークフロー概要

`.github/workflows/scrape.yml` が以下を一括実行する:

1. スクレイパーテスト（Vitest）
2. 5施設スクレイピング → `events.json` 更新・コミット
3. Next.js ビルド → GitHub Pages デプロイ

**実行スケジュール**: 毎日 JST 09:00（UTC 00:00）および手動実行（`workflow_dispatch`）

---

## 環境

- Node.js: v22
- pnpm: workspace設定（`pnpm-workspace.yaml`）
- GitHub Pages: `gh-pages` ブランチ、`peaceiris/actions-gh-pages@v4`

---

## 手動実行

1. Actions タブ → `Scrape Events` → `Run workflow`

**用途**:
- セレクタ修正後の即時確認
- 定期実行が失敗した後の再実行

---

## ログ確認

Actions タブ → `Scrape Events` → 対象実行 → `scrape` ジョブ

各施設の取得件数・警告・エラーが GitHub Actions Summary に出力される。

---

## エラー時の対応

| エラー種別 | 対応 |
|:---|:---|
| スクレイピング失敗 | `docs/TROUBLESHOOTING.md` セクション1を参照 |
| 一時的なネットワークエラー | 手動で再実行 |
| Webビルド失敗 | `NEXT_PUBLIC_BASE_PATH=/ariake-events pnpm --filter web build` でローカル確認 |
| デプロイ失敗 | `permissions: pages: write` が設定されているか確認 |

---

## permissions

```yaml
permissions:
  contents: write   # events.json のコミット・プッシュ
  pages: write      # GitHub Pages デプロイ
  id-token: write   # OIDC認証（peaceiris/actions-gh-pages）
```
