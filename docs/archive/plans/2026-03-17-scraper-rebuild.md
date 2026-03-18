# スクレイパー完全リビルド 実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 有明エリア5施設のイベント情報スクレイパーをゼロから再構築し、GitHub Actionsで毎日安定稼働させる

**Architecture:** pnpmモノレポ構造を維持し`packages/scraper`を完全書き直し。`tsx`で直接実行（ビルドステップ不要）。Playwright + Cheerioでスクレイピング、Vitestでテスト。施設ごとに独立したスクレイパーモジュール、HTML fixtureベースのユニットテスト。

**Tech Stack:** TypeScript, Node.js 22, pnpm, Playwright, Cheerio, Luxon, Vitest, tsx, GitHub Actions

---

## 既存コードの問題と解決方針

| 問題 | 解決策 |
|---|---|
| CIにビルドステップがなく`dist/index.js`が見つからない | `tsx`で直接実行。ビルド不要 |
| 毎回新しいBrowserContextを生成 | Browser1つ、Context1つを使い回し |
| CSSセレクタが脆弱 | 各サイトの実際のHTML構造に基づいて堅牢なセレクタを設計 |
| テストゼロ | Vitest + HTML fixtureで各スクレイパーをテスト |
| `@types/luxon`がない | devDependenciesに追加 |

## サイト別HTML構造分析（2026-03-17確認済み）

### 1. 有明ガーデン（サーバーサイドレンダリング）
- イベントカード: `a.card_wrap` → `h3.font_gothic.leader_01`（タイトル）
- 日付: `time[datetime]`属性（`2026-3-14`形式）
- カテゴリ: `span[data-eventlabel]`（kids, exhibition, food等）
- **リストページだけで全情報が取れる。詳細ページへの遷移不要**

### 2. 東京ガーデンシアター（WordPress）
- スケジュールリストページ。JS依存の可能性あり→Playwright使用
- 旧実装: 月別ページネーション + 個別イベントページ

### 3. 有明アリーナ（WordPress）
- 月別タブ構造（`/event/`, `/event/next/`等）
- イベントリスト: `ul.event_detail_list > li`
- 日付: `div.event_day span`（`MM.DD`形式）
- タイトル: `p.sub_title`または`div.event_name p`

### 4. TOYOTA ARENA TOKYO（Next.js SSR）
- クライアントハイドレーション→**Playwright必須**
- 月別パラメータ: `?year=YYYY&month=MM`

### 5. 東京ビッグサイト（サーバーサイドレンダリング）
- イベント: `article.lyt-event-01`
- タイトル: `h3.hdg-01 a`
- 詳細: `dl.list-01 div`（dt/dd構造、開催期間・URL等）
- ページネーション: `search.php?page=N`（現在5ページ、176件）
- **構造が最も安定。fetch + Cheerioで十分**

## ファイル構成（新規作成）

```
packages/scraper/
├── src/
│   ├── index.ts              # エントリーポイント（オーケストレーター）
│   ├── types.ts              # 型定義（EventItem, ScrapeResult等）
│   ├── config.ts             # 設定（出力先、タイムゾーン）
│   ├── lib/
│   │   ├── browser.ts        # Playwright管理（コンテキスト再利用）
│   │   ├── date.ts           # 日付パーサー
│   │   ├── normalize.ts      # ID生成、カテゴリマッピング、テキスト正規化
│   │   └── validate.ts       # イベントバリデーション、重複排除、ソート
│   └── sources/
│       ├── index.ts           # 全スクレイパーのexport
│       ├── ariakeGarden.ts
│       ├── tokyoGardenTheater.ts
│       ├── ariakeArena.ts
│       ├── toyotaArenaTokyo.ts
│       └── tokyoBigSight.ts
├── test/
│   ├── fixtures/              # 各サイトの保存済みHTML
│   │   ├── ariake-garden.html
│   │   ├── tokyo-garden-theater.html
│   │   ├── ariake-arena.html
│   │   ├── toyota-arena-tokyo.html
│   │   └── tokyo-big-sight.html
│   ├── lib/
│   │   ├── date.test.ts
│   │   ├── normalize.test.ts
│   │   └── validate.test.ts
│   └── sources/
│       ├── ariakeGarden.test.ts
│       ├── tokyoGardenTheater.test.ts
│       ├── ariakeArena.test.ts
│       ├── toyotaArenaTokyo.test.ts
│       └── tokyoBigSight.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
.github/
└── workflows/
    └── scrape.yml             # 修正版ワークフロー
```

---

## Chunk 1: プロジェクト基盤とコアユーティリティ

### Task 1: 既存スクレイパーコードの削除と依存関係のセットアップ

**Files:**
- Modify: `packages/scraper/package.json`
- Create: `packages/scraper/vitest.config.ts`
- Modify: `packages/scraper/tsconfig.json`
- Delete: `packages/scraper/src/**/*`（全ファイル）
- Delete: `packages/scraper/docs/**/*`

- [ ] **Step 1: 既存のsrcとdocsを削除**

```bash
cd packages/scraper
rm -rf src docs dist
mkdir -p src/lib src/sources test/fixtures test/lib test/sources
```

- [ ] **Step 2: package.jsonを更新**

```json
{
  "name": "scraper",
  "private": true,
  "version": "0.2.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "start": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "scrape:single": "tsx src/index.ts --facility"
  },
  "dependencies": {
    "cheerio": "^1.0.0",
    "luxon": "^3.5.0",
    "playwright": "^1.49.1"
  },
  "devDependencies": {
    "@types/luxon": "^3.4.2",
    "@types/node": "^22.0.0",
    "tsx": "^4.7.1",
    "typescript": "^5.4.5",
    "vitest": "^3.0.0"
  }
}
```

