# GitHub Actions 運用ガイド

## 概要

このプロジェクトでは、GitHub Actionsを利用して毎日1回、イベント情報のスクレイピングを自動実行します。

## 1. ワークフロー設定

-   **ワークフローファイル**: `.github/workflows/scrape.yml`

```yaml
name: Scrape Events
on:
  schedule:
    # 毎日午前9時（JST）= UTC 0:00 に実行
    - cron: '0 0 * * *'
  workflow_dispatch: # 手動実行も可能
permissions:
  contents: write # リポジトリへのコミット・プッシュに必要
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright browsers
        run: pnpm --filter scraper exec playwright install --with-deps chromium
      - name: Run scraper
        run: pnpm --filter scraper start
      - name: Check for changes
        id: check_changes
        run: |
          if git diff --exit-code packages/web/public/events.json; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi
      - name: Commit and push changes
        if: steps.check_changes.outputs.changed == 'true'
        run: |
          git config --global user.name "GitHub Actions"
          git config --global user.email "actions@github.com"
          git add packages/web/public/events.json
          git commit -m "chore: Update events.json [skip ci]"
          git push
```

## 2. 実行スケジュール

-   **実行頻度**: 毎日1回
-   **実行時刻**: 日本時間 午前9時（`0 0 * * *` UTC）

## 3. シークレット設定

スクレイピングは公開サイトを対象としているため認証は不要ですが、**メール通知を有効にする場合は以下のシークレットが必要**です。

-   `GMAIL_USER`
-   `GMAIL_APP_PASSWORD`
-   `NOTIFICATION_TO`

設定場所: `Settings` → `Secrets and variables` → `Actions`

未設定でも実行は継続します（通知はスキップされます）。

## 4. ログの確認方法

1.  リポジトリの `Actions` タブにアクセスします。
2.  `Scrape Events` ワークフローの実行履歴が表示されます。
3.  各実行の `scrape` ジョブをクリックすると、詳細なログ（各施設のスクレイピング結果、エラーメッセージなど）を確認できます。

## 5. エラー時の対応手順

1.  **通知**: ワークフローの実行が失敗すると、リポジトリの管理者に通知メールが届きます。
2.  **ログ確認**: 上記「4. ログの確認方法」に従い、エラーの原因を特定します。
3.  **原因分析**: 
    -   **サイト構造の変更**: `SCRAPING_GUIDE.md` と `TROUBLESHOOTING.md` を参照し、セレクタやロジックを修正します。
    -   **一時的なネットワークエラー**: 手動でワークフローを再実行します。
    -   **権限不足**: `permissions: contents: write` が設定されているか確認します。

## 6. 手動実行の方法

1.  リポジトリの `Actions` タブにアクセスします。
2.  左側のサイドバーから `Scrape Events` ワークフローを選択します。
3.  `Run workflow` ボタンをクリックすると、手動でワークフローを実行できます。

**用途**:
-   サイト構造の変更後、すぐに動作確認したい場合
-   定期実行が失敗した後の再実行
