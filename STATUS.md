# STATUS.md — ariake-events

## 現在地

**2026-06-04: EventCard Pinterest 風 revert PR 作成中 → マージ・デプロイ待ち**
- PR #6 (`201c489` Pinterest 風) を `git revert` → branch `revert/pr-6-pinterest-cards` 作成、ローカル 197/197 PASS 確認
- 次は GitHub に push → PR 作成 → CI 通過確認 → マージで Cloudflare Pages 自動デプロイ → HK 本番目視確認
- Cloudflare Pages 移行は完了済 (`https://ariake-events.pages.dev/` 稼働中)、旧 GitHub Pages は並走中 (Disable 未実施)
- X アカウント `@ariake_events` セットアップ完了 (プロフィール画像/ヘッダー画像/bio・Location 入力済)

最新リモート同期: 2026-06-04 01:11 JST — branch `revert/pr-6-pinterest-cards` (ローカル、未 push)

## 次にやること

1. **revert PR をマージ & 本番反映確認** — push → PR 作成 → CI 通過 → `gh pr merge --merge` → 1〜2 分で `https://ariake-events.pages.dev/` に反映。HK が強制リロード (Ctrl+Shift+R) で目視確認 [Claude/HK]
2. **GitHub Pages 廃止** — Settings → Pages → Disabled に変更 (HK 本人作業)
3. **X プロフィール Website 欄に新 URL 入力** — `https://ariake-events.pages.dev` (HK 本人作業)
4. **ドキュメント URL 一括置換** — README/CLAUDE.md/docs/* の `kannohi1.github.io/ariake-events` → `ariake-events.pages.dev` (別 PR) [Claude]
5. **Phase 11 M1 (HK本人作業)** — X Developer Portal で Free tier API キー発行 (`docs/X_API_SETUP_GUIDE.md`)
6. **Phase 12 M1 (HK本人作業)** — バリューコマース等経由でぴあ/e+/ローチケ アフィリエイト加入申請
7. **Phase 10 M1 (Claude/Codex)** — 計測ツール選定 (GA4 / Vercel Analytics / Plausible)
8. **LINE OGキャッシュ更新確認** — 数時間後にLINEで再シェアして新サムネが反映されてるか確認 [Claude]

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
| EventCard Pinterest 風 (PR #6) を revert | ariake-events は順序依存 (sortEvents.ts) + 情報主体 (バッジ/タイトル/混雑度/チケット) のため Pinterest と不適合。CSS columns 移行も既に Grid のため不要、画像 max-width も aspect-video で対応済 → 単純 revert で完結 | 2026-06-04 [Claude] |
| Cloudflare Pages 採用 (GitHub Pages 廃止) | 商用利用 OK・無料・帯域無制限・Next.js 静的エクスポート互換・URL から個人名 kannohi1 排除 | 2026-06-03 [Claude] |
| Vercel Hobby 不採用 | 規約上「個人利用のみ・商用 NG」、Phase 12 アフィリエイト導入と非整合 | 2026-06-03 [Claude] |
| wrangler-action@v3 不採用、npx wrangler 直接呼出 | wrangler-action は内部で `pnpm add wrangler` を実行し pnpm workspace ルートで失敗 (ERR_PNPM_ADDING_TO_ROOT)。npx は workspace 制約を回避 | 2026-06-03 [Claude] |
| `pages project create` 明示ステップを deploy.yml に追加 | wrangler 4.x は初回 deploy 時に project auto-create を廃止 ("Project not found [code: 8000007]")。`|| true` で再実行時の重複エラーをスキップ | 2026-06-03 [Claude] |
| Codex hang 時は Claude 直接 Edit で代行 (例外発動) | gpt-5.5 high で stdout 0 バイト 10 分以上 hang → 単純文字列置換のために再起動・stderr 復活する ROI が悪い。HK 明示指示で例外として Claude 代行 | 2026-06-03 [Claude] |
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

- **wrangler-action@v3 は pnpm workspace ルートで動かない**: 内部で `pnpm add wrangler` を実行するが `-w` フラグ無しでエラー終了 (ERR_PNPM_ADDING_TO_ROOT)。回避: `npx -y wrangler@latest pages deploy` 直接呼出 + 環境変数で認証 [Claude]
- **wrangler 4.x はプロジェクト auto-create を廃止**: 初回 deploy 時に「Project not found [code: 8000007]」。事前に `wrangler pages project create <name> --production-branch=main || true` を実行する必要あり [Claude]
- **Cloudflare Pages の GitHub Integration UI がループバグ**: 「Connect GitHub」→ 承認 → Cloudflare に戻ると未連携状態に戻り、無限ループに陥る。回避: UI 連携諦めて GitHub Actions + wrangler CLI 方式に切替 [Claude]
- **Codex CLI が stderr 抑止 (2>/dev/null) で hang し原因不明化**: gpt-5.5 high が thinking phase で stuck、stdout 0 バイトのまま 10 分以上停止、プロセスが11個爆発。stderr 抑止のためエラー原因が見えない。対処: 単純タスクは Claude 直接 Edit、複雑タスクは stderr 復活させて再試行 [Claude]
- **`taskkill /F /IM <name>.exe` を Git Bash から実行するとパス変換エラー**: MSYS が `/F` を `F:/` と誤解釈する。回避: `MSYS_NO_PATHCONV=1 taskkill /F /IM ...` で実行 [Claude]
- **`gh pr merge` 後の sleep 確認は最低 5 秒以上**: マージ反映に時間がかかり、即時 `gh run list` だと旧 run が見える。`sleep 5` 程度後でないと正確に検出できない [Claude]
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
| 2026-06-04 | PR #6 (`201c489` Pinterest 風 EventCard) を `git revert` 実行、branch `revert/pr-6-pinterest-cards` 作成、ローカル `pnpm --filter web test` 197/197 PASS 確認。次は push → PR 作成 → マージ [Claude] |
| 2026-06-04 | EventCard Pinterest 風 (PR #6, `201c489`) を revert 方針確定。プランファイル `~/.claude/plans/sunny-churning-wilkes.md` 更新 (Cloudflare 移行プラン上書き)、新セッションで実行へ引継ぎ [Claude] |
| 2026-06-03 | Cloudflare Pages 移行完了 (PR #1/#2/#3 マージ)、`ariake-events.pages.dev` 本番稼働。X アカウント `@ariake_events` セットアップ完了 (プロフィール画像 / ヘッダー画像 / bio / Location)。EventCard 高さ制限 PR #4/5 + Pinterest 風 PR #6 試行で PC 画像巨大化が判明、revert 方針へ [Claude] |
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
