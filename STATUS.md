# STATUS.md — ariake-events

## 現在地

**2026-05-25: マネタイズ戦略にピボット。Phase 10〜14 を新規策定。「役に立つと言える」のゴールを「収益が発生している状態」に再定義。**
- 集客 (X自動告知) → 計測 (GA4) → 換金 (アフィ) → 品質向上 (混雑度チューニング/マップ) のファネル設計確定
- X自動告知は MLB プロジェクトの設計流用、Free tier 無料運用予定 (推定 120〜320投稿/月、上限1500/月の 1/5〜1/12)
- 構成方針: モノレポ拡張 `packages/x-poster/` (npm `twitter-api-v2` 使用)
- 詳細設計書: `docs/X_POSTER_DESIGN.md` / HK本人作業手順: `docs/X_API_SETUP_GUIDE.md`

最新リモート同期: 2026-05-24 23:27 JST — origin/main = HEAD (ahead 0 / behind 0)

## 次にやること

1. **Phase 11 M1 (HK本人作業)** — 新規X アカウント `@ariake_events` 作成 + Developer Portal で Free tier API キー発行。手順は `docs/X_API_SETUP_GUIDE.md` 参照
2. **Phase 12 M1 (HK本人作業)** — バリューコマース等経由でぴあ/e+/ローチケ のアフィリエイトプログラム加入申請 (Phase 11 と並行可)
3. **Phase 10 M1 (Claude/Codex)** — 計測ツール選定 (GA4 vs Vercel Analytics vs Plausible) → 推奨案提示
4. **Phase 11 M2-M3 (Codex委譲)** — HK が API キー入手後、`packages/x-poster/` 雛形実装開始 (`docs/X_POSTER_DESIGN.md` 参照)
5. **LINE OGキャッシュ更新確認** — 旧タスク。数時間後にLINEで再シェアして新サムネが反映されてるか確認 [Claude]

## 未解決・保留

| 項目 | 状態 | メモ |
|---|---|---|
| TOYOTA ARENA TOKYOフィクスチャが月ボタン押下後を再現できない | 既知の制約（確定） | テスト設計上の限界。修正不要 |
| ZAIKO チケット検索リンク | 除外（確定） | Vue SPA で URL params 非対応 |
| 楽天チケット検索リンク | 除外（確定） | 在庫小・アリーナ規模公演ほぼ未登録（DIR EN GREY/MAZZEL/桑田佳祐/乃木坂46 全0件） [Claude] |
| ぴあDB 全角表記問題 | 未解決（許容） | 例: TM NETWORK は ぴあDBでは「ＴＭＮＥＴＷＯＲＫ」（全角スペース無し）。半角検索で当たらない |
| 桑田佳祐 LIVE TOUR 2026 等の販売前公演 | 仕様 | クエリ整形では解決不可。プラットフォーム側DB登録待ち |

## 判断済みの決定