**変更ポイント:**
- `start`を`node dist/index.js`→`tsx src/index.ts`に変更（**CI障害の根本原因を排除**）
- `dotenv`削除（Node.js 22は`--env-file`対応、環境変数はGitHub Secretsで管理）
- `nodemailer`削除（通知はGitHub Actions標準機能で代替）
- `vitest`追加
- `@types/luxon`追加
- `cheerio`をv1.0.0安定版に更新

- [ ] **Step 3: tsconfig.jsonを更新**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 4: vitest.config.tsを作成**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: ".",
    include: ["test/**/*.test.ts"],
    testTimeout: 10000,
  },
});
```

- [ ] **Step 5: 依存関係をインストール**

```bash
cd ../.. && pnpm install
```

- [ ] **Step 6: コミット**

```bash
git add -p
git commit -m "refactor: clean slate for scraper rebuild — remove old code, update deps

- Remove all existing scraper source code and docs
- Switch from node dist/ to tsx direct execution (fixes CI failure)
- Remove dotenv/nodemailer (use native Node.js 22 features)
- Add vitest, @types/luxon
- Update cheerio to stable v1.0.0"
```

---

### Task 2: 型定義とConfig

**Files:**
- Create: `packages/scraper/src/types.ts`
- Create: `packages/scraper/src/config.ts`

- [ ] **Step 1: types.tsを作成**

```typescript
export type EventItem = {
  id: string;
  eventName: string;
  facility: string;
  category: string;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  peakTimeStart: string | null;
  peakTimeEnd: string | null;
  estimatedAttendees: number | null;
  congestionRisk: number | null;
  sourceURL: string;
  lastUpdated: string;     // ISO 8601
};

export type ScrapeResult = {
  facility: string;
  sourceURL: string;
  events: EventItem[];
  warnings: string[];
  errors: string[];
};

export type FacilityScraper = {
  facility: string;
  sourceURL: string;
  run: (ctx: ScrapeContext) => Promise<ScrapeResult>;
};

export type ScrapeContext = {
  nowISO: string;
  timezone: string;
  fetchHtml: (url: string) => Promise<string>;
  log: (message: string) => void;
};
```

**変更ポイント:**
- `ScrapeContext`からbrowserを排除。代わりに`fetchHtml`関数を注入（テスト時にモックしやすい）
- `FacilityScraper`に`sourceURL`を追加

- [ ] **Step 2: config.tsを作成**

```typescript
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PACKAGE_ROOT = path.resolve(__dirname, "..");
export const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");
export const OUTPUT_PATH = path.join(REPO_ROOT, "packages", "web", "public", "events.json");
export const TIMEZONE = "Asia/Tokyo";
```

- [ ] **Step 3: コミット**

```bash
git add packages/scraper/src/types.ts packages/scraper/src/config.ts
git commit -m "feat(scraper): add type definitions and config"
```

---

### Task 3: 日付パーサー（TDD）

**Files:**
- Create: `packages/scraper/src/lib/date.ts`
- Create: `packages/scraper/test/lib/date.test.ts`

- [ ] **Step 1: テストを先に書く**

```typescript
// test/lib/date.test.ts
import { describe, expect, it } from "vitest";
import { toISODate, parseDateRange, isValidISODate } from "../../src/lib/date.js";

describe("toISODate", () => {
  it("pads single digit month and day", () => {
    expect(toISODate(2026, 3, 5)).toBe("2026-03-05");
  });
  it("handles double digit month and day", () => {
    expect(toISODate(2026, 12, 25)).toBe("2026-12-25");
  });
});

describe("isValidISODate", () => {
  it("accepts valid date", () => {
    expect(isValidISODate("2026-03-17")).toBe(true);
  });
  it("rejects invalid format", () => {
    expect(isValidISODate("2026/03/17")).toBe(false);
  });
  it("rejects invalid date", () => {
    expect(isValidISODate("2026-02-30")).toBe(false);
  });
});

describe("parseDateRange", () => {
  it("parses full date range: 2026年03月17日（火）～2026年03月19日（木）", () => {
    const result = parseDateRange("2026年03月17日（火）～2026年03月19日（木）");
    expect(result).toEqual({ start: "2026-03-17", end: "2026-03-19" });
  });
  it("parses range with month-day only end: 2026 年 3 月 14 日 (土) ～ 3 月 22 日 (日)", () => {
    const result = parseDateRange("2026 年 3 月 14 日 (土) ～ 3 月 22 日 (日)");
    expect(result).toEqual({ start: "2026-03-14", end: "2026-03-22" });
  });
  it("parses single date: 2026年04月01日", () => {
    const result = parseDateRange("2026年04月01日");
    expect(result).toEqual({ start: "2026-04-01", end: "2026-04-01" });
  });
  it("parses dot format: 2026.3.14", () => {
    const result = parseDateRange("2026.3.14");
    expect(result).toEqual({ start: "2026-03-14", end: "2026-03-14" });
  });
  it("parses slash format: 2026/3/14 ～ 2026/3/22", () => {
    const result = parseDateRange("2026/3/14 ～ 2026/3/22");
    expect(result).toEqual({ start: "2026-03-14", end: "2026-03-22" });
  });
  it("parses time[datetime] attribute: 2026-3-14", () => {
    const result = parseDateRange("2026-3-14");
    expect(result).toEqual({ start: "2026-03-14", end: "2026-03-14" });
  });
  it("handles year rollover: 2026年12月28日～1月5日", () => {
    const result = parseDateRange("2026年12月28日～1月5日");
    expect(result).toEqual({ start: "2026-12-28", end: "2027-01-05" });
  });
  it("returns null for unparseable text", () => {
    expect(parseDateRange("coming soon")).toBeNull();
  });
});
```

- [ ] **Step 2: テスト実行して失敗を確認**

```bash
cd packages/scraper && pnpm test
```
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: 実装を書く**

```typescript
// src/lib/date.ts
const pad2 = (n: number) => n.toString().padStart(2, "0");

