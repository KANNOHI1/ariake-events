# packages/x-poster/ 設計仕様書

ariake-events プロジェクトの X 自動告知ボット。検出→1週間前→前日→当日の4段階で引用RTスレッドを生成し、サイト流入を最大化する。

**実装委譲先**: Codex (TypeScript)
**前提**: `docs/X_API_SETUP_GUIDE.md` 完了 (HK 本人作業で API キー取得済み)

---

## 0. 設計原則

| 原則 | 内容 |
|---|---|
| **Dry-run first** | 環境変数 `X_DRY_RUN=1` で stdout 出力のみ、実投稿しないモードを必ず用意 |
| **冪等性** | 同じイベント×同じステージの2重投稿を防ぐ。`posted_tweets.json` を Single Source of Truth に |
| **クォータ防御** | 1日50件・月1500件に近づいたら自動停止。API 課金リスクをゼロに |
| **MLB プロジェクト踏襲** | `src/mlb_analysis/posters/twitter_client.py` の Protocol/Mock/Live パターンを TypeScript で再現 |
| **テスト先行 (TDD)** | Mock クライアントで全動作を unit test カバー後、Live クライアントは最低限の smoke test のみ |

---

## 1. ディレクトリ構成

```
packages/x-poster/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── src/
│   ├── index.ts              # CLI エントリ (pnpm --filter x-poster start)
│   ├── client.ts             # TwitterClient Protocol + Mock + Live
│   ├── templates.ts          # detected / 1week / 1day / 0day テンプレ
│   ├── scheduler.ts          # 今日投稿すべきイベント抽出
│   ├── state.ts              # posted_tweets.json 読み書き
│   ├── quota.ts              # 日次/月次の投稿数ガード
│   └── types.ts              # PostedTweetRecord / PostStage 等
├── data/
│   └── posted_tweets.json    # 状態ファイル (git管理)
└── test/
    ├── client.test.ts
    ├── templates.test.ts
    ├── scheduler.test.ts
    ├── state.test.ts
    ├── quota.test.ts
    └── fixtures/
        └── events.sample.json
```

---

## 2. 依存関係

`package.json` に追加:

```json
{
  "name": "x-poster",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "twitter-api-v2": "^1.18.0",
    "scraper": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.0.0"
  }
}
```

- `twitter-api-v2`: tweepy 相当の npm パッケージ。`quote_tweet_id` 対応済み
- `scraper`: 既存パッケージ。`EventItem` 型と `events.json` を import するため workspace 依存

---

## 3. データモデル

### 3-1. PostStage (投稿ステージ)

```typescript
type PostStage = "detected" | "1week" | "1day" | "0day";
```

| ステージ | トリガー | 投稿パターン |
|---|---|---|
| `detected` | 新規イベントが events.json に追加された日 | 単独投稿 (root tweet) |
| `1week` | startDate の 7日前 | root tweet を引用RT |
| `1day` | startDate の 1日前 | root tweet を引用RT |
| `0day` | startDate 当日 | root tweet を引用RT |

### 3-2. PostedTweetRecord (状態ファイル)

`data/posted_tweets.json`:

```typescript
type PostedTweetRecord = {
  eventId: string;            // EventItem.id
  rootTweetId: string;        // detected ステージで作成された tweet ID
  postedStages: PostStage[];  // 投稿済みステージ
  facility: string;           // 監査用
  eventName: string;          // 監査用
  startDate: string;          // 監査用
  firstPostedAt: string;      // ISO 8601
  lastPostedAt: string;       // ISO 8601
};

type StateFile = {
  records: Record<string, PostedTweetRecord>;  // key = eventId
  dailyPostCount: Record<string, number>;       // key = YYYY-MM-DD
  monthlyPostCount: Record<string, number>;     // key = YYYY-MM
  lastSyncedAt: string;                         // ISO 8601
};
```

---

## 4. アーキテクチャ

### 4-1. TwitterClient (MLB 流用パターン)

```typescript
// src/client.ts
export interface TwitterClient {
  post(params: {
    text: string;
    quoteTweetId?: string;        // 引用RT 対象
    inReplyToTweetId?: string;    // リプライ対象 (今は未使用、将来用)
  }): Promise<string>;             // 返り値: 新規 tweet ID
}

export class MockTwitterClient implements TwitterClient {
  async post(params): Promise<string> {
    if (params.quoteTweetId) console.log(`[QUOTE RT to ${params.quoteTweetId}]`);
    console.log(`[MOCK TWEET]\n${params.text}\n---`);
    return `dryrun-${hash(params.text)}`;
  }
}

export class LiveTwitterClient implements TwitterClient {
  constructor(private readonly client: TwitterApi) {}
  async post(params): Promise<string> {
    const opts: SendTweetV2Params = { text: params.text };
    if (params.quoteTweetId) opts.quote_tweet_id = params.quoteTweetId;
    if (params.inReplyToTweetId) opts.reply = { in_reply_to_tweet_id: params.inReplyToTweetId };
    const result = await this.client.v2.tweet(opts);
    return result.data.id;
  }
}
```

