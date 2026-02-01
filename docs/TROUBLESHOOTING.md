# トラブルシューティングガイド

## 概要

このドキュメントは、開発・運用中に発生する可能性のある一般的な問題とその解決策をまとめたものです。

---

## 1. スクレイピング関連

### 問題: イベント情報が取得できない、または一部欠落する

-   **原因**: サイトのHTML構造（セレクタ）が変更された可能性があります。
-   **解決策**:
    1.  対象施設の公式サイトをブラウザで開きます。
    2.  デベロッパーツール（F12）を使い、イベント情報を囲む要素のセレクタが変更されていないか確認します。
    3.  `packages/scraper/src/sources/*.ts` を開き、古いセレクタを新しいものに修正します。
    4.  `SCRAPING_GUIDE.md` も忘れずに更新します。

### 問題: 新しいイベントが `events.json` に反映されない

-   **原因1**: スクレイピングロジックが新しい形式のイベントに対応できていない可能性があります。
-   **原因2**: サイトが動的コンテンツ（JavaScriptでの読み込み）に変更された可能性があります。
-   **解決策**:
    1.  対象サイトのソースコードを確認し、イベント情報が静的HTMLに含まれているか確認します。
    2.  動的に読み込まれている場合は、Playwrightの待機条件やセレクタを調整します。
    3.  `packages/scraper/src/sources/*.ts` のデータ抽出ロジックをデバッグし、問題箇所を特定・修正します。

---

## 2. GitHub Actions関連

### 問題: ワークフローの実行が失敗する

-   **原因**: 
    -   一時的なネットワークエラー
    -   サイト構造の変更によるスクレイピングエラー
    -   依存関係の解決エラー
-   **解決策**:
    1.  リポジトリの `Actions` タブから、失敗したワークフローのログを確認します。
    2.  エラーメッセージを読み、原因を特定します。
    3.  一時的なエラーの場合は、手動でワークフローを再実行します。
    4.  スクレイピングエラーの場合は、上記「1. スクレイピング関連」を参照してコードを修正します。

### 問題: `events.json` がコミットされない

-   **原因1**: スクレイピング結果が前回と全く同じで、差分がない。
-   **原因2**: `GITHUB_TOKEN` に書き込み権限が無い。
-   **解決策**:
    -   **原因1**: 正常動作です。ログで `No changes to commit` を確認してください。
    -   **原因2**: `.github/workflows/scraper.yml` に `permissions: contents: write` があるか確認してください。

---

## 3. 開発環境関連

### 問題: `pnpm install` が失敗する

-   **原因**: Node.jsのバージョンが古い、またはネットワークの問題が考えられます。
-   **解決策**:
    1.  `node -v` でバージョンを確認し、`v18` 以降であることを確認します。
    2.  `pnpm store prune` でキャッシュを整理します。

### 問題: Playwrightのインストールが失敗する (`self-signed certificate in certificate chain`)

-   **原因**: 会社のプロキシやファイアウォールが自己署名証明書を使っているため、Node.jsが安全な接続と判断できずに失敗しています。
-   **解決策**:

    **方法A: 証明書検証を一時的に無効化（非推奨）**
    ```bash
    # 環境変数を設定して、証明書の検証を一時的に無効にする
    set NODE_TLS_REJECT_UNAUTHORIZED=0

    # インストールコマンドを再実行
    pnpm --filter scraper exec playwright install --with-deps chromium

    # 必ず元に戻す
    set NODE_TLS_REJECT_UNAUTHORIZED=1
    ```

    **方法B: 社内CA証明書を設定（推奨）**
    1. 社内IT部門からルート証明書（`.crt`）を取得
    2. 環境変数に指定

    ```bash
    set NODE_EXTRA_CA_CERTS="C:\path\to\your\company-ca.crt"
    pnpm --filter scraper exec playwright install --with-deps chromium
    ```

    追加で必要な場合:
    ```bash
    pnpm config set cafile "C:\path\to\your\company-ca.crt"
    ```

---

## FAQ

### Q: 新しい施設を追加したい

**A**: `SCRAPING_GUIDE.md` の「新しい施設の追加手順」セクションを参照してください。

### Q: スクレイピング対象の期間を変更したい

**A**: `packages/scraper/src/sources/toyotaArenaTokyo.ts` の月別ループなど、期間を制御している箇所を修正してください。

### Q: ローカルでPlaywrightが動かない

**A**: 会社ネットワーク環境では証明書エラーが発生することがあります。GitHub Actionsを主経路として運用し、ローカルは必要時のみ実行する運用を推奨します。
