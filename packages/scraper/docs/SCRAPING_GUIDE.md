# スクレイピング実装ガイド

## 概要

このドキュメントは、各施設の公式サイトからイベント情報をスクレイピングするための技術的な詳細を記述します。

## 実装方針

-   **ツール**: Playwright（HTML取得） + Cheerio（HTML解析）
-   **共通処理**:
    -   `fetchPageContent` でPlaywright経由のHTML取得（動的ページ対応）
    -   `normalizeWhitespace` による空白正規化
    -   `parseDateRangeFromText` / `toISODate` による日付のISO化
    -   `mapCategory` によるカテゴリ分類
    -   `makeEventId` による安定ID生成
    -   施設ごと3回までリトライ、検証エラーはレポートに集約

---

## 施設別実装詳細

### 1. 有明ガーデン

-   **担当ファイル**: `packages/scraper/src/sources/ariakeGarden.ts`
-   **公式サイトURL**: `https://www.shopping-sumitomo-rd.com/ariake/event/`

#### URL構造

-   一覧: `/ariake/event/`
-   詳細: `/ariake/event/detail/{id}/`
-   ページネーションなし（一覧から詳細URLを収集）

#### HTMLセレクタ

-   **イベントコンテナ**: 詳細ページ内（個別ページで抽出）
-   **イベント名**: `div.event_title`
-   **開催日時**: `div.date`
-   **詳細ページURL**: 一覧ページの `a[href^='/ariake/event/detail/']`
-   **カテゴリ**: `div.genre span.active`（無い場合は `div.genre span`）

#### データ抽出ロジック

-   一覧ページから詳細URLを収集 → 詳細ページを個別取得
-   `div.date` の「YYYY 年 M 月 D 日 ～ YYYY 年 M 月 D 日」を `parseDateRangeFromText` で解析
-   ISO日付に正規化し、`makeEventId` でID生成

#### 注意事項

-   一覧ページ内に複数のリンクがあるため `Set` で重複排除

---

### 2. 東京ガーデンシアター

-   **担当ファイル**: `packages/scraper/src/sources/tokyoGardenTheater.ts`
-   **公式サイトURL**: `https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/`

#### URL構造

-   一覧: `/tokyo_garden_theater/schedule/`
-   月別: `/tokyo_garden_theater/schedule/?date=YYYY-MM`
-   詳細: `/tokyo_garden_theater/schedule/{id}/`

#### HTMLセレクタ

-   **イベントコンテナ**: 詳細ページ内
-   **イベント名**: `div.eventTitle`
-   **開催日時**: `div.data`（OPEN/START行を含むテキスト全体）
-   **詳細ページURL**: `.list_schedule li a`
-   **カテゴリ**: `div.tag`

#### データ抽出ロジック

-   一覧ページから詳細URLを収集し、月別ページもキューで巡回
-   `div.data` の日付表記を `parseDateRangeFromText` で解析
-   日付が1つの場合は同日イベントとして処理

#### 注意事項

-   月別ページを最大24件まで巡回（無限ループ防止）

---

### 3. 有明アリーナ

-   **担当ファイル**: `packages/scraper/src/sources/ariakeArena.ts`
-   **公式サイトURL**: `https://ariake-arena.tokyo/event/`

#### URL構造

-   月別タブ相当の固定URLを複数巡回
    -   `/event/`, `/event/next/`, `/event/two/`, `/event/three/`, `/event/last/`

#### HTMLセレクタ

-   **イベントコンテナ**: `ul.event_detail_list > li`
-   **開催日時**: `div.event_day span`（`M.D` 形式）
-   **イベント名**: `p.sub_title`（無ければ `div.event_name p`）
-   **詳細ページURL**: `tr.url_area a` または `a.other_link`（無ければ一覧URL）

#### データ抽出ロジック

-   `div.event_day span` から `M.D` を抽出し、タブの年/月情報と合成
-   `.event_tab_menu li.active span.year` / `span.month_number` を基準に年跨ぎを補正
-   ISO日付に正規化し、`makeEventId` を生成

#### 注意事項

-   月跨ぎイベントは年補正ロジックで対応

---

### 4. TOYOTA ARENA TOKYO

-   **担当ファイル**: `packages/scraper/src/sources/toyotaArenaTokyo.ts`
-   **公式サイトURL**: `https://www.toyota-arena-tokyo.jp/events/`

#### URL構造

-   月別URLを6ヶ月分ループ
-   形式: `https://www.toyota-arena-tokyo.jp/events/?year=YYYY&month=MM`

#### HTMLセレクタ

-   **イベントコンテナ**: ページ内の `li` を対象にスキャン
-   **開催日時**: `span` 内の `YYYY.M.D` 形式
-   **イベント名**: 最初に見つかった `p`（空でないもの）
-   **詳細ページURL**: `li` 内の `a` の `href`

#### データ抽出ロジック

-   `YYYY.M.D` をISO化（`YYYY-MM-DD`）
-   タイトルに「アーティスト:」が含まれる場合はタイトル側のみ残す
-   1日イベントとして `startDate = endDate`

#### 注意事項

-   イベントが無い月は `ctx.log` に「イベントなし」を記録（エラー扱いしない）

---

### 5. 東京ビッグサイト

-   **担当ファイル**: `packages/scraper/src/sources/tokyoBigSight.ts`
-   **公式サイトURL**: `https://www.bigsight.jp/visitor/event/`

#### URL構造

-   一覧: `/visitor/event/`
-   ページネーション: `/visitor/event/search.php?page=N`（最大10ページまで巡回）

#### HTMLセレクタ

-   **イベントコンテナ**: `article.lyt-event-01`
-   **イベント名**: `h3.hdg-01 a`
-   **開催日時**: `dl.list-01 div` 内の `dt=開催期間` の `dd`
-   **詳細ページURL**: `dt:contains('URL')` 直後の `dd a`（無ければタイトルリンク）

#### データ抽出ロジック

-   `開催期間` を `parseDateRangeFromText` で解析
-   「新規タブで開きます」などの文言を除去
-   期間を `YYYY-MM-DD` に正規化

#### 注意事項

-   空の `article` が混在するため、タイトルが空ならスキップ
-   ページ数は最大10に制限（過剰巡回防止）

---

## 新しい施設の追加手順

1.  **ファイル作成**: `packages/scraper/src/sources/newFacility.ts` を作成
2.  **実装**: 本ドキュメントの形式に従い、URL構造・セレクタ・抽出ロジックを実装
3.  **呼び出し**: `packages/scraper/src/sources/index.ts` にexportを追加
4.  **実行登録**: `packages/scraper/src/index.ts` の `SCRAPERS` 配列へ追加
5.  **動作確認**: `pnpm --filter scraper dev` でローカル実行（必要に応じてPlaywrightのブラウザをインストール）
6.  **ドキュメント更新**: 本ファイルに施設セクションを追加
