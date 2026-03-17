# TODOS

## Phase 1 完了後の最適化

### SSRサイトのHTTP fetch最適化
- **What:** 有明ガーデン・東京ビッグサイト・有明アリーナはPlaywright不要。node-fetch + Cheerioで高速化する
- **Why:** CI実行時間の短縮（2秒wait×ページ数を削減）とPlaywright/Chromium依存の部分的排除
- **Pros:** CIが速くなる、Chromiumインストール不要なサイトが増える、リソース使用量削減
- **Cons:** fetchHtmlの2系統管理が必要、SSR判定が変わるとPlaywrightに戻す必要あり
- **Context:** 現在は全5施設でPlaywright経由。有明ガーデン（`time[datetime]`属性あり）、東京ビッグサイト（`article.lyt-event-01`）、有明アリーナ（WordPress）はサーバーサイドレンダリングでJS実行不要。TOYOTA ARENA TOKYO（Next.js）と東京ガーデンシアター（要検証）のみPlaywright必須
- **Depends on:** Phase 1リビルド完了、CI安定稼働の確認

### TOYOTA ARENA TOKYO 月ナビのデバッグ
- **What:** 月切り替えボタンのPlaywrightクリックが動いていない（0 future month buttons found）。当月分14件のみ取得中
- **Why:** Next.jsのReactハイドレーション後のDOM構造が`page.evaluate`内の検索パターンと不一致の可能性
- **Pros:** 修正すれば14件→数十件に増加する見込み
- **Cons:** ライブサイトのDOM構造変更に依存するためメンテコスト
- **Context:** SSR HTMLには月ボタンが含まれず、クライアントサイドでのみレンダリングされる。3秒waitでは不十分か、ボタンのテキスト形式が`/\d{4}年/`にマッチしない可能性。CIログに`page.content()`のスニペットを出力するデバッグモードを入れて調査が必要
- **Depends on:** なし（独立タスク）

## Phase 2 準備

### カテゴリ分類の拡充
- **What:** 現在のmusic/sports/exhibition/otherの4分類を、kids/food/fashion等に細分化
- **Why:** フェーズ2のWebフロントエンドでフィルタリングUIの精度を上げる
- **Pros:** ユーザーが目的のイベントを見つけやすくなる
- **Cons:** 分類ロジックの複雑化、既存events.jsonとの互換性（マイグレーション不要だがUI側の対応必要）
- **Context:** 有明ガーデンは`data-eventlabel`属性（kids, food, exhibition等）を持っている。他施設はタイトルベースのキーワードマッチのみ。施設間で分類精度に差が出る
- **Depends on:** Phase 1完了、Phase 2 UI設計

### 過去の混雑度データの蓄積
- **What:** 日次cronで収集したイベントデータから混雑度を推定し、日別の混雑度スコアを蓄積する仕組みを作る
- **Why:** 「去年のコミケ時期はどうだった？」のような年次比較ができるようになる。過去のイベント情報自体は不要だが、混雑度の推移は有用
- **Pros:** 前年同時期比較で混雑予測の精度が向上、季節パターンの学習が可能
- **Cons:** 蓄積先のストレージ設計が必要（JSON? DB?）、推定ロジックが先に必要
- **Context:** 現在events.jsonは最新スナップショットのみ上書き。過去データは自然蓄積されない。congestionRisk推定ロジック実装後に、日別集計+蓄積の仕組みを追加する
- **Depends on:** congestionRisk推定ロジックの実装

## Phase 3 基盤

### congestionRisk / estimatedAttendees 推定ロジック
- **What:** 現在は常にnull。施設キャパシティとイベント種別から粗推定するロジックを実装
- **Why:** フェーズ3（パーソナライズ）の混雑予測機能の基盤データ
- **Pros:** 混雑回避のレコメンデーションが可能になる
- **Cons:** 推定精度が低いとミスリーディング。キャパシティデータの取得・メンテが必要
- **Context:** 有明アリーナ（最大15,000人）、TOYOTA ARENA TOKYO（最大10,000人）、東京ビッグサイト（展示面積による）など、施設ごとのキャパは公開情報。イベント種別（コンサート vs 展示会）で来場者パターンが異なる
- **Depends on:** Phase 1完了、施設キャパシティデータの収集
