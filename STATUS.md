# STATUS.md — ariake-events

## 現在地

**2026-04-07: UI不具合2件修正 完了 — push済み（51e7f7d）**
- EventCard: `h-28` → `min-h-28`（バッジ折り返し時の文字潰れ解消）
- DayView: 今日=spanラベル、今日以外=「↩ 今日に戻る」ボタンに分離
- テスト: web 157/157 PASS

## 次にやること

1. **混雑度チューニング** — 現行アルゴリズムの精度検証
2. **混雑度マップ可視化** — 設計・検討フェーズ
3. **交通ページ追加改善**（あれば） — 地図・停留所位置の視覚化

## 未解決・保留

| 項目 | 状態 | メモ |
|---|---|---|
| TOYOTA ARENA TOKYOフィクスチャが月ボタン押下後を再現できない | 既知の制約（確定） | テスト設計上の限界。修正不要 |

## 判断済みの決定

| 決定 | 理由 | 日付 |
|---|---|---|
| agent-browser 導入断念・Playwright継続 | HTML非返却＋Windows既知バグ | 2026-04-07 |
| sortEvents: 4日以上開催にペナルティ+10 | 長期展示イベントを短期コンサートより下に | 2026-04-07 |
| getDurationDays に Date.UTC 使用 | Windows/UTC環境でのタイムゾーン安全性 | 2026-04-07 |

## ハマりパターン

- **agent-browser系ライブラリ**: HTML非返却のものが多い。スクレイパー置き換え前に API の返却値形式を必ず確認する

## 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-04-07 | UI不具合2件修正（カード文字潰れ・今日ラベル/ボタン分離）、agent-browser調査→断念、sortEvents完了、交通ページ全面刷新 |
| 2026-04-06 | Airbnb全面リデザイン完了（push: 5269a89） |
| 2026-04-05 | Phase 8 M7-M8: FilterBar Popover・CalendarView 2カラム・月曜始まり |
| 2026-04-04 | Phase 8 M5-M6: EventCard画像改善・Blurred Backdrop |
| 2026-04-03 | Phase 8 M1-M4: FilterBar Bottom Sheet・Masonry・UI Polish・交通リデザイン |
| 2026-03-30 | Phase 7 M1-M3: ビュー切替・月リスト・実画像 |