export const toISODate = (year: number, month: number, day: number): string =>
  `${year}-${pad2(month)}-${pad2(day)}`;

export const isValidISODate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
};

type DateRange = { start: string; end: string };

// YYYY年MM月DD日, YYYY/MM/DD, YYYY.MM.DD, YYYY-M-D
const FULL_DATE = /(\d{4})\s*[年/.\-]\s*(\d{1,2})\s*[月/.\-]?\s*(\d{1,2})\s*日?/g;
// M月D日 or M/D
const MONTH_DAY = /(\d{1,2})\s*[月/]\s*(\d{1,2})\s*日?/g;

export const parseDateRange = (text: string): DateRange | null => {
  // Extract all full dates (YYYY-MM-DD patterns)
  const fullDates: Array<{ year: number; month: number; day: number }> = [];
  let m: RegExpExecArray | null;
  const fullRegex = new RegExp(FULL_DATE.source, "g");
  while ((m = fullRegex.exec(text)) !== null) {
    fullDates.push({ year: +m[1], month: +m[2], day: +m[3] });
  }

  if (fullDates.length >= 2) {
    const s = fullDates[0];
    const e = fullDates[fullDates.length - 1];
    return {
      start: toISODate(s.year, s.month, s.day),
      end: toISODate(e.year, e.month, e.day),
    };
  }

  if (fullDates.length === 1) {
    const s = fullDates[0];
    const startStr = toISODate(s.year, s.month, s.day);

    // Check for month-day only end after separator
    const sepIdx = text.indexOf("～") !== -1 ? text.indexOf("～")
      : text.indexOf("~") !== -1 ? text.indexOf("~")
      : text.indexOf("-", text.indexOf(String(s.day)) + 1);

    if (sepIdx !== -1) {
      const afterSep = text.slice(sepIdx + 1);
      const mdRegex = new RegExp(MONTH_DAY.source);
      const mdMatch = mdRegex.exec(afterSep);
      if (mdMatch) {
        const endMonth = +mdMatch[1];
        const endDay = +mdMatch[2];
        const endYear = endMonth < s.month ? s.year + 1 : s.year;
        return { start: startStr, end: toISODate(endYear, endMonth, endDay) };
      }
    }

    return { start: startStr, end: startStr };
  }

  return null;
};
```

- [ ] **Step 4: テスト実行してパスを確認**

```bash
pnpm test
```
Expected: ALL PASS

- [ ] **Step 5: コミット**

```bash
git add packages/scraper/src/lib/date.ts packages/scraper/test/lib/date.test.ts
git commit -m "feat(scraper): add date parser with TDD tests"
```

---

### Task 4: 正規化ユーティリティ（TDD）

**Files:**
- Create: `packages/scraper/src/lib/normalize.ts`
- Create: `packages/scraper/test/lib/normalize.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// test/lib/normalize.test.ts
import { describe, expect, it } from "vitest";
import { normalizeWhitespace, mapCategory, makeEventId, removeNewTabNotice } from "../../src/lib/normalize.js";

describe("normalizeWhitespace", () => {
  it("collapses whitespace and trims", () => {
    expect(normalizeWhitespace("  hello   world  ")).toBe("hello world");
  });
  it("handles newlines", () => {
    expect(normalizeWhitespace("foo\n\tbar")).toBe("foo bar");
  });
});

describe("removeNewTabNotice", () => {
  it("removes 新規タブで開きます", () => {
    expect(removeNewTabNotice("イベント名新規タブで開きます")).toBe("イベント名");
  });
});

describe("mapCategory", () => {
  it("maps music keywords", () => {
    expect(mapCategory("ライブ")).toBe("music");
    expect(mapCategory("コンサート2026")).toBe("music");
  });
  it("maps sports keywords", () => {
    expect(mapCategory("Bリーグ")).toBe("sports");
  });
  it("maps exhibition keywords", () => {
    expect(mapCategory("展示会")).toBe("exhibition");
    expect(mapCategory("EXPO 2026")).toBe("exhibition");
  });
  it("maps eventlabel attributes", () => {
    expect(mapCategory("kids")).toBe("other");
    expect(mapCategory("food")).toBe("other");
    expect(mapCategory("exhibition")).toBe("exhibition");
  });
  it("defaults to other", () => {
    expect(mapCategory("キャンペーン")).toBe("other");
    expect(mapCategory(null)).toBe("other");
  });
});

describe("makeEventId", () => {
  it("generates deterministic id", () => {
    const id1 = makeEventId("有明ガーデン", "テスト", "2026-03-17", "https://example.com");
    const id2 = makeEventId("有明ガーデン", "テスト", "2026-03-17", "https://example.com");
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^ariake-garden-20260317-[0-9a-f]{8}$/);
  });
  it("generates different ids for different events", () => {
    const id1 = makeEventId("有明ガーデン", "テストA", "2026-03-17", "https://example.com");
    const id2 = makeEventId("有明ガーデン", "テストB", "2026-03-17", "https://example.com");
    expect(id1).not.toBe(id2);
  });
});
```

- [ ] **Step 2: テスト実行して失敗を確認**
- [ ] **Step 3: 実装を書く**

```typescript
// src/lib/normalize.ts
import { createHash } from "node:crypto";

