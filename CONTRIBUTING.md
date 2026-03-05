# 開発・引き継ぎガイド

## 1. プロジェクト概要

本ドキュメントは、新しい開発者（人間・AIを問わず）がこのプロジェクトを引き継ぐ際に必要な情報をまとめたものです。

## 2. プロジェクトの現状（2026年3月時点）

| フェーズ | 内容 | 状態 |
|:---|:---|:---|
| フェーズ1 | データ収集基盤（スクレイパー + GitHub Actions） | **完了** |
| フェーズ2 | Webフロントエンドの実装 | **未着手** |
| フェーズ3 | パーソナライズ機能・高度な混雑予測 | 計画中 |

### 完了済みの実装

- 5施設のスクレイパー（TypeScript + Playwright + Cheerio）
- GitHub Actionsによる毎日 JST 02:00 の自動実行
- `events.json` の自動コミット
- エラー時・週次のメール通知（任意）

### 未実装の機能

- Webフロントエンド（`packages/web` は現時点でデータファイルのみ）
- テストコード
- 混雑リスクの自動算出ロジック（現状は手動入力）

## 3. リポジトリ構成

```
.
├── .github/
│   ├── workflows/
│   │   └── scraper.yml          # GitHub Actions ワークフロー
│   └── docs/
│       └── GITHUB_ACTIONS_GUIDE.md  # 運用ガイド
├── packages/
│   ├── scraper/                 # スクレイパー（コア機能）
│   │   ├── src/
│   │   │   ├── sources/         # 施設別スクレイパー（5ファイル）
│   │   │   ├── lib/             # 共通処理（正規化・検証・通知など）
│   │   │   ├── config.ts        # 出力先・タイムゾーン設定
│   │   │   ├── index.ts         # エントリーポイント
│   │   │   └── types.ts         # 型定義
│   │   ├── docs/
│   │   │   ├── SCRAPING_GUIDE.md  # 施設別スクレイピング詳細
│   │   │   └── DATA_SCHEMA.md     # events.json のスキーマ定義
│   │   ├── .env.example         # 環境変数テンプレート
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                     # Webフロントエンド（未実装）
│       ├── public/
│       │   └── events.json      # スクレイピング結果（自動更新）
│       └── package.json
├── docs/
│   ├── TECHNICAL_SPEC.md        # 技術仕様書
│   ├── SETUP.md                 # 開発環境セットアップ
│   └── TROUBLESHOOTING.md       # トラブルシューティング
├── .gitignore
├── LICENSE
├── README.md
├── CONTRIBUTING.md              # このファイル
├── package.json                 # ルート（pnpm workspace設定）
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## 4. 次のステップ（フェーズ2）

Webフロントエンドを実装する際は、以下の要件を参照してください。

### フロントエンド要件（優先度順）

| 機能ID | 機能名 | 詳細 |
|:---|:---|:---|
| FE-01 | 今日の混雑予報 | 時間帯別（朝・昼・夜）の混雑レベルとコメントを表示 |
| FE-02 | イベント表示形式 | リスト・テーブル・カレンダー・マップの4形式を切り替え可能 |
| FE-03 | 検索・フィルター | キーワード・施設・カテゴリ・月・混雑リスクで絞り込み |
| FE-04 | イベント詳細情報 | イベント名、施設、カテゴリ、開催期間、混雑リスクなどを表示 |
| FE-05 | 過去イベント閲覧 | 過去のイベント情報を別ページまたはアコーディオン形式で閲覧 |

### 混雑リスクの表示定義

`events.json` の `congestionRisk` フィールドの値に応じて、以下の通り表示します。

| 値 | 表示ラベル | 意味 |
|:---|:---|:---|
| 5 | CRITICAL | 極めて高い（コミケ規模、有明アリーナ満員など） |
| 4 | HIGH | 高い（東京ガーデンシアター満員レベル） |
| 3 | MODERATE | 中程度 |
| 2 | LOW | 低い |
| 1 | MINIMAL | 極めて低い |

## 5. GitHub Secrets の設定

メール通知を有効にする場合は、以下のシークレットを設定してください。

`Settings` → `Secrets and variables` → `Actions` から設定します。

| シークレット名 | 説明 |
|:---|:---|
| `GMAIL_USER` | 通知送信元のGmailアドレス |
| `GMAIL_APP_PASSWORD` | Gmailのアプリパスワード |
| `NOTIFICATION_TO` | 通知送信先のメールアドレス |

未設定の場合、スクレイパーは正常に動作しますが、通知メールはスキップされます。

## 6. 関連ドキュメント（Google Drive）

プロジェクトの詳細な経緯や意思決定の記録は、Google Driveの `Ariake Events` フォルダに保存されています。

| ドキュメント名 | 内容 |
|:---|:---|
| `Ariake_Events_プロジェクト管理マスター.md` | プロジェクトの現状・URL・更新履歴 |
| `Ariake_Events_Future_Roadmap.md` | フェーズ3以降の機能提案とマネタイズ戦略 |
| `調査レポート/final_analysis.md` | 施設調査の詳細レポート |
