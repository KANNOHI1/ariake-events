# CLAUDE.md — ariake-events

有明エリア5施設のイベント情報を自動収集し、events.jsonとして出力するスクレイパー。

---

## プロジェクト概要

- **目的**: 有明エリアの混雑予測に必要なイベントデータの自動収集
- **対象施設**: 有明ガーデン、東京ガーデンシアター、有明アリーナ、TOYOTA ARENA TOKYO、東京ビッグサイト
- **実行**: GitHub Actions日次cron（UTC 00:00 / JST 09:00）
- **出力**: `packages/web/public/events.json`

## 技術スタック

- TypeScript + Node.js 22（tsx直接実行、ビルド不要）
- Playwright（ブラウザ自動化）+ Cheerio（HTML解析）
- Vitest（テスト）
- pnpm モノレポ（packages/scraper, packages/web）
- GitHub Actions

## アーキテクチャ

- `ScrapeContext` DI パターン: `fetchHtml` を注入、テスト時はモック可能
- 各施設ごとに独立した `FacilityScraper` を実装
- オーケストレーター: 120秒タイムアウト、部分失敗許容（全施設ゼロの時のみ exit 1）
- HTMLフィクスチャベースのTDD

## コマンド

```bash
pnpm --filter scraper test        # テスト実行
pnpm --filter scraper start       # スクレイパー実行（要Playwright）
```

## セッション開始時

1. このファイルを最新状態に更新する
2. ディレクトリ構造を確認する
3. 作業内容をサマリしてから開始

---

## UI デザインルール（melta-ui準拠）

> Web UI を生成・修正するときは必ずこのセクションを参照すること。

### 設計原則（5つ）

1. **Layered** — Background → Surface → Text/Object の3層でUIを構成する
2. **Contrast** — テキストは背景に対してWCAG 2.1準拠（4.5:1以上）
3. **Semantic** — 色は用途で指定する（`bg-surface-primary` ≠ 生の `bg-white`）
4. **Minimal** — 1つのViewに使う色は3色まで（背景・アクセント・テキスト）
5. **Grid** — スペーシングは4の倍数を基本、8の倍数を推奨する

### Tailwind CDN テンプレート

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#f0f5ff',100:'#dde8ff',200:'#c0d4ff',300:'#95b6ff',
          400:'#6492ff',500:'#2b70ef',600:'#2250df',700:'#1a40b5',
          800:'#13318d',900:'#0e266a',950:'#07194e'
        }
      },
      fontFamily: {
        sans: ['Inter','Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans JP','sans-serif']
      }
    }
  }
}
</script>
```

### クイックリファレンス

```
ページ全体         : bg-gray-50 min-h-screen
ページコンテンツ   : max-w-7xl mx-auto px-8 py-12
カード             : bg-white rounded-xl border border-slate-200 p-6 shadow-sm
CTAボタン（M）     : inline-flex items-center justify-center gap-2 h-10 px-4 text-[1rem] font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-700 cursor-pointer
サブボタン         : inline-flex items-center justify-center gap-2 h-10 px-4 text-[1rem] font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-gray-50 cursor-pointer
入力欄             : w-full px-3 py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/50
見出し             : text-3xl font-bold text-slate-900
本文               : text-base text-body leading-relaxed（.text-body = #3d4b5f）
```

### 禁止パターン

| 禁止 | 代替 |
|------|------|
| `text-black` | `text-slate-900` |
| `shadow-lg` / `shadow-2xl` | `shadow-sm` 〜 `shadow-md` |
| カード上部・左端のカラーバー（`border-t-4` / `border-l-4`） | `border border-*-200 rounded-lg` で全周ボーダー |
| `bg-indigo-*` / `bg-blue-*` ハードコード | `primary-*` を使う |
| 派手なグラデーション・ネオンカラー | セマンティックカラーのみ |
| 絵文字の多用 | テキストとアイコンで表現 |
| `rounded-none` on cards | `rounded-xl` |
| 色だけで情報伝達 | アイコン/テキストを併用 |

---
最終更新: 2026-03-17