const FACILITY_SLUG: Record<string, string> = {
  "有明ガーデン": "ariake-garden",
  "東京ガーデンシアター": "tokyo-garden-theater",
  "有明アリーナ": "ariake-arena",
  "TOYOTA ARENA TOKYO": "toyota-arena-tokyo",
  "東京ビッグサイト": "tokyo-big-sight",
};

export const normalizeWhitespace = (s: string): string =>
  s.replace(/\s+/g, " ").trim();

export const removeNewTabNotice = (s: string): string =>
  normalizeWhitespace(s.replace(/新規タブで開きます/g, ""));

export const mapCategory = (raw: string | null | undefined): string => {
  if (!raw) return "other";
  const s = raw.toLowerCase();
  if (/ライブ|コンサート|音楽|ショー|フェス|live|music/.test(s)) return "music";
  if (/スポーツ|リーグ|試合|大会|カップ|選手権|sports/.test(s)) return "sports";
  if (/展示|展覧|見本市|expo|exhibition/.test(s)) return "exhibition";
  return "other";
};

export const makeEventId = (
  facility: string,
  eventName: string,
  startDate: string,
  sourceURL: string,
): string => {
  const slug = FACILITY_SLUG[facility] ?? "unknown";
  const hash = createHash("sha1")
    .update(`${facility}|${eventName}|${startDate}|${sourceURL}`)
    .digest("hex")
    .slice(0, 8);
  return `${slug}-${startDate.replace(/-/g, "")}-${hash}`;
};
```

- [ ] **Step 4: テスト実行してパスを確認**
- [ ] **Step 5: コミット**

```bash
git add packages/scraper/src/lib/normalize.ts packages/scraper/test/lib/normalize.test.ts
git commit -m "feat(scraper): add normalization utilities with TDD tests"
```

---

### Task 5: バリデーションユーティリティ（TDD）

**Files:**
- Create: `packages/scraper/src/lib/validate.ts`
- Create: `packages/scraper/test/lib/validate.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// test/lib/validate.test.ts
import { describe, expect, it } from "vitest";
import { validateEvents, dedupeEvents, sortEvents } from "../../src/lib/validate.js";
import type { EventItem } from "../../src/types.js";

const makeEvent = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: "test-20260317-abc12345",
  eventName: "テストイベント",
  facility: "有明ガーデン",
  category: "other",
  startDate: "2026-03-17",
  endDate: "2026-03-17",
  peakTimeStart: null,
  peakTimeEnd: null,
  estimatedAttendees: null,
  congestionRisk: null,
  sourceURL: "https://example.com",
  lastUpdated: "2026-03-17T00:00:00Z",
  ...overrides,
});

describe("validateEvents", () => {
  it("accepts valid event", () => {
    const { valid, errors } = validateEvents([makeEvent()]);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });
  it("rejects event missing eventName", () => {
    const { valid, errors } = validateEvents([makeEvent({ eventName: "" })]);
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });
  it("rejects event with startDate after endDate", () => {
    const { valid } = validateEvents([makeEvent({ startDate: "2026-03-20", endDate: "2026-03-17" })]);
    expect(valid).toHaveLength(0);
  });
  it("rejects invalid sourceURL", () => {
    const { valid } = validateEvents([makeEvent({ sourceURL: "not-a-url" })]);
    expect(valid).toHaveLength(0);
  });
});

describe("dedupeEvents", () => {
  it("removes duplicate ids", () => {
    const events = [makeEvent(), makeEvent(), makeEvent({ id: "different-id" })];
    expect(dedupeEvents(events)).toHaveLength(2);
  });
});

describe("sortEvents", () => {
  it("sorts by startDate then eventName", () => {
    const events = [
      makeEvent({ startDate: "2026-03-20", eventName: "B" }),
      makeEvent({ startDate: "2026-03-17", eventName: "Z" }),
      makeEvent({ startDate: "2026-03-17", eventName: "A" }),
    ];
    const sorted = sortEvents(events);
    expect(sorted.map((e) => e.eventName)).toEqual(["A", "Z", "B"]);
  });
});
```

- [ ] **Step 2: テスト実行して失敗を確認**
- [ ] **Step 3: 実装を書く**

```typescript
// src/lib/validate.ts
import type { EventItem } from "../types.js";
import { isValidISODate } from "./date.js";

export type ValidationResult = {
  valid: EventItem[];
  errors: string[];
};

export const validateEvents = (events: EventItem[]): ValidationResult => {
  const valid: EventItem[] = [];
  const errors: string[] = [];

  for (const e of events) {
    const issues: string[] = [];
    if (!e.eventName) issues.push("missing eventName");
    if (!e.facility) issues.push("missing facility");
    if (!e.startDate || !isValidISODate(e.startDate)) issues.push("invalid startDate");
    if (!e.endDate || !isValidISODate(e.endDate)) issues.push("invalid endDate");
    if (e.startDate && e.endDate && e.startDate > e.endDate) issues.push("startDate > endDate");
    if (!e.sourceURL || !/^https?:\/\//.test(e.sourceURL)) issues.push("invalid sourceURL");

    if (issues.length > 0) {
      errors.push(`[${e.facility}] ${e.eventName || "(no name)"}: ${issues.join(", ")}`);
    } else {
      valid.push(e);
    }
  }
  return { valid, errors };
};

export const dedupeEvents = (events: EventItem[]): EventItem[] => {
  const seen = new Set<string>();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
};

export const sortEvents = (events: EventItem[]): EventItem[] =>
  [...events].sort((a, b) =>
    a.startDate !== b.startDate
      ? a.startDate.localeCompare(b.startDate)
      : a.eventName.localeCompare(b.eventName),
  );
```

- [ ] **Step 4: テスト実行してパスを確認**
- [ ] **Step 5: コミット**

```bash
git add packages/scraper/src/lib/validate.ts packages/scraper/test/lib/validate.test.ts
git commit -m "feat(scraper): add validation, dedup, sort with TDD tests"
```

---

### Task 6: ブラウザマネージャー

**Files:**
- Create: `packages/scraper/src/lib/browser.ts`

- [ ] **Step 1: 実装を書く**

```typescript
// src/lib/browser.ts
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

let browser: Browser | null = null;
let context: BrowserContext | null = null;

export const launchBrowser = async (): Promise<void> => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  });
};

