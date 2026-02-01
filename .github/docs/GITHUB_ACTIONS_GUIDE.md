# GitHub Actions 運用ガイド

## 概要

このプロジェクトでは、GitHub Actionsを利用して毎日1回、イベント情報のスクレイピングを自動実行します。

## 1. ワークフロー設定

-   **ワークフローファイル**: `.github/workflows/scraper.yml`

```yaml
name: Daily Scraper

on:
  schedule:
    - cron: "0 17 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  run-scraper:
    runs-on: ubuntu-latest
    env:
      TZ: Asia/Tokyo
      GMAIL_USER: ${{ secrets.GMAIL_USER }}
      GMAIL_APP_PASSWORD: ${{ secrets.GMAIL_APP_PASSWORD }}
      NOTIFICATION_TO: ${{ secrets.NOTIFICATION_TO }}
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: true
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: pnpm
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright Chromium
        run: pnpm --filter scraper exec playwright install --with-deps chromium
      - name: Run scraper
        run: pnpm --filter scraper dev
      - name: Commit events.json
        run: |
          if git diff --quiet -- packages/web/public/events.json; then
            echo "No changes to commit"
            exit 0
          fi
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add packages/web/public/events.json
          git commit -m "chore: update events.json"
          git push
```

## 2. 実行スケジュール

-   **実行頻度**: 毎日1回
-   **実行時刻**: 日本時間 午前2時（`0 17 * * *` UTC）

## 3. シークレット設定

スクレイピングは公開サイトを対象としているため認証は不要ですが、**メール通知を有効にする場合は以下のシークレットが必要**です。

-   `GMAIL_USER`
-   `GMAIL_APP_PASSWORD`
-   `NOTIFICATION_TO`

設定場所: `Settings` → `Secrets and variables` → `Actions`

未設定でも実行は継続します（通知はスキップされます）。

## 4. ログの確認方法

1.  リポジトリの `Actions` タブにアクセスします。
2.  `Daily Scraper` ワークフローの実行履歴が表示されます。
3.  各実行の `run-scraper` ジョブをクリックすると、詳細なログ（各施設のスクレイピング結果、エラーメッセージなど）を確認できます。

## 5. エラー時の対応手順

1.  **通知**: ワークフローの実行が失敗すると、リポジトリの管理者に通知メールが届きます。
2.  **ログ確認**: 上記「4. ログの確認方法」に従い、エラーの原因を特定します。
3.  **原因分析**: 
    -   **サイト構造の変更**: `SCRAPING_GUIDE.md` と `TROUBLESHOOTING.md` を参照し、セレクタやロジックを修正します。
    -   **一時的なネットワークエラー**: 手動でワークフローを再実行します。
    -   **権限不足**: `permissions: contents: write` が設定されているか確認します。

## 6. 手動実行の方法

1.  リポジトリの `Actions` タブにアクセスします。
2.  左側のサイドバーから `Daily Scraper` ワークフローを選択します。
3.  `Run workflow` ボタンをクリックすると、手動でワークフローを実行できます。

**用途**:
-   サイト構造の変更後、すぐに動作確認したい場合
-   定期実行が失敗した後の再実行
