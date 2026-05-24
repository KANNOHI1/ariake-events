# STATUS.md — ariake-events

## 現在地

**2026-05-24: Phase 8 M5（交通マップ）+ M6（チケット導線+混雑バー削除）完了・push 直前**
- MapView.tsx 新規（Leaflet + react-leaflet、CircleMarker、フィルター）
- TransportView.tsx: 時刻表/マップ切替トグル + RouteCard 停留所展開
- TicketModal.tsx 新規（4社: ぴあ/ローチケ/e+/楽天、ESC/×/外側クリックで close）
- EventCard.tsx: music/sports/anime のみチケットボタン表示、混雑度プログレスバー削除
- テスト: web 179/179 PASS、Next.js build 成功

最新リモート同期: 2026-05-24 15:30 JST — origin/main = HEAD ahead 0 / behind 0（push 前）

## 次にやること

1. **コミット & push** — 2コミット（M5 + M6）に分けて push、本番デプロイ確認
2. **混雑度チューニング** — 現行アルゴリズムの精度検証
3. **混雑度マップ可視化** — 設計・検討フェーズ
4. **チケット導線: B案（スクレイパー拡張）検討** — Phase 9 候補として正式化。詳細プラン: `docs/ROADMAP.md` Phase 9 / `memory/project_phase9_ticket_b_scraper.md` / `~/.claude/plans/ok-b-foamy-cookie.md`。実装前に M1 スパイク（各施設詳細ページの販売元リンク確認）必須

## 未解決・保留

| 項目 | 状態 | メモ |
|---|---|---|
| TOYOTA ARENA TOKYOフィクスチャが月ボタン押下後を再現できない | 既知の制約（確定） | テスト設計上の限界。修正不要 |
| ZAIKO チケット検索リンク | 除外（確定） | Vue SPA で URL params 非対応のため検索URLが作れない |

## 判断済みの決定

| 決定 | 理由 | 日付 |
|---|---|---|
| チケット導線: A案（4社の検索URL直リン）採用 | スクレイパー変更ゼロで全カテゴリ即適用、HK の「5社試す」方針 | 2026-05-24 |
| ZAIKO は除外（5社→4社） | Vue SPA で keyword URL 非対応、再入力させる体験はダスい | 2026-05-24 |
| 混雑度プログレスバー削除 | 画像右上のバッジと情報が重複、カード下部を静かにしてチケットボタンを目立たせる | 2026-05-24 |
| 対象カテゴリは music/sports/anime のみ | food/exhibition にチケット導線は不適切 | 2026-05-24 |
| 交通マップUI: A案（時刻表/マップ切替トグル）採用 | HTMLプロトタイプ3案比較後ユーザーが選択 | 2026-04-08 |
| Leaflet + OpenStreetMap 採用 | APIキー不要・無料・react-leaflet対応 | 2026-04-08 |
| agent-browser 導入断念・Playwright継続 | HTML非返却＋Windows既知バグ | 2026-04-07 |
| sortEvents: 4日以上開催にペナルティ+10 | 長期展示イベントを短期コンサートより下に | 2026-04-07 |
| getDurationDays に Date.UTC 使用 | Windows/UTC環境でのタイムゾーン安全性 | 2026-04-07 |

## ハマりパターン

- **agent-browser系ライブラリ**: HTML非返却のものが多い。スクレイパー置き換え前に API の返却値形式を必ず確認する
- **検索URLは推測せず実機検証**: WebFetch では JS レンダ系サイトのフォーム構造が読めない。Playwright で実際に検索を実行して URL を観察するのが確実

## 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-05-24 | Phase 8 M5・M6 完了（交通マップA案、チケット導線4社、混雑バー削除）、test 179/179 PASS [Claude] |
| 2026-04-08 | 交通マップ機能A案実装（MapView/stops/coords/トグルUI）、テスト165PASS、目視確認待ち [Claude] |
| 2026-04-07 | UI不具合2件修正（カード文字潰れ・今日ラベル/ボタン分離）、agent-browser調査→断念、sortEvents完了、交通ページ全面刷新 [Claude] |
| 2026-04-06 | Airbnb全面リデザイン完了（push: 5269a89） [Claude] |
| 2026-04-05 | Phase 8 M7-M8: FilterBar Popover・CalendarView 2カラム・月曜始まり [Claude] |
| 2026-04-04 | Phase 8 M5-M6: EventCard画像改善・Blurred Backdrop [Claude] |
| 2026-04-03 | Phase 8 M1-M4: FilterBar Bottom Sheet・Masonry・UI Polish・交通リデザイン [Claude] |
| 2026-03-30 | Phase 7 M1-M3: ビュー切替・月リスト・実画像 [Claude] |
