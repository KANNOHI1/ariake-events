# トラブルシューティングガイド

---

## 1. スクレイピング関連

### イベント情報が取得できない／一部欠落する

- **原因**: 施設サイトのHTML構造（セレクタ）が変更された
- **対応**:
  1. 対象施設の公式サイトをブラウザで開き、DevToolsでセレクタを確認
  2. `packages/scraper/src/sources/*.ts` のセレクタを修正
  3. `pnpm --filter scraper update-fixtures` でHTMLフィクスチャを更新
  4. `pnpm --filter scraper test` でテストを通す

### TOYOTA ARENA TOKYOのイベントが少ない

- **既知の制約**: HTMLフィクスチャは月ボタン押下後の状態を再現できない
- Playwright実行時は正常取得される。テストの制約として許容済み

---

## 2. GitHub Actions関連

### ワークフローが失敗する

1. Actions タブから失敗ジョブのログを確認
2. 原因別対応:
   - **スクレイピングエラー**: セクション1を参照してコードを修正
   - **一時的なネットワークエラー**: 手動で `workflow_dispatch` から再実行
   - **権限不足**: `scrape.yml` に `permissions: contents: write` があるか確認

### events.json がコミットされない

- 前回と差分なし → 正常動作。ログで `No changes to commit` を確認

---

## 3. 開発環境関連

### `pnpm install` が失敗する

- `node -v` でv22以降であることを確認
- `pnpm store prune` でキャッシュを整理して再試行

### Playwrightのインストールが失敗する（証明書エラー）

```bash
# 方法A: 一時的に証明書検証を無効化（非推奨）
set NODE_TLS_REJECT_UNAUTHORIZED=0
pnpm --filter scraper exec playwright install --with-deps chromium
set NODE_TLS_REJECT_UNAUTHORIZED=1

# 方法B: 社内CA証明書を指定（推奨）
set NODE_EXTRA_CA_CERTS="C:\path\to\company-ca.crt"
pnpm --filter scraper exec playwright install --with-deps chromium
```

### Webビルドが失敗する

```bash
# basePath付きでビルド確認
NEXT_PUBLIC_BASE_PATH=/ariake-events pnpm --filter web build
```

---

## 4. よくある質問

### Q: ローカルでPlaywrightが動かない

会社ネットワーク環境では証明書エラーが発生することがある。GitHub Actionsを主経路として運用し、ローカルは必要時のみ実行する運用を推奨。

### Q: `other` カテゴリのイベントが多い

`packages/scraper/src/lib/normalize.ts` の `mapCategory` にキーワードを追加することで分類できる。ただし有明ガーデンのラベルのみ渡す設計上、一部はタイトルフォールバックが必要（既知の制約）。
