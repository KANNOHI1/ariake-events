_# 技術仕様書

## 1. プロジェクト概要

本プロジェクトは、有明エリアの主要施設で開催されるイベント情報を自動的に収集し、一元的に表示するWebアプリケーション「Ariake Events」のバックエンドシステムを構築するものです。

-   **目的**: イベント情報の一元化による利便性向上
-   **コア機能**: 5施設の公式サイトからの日次スクレイピング
-   **最終成果物**: イベント情報を集約した `events.json`

## 2. アーキテクチャ

```mermaid
graph TD
    A[GitHub Actions (cron/手動)] --> B[Scraper (packages/scraper)];
    B --> C[Playwright + Chromium];
    C --> D{各施設公式サイト};
    D --> C;
    C --> B;
    B --> E[Cheerio + 正規化/検証];
    E --> F[events.json (packages/web/public)];
    F --> G[Git commit & push];
    F --> H[Webフロントエンド (packages/web)];
    B --> I[通知メール (Nodemailer, 任意)];
```

## 3. 技術スタック

-   **言語**: TypeScript (Node.js)
-   **フレームワーク/ライブラリ**:
    -   スクレイピング: Playwright + Cheerio
    -   日時処理: Luxon
    -   通知: Nodemailer
    -   環境変数: dotenv
    -   パッケージ管理: pnpm
-   **実行環境**: Node.js
-   **CI/CD**: GitHub Actions

## 4. ディレクトリ構造

```
.
├── .github/
│   ├── workflows/         # GitHub Actions ワークフロー
│   └── docs/              # GitHub Actions 運用ガイド
├── packages/
│   ├── scraper/           # スクレイピング処理のコアロジック
│   │   ├── src/
│   │   │   ├── sources/   # 施設別スクレイパー
│   │   │   ├── lib/       # 共通処理（正規化・検証・通知など）
│   │   │   ├── config.ts  # 出力先・タイムゾーン設定
│   │   │   └── index.ts   # 入口（実行・集約）
│   │   └── docs/          # スクレイピング関連ドキュメント
│   └── web/
│       └── public/
│           └── events.json # スクレイピング結果
├── docs/                  # プロジェクト全体のドキュメント
├── README.md              # プロジェクト概要
└── ...
```

## 5. データフロー

1.  **トリガー**: GitHub Actionsのスケジュール（`cron`）により、毎日定時にワークフローが起動します。
2.  **実行**: ワークフローは、`packages/scraper` 内のスクリプトを実行します。
3.  **収集**: スクリプトは、対象となる5施設の公式サイトにアクセスし、イベント情報をスクレイピングします。
4.  **正規化**: 収集したデータを共通の `Event` 型（`DATA_SCHEMA.md`参照）に正規化します。
5.  **出力**: 全施設のイベント情報を集約し、`events.json` としてリポジトリのルートに出力します。
6.  **コミット**: 変更があった場合、`events.json` をリポジトリにコミット＆プッシュします。
7.  **デプロイ**: （フロントエンド側で）リポジトリの変更をトリガーに、Webサイトが自動的に再デプロイされます。

## 6. 対象施設

| No. | 施設名 | 公式サイトURL | スクレイピング実装ファイル |
| :-- | :--- | :--- | :--- |
| 1 | 有明ガーデン | `https://www.shopping-sumitomo-rd.com/ariake/event/` | `ariakeGarden.ts` |
| 2 | 東京ガーデンシアター | `https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/` | `tokyoGardenTheater.ts` |
| 3 | 有明アリーナ | `https://ariake-arena.tokyo/event/` | `ariakeArena.ts` |
| 4 | TOYOTA ARENA TOKYO | `https://www.toyota-arena-tokyo.jp/events/` | `toyotaArenaTokyo.ts` |
| 5 | 東京ビッグサイト | `https://www.bigsight.jp/visitor/event/` | `tokyoBigSight.ts` |

## 7. 除外した施設

| 施設名 | 除外理由 |
| :--- | :--- |
| 有明コロシアム | 公式サイトに民間イベントが掲載されず、情報の網羅性が極めて低いため。 |
| 豊洲PIT | プロジェクトの対象エリアである「有明」のスコープ外であるため。 |
