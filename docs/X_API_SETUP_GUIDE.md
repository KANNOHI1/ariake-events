# X API キー取得手順書 (HK 本人作業)

このドキュメントは ariake-events プロジェクトの自動投稿ボット (`packages/x-poster/`) で使う X API キーを HK 本人が取得するための手順書。**Claude/Codex はこの作業を代行できない** (本人確認・電話番号認証が必要なため)。

所要時間: **30〜60分** (アカウント作成 + Developer Portal 申請 + 1Password 登録)

---

## ステップ1: 新規 X アカウント作成

### 1-1. ブラウザで新規アカウント登録

1. プライベートブラウジング (シークレットウィンドウ) で https://x.com にアクセス
   - 既存の HK 個人アカウントと混ざらないようにするため
2. 「アカウント作成」をクリック
3. 推奨アカウント名:
   - **第一候補**: `@ariake_events`
   - **第二候補**: `@ariake_event` `@arikabu` `@ariake_now` 等 (空いてるもの)
4. メールアドレス: HK の Gmail エイリアス推奨 (例: `c63410+ariake@gmail.com`)
   - これだけで Gmail 受信箱は同じで、X からのメールだけ分離フィルタ可能
5. 電話番号認証: HK の携帯番号で OK (1番号で複数 X アカウント可)

### 1-2. プロフィール設定 (最低限)

- **アイコン**: `packages/web/public/og-image.png` (Big Sight 写真) を使うか、新規で作成
- **bio**: 例
  ```
  有明エリア5施設のイベント情報と混雑度を毎日お届け。
  公式サイト: https://kannohi1.github.io/ariake-events
  ※ 自動投稿botです
  ```
- **ヘッダー画像**: 任意 (Phase 11 後半で OG画像を自動流用予定)

---

## ステップ2: Developer Portal で API アクセス申請

### 2-1. Developer アカウント作成

1. 上で作った新規アカウントで X にログインした状態で https://developer.x.com にアクセス
2. 「Sign up」→ Free tier を選択
3. 利用目的アンケート (英語):
   - **Question**: "What's your primary reason for using X API?"
   - **Answer 例 (コピペ可)**:
     ```
     Building a public-good information bot that posts daily event schedules
     for the Ariake area in Tokyo (concert halls, exhibition centers, sports
     arenas). The bot announces upcoming events and predicted congestion
     levels to help residents and visitors plan their visits. Source data
     comes from each venue's official website (publicly available event
     listings). No replies, no DMs, no data collection from other users —
     write-only operation.
     ```
4. 規約同意 → アカウント承認 (通常即時、まれに数時間)

### 2-2. App 作成

1. Developer Portal 内 https://developer.x.com/en/portal/dashboard
2. 「Projects & Apps」→「+ Add App」または「Create App」
3. App 名: `ariake-events-bot` (任意)
4. 作成完了画面で **API Key / API Secret** が一度だけ表示される → **すぐコピー** (再表示不可)

### 2-3. アプリ権限を Read+Write に変更 (重要)

デフォルトは Read-only。投稿するには Write 権限が必要。

1. App 詳細画面 → 「User authentication settings」→「Set up」
2. **App permissions**: `Read and write` を選択
3. **Type of App**: `Web App, Automated App or Bot` を選択
4. **Callback URI**: 適当に `https://kannohi1.github.io/ariake-events` を入力 (使わないが必須項目)
5. **Website URL**: `https://kannohi1.github.io/ariake-events`
6. Save

### 2-4. Access Token / Secret を発行

1. App 詳細画面 → 「Keys and tokens」タブ
2. 「Access Token and Secret」→ Generate
3. **Access Token / Access Token Secret** が一度だけ表示 → **すぐコピー**

⚠️ **必ず Read+Write 権限変更を先にやってから Access Token を発行すること**。順序を逆にすると Read-only の Token になり投稿できない (やり直しは Regenerate で可能)。

---

## ステップ3: 1Password に登録

HK の認証情報管理ルール (`~/.claude/rules/git-security.md`) に従って 1Password に保存。

### 3-1. 1Password で新規アイテム作成

- **Vault**: 既存の開発用 Vault (なければ新規作成)
- **アイテム名**: `ariake-events X API`
- **タイプ**: API Credential
- **フィールド**:
  | フィールド名 | 値 |
  |---|---|
  | `X_API_KEY` | (ステップ 2-2 で取得) |
  | `X_API_SECRET` | (ステップ 2-2 で取得) |
  | `X_ACCESS_TOKEN` | (ステップ 2-4 で取得) |
  | `X_ACCESS_TOKEN_SECRET` | (ステップ 2-4 で取得) |
  | `X_USERNAME` | `@ariake_events` (実際に取れたもの) |
  | `X_USER_ID` | App 詳細画面で確認できる数値 ID |

### 3-2. GitHub Secrets に登録

GitHub Actions から使うため、リポジトリの Secrets に追加:

1. https://github.com/KANNOHI1/ariake-events/settings/secrets/actions
2. 「New repository secret」で以下を1つずつ追加:
   - `X_API_KEY`
   - `X_API_SECRET`
   - `X_ACCESS_TOKEN`
   - `X_ACCESS_TOKEN_SECRET`

⚠️ GitHub Secrets は **登録後は値の表示不可** (上書きは可)。1Password に元データを必ず残しておくこと。

---

## ステップ4: Claude/Codex に連絡

完了したら以下を Claude にメッセージで伝える:

```
X API キー取得完了。1Password と GitHub Secrets に登録済み。
- アカウント: @ariake_events (実際に取れた名前を記載)
- User ID: 1234567890... (Developer Portal で確認した数値)
- 権限: Read+Write 確認済み
```

これで Phase 11 M2 (Codex による実装) を開始できる。

---

## トラブルシューティング

### Developer アカウント審査で停滞した
- 利用目的アンケートの英文を再送 (上の例文を使えばまず通る)
- どうしても通らない場合は HK 個人アカウントで Free tier 申請 → 同一 Developer プロジェクト内に新規 App として `ariake-events-bot` を作る方法もある (アカウント単位ではなく App 単位で API キーが発行される)

### 「Read and write」が選択できない (グレーアウト)
- メール認証・電話番号認証が未完了の可能性 → アカウント設定で確認

### 投稿テストで 403 エラー
- Access Token を Read+Write 権限変更**前**に発行している → 「Keys and tokens」→「Access Token」→ Regenerate でやり直す

### Free tier の制限超過
- 月1,500投稿上限。ariake-events の予想使用量は 120〜320投稿/月なので余裕だが、不具合で連投したらすぐ枯渇する
- `packages/x-poster/` 側に「1日50件超で自動停止」のガード実装済み (Phase 11 M3)

---

## 参考

- X Developer Portal: https://developer.x.com
- Free tier 仕様: https://docs.x.com/x-api/getting-started/about-x-api
- API リファレンス (POST tweet): https://docs.x.com/x-api/posts/creation-of-a-post

---
最終更新: 2026-05-25 by Claude