export const closeBrowser = async (): Promise<void> => {
  await context?.close();
  await browser?.close();
  context = null;
  browser = null;
};

export const fetchHtml = async (url: string): Promise<string> => {
  if (!context) throw new Error("Browser not launched. Call launchBrowser() first.");
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    // Wait for dynamic content (Next.js etc)
    await page.waitForTimeout(2000);
    return await page.content();
  } finally {
    await page.close();
  }
};
```

**変更ポイント:**
- BrowserContextを1つだけ作成し、全スクレイパーで共有
- ページ単位で開閉（コンテキストは維持）
- 2秒のwaitでJS hydrationを待つ

- [ ] **Step 2: コミット**

```bash
git add packages/scraper/src/lib/browser.ts
git commit -m "feat(scraper): add browser manager with context reuse"
```

---

### Task 6.5: makeScraper DRYヘルパー

**Files:**
- Create: `packages/scraper/src/lib/scraper-factory.ts`

- [ ] **Step 1: 実装**

```typescript
// src/lib/scraper-factory.ts
import type { EventItem, FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

type ParseFn = (html: string, nowISO: string) => EventItem[];

export const makeScraper = (
  facility: string,
  sourceURL: string,
  parseFn: ParseFn,
): FacilityScraper => ({
  facility,
  sourceURL,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    try {
      const html = await ctx.fetchHtml(sourceURL);
      const events = parseFn(html, ctx.nowISO);
      if (events.length === 0) warnings.push("No events found on list page");
      return { facility, sourceURL, events, warnings, errors };
    } catch (error) {
      errors.push(`Failed: ${(error as Error).message}`);
      return { facility, sourceURL, events: [], warnings, errors };
    }
  },
});
```

**設計ポイント:**
- 単一ページの施設（有明ガーデン等）はこのヘルパーで1行定義
- 東京ビッグサイトのようなページネーションが必要な施設はカスタム`run`を直接書く
- DRY: try/catch/ScrapeResult構築の5回重複を排除

- [ ] **Step 2: コミット**

```bash
git add packages/scraper/src/lib/scraper-factory.ts
git commit -m "feat(scraper): add makeScraper DRY helper for single-page scrapers"
```

---

## Chunk 2: 施設別スクレイパー

### Task 7: 有明ガーデン スクレイパー

**Files:**
- Create: `packages/scraper/src/sources/ariakeGarden.ts`
- Create: `packages/scraper/test/fixtures/ariake-garden.html`
- Create: `packages/scraper/test/sources/ariakeGarden.test.ts`

- [ ] **Step 1: HTMLフィクスチャを取得して保存**

```bash
# Playwright CLIでHTMLを保存
cd packages/scraper
pnpm exec playwright install chromium
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('https://www.shopping-sumitomo-rd.com/ariake/event/');
  const html = await p.content();
  require('fs').writeFileSync('test/fixtures/ariake-garden.html', html);
  await b.close();
})();
"
```

- [ ] **Step 2: テストを書く**

```typescript
// test/sources/ariakeGarden.test.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAriakeGardenEvents } from "../../src/sources/ariakeGarden.js";

const html = readFileSync(
  path.join(__dirname, "../fixtures/ariake-garden.html"),
  "utf-8",
);

