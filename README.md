# Ariake Events

有明エリア5施設のイベント情報を自動収集・可視化するWebサイト。

**URL**: [kannohi1.github.io/ariake-events](https://kannohi1.github.io/ariake-events)

---

## 対象施設

| 施設名 | 公式サイト |
|:---|:---|
| 有明ガーデン | https://www.shopping-sumitomo-rd.com/ariake/event/ |
| 東京ガーデンシアター | https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/ |
| 有明アリーナ | https://ariake-arena.tokyo/event/ |
| TOYOTA ARENA TOKYO | https://toyota-arena-tokyo.jp/events/ |
| 東京ビッグサイト | https://www.bigsight.jp/visitor/event/ |

> 有明コロシアムは公式サイトに民間イベントが掲載されないため対象外。

---

## コマンド

```bash
pnpm --filter scraper test        # スクレイパーテスト
pnpm --filter scraper start       # スクレイパー実行（要Playwright）
pnpm --filter web test            # Webテスト
pnpm --filter web dev             # Web開発サーバー
```

---

## ドキュメント

| ドキュメント | パス |
|:---|:---|
| ロードマップ | `docs/ROADMAP.md` |
| UIデザインルール | `docs/design/melta-ui.md` |
| カラーシステム | `docs/design/color-system.md` |
| トラブルシューティング | `docs/TROUBLESHOOTING.md` |
| GitHub Actions運用 | `.github/docs/GITHUB_ACTIONS_GUIDE.md` |
| 完了済みPlans/Specs | `docs/archive/` |

---

## ライセンス

[MIT](LICENSE)
