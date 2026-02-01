# Ariake Events

## 概要

有明エリアで開催されるイベント情報を一元的に集約・表示するWebアプリケーションです。利用者は、本サイトを通じて有明エリアのイベント情報を網羅的に把握し、各イベントの混雑リスクを事前に確認することができます。

## 対象施設（5施設）

1.  有明ガーデン
2.  東京ガーデンシアター
3.  有明アリーナ
4.  TOYOTA ARENA TOKYO
5.  東京ビッグサイト

## 主な機能

-   **イベント情報の自動収集**: GitHub Actionsを利用して、毎日1回、各施設の公式サイトからイベント情報を自動的にスクレイピングします。
-   **イベント情報の一元表示**: 収集したイベント情報をWebサイト上で一覧表示します。
-   **データのエクスポート**: 収集したデータは `events.json` としてリポジトリに保存されます。

## クイックスタート

以下はローカルでスクレイパーを動かす最小手順です。出力は `packages/web/public/events.json` に保存されます。

```bash
# 依存関係のインストール
pnpm install

# スクレイピングの実行
pnpm --filter scraper dev

# 開発サーバーの起動（Webは現時点で雛形のみ）
# まだ起動コマンドはありません
```

## ドキュメント

-   [技術仕様書](TECHNICAL_SPEC.md)
-   [スクレイピング実装ガイド](packages/scraper/docs/SCRAPING_GUIDE.md)
-   [GitHub Actions運用ガイド](.github/docs/GITHUB_ACTIONS_GUIDE.md)
-   [データスキーマ定義](packages/scraper/docs/DATA_SCHEMA.md)
-   [開発環境セットアップガイド](SETUP.md)
-   [トラブルシューティングガイド](docs/TROUBLESHOOTING.md)

## ライセンス

MIT