describe("ariakeGarden parser", () => {
  it("extracts events from list page HTML", () => {
    const events = parseAriakeGardenEvents(html, "2026-03-17T00:00:00Z");
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.facility).toBe("有明ガーデン");
      expect(e.eventName).toBeTruthy();
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.id).toMatch(/^ariake-garden-/);
    }
  });
});
```

- [ ] **Step 3: スクレイパー実装**

```typescript
// src/sources/ariakeGarden.ts
import * as cheerio from "cheerio";
import { parseDateRange } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type { EventItem, FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

const FACILITY = "有明ガーデン";
const LIST_URL = "https://www.shopping-sumitomo-rd.com/ariake/event/";
const BASE_URL = "https://www.shopping-sumitomo-rd.com";

export const parseAriakeGardenEvents = (html: string, nowISO: string): EventItem[] => {
  const $ = cheerio.load(html);
  const events: EventItem[] = [];

  $("a.card_wrap").each((_, el) => {
    const $el = $(el);
    const title = normalizeWhitespace($el.find("h3").first().text());
    if (!title) return;

    const href = $el.attr("href") ?? "";
    const sourceURL = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    // Extract dates from time[datetime] elements
    const times = $el.find("time[datetime]");
    const startRaw = times.eq(0).attr("datetime") ?? "";
    const endRaw = times.length > 1 ? (times.eq(1).attr("datetime") ?? startRaw) : startRaw;

    // Parse datetime attribute (format: "2026-3-14")
    const startRange = parseDateRange(startRaw);
    const endRange = parseDateRange(endRaw);
    if (!startRange || !endRange) return;

    const startDate = startRange.start;
    const endDate = endRange.start; // endRaw is a single date

    // Categories from data-eventlabel spans
    const labels: string[] = [];
    $el.find("span[data-eventlabel]").each((_, span) => {
      labels.push($(span).attr("data-eventlabel") ?? "");
    });
    const category = mapCategory(labels.join(" "));

    events.push({
      id: makeEventId(FACILITY, title, startDate, sourceURL),
      eventName: title,
      facility: FACILITY,
      category,
      startDate,
      endDate,
      peakTimeStart: null,
      peakTimeEnd: null,
      estimatedAttendees: null,
      congestionRisk: null,
      sourceURL,
      lastUpdated: nowISO,
    });
  });

  return events;
};

export const ariakeGardenScraper: FacilityScraper = {
  facility: FACILITY,
  sourceURL: LIST_URL,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      const html = await ctx.fetchHtml(LIST_URL);
      const events = parseAriakeGardenEvents(html, ctx.nowISO);
      if (events.length === 0) {
        warnings.push("No events found on list page");
      }
      return { facility: FACILITY, sourceURL: LIST_URL, events, warnings, errors };
    } catch (error) {
      errors.push(`Failed: ${(error as Error).message}`);
      return { facility: FACILITY, sourceURL: LIST_URL, events: [], warnings, errors };
    }
  },
};
```

**設計ポイント:**
- `parseAriakeGardenEvents`を純粋関数として分離（HTML in → events out）→テスト容易
- `time[datetime]`属性から日付を取得（テキスト解析より堅牢）
- `data-eventlabel`からカテゴリ取得
- **リストページだけで完結。詳細ページへの遷移不要（旧実装の数十回のHTTPリクエストを1回に削減）**

- [ ] **Step 4: テスト実行してパスを確認**
- [ ] **Step 5: コミット**

---

### Task 8: 東京ビッグサイト スクレイパー

**Files:**
- Create: `packages/scraper/src/sources/tokyoBigSight.ts`
- Create: `packages/scraper/test/fixtures/tokyo-big-sight.html`
- Create: `packages/scraper/test/sources/tokyoBigSight.test.ts`

- [ ] **Step 1: HTMLフィクスチャを取得して保存**
- [ ] **Step 2: テストを書く**

```typescript
// test/sources/tokyoBigSight.test.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseTokyoBigSightEvents } from "../../src/sources/tokyoBigSight.js";

const html = readFileSync(
  path.join(__dirname, "../fixtures/tokyo-big-sight.html"),
  "utf-8",
);

describe("tokyoBigSight parser", () => {
  it("extracts events from page HTML", () => {
    const events = parseTokyoBigSightEvents(html, "2026-03-17T00:00:00Z");
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.facility).toBe("東京ビッグサイト");
      expect(e.eventName).toBeTruthy();
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
```

- [ ] **Step 3: スクレイパー実装**

```typescript
// src/sources/tokyoBigSight.ts
import * as cheerio from "cheerio";
import { parseDateRange } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace, removeNewTabNotice } from "../lib/normalize.js";
import type { EventItem, FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

const FACILITY = "東京ビッグサイト";
const LIST_URL = "https://www.bigsight.jp/visitor/event/";
const PAGE_URL = "https://www.bigsight.jp/visitor/event/search.php?page=";

export const parseTokyoBigSightEvents = (html: string, nowISO: string): EventItem[] => {
  const $ = cheerio.load(html);
  const events: EventItem[] = [];

  $("article.lyt-event-01").each((_, el) => {
    const $el = $(el);
    const titleEl = $el.find("h3.hdg-01 a").first();
    const rawTitle = normalizeWhitespace(titleEl.text());
    const title = removeNewTabNotice(rawTitle);
    if (!title) return;

    // Extract info from dl.list-01
    const info: Record<string, string> = {};
    $el.find("dl.list-01 div").each((_, row) => {
      const dt = normalizeWhitespace($(row).find("dt").first().text());
      const dd = normalizeWhitespace($(row).find("dd").first().text());
      if (dt) info[dt] = dd;
    });

    const dateText = info["開催期間"] ?? "";
    const range = parseDateRange(dateText);
    if (!range) return;

    // Get URL: prefer explicit URL field, fallback to title link
    const urlDd = $el.find("dt:contains('URL')").next("dd").find("a").attr("href");
    const titleHref = titleEl.attr("href");
    const rawUrl = urlDd ?? titleHref ?? LIST_URL;
    const sourceURL = rawUrl.startsWith("http") ? rawUrl : `https://www.bigsight.jp${rawUrl}`;

    events.push({
      id: makeEventId(FACILITY, title, range.start, sourceURL),
      eventName: title,
      facility: FACILITY,
      category: mapCategory(title),
      startDate: range.start,
      endDate: range.end,
      peakTimeStart: null,
      peakTimeEnd: null,
      estimatedAttendees: null,
      congestionRisk: null,
      sourceURL,
      lastUpdated: nowISO,
    });
  });

  return events;
};

export const tokyoBigSightScraper: FacilityScraper = {
  facility: FACILITY,
  sourceURL: LIST_URL,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    let allEvents: EventItem[] = [];

    try {
      // First page
      const firstHtml = await ctx.fetchHtml(LIST_URL);
      allEvents.push(...parseTokyoBigSightEvents(firstHtml, ctx.nowISO));

      // Detect max page
      const $ = cheerio.load(firstHtml);
      let maxPage = 1;
      $("a[href*='search.php?page=']").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        const m = href.match(/page=(\d+)/);
        if (m) maxPage = Math.max(maxPage, +m[1]);
      });
      maxPage = Math.min(maxPage, 10); // safety cap

      // Remaining pages
      for (let page = 2; page <= maxPage; page++) {
        try {
          const html = await ctx.fetchHtml(`${PAGE_URL}${page}`);
          allEvents.push(...parseTokyoBigSightEvents(html, ctx.nowISO));
        } catch (e) {
          warnings.push(`Page ${page}: ${(e as Error).message}`);
        }
      }

      ctx.log(`${FACILITY}: ${allEvents.length} events from ${maxPage} pages`);
    } catch (error) {
      errors.push(`Failed: ${(error as Error).message}`);
    }

    return { facility: FACILITY, sourceURL: LIST_URL, events: allEvents, warnings, errors };
  },
};
```

- [ ] **Step 4: テスト実行してパスを確認**
- [ ] **Step 5: コミット**

---

### Task 9: 有明アリーナ スクレイパー

同様のパターンで実装。
- HTMLフィクスチャ取得→テスト→実装→検証→コミット
- セレクタ: `ul.event_detail_list > li`, `div.event_day span`, `p.sub_title`, `div.event_name p`
- 月別URL: `/event/`, `/event/next/`, `/event/two/`, `/event/three/`, `/event/last/`

---

### Task 10: TOYOTA ARENA TOKYO スクレイパー

同様のパターンで実装。
- **Next.js SSRのため、Playwright必須。JSハイドレーション後のHTMLをフィクスチャとして保存**
- 月別パラメータ: `?year=YYYY&month=MM`（6ヶ月先まで）
- 日付パース: `YYYY.M.D`形式

---

### Task 11: 東京ガーデンシアター スクレイパー

同様のパターンで実装。
- WordPress。スケジュールページの実際のイベント一覧部分をフィクスチャ保存
- 月別ページネーション

---

### Task 12: sourcesのindex.ts

**Files:**
- Create: `packages/scraper/src/sources/index.ts`

```typescript
export { ariakeGardenScraper } from "./ariakeGarden.js";
export { tokyoGardenTheaterScraper } from "./tokyoGardenTheater.js";
export { ariakeArenaScraper } from "./ariakeArena.js";
export { toyotaArenaTokyoScraper } from "./toyotaArenaTokyo.js";
export { tokyoBigSightScraper } from "./tokyoBigSight.js";
```

---

## Chunk 3: オーケストレーターとCI

### Task 13: メインオーケストレーター

**Files:**
- Create: `packages/scraper/src/index.ts`

- [ ] **Step 1: 実装**

```typescript
// src/index.ts
import fs from "node:fs/promises";
import path from "node:path";
import { DateTime } from "luxon";

