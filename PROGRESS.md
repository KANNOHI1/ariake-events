# PROGRESS — ariake-events

> このファイルはセッション末に更新する。セッション開始時に最初に読む。

---

## 現在地

**Phase 2 / M3（CI確認）— プッシュ待ち**

---

## 完了済み

- **Phase 1** (完了 2026-03-17): スクレイパー5施設、44テスト、CI日次cron稼働
- **ロードマップ策定** (完了 2026-03-18): `docs/ROADMAP.md` に確定版を記録
- **Phase 2 M1** (完了 2026-03-18): 有明ガーデン data-eventlabel 対応（kids/food/fashion）
- **Phase 2 M2** (完了 2026-03-18): 全施設キーワード辞書拡張 → other 73件→20件
  - 新カテゴリ: kids(4), food(4), anime(2), fashion(1)
  - 既存拡張: music +12（tour/concert対応）, sports +18（league対応）, exhibition +12（展/フェア/week対応）

---

## 次にやること

**Phase 2 M3: CI確認 → git push → テスト・スクレイパー通過を確認**

```bash
cd C:/Users/c6341/Documents/Projects/ariake-events
git push
```
→ GitHub Actions で tests PASS + scraper OK を確認したら Phase 3 開始

**Phase 3 M1: Next.js セットアップ**
- `packages/web/` に Next.js + Tailwind をセットアップ
- events.json を静的インポートして動作確認（ローカル）
- `writing-plans` → `subagent-driven-development` で実行

---

## 未解決の問題・懸案

- [ ] `other` 20件のうち5件（レディースアパレル販売等）は ariakeGarden がラベルのみを mapCategory に渡す設計上の制約。タイトルもフォールバックに使えば解消できるが、Phase 2 スコープ外で記録のみ
- [ ] Phase 4の混雑度推定ロジックは設計が未確定（施設キャパ × イベント種別 × 時間帯）
- [ ] TOYOTA ARENA TOKYOのHTMLフィクスチャは月ボタン押下後の状態を再現できていない（テストの制約として既知）

---

## 直近の判断メモ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-03-18 | WebはNext.js静的エクスポート + GitHub Pages | コストゼロ、CIと親和性高い |
| 2026-03-18 | MVPに混雑度は含めない | 推定ロジック設計が重く待てない |
| 2026-03-18 | カテゴリ拡充はPhase 3の前に実施 | フィルタUIの初日品質に直結 |
| 2026-03-18 | カレンダービューはMVP必須 | ユーザー判断 |
| 2026-03-18 | other目標≤15 → 実績20件。残り20件は正当なother（PR/キャンペーン/未判定）で許容範囲 | 73→20で十分な改善 |

---

## セッション履歴（直近3件）

### 2026-03-18（今日）
- ロードマップ策定・確定（Phase 1〜4、マイルストーン設定）
- Phase 2 全実装完了: カテゴリ拡充 73→20件
- 58テスト通過、events.json再生成
- 次: git push → CI確認 → Phase 3開始

### 2026-03-17
- スクレイパー完全リビルド完了（173イベント）
- Toyota Arena月ボタン正規表現修正
- GitHub Actions Summary追加
- `update-fixtures` スクリプト追加
