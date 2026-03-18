# CLAUDE.md — ariake-events

有明エリア5施設のイベント情報を自動収集し、混雑度スコアを付与してWebサイトに公開するプロジェクト。

---

## プロジェクト概要

- **目的**: 有明エリアのイベント情報と混雑度を可視化する
- **対象施設**: 有明ガーデン、東京ガーデンシアター、有明アリーナ、TOYOTA ARENA TOKYO、東京ビッグサイト
- **実行**: GitHub Actions日次cron（UTC 00:00 / JST 09:00）
- **出力**: `packages/web/public/events.json`（congestionRiskフィールド付き）
- **公開URL**: https://kannohi1.github.io/ariake-events

## 技術スタック

- TypeScript + Node.js 22（tsx直接実行、ビルド不要）
- Playwright（ブラウザ自動化）+ Cheerio（HTML解析）
- Vitest（テスト）
- pnpm モノレポ（packages/scraper, packages/web）
- GitHub Actions

## アーキテクチャ

- `ScrapeContext` DI パターン: `fetchHtml` を注入、テスト時はモック可能
- 各施設ごとに独立した `FacilityScraper` を実装
- オーケストレーター: 120秒タイムアウト、部分失敗許容（全施設ゼロの時のみ exit 1）
- HTMLフィクスチャベースのTDD

## コマンド

```bash
pnpm --filter scraper test              # スクレイパーテスト実行
pnpm --filter scraper start             # スクレイパー実行（要Playwright）
pnpm --filter scraper update-fixtures   # HTMLフィクスチャ更新（セレクタ変更検知用）
pnpm --filter web test                  # WebテストUIT実行
pnpm --filter web dev                   # Web開発サーバー起動
```

## 実装ルール

- 5ファイル超の変更や独立タスクが複数ある場合、GPT-Codexを呼び出すSkills（subagent-driven-development, dispatching-parallel-agents等）を常に意識し、積極的に活用すること

## セッション開始時

1. **`PROGRESS.md` を読む**（現在地・次のアクション・未解決問題を把握）
2. **`docs/ROADMAP.md` を読む**（必要なら）
3. このファイルを最新状態に確認する
4. 作業内容を1〜2行でサマリしてから開始

---

## UI デザインルール

Web UI を生成・修正するときのみ参照: `docs/design/melta-ui.md`

---
最終更新: 2026-03-19