### 4-2. Templates (4種類)

```typescript
// src/templates.ts
export const buildText = (event: EventItem, stage: PostStage): string => {
  switch (stage) {
    case "detected":
      return `📢 新着イベント\n${event.eventName}\n${event.facility} / ${formatDateJP(event.startDate)}\n#有明イベント #${categoryHashtag(event.category)}\nhttps://kannohi1.github.io/ariake-events?id=${event.id}`;
    case "1week":
      return `🗓 1週間後\n${event.eventName}\n${formatDateJP(event.startDate)} 開催予定\nチケット情報はサイトから`;
    case "1day":
      return `⏰ 明日です\n${event.eventName}\n会場: ${event.facility}\n${congestionPhrase(event.congestionRisk)}`;
    case "0day":
      return `🎉 本日開催\n${event.eventName}\n${event.facility}\n${congestionPhrase(event.congestionRisk)}\n動線情報はサイトの「交通」タブから`;
  }
};
```

**禁止事項**:
- `https://t.co` 短縮URL の埋め込み (X 側で勝手にやる)
- 5個以上のハッシュタグ (スパム判定回避)
- 全イベントで同一文 (テンプレに動的要素を必ず混ぜる)

### 4-3. Scheduler (投稿対象抽出)

```typescript
// src/scheduler.ts
export const findEventsToPost = (
  events: EventItem[],
  state: StateFile,
  today: string,
): Array<{ event: EventItem; stage: PostStage; quoteTweetId?: string }> => {
  const result = [];
  for (const event of events) {
    const record = state.records[event.id];
    const daysUntil = diffDays(event.startDate, today);

    // detected: 新規イベント (record 無し)
    if (!record) {
      result.push({ event, stage: "detected" });
      continue;
    }

    // 1week / 1day / 0day: 既に root tweet があるイベント
    if (daysUntil === 7 && !record.postedStages.includes("1week")) {
      result.push({ event, stage: "1week", quoteTweetId: record.rootTweetId });
    } else if (daysUntil === 1 && !record.postedStages.includes("1day")) {
      result.push({ event, stage: "1day", quoteTweetId: record.rootTweetId });
    } else if (daysUntil === 0 && !record.postedStages.includes("0day")) {
      result.push({ event, stage: "0day", quoteTweetId: record.rootTweetId });
    }
  }
  return result;
};
```

### 4-4. Quota Guard

```typescript
// src/quota.ts
const DAILY_LIMIT = 50;
const MONTHLY_LIMIT = 1500;
const DAILY_SAFETY = 40;       // 80% で警告
const MONTHLY_SAFETY = 1200;   // 80% で警告

export const canPost = (state: StateFile, today: string): { allowed: boolean; reason?: string } => {
  const day = today;
  const month = today.slice(0, 7);
  const daily = state.dailyPostCount[day] ?? 0;
  const monthly = state.monthlyPostCount[month] ?? 0;

  if (daily >= DAILY_LIMIT) return { allowed: false, reason: `daily limit ${DAILY_LIMIT} reached` };
  if (monthly >= MONTHLY_LIMIT) return { allowed: false, reason: `monthly limit ${MONTHLY_LIMIT} reached` };
  if (daily >= DAILY_SAFETY) console.warn(`[WARN] daily ${daily}/${DAILY_LIMIT}`);
  if (monthly >= MONTHLY_SAFETY) console.warn(`[WARN] monthly ${monthly}/${MONTHLY_LIMIT}`);
  return { allowed: true };
};
```

### 4-5. State (永続化)

```typescript
// src/state.ts
export const loadState = (path: string): StateFile => { /* readFileSync + JSON.parse */ };
export const saveState = (path: string, state: StateFile): void => { /* JSON.stringify + writeFileSync */ };
export const recordPost = (state: StateFile, event: EventItem, stage: PostStage, tweetId: string, today: string): StateFile => { /* immutable 更新、新 StateFile を返す */ };
```

### 4-6. CLI Entry

```typescript
// src/index.ts
import { readFileSync } from "fs";
import path from "path";

const main = async () => {
  const dryRun = process.env.X_DRY_RUN === "1";
  const eventsPath = path.resolve("../web/public/events.json");
  const statePath = path.resolve("./data/posted_tweets.json");
  const today = new Date().toISOString().slice(0, 10);

  const events: EventItem[] = JSON.parse(readFileSync(eventsPath, "utf-8"));
  let state = loadState(statePath);

  const targets = findEventsToPost(events, state, today);
  console.log(`[INFO] ${targets.length} posts to make today`);

  const client = dryRun
    ? new MockTwitterClient()
    : new LiveTwitterClient(buildLiveClient());

  for (const { event, stage, quoteTweetId } of targets) {
    const quota = canPost(state, today);
    if (!quota.allowed) {
      console.warn(`[STOP] ${quota.reason}`);
      break;
    }
    const text = buildText(event, stage);
    const tweetId = await client.post({ text, quoteTweetId });
    state = recordPost(state, event, stage, tweetId, today);
    saveState(statePath, state);
    await sleep(2000); // X API レート制限緩和
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## 5. GitHub Actions 統合

既存 `.github/workflows/scrape.yml` の末尾に追加:

```yaml
- name: Run X poster (after scrape)
  run: pnpm --filter x-poster start
  env:
    X_API_KEY: ${{ secrets.X_API_KEY }}
    X_API_SECRET: ${{ secrets.X_API_SECRET }}
    X_ACCESS_TOKEN: ${{ secrets.X_ACCESS_TOKEN }}
    X_ACCESS_TOKEN_SECRET: ${{ secrets.X_ACCESS_TOKEN_SECRET }}

