# 開発環境セットアップガイド

## 概要

このドキュメントは、「Ariake Events」プロジェクトのスクレイピング環境をローカルに構築するための手順を説明します。

## 1. 必要なツール

-   **Node.js**: v18.x またはそれ以降
-   **pnpm**: v9.x またはそれ以降
-   **Git**: v2.x またはそれ以降

## 2. インストール手順

### ステップ1: リポジトリのクローン

```bash
git clone https://github.com/KANNOHI1/ariake-events.git
cd ariake-events
```

### ステップ2: 依存関係のインストール

```bash
pnpm install
```

### ステップ3: Playwrightのセットアップ

スクレイピングにはPlaywrightが必要です。以下のコマンドで、ブラウザ（Chromium）をインストールします。

```bash
pnpm --filter scraper exec playwright install --with-deps chromium
```

**注意**: 会社のプロキシや証明書の問題で失敗する場合は、[トラブルシューティングガイド](docs/TROUBLESHOOTING.md)を参照してください。

## 3. 環境変数の設定

メール通知を使う場合のみ設定が必要です。

```bash
# 例: .env の作成
cp packages/scraper/.env.example packages/scraper/.env
```

`.env` に以下を設定します。

```
GMAIL_USER="your_gmail_address@gmail.com"
GMAIL_APP_PASSWORD="your_gmail_app_password"
NOTIFICATION_TO="recipient_email@example.com"
```

## 4. ローカルでの実行方法

### スクレイピングの実行

以下のコマンドで、5施設すべてのスクレイピングを実行します。結果は `packages/web/public/events.json` に出力されます。

```bash
pnpm --filter scraper dev
```

### テストの実行

現時点で自動テストは未整備です。

## 5. フロントエンドの起動（参考）

`packages/web` は現時点で雛形のみです。起動スクリプトは未用意のため、必要に応じて追記してください。
