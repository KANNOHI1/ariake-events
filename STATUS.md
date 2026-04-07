# STATUS.md — ariake-events

## 現在地

**2026-04-07: 交通ページ全面刷新 完了 — push済み（b00d1f8）**
- タブUI（鉄道/BRT/バス）導入、横スクロール廃止
- 土曜ダイヤ対応（getDayType: weekday/saturday/holiday 3分岐）
- バス停3件追加（有明小中学校前・有明二丁目・都橋住宅前、計8路線）
- テスト: scraper 82/82 + web 157/157 = 239 PASS

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
| 2026-04-07 | agent-browser調査→断念、sortEvents完了、未解決問題整理、交通ページ全面刷新（タブUI・土曜ダイヤ・バス停3件追加） |
| 2026-04-06 | Airbnb全面リデザイン完了（push: 5269a89） |
| 2026-04-05 | Phase 8 M7-M8: FilterBar Popover・CalendarView 2カラム・月曜始まり |
| 2026-04-04 | Phase 8 M5-M6: EventCard画像改善・Blurred Backdrop |
| 2026-04-03 | Phase 8 M1-M4: FilterBar Bottom Sheet・Masonry・UI Polish・交通リデザイン |
| 2026-03-30 | Phase 7 M1-M3: ビュー切替・月リスト・実画像 |
