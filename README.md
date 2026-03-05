# Ariake Events

> **初めてこのリポジトリを見る方へ**: まず [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) をお読みください。プロジェクトの背景・現在地・次のステップが5分で把握できます。

## 1. 概要

有明エリアで開催されるイベント情報を一元的に集約・表示するWebアプリケーションです。利用者は、本サイトを通じて有明エリアのイベント情報を網羅的に把握し、各イベントの混雑リスクを事前に確認することができます。

本リポジトリは、プロジェクトのソースコード、ドキュメント、設定ファイルなど、すべての資産を管理するマスターリポジトリです。

## 2. 対象施設

本プロジェクトでは、以下の5つの施設を対象としています。

| No. | 施設名 | 公式サイト |
|:---|:---|:---|
| 1 | 有明ガーデン | [https://www.shopping-sumitomo-rd.com/ariake/event/](https://www.shopping-sumitomo-rd.com/ariake/event/) |
| 2 | 東京ガーデンシアター | [https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/](https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/) |
| 3 | 有明アリーナ | [https://ariake-arena.tokyo/event/](https://ariake-arena.tokyo/event/) |
| 4 | TOYOTA ARENA TOKYO | [https://toyota-arena-tokyo.jp/events/](https://toyota-arena-tokyo.jp/events/) |
| 5 | 東京ビッグサイト | [https://www.bigsight.jp/visitor/event/](https://www.bigsight.jp/visitor/event/) |

> [!NOTE]
> 当初検討されていた「有明コロシアム」は、公式サイトに民間イベントが掲載されず、情報の網羅性が低いことから対象外となりました。

## 3. 主な機能

- **イベント情報の自動収集**: GitHub Actionsを利用して、毎日定時に各施設の公式サイトからイベント情報を自動的にスクレイピングします。
- **イベント情報の一元管理**: 収集したイベント情報を正規化し、`packages/web/public/events.json` としてリポジトリに保存します。
- **Webフロントエンド（開発中）**: `events.json` を利用して、イベント情報を表示するWebサイトを構築します。

## 4. クイックスタート

ローカル環境でスクレイパーを実行し、`events.json` を生成するまでの手順は以下の通りです。

```bash
# 1. 依存関係のインストール
pnpm install

# 2. Playwrightのブラウザをインストール
pnpm --filter scraper exec playwright install --with-deps chromium

# 3. スクレイピングの実行
pnpm --filter scraper dev
```

実行が完了すると、`packages/web/public/events.json` に最新のイベント情報が出力されます。

## 5. ドキュメント

本プロジェクトに関する詳細なドキュメントは `docs` ディレクトリ、および各パッケージ内に格納されています。

| ドキュメント名 | パス | 概要 |
|:---|:---|:---|
| **プロジェクト全容** | `docs/PROJECT_OVERVIEW.md` | **最初に読む**。背景・現在地・次のステップ・意思決定の記録を網羅しています。 |
| **技術仕様書** | `docs/TECHNICAL_SPEC.md` | プロジェクトのアーキテクチャ、技術スタック、データフローなどを定義しています。 |
| **開発環境セットアップ** | `docs/SETUP.md` | ローカルでの開発環境構築手順を説明しています。 |
| **トラブルシューティング** | `docs/TROUBLESHOOTING.md` | 開発中や運用中に発生しうる問題とその解決策をまとめています。 |
| **GitHub Actions運用ガイド** | `.github/docs/GITHUB_ACTIONS_GUIDE.md` | 自動実行ワークフローの運用方法について説明しています。 |
| **スクレイピング実装ガイド** | `packages/scraper/docs/SCRAPING_GUIDE.md` | 各施設のスクレイピングロジックの詳細を解説しています。 |
| **データスキーマ定義** | `packages/scraper/docs/DATA_SCHEMA.md` | `events.json` のデータ構造を定義しています。 |

## 6. ライセンス

[MIT](LICENSE)
