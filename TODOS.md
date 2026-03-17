# TODOS

## Phase 1 完了後の最適化

### SSRサイトのHTTP fetch最適化
- **What:** 有明ガーデン・東京ビッグサイト・有明アリーナはPlaywright不要。node-fetch + Cheerioで高速化する
- **Why:** CI実行時間の短縮（2秒wait×ページ数を削減）とPlaywright/Chromium依存の部分的排除
- **Pros:** CIが速くなる、Chromiumインストール不要なサイトが増える、リソース使用量削減
- **Cons:** fetchHtmlの2系統管理が必要、SSR判定が変わるとPlaywrightに戻す必要あり
- **Context:** 現在は全5施設でPlaywright経由。有明ガーデン（`time[datetime]`属性あり）、東京ビッグサイト（`article.lyt-event-01`）、有明アリーナ（WordPress）はサーバーサイドレンダリングでJS実行不要。TOYOTA ARENA TOKYO（Next.js）と東京ガーデンシアター（要検証）のみPlaywright必須
- **Depends on:** Phase 1リビルド完了、CI安定稼働の確認

## Phase 2 準備

### カテゴリ分類の拡充
- **What:** 現在のmusic/sports/exhibition/otherの4分類を、kids/food/fashion等に細分化
- **Why:** フェーズ2のWebフロントエンドでフィルタリングUIの精度を上げる
- **Pros:** ユーザーが目的のイベントを見つけやすくなる
- **Cons:** 分類ロジックの複雑化、既存events.jsonとの互換性（マイグレーション不要だがUI側の対応必要）
- **Context:** 有明ガーデンは`data-eventlabel`属性（kids, food, exhibition等）を持っている。他施設はタイトルベースのキーワードマッチのみ。施設間で分類精度に差が出る
- **Depends on:** Phase 1完了、Phase 2 UI設計

## Phase 3 基盤

### congestionRisk / estimatedAttendees 推定ロジック
- **What:** 現在は常にnull。施設キャパシティとイベント種別から粗推定するロジックを実装
- **Why:** フェーズ3（パーソナライズ）の混雑予測機能の基盤データ
- **Pros:** 混雑回避のレコメンデーションが可能になる
- **Cons:** 推定精度が低いとミスリーディング。キャパシティデータの取得・メンテが必要
- **Context:** 有明アリーナ（最大15,000人）、TOYOTA ARENA TOKYO（最大10,000人）、東京ビッグサイト（展示面積による）など、施設ごとのキャパは公開情報。イベント種別（コンサート vs 展示会）で来場者パターンが異なる
- **Depends on:** Phase 1完了、施設キャパシティデータの収集