import { OUTPUT_PATH, TIMEZONE } from "./config.js";
import { launchBrowser, closeBrowser, fetchHtml } from "./lib/browser.js";
import { dedupeEvents, sortEvents, validateEvents } from "./lib/validate.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "./types.js";

import {
  ariakeGardenScraper,
  tokyoGardenTheaterScraper,
  ariakeArenaScraper,
  toyotaArenaTokyoScraper,
  tokyoBigSightScraper,
} from "./sources/index.js";

const SCRAPERS: FacilityScraper[] = [
  ariakeGardenScraper,
  tokyoGardenTheaterScraper,
  ariakeArenaScraper,
  toyotaArenaTokyoScraper,
  tokyoBigSightScraper,
];

const log = (msg: string) => console.log(`[${new Date().toISOString()}] ${msg}`);

const SCRAPER_TIMEOUT_MS = 120_000; // 2 minutes per facility

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label}: timed out after ${ms / 1000}s`)), ms),
    ),
  ]);

const runScraper = async (
  scraper: FacilityScraper,
  ctx: ScrapeContext,
  retries = 3,
): Promise<ScrapeResult> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`${scraper.facility}: attempt ${attempt}/${retries}`);
      return await withTimeout(scraper.run(ctx), SCRAPER_TIMEOUT_MS, scraper.facility);
    } catch (error) {
      log(`${scraper.facility}: attempt ${attempt} failed — ${(error as Error).message}`);
      if (attempt < retries) {
        const delay = attempt * 5000; // 5s, 10s backoff
        log(`Waiting ${delay / 1000}s before retry...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return {
    facility: scraper.facility,
    sourceURL: scraper.sourceURL,
    events: [],
    warnings: [],
    errors: [`Failed after ${retries} attempts`],
  };
};