| 決定 | 理由 | 日付 |
|---|---|---|
| マネタイズ戦略導入: Phase 10〜14 新設 | 「機能拡張だけでは『誰の役に立つ』を証明できない」HK判断。収益発生を最も嘘がつけない指標として再定義 | 2026-05-25 [Claude] |
| X 自動告知: モノレポ `packages/x-poster/` で追加 | CI/データ受け渡し/Secrets を既存と統合。別リポは管理コスト2倍で利点なし | 2026-05-25 [Claude] |
| X API は Free tier ($0) で運用 | 推定120〜320投稿/月 vs 上限1500/月。有料化検討するほど成長したら収益で賄える | 2026-05-25 [Claude] |
| X 告知パターン: 引用RT スレッド | 検出/1週間前/前日/当日の4段階、引用RTで元投稿カード埋込+新メッセージ追加。リーチ最大化 | 2026-05-25 [Claude] |
| 計測ツールは Phase 10 M1 で再選定 | GA4 / Vercel Analytics / Plausible の比較は実装前に確定する | 2026-05-25 [Claude] |
| OG画像: Big Sight 写真ベース | エリア最強アイコン（コミケ等で国際知名度）・写真完成度高・他施設はOG向きでない。チケットバッジは折り返しダサさのため削除 | 2026-05-24 [Claude] |
| 楽天削除（4→3社モーダル） | 実検証で楽天在庫が極めて小さくarikaのアリーナ規模イベントとマッチしない。ZAIKO同様の判断 | 2026-05-24 [Claude] |
| 楽天URL は `?s=&q=` 形式必須 | `?q=` 単独だとホームページ表示で検索走らない（Playwrightで実機検証） | 2026-05-24 [Claude] |
| Phase 9 (B案) を候補・未着手で正式化 | A案のヒット率が実用で1〜2割。直行リンク化が必要だが詳細ページ確認スパイク必須 | 2026-05-24 |
| commit & push は自動化 | HK指示「コミットプッシュは言われなくてもやってくれ」。memory `feedback_autonomous_commit.md` に保存 | 2026-05-24 |
| buildSearchQuery ロジック: 重複除去+括弧切り捨て+ツアーマーカー切り捨て+×正規化+施設名付与 | 実検証データに基づく。DIR EN GREYヒット成功例で施設名付与が有効と確認 | 2026-05-24 |
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
- **チケット検索のヒット率はクエリ整形ではなくプラットフォームDB登録状況に依存**: クエリを完璧にしても「販売開始前」「他プラットフォーム独占」公演は 0件のまま。改善余地はB案（直接URL取得）のみ
- **PowerShell `git pull --rebase` のブロッカー**: `tsconfig.tsbuildinfo` 等 auto-generated ファイルが unstaged だと rebase が失敗する。`git stash push <file>` → rebase → push → `git stash pop` で回避
- **shell escape での inline regex 検証は信用するな**: `node -e` への bash heredoc で `\\\\s` などのエスケープが多重崩壊する。Vitest テスト結果のほうが正
- **OG画像は日本語フォント込みで生成すること**: 過去 ogp.png が「□□□□」豆腐化していた。HTML+Playwright+Noto Sans JP で生成すれば確実 [Claude]
- **`file://` プロトコルは Playwright MCP でブロック**: ローカル HTML 表示は Python `http.server` 経由で `http://localhost:{port}/` でアクセス [Claude]

## 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-05-25 | マネタイズ戦略ピボット。Phase 10〜14 (計測/X告知/アフィ/混雑度チューニング/マップ) を ROADMAP に追記。`docs/X_POSTER_DESIGN.md` と `docs/X_API_SETUP_GUIDE.md` を新規作成 [Claude] |
| 2026-05-24 | OG画像差し替え（Big Sight写真ベース・1200x630）push 済 (`21de7c1`)、scripts/og-template.html で再生成可能に [Claude] |
| 2026-05-24 | 楽天URL修正→在庫小のため楽天除外で3社化、Phase 9 (B案) 候補化・永続化 [Claude] |
| 2026-05-24 | Phase 8 M5/M6 リリース + Phase 9 (B案) 候補化・永続化。buildSearchQuery 強化（重複除去+括弧+ツアーマーカー+×正規化）、 196 PASS。実検証で4社並列の有効性確認 [Claude] |
| 2026-05-24 | Phase 8 M5・M6 完了（交通マップA案、チケット導線4社、混雑バー削除）、test 179/179 PASS [Claude] |
| 2026-04-08 | 交通マップ機能A案実装（MapView/stops/coords/トグルUI）、テスト165PASS、目視確認待ち [Claude] |
| 2026-04-07 | UI不具合2件修正（カード文字潰れ・今日ラベル/ボタン分離）、agent-browser調査→断念、sortEvents完了、交通ページ全面刷新 [Claude] |
| 2026-04-06 | Airbnb全面リデザイン完了（push: 5269a89） [Claude] |
| 2026-04-05 | Phase 8 M7-M8: FilterBar Popover・CalendarView 2カラム・月曜始まり [Claude] |
| 2026-04-04 | Phase 8 M5-M6: EventCard画像改善・Blurred Backdrop [Claude] |
| 2026-04-03 | Phase 8 M1-M4: FilterBar Bottom Sheet・Masonry・UI Polish・交通リデザイン [Claude] |
| 2026-03-30 | Phase 7 M1-M3: ビュー切替・月リスト・実画像 [Claude] |