- name: Commit posted_tweets.json
  run: |
    git add packages/x-poster/data/posted_tweets.json
    git diff --staged --quiet || git commit -m "chore: update posted_tweets.json [skip ci]"
    git push
```

**順序**: scrape → events.json 更新 → web build → deploy → x-poster (新着検出後に投稿)

---

## 6. テスト計画 (TDD)

### Unit Tests (Mock クライアント使用)

| ファイル | テスト内容 |
|---|---|
| `client.test.ts` | MockTwitterClient が text/quoteTweetId を正しく扱う、deterministic ID |
| `templates.test.ts` | 4ステージ全部の文字列生成、文字数 < 140 (日本語 weighted)、URL 含む |
| `scheduler.test.ts` | record 無し → detected / daysUntil=7 → 1week / 同ステージ2重スキップ |
| `state.test.ts` | recordPost が immutable、dailyPostCount/monthlyPostCount インクリメント |
| `quota.test.ts` | DAILY_LIMIT 到達で allowed=false、SAFETY 到達で warn |

### Integration Test (Mock + 実 events.json)

| シナリオ | 期待動作 |
|---|---|
| 初日 (state 空) | events.json 全件が detected 投稿対象 |
| 検出7日後 | 該当イベントが 1week 引用RT 対象 |
| 検出済みイベント | 同ステージなら skip |
| 50件投稿後 | quota guard で停止 |

### Live Smoke Test

- `X_DRY_RUN=0` + テスト用の dummy event 1件 で実投稿確認
- 確認後は手動で tweet 削除

---

## 7. 段階的リリース手順

| 段階 | 内容 | 期間 |
|---|---|---|
| **Stage 1** | 全コード実装 + Mock テスト 100% PASS | 1〜2日 |
| **Stage 2** | `X_DRY_RUN=1` で GitHub Actions 数日運用、stdout ログで投稿内容確認 | 3日 |
| **Stage 3** | HK が stdout ログをレビュー、文面の違和感修正 | 1日 |
| **Stage 4** | `X_DRY_RUN=0` で本番運用開始、最初の3日は毎朝 HK が actual tweet を確認 | 3日 |
| **Stage 5** | 安定運用 | ongoing |

---

## 8. 監視・アラート

- **毎日**: GitHub Actions Summary に投稿数・スキップ理由を出力
- **クォータ80%**: console.warn → Actions ログに残る
- **連続失敗 3回**: GitHub Issue を自動作成 (将来実装)

---

## 9. 既知の制約・将来課題

| 制約 | 対応 |
|---|---|
| Free tier 月1500投稿 | 推定 120〜320 で十分。超過リスクは quota guard で防御 |
| Free tier 読み取り 100req/月 | リプライ反応取得は当面不可。Phase 12以降で必要なら Basic 課金検討 |
| イベント検出のタイミング | 日次 scrape の差分検出に依存。同日複数回検出されたら 1回のみ投稿 (state guard) |
| 画像添付 (OG画像) | Phase 11 では未対応。Phase 14 でマップ画像を添付する形で対応予定 |
| エラー時の再投稿 | tweet ID 取得失敗時は state に記録しない → 翌日 retry |

---

## 10. Codex 委譲時の指示テンプレ

```
このファイル (docs/X_POSTER_DESIGN.md) を完全準拠で実装してください。

ALLOWED to modify/create:
- packages/x-poster/** (新規パッケージ)
- pnpm-workspace.yaml (workspace に追加)
- .github/workflows/scrape.yml (末尾に X poster step 追加)

FORBIDDEN to touch:
- packages/scraper/** (既存スクレイパーは変更不要)
- packages/web/** (web 側変更なし)
- 既存 events.json / history/ ファイル

TDD: 全 unit test を先に書く (vitest)。Mock クライアントで 100% PASS してから Live クライアントを実装。

完了基準:
- pnpm --filter x-poster test が全 PASS
- X_DRY_RUN=1 pnpm --filter x-poster start が events.json を読んで stdout に MOCK TWEET を出力
- pnpm --filter x-poster typecheck がエラーゼロ
```

---
最終更新: 2026-05-25 by Claude