const main = async () => {
  const now = DateTime.now().setZone(TIMEZONE);
  const nowISO = now.toUTC().toISO({ suppressMilliseconds: true }) ?? new Date().toISOString();

  log("Launching browser...");
  await launchBrowser();

  const ctx: ScrapeContext = {
    nowISO,
    timezone: TIMEZONE,
    fetchHtml,
    log,
  };

  // Run scrapers sequentially to be polite to servers
  const results: ScrapeResult[] = [];
  for (const scraper of SCRAPERS) {
    const result = await runScraper(scraper, ctx);
    results.push(result);
    log(`${result.facility}: ${result.events.length} events, ${result.errors.length} errors`);
  }

  await closeBrowser();
  log("Browser closed.");

  // Aggregate
  const collected = results.flatMap((r) => r.events);
  const deduped = dedupeEvents(collected);
  const { valid, errors: validationErrors } = validateEvents(deduped);
  const sorted = sortEvents(valid);

  // Report
  const totalEvents = sorted.length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0) + validationErrors.length;
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  log(`\n=== Summary ===`);
  log(`Total events: ${totalEvents}`);
  log(`Errors: ${totalErrors}, Warnings: ${totalWarnings}`);
  for (const r of results) {
    log(`  ${r.facility}: ${r.events.length} events`);
    r.errors.forEach((e) => log(`    ERROR: ${e}`));
    r.warnings.forEach((w) => log(`    WARN: ${w}`));
  }
  validationErrors.forEach((e) => log(`  VALIDATION: ${e}`));

  // Write output
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf-8");
  log(`Wrote ${totalEvents} events to ${OUTPUT_PATH}`);

  // Only fail CI if ALL scrapers failed (0 events collected)
  // Partial failures are logged as warnings but don't break CI
  if (totalEvents === 0) {
    log("CRITICAL: No events collected from any facility!");
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**改善ポイント:**
- 指数バックオフ付きリトライ（5秒→10秒）
- 施設ごと120秒タイムアウト（CI 10分枠を1施設が独占しない）
- 構造化されたサマリーログ
- 部分失敗に寛容（全施設失敗=0イベントの場合のみCI失敗）
- メール通知を削除（GitHub Actionsの通知で十分）

- [ ] **Step 2: コミット**

---

### Task 13.5: オーケストレーターのテスト

**Files:**
- Create: `packages/scraper/test/index.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// test/index.test.ts
import { describe, expect, it } from "vitest";

// runScraper と withTimeout をテスト可能にするため、
// index.ts から export するか、別ファイルに切り出す。
// 実装時に orchestrator.ts として切り出すことを推奨。

// テスト対象:
// 1. リトライ: 1回目失敗→2回目成功で正常結果を返す
// 2. タイムアウト: 120秒超過でエラー返却
// 3. 部分失敗: 1/5失敗でもexitCode=0、0イベントならexitCode=1
// 4. 集約: 複数施設の結果をマージ・バリデーション・ソート
```

**注意:** `runScraper`と`withTimeout`は`index.ts`からテスト用にexportするか、
`lib/orchestrator.ts`に切り出す。fetchHtmlをScrapeContextで注入しているため、
テスト時はモック関数を渡すだけで完結する。

- [ ] **Step 2: 実装に合わせてテストを完成**
- [ ] **Step 3: コミット**
- メール通知を削除（GitHub Actionsの通知で十分）

- [ ] **Step 2: コミット**

---

### Task 14: GitHub Actions ワークフロー修正

**Files:**
- Modify: `.github/workflows/scrape.yml`

- [ ] **Step 1: ワークフローを更新**

```yaml
name: Scrape Events

on:
  schedule:
    - cron: '0 0 * * *'  # 毎日 JST 09:00 (UTC 00:00)
  workflow_dispatch:

permissions:
  contents: write

jobs:
  scrape:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright Chromium
        run: pnpm --filter scraper exec playwright install --with-deps chromium

      - name: Run scraper
        run: pnpm --filter scraper start

      - name: Commit and push if changed
        run: |
          if git diff --quiet packages/web/public/events.json; then
            echo "No changes to events.json"
          else
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add packages/web/public/events.json
            git commit -m "chore: update events.json [skip ci]"
            git push
          fi
```

**変更ポイント:**
- Node.js 20→22に更新
- pnpm/action-setup v2→v4（Node.js 24対応）
- `pnpm install --frozen-lockfile`（CI安定性）
- `timeout-minutes: 10`追加（無限ループ防止）
- `start`スクリプトが`tsx`を使うので**ビルドステップ不要**
- git diff終了コードのハンドリング修正（`--exit-code`→`--quiet`）

- [ ] **Step 2: コミット**

---

### Task 15: CLAUDE.mdの更新

**Files:**
- Modify: `CLAUDE.md`

プロジェクト概要・技術スタック・セッション開始時の手順を更新する。

- [ ] **Step 1: 更新**
- [ ] **Step 2: コミット**

---

### Task 16: ローカル実行で検証

- [ ] **Step 1: pnpm installを実行**
- [ ] **Step 2: Playwright Chromiumをインストール**
- [ ] **Step 3: `pnpm --filter scraper start`を実行**
- [ ] **Step 4: events.jsonの内容を確認**（イベントが取得できていること）
- [ ] **Step 5: `pnpm --filter scraper test`を実行**（全テストパス）
- [ ] **Step 6: 最終コミット＆プッシュ**

---

### Task 17: GitHub Actionsの手動実行で検証

- [ ] **Step 1: `gh workflow run scrape.yml`で手動トリガー**
- [ ] **Step 2: 実行結果を確認**（成功すること）
- [ ] **Step 3: events.jsonが更新されていること**

---

## 実行順序のまとめ

| Task | 内容 | 依存 |
|---|---|---|
| 1 | プロジェクトセットアップ | なし |
| 2 | 型定義・Config | Task 1 |
| 3 | 日付パーサー（TDD） | Task 1 |
| 4 | 正規化ユーティリティ（TDD） | Task 1 |
| 5 | バリデーション（TDD） | Task 3 |
| 6 | ブラウザマネージャー | Task 2 |
| 7 | 有明ガーデン | Task 3,4,6 |
| 8 | 東京ビッグサイト | Task 3,4,6 |
| 9 | 有明アリーナ | Task 3,4,6 |
| 10 | TOYOTA ARENA TOKYO | Task 3,4,6 |
| 11 | 東京ガーデンシアター | Task 3,4,6 |
| 12 | sources/index.ts | Task 7-11 |
| 13 | オーケストレーター | Task 5,6,12 |
| 14 | GitHub Actions修正 | Task 13 |
| 15 | CLAUDE.md更新 | Task 14 |
| 16 | ローカル検証 | Task 13 |
| 17 | CI検証 | Task 14,16 |
