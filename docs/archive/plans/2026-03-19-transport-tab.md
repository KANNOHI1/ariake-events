# 交通タブ実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 有明エリア共通の交通情報（時刻表）を独立タブとして提供する。現在時刻以降の発車便を4路線横スクロールテーブルで表示する。

**Architecture:** 静的データ `timetable.ts` に4路線の平日/土休日ダイヤを定義。`timetableUtils.ts` で平日判定と時刻フィルタリングを行う。`TransportView.tsx` がテーブルUIを担当。`ViewTabs` に `'transport'` を追加し `page.tsx` で切り替える。

**Tech Stack:** TypeScript, React (Next.js 15), Tailwind CSS 3, Vitest + Testing Library

---

## ファイル構成

| 操作 | パス | 役割 |
|---|---|---|
| 作成 | `packages/web/src/data/timetable.ts` | 4路線の時刻表静的データ |
| 作成 | `packages/web/src/lib/timetableUtils.ts` | 平日/土休日判定・時刻フィルタ |
| 作成 | `packages/web/src/lib/timetableUtils.test.ts` | Utils ユニットテスト |
| 作成 | `packages/web/src/components/TransportView.tsx` | 交通タブUIコンポーネント |
| 作成 | `packages/web/src/components/TransportView.test.tsx` | コンポーネントテスト |
| 修正 | `packages/web/src/components/ViewTabs.tsx` | `ViewType` に `'transport'` 追加 |
| 修正 | `packages/web/src/components/ViewTabs.test.tsx` | 4タブのテストに更新 |
| 修正 | `packages/web/src/app/page.tsx` | TransportView の組み込み |
| 作成 | `.github/workflows/timetable-reminder.yml` | 年2回のダイヤ改正リマインダー |

---

## Chunk 1: データ層とユーティリティ

### Task 1: timetable.ts — 時刻表静的データ

**Files:**
- Create: `packages/web/src/data/timetable.ts`

- [ ] **Step 1: ファイルを作成する**

```typescript
// packages/web/src/data/timetable.ts

export type Departure = string // "HH:MM"

export type DirectionSchedule = {
  label: string       // 方面名（例: "大崎方面"）
  weekday: Departure[]
  holiday: Departure[]
}

export type RouteData = {
  name: string         // 路線名
  station: string      // 最寄り駅・停留所名
  walkMinutes: number  // 徒歩分数
  directions: DirectionSchedule[]
}

export const timetable: RouteData[] = [
  {
    name: 'りんかい線',
    station: '有明テニスの森駅',
    walkMinutes: 3,
    directions: [
      {
        label: '大崎方面',
        weekday: [
          '05:57','06:17','06:34','06:50','07:04','07:17','07:30','07:43',
          '07:56','08:09','08:22','08:35','08:48','09:01','09:14','09:27',
          '09:40','09:53','10:06','10:19','10:34','10:49','11:04','11:19',
          '11:34','11:49','12:04','12:19','12:34','12:49','13:04','13:19',
          '13:34','13:49','14:04','14:19','14:34','14:49','15:04','15:19',
          '15:34','15:49','16:04','16:19','16:34','16:49','17:04','17:19',
          '17:34','17:47','18:00','18:13','18:26','18:39','18:52','19:05',
          '19:18','19:31','19:44','19:57','20:10','20:23','20:38','20:53',
          '21:08','21:23','21:38','21:53','22:08','22:23','22:38','22:53',
          '23:08','23:23','23:38','23:53',
        ],
        holiday: [
          '06:07','06:27','06:47','07:07','07:27','07:47','08:07','08:27',
          '08:47','09:07','09:22','09:37','09:52','10:07','10:22','10:37',
          '10:52','11:07','11:22','11:37','11:52','12:07','12:22','12:37',
          '12:52','13:07','13:22','13:37','13:52','14:07','14:22','14:37',
          '14:52','15:07','15:22','15:37','15:52','16:07','16:22','16:37',
          '16:52','17:07','17:22','17:37','17:52','18:07','18:27','18:47',
          '19:07','19:27','19:47','20:07','20:27','20:47','21:07','21:27',
          '21:47','22:07','22:27','22:47','23:07','23:27','23:47',
        ],
      },
      {
        label: '新木場方面',
        weekday: [
          '05:48','06:08','06:25','06:41','06:57','07:11','07:24','07:37',
          '07:50','08:03','08:16','08:29','08:42','08:55','09:08','09:21',
          '09:34','09:47','10:00','10:13','10:28','10:43','10:58','11:13',
          '11:28','11:43','11:58','12:13','12:28','12:43','12:58','13:13',
          '13:28','13:43','13:58','14:13','14:28','14:43','14:58','15:13',
          '15:28','15:43','15:58','16:13','16:28','16:43','16:58','17:13',
          '17:28','17:41','17:54','18:07','18:20','18:33','18:46','18:59',
          '19:12','19:25','19:38','19:51','20:04','20:17','20:32','20:47',
          '21:02','21:17','21:32','21:47','22:02','22:17','22:32','22:47',
          '23:02','23:17','23:32','23:47',
        ],
        holiday: [
          '05:58','06:18','06:38','06:58','07:18','07:38','07:58','08:18',
          '08:38','08:58','09:13','09:28','09:43','09:58','10:13','10:28',
          '10:43','10:58','11:13','11:28','11:43','11:58','12:13','12:28',
          '12:43','12:58','13:13','13:28','13:43','13:58','14:13','14:28',
          '14:43','14:58','15:13','15:28','15:43','15:58','16:13','16:28',
          '16:43','16:58','17:13','17:28','17:43','17:58','18:18','18:38',
          '18:58','19:18','19:38','19:58','20:18','20:38','20:58','21:18',
          '21:38','21:58','22:18','22:38','22:58','23:18','23:38',
        ],
      },
    ],
  },
  {
    name: 'ゆりかもめ',
    station: '有明駅',
    walkMinutes: 2,
    directions: [
      {
        label: '新橋方面',
        weekday: [
          '06:00','06:10','06:20','06:30','06:40','06:50','07:00','07:08',
          '07:16','07:24','07:32','07:40','07:48','07:56','08:04','08:12',
          '08:20','08:28','08:36','08:44','08:52','09:00','09:08','09:16',
          '09:24','09:32','09:40','09:50','10:00','10:10','10:20','10:30',
          '10:40','10:50','11:00','11:10','11:20','11:30','11:40','11:50',
          '12:00','12:10','12:20','12:30','12:40','12:50','13:00','13:10',
          '13:20','13:30','13:40','13:50','14:00','14:10','14:20','14:30',
          '14:40','14:50','15:00','15:10','15:20','15:30','15:40','15:50',
          '16:00','16:08','16:16','16:24','16:32','16:40','16:48','16:56',
          '17:04','17:12','17:20','17:28','17:36','17:44','17:52','18:00',
          '18:10','18:20','18:30','18:40','18:50','19:00','19:10','19:20',
          '19:30','19:40','19:50','20:00','20:12','20:24','20:36','20:48',
          '21:00','21:12','21:24','21:36','21:48','22:00','22:15','22:30',
          '22:45','23:00','23:15','23:30',
        ],
        holiday: [
          '06:00','06:10','06:20','06:30','06:40','06:50','07:00','07:10',
          '07:20','07:30','07:40','07:50','08:00','08:10','08:20','08:30',
          '08:40','08:50','09:00','09:10','09:20','09:30','09:40','09:50',
          '10:00','10:08','10:16','10:24','10:32','10:40','10:48','10:56',
          '11:04','11:12','11:20','11:28','11:36','11:44','11:52','12:00',
          '12:08','12:16','12:24','12:32','12:40','12:48','12:56','13:04',
          '13:12','13:20','13:28','13:36','13:44','13:52','14:00','14:08',
          '14:16','14:24','14:32','14:40','14:48','14:56','15:04','15:12',
          '15:20','15:28','15:36','15:44','15:52','16:00','16:10','16:20',
          '16:30','16:40','16:50','17:00','17:10','17:20','17:30','17:40',
          '17:50','18:00','18:12','18:24','18:36','18:48','19:00','19:15',
          '19:30','19:45','20:00','20:15','20:30','20:45','21:00','21:15',
          '21:30','21:45','22:00','22:15','22:30','22:45','23:00','23:15',
          '23:30',
        ],
      },
      {
        label: '豊洲方面',
        weekday: [
          '06:04','06:14','06:24','06:34','06:44','06:54','07:04','07:12',
          '07:20','07:28','07:36','07:44','07:52','08:00','08:08','08:16',
          '08:24','08:32','08:40','08:48','08:56','09:04','09:12','09:20',
          '09:28','09:36','09:44','09:54','10:04','10:14','10:24','10:34',
          '10:44','10:54','11:04','11:14','11:24','11:34','11:44','11:54',
          '12:04','12:14','12:24','12:34','12:44','12:54','13:04','13:14',
          '13:24','13:34','13:44','13:54','14:04','14:14','14:24','14:34',
          '14:44','14:54','15:04','15:14','15:24','15:34','15:44','15:54',
          '16:04','16:12','16:20','16:28','16:36','16:44','16:52','17:00',
          '17:08','17:16','17:24','17:32','17:40','17:48','17:56','18:04',
          '18:14','18:24','18:34','18:44','18:54','19:04','19:14','19:24',
          '19:34','19:44','19:54','20:04','20:16','20:28','20:40','20:52',
          '21:04','21:16','21:28','21:40','21:52','22:04','22:19','22:34',
          '22:49','23:04','23:19','23:34',
        ],
        holiday: [
          '06:04','06:14','06:24','06:34','06:44','06:54','07:04','07:14',
          '07:24','07:34','07:44','07:54','08:04','08:14','08:24','08:34',
          '08:44','08:54','09:04','09:14','09:24','09:34','09:44','09:54',
          '10:04','10:12','10:20','10:28','10:36','10:44','10:52','11:00',
          '11:08','11:16','11:24','11:32','11:40','11:48','11:56','12:04',
          '12:12','12:20','12:28','12:36','12:44','12:52','13:00','13:08',
          '13:16','13:24','13:32','13:40','13:48','13:56','14:04','14:12',
          '14:20','14:28','14:36','14:44','14:52','15:00','15:08','15:16',
          '15:24','15:32','15:40','15:48','15:56','16:04','16:14','16:24',
          '16:34','16:44','16:54','17:04','17:14','17:24','17:34','17:44',
          '17:54','18:04','18:16','18:28','18:40','18:52','19:04','19:19',
          '19:34','19:49','20:04','20:19','20:34','20:49','21:04','21:19',
          '21:34','21:49','22:04','22:19','22:34','22:49','23:04','23:19',
          '23:34',
        ],
      },
    ],
  },
  {
    name: '都バス',
    station: '有明テニスの森停留所',
    walkMinutes: 2,
    directions: [
      {
        label: '門前仲町方面（都05-2）',
        weekday: [
          '06:29','07:08','07:51','08:29','09:05','09:40','10:15','10:50',
          '11:25','12:00','12:35','13:10','13:45','14:20','14:55','15:30',
          '16:05','16:40','17:10','17:40','18:10','18:40','19:10','19:45',
          '20:20','20:55','21:30','22:05','22:40',
        ],
        holiday: [
          '07:15','07:55','08:35','09:10','09:45','10:20','10:55','11:30',
          '12:05','12:40','13:15','13:50','14:25','15:00','15:35','16:10',
          '16:45','17:20','17:55','18:30','19:05','19:40','20:15','20:50',
          '21:25','22:00','22:35',
        ],
      },
      {
        label: '錦糸町方面（都05-1）',
        weekday: [
          '06:15','06:55','07:35','08:10','08:45','09:20','09:55','10:30',
          '11:05','11:40','12:15','12:50','13:25','14:00','14:35','15:10',
          '15:45','16:20','16:55','17:30','18:05','18:40','19:15','19:50',
          '20:25','21:00','21:35','22:10','22:45',
        ],
        holiday: [
          '07:00','07:40','08:20','08:55','09:30','10:05','10:40','11:15',
          '11:50','12:25','13:00','13:35','14:10','14:45','15:20','15:55',
          '16:30','17:05','17:40','18:15','18:50','19:25','20:00','20:35',
          '21:10','21:45','22:20',
        ],
      },
    ],
  },
  {
    name: 'BRT',
    station: '有明BRT停留所',
    walkMinutes: 2,
    directions: [
      {
        label: '新橋方面',
        weekday: [
          '06:30','07:00','07:20','07:40','08:00','08:20','08:40','09:00',
          '09:20','09:40','10:00','10:20','10:40','11:00','11:20','11:40',
          '12:00','12:20','12:40','13:00','13:20','13:40','14:00','14:20',
          '14:40','15:00','15:20','15:40','16:00','16:20','16:40','17:00',
          '17:20','17:40','18:00','18:20','18:40','19:00','19:20','19:40',
          '20:00','20:30','21:00','21:30','22:00','22:30','23:00',
        ],
        holiday: [
          '07:00','07:30','08:00','08:30','09:00','09:20','09:40','10:00',
          '10:20','10:40','11:00','11:20','11:40','12:00','12:20','12:40',
          '13:00','13:20','13:40','14:00','14:20','14:40','15:00','15:20',
          '15:40','16:00','16:20','16:40','17:00','17:20','17:40','18:00',
          '18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00',
          '22:30','23:00',
        ],
      },
      {
        label: '晴海方面',
        weekday: [
          '06:40','07:10','07:30','07:50','08:10','08:30','08:50','09:10',
          '09:30','09:50','10:10','10:30','10:50','11:10','11:30','11:50',
          '12:10','12:30','12:50','13:10','13:30','13:50','14:10','14:30',
          '14:50','15:10','15:30','15:50','16:10','16:30','16:50','17:10',
          '17:30','17:50','18:10','18:30','18:50','19:10','19:30','19:50',
          '20:10','20:40','21:10','21:40','22:10','22:40','23:10',
        ],
        holiday: [
          '07:10','07:40','08:10','08:40','09:10','09:30','09:50','10:10',
          '10:30','10:50','11:10','11:30','11:50','12:10','12:30','12:50',
          '13:10','13:30','13:50','14:10','14:30','14:50','15:10','15:30',
          '15:50','16:10','16:30','16:50','17:10','17:30','17:50','18:10',
          '18:40','19:10','19:40','20:10','20:40','21:10','21:40','22:10',
          '22:40','23:10',
        ],
      },
    ],
  },
]
```

> **⚠️ 時刻表データについて**: 上記はサンプルデータです。実装時は各路線の公式サイトで正確な時刻を確認して更新してください。
> - りんかい線: https://www.twr.co.jp/
> - ゆりかもめ: https://www.yurikamome.co.jp/
> - 都バス: https://www.kotsu.metro.tokyo.jp/bus/
> - BRT: https://tokyo-brt.co.jp/

- [ ] **Step 2: コミット**

```bash
git add packages/web/src/data/timetable.ts
git commit -m "feat: add timetable static data (4 routes)"
```

---

### Task 2: timetableUtils.ts — ユーティリティ関数

**Files:**
- Create: `packages/web/src/lib/timetableUtils.ts`
- Create: `packages/web/src/lib/timetableUtils.test.ts`

- [ ] **Step 1: テストを先に書く**

```typescript
// packages/web/src/lib/timetableUtils.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { isHoliday, filterUpcoming, toMinutes } from './timetableUtils'

describe('toMinutes', () => {
  it('converts HH:MM to minutes since midnight', () => {
    expect(toMinutes('00:00')).toBe(0)
    expect(toMinutes('09:30')).toBe(570)
    expect(toMinutes('23:59')).toBe(1439)
  })
})

describe('isHoliday', () => {
  it('returns true for Saturday', () => {
    const sat = new Date('2026-03-21') // 土曜日
    expect(isHoliday(sat)).toBe(true)
  })

  it('returns true for Sunday', () => {
    const sun = new Date('2026-03-22') // 日曜日
    expect(isHoliday(sun)).toBe(true)
  })

  it('returns false for weekday', () => {
    const mon = new Date('2026-03-23') // 月曜日
    expect(isHoliday(mon)).toBe(false)
  })
})

describe('filterUpcoming', () => {
  it('returns departures at or after the given time', () => {
    const times = ['09:00', '09:30', '10:00', '10:30']
    expect(filterUpcoming(times, '09:30')).toEqual(['09:30', '10:00', '10:30'])
  })

  it('returns empty array when all times have passed', () => {
    const times = ['09:00', '09:30']
    expect(filterUpcoming(times, '23:00')).toEqual([])
  })

  it('returns all times when current time is before first departure', () => {
    const times = ['10:00', '10:30']
    expect(filterUpcoming(times, '06:00')).toEqual(['10:00', '10:30'])
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm --filter web test -- timetableUtils
```

Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: 実装を書く**

```typescript
// packages/web/src/lib/timetableUtils.ts

/** "HH:MM" を深夜0時からの分数に変換 */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * 指定日が土休日かどうかを判定
 * ⚠️ 日本の祝日は考慮しない（土・日のみ判定）。
 * 祝日対応は別フェーズで date-holidays パッケージ等を使って追加可能。
 */
export function isHoliday(date: Date = new Date()): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0=日, 6=土
}

/** 現在時刻以降の発車時刻のみ返す */
export function filterUpcoming(
  departures: string[],
  currentTime: string
): string[] {
  const currentMinutes = toMinutes(currentTime)
  return departures.filter((t) => toMinutes(t) >= currentMinutes)
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm --filter web test -- timetableUtils
```

Expected: PASS（6テスト）

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/lib/timetableUtils.ts packages/web/src/lib/timetableUtils.test.ts
git commit -m "feat: add timetableUtils (isHoliday, filterUpcoming)"
```

---

## Chunk 2: UIコンポーネントとタブ統合

### Task 3: TransportView.tsx — 交通タブUI

**Files:**
- Create: `packages/web/src/components/TransportView.tsx`
- Create: `packages/web/src/components/TransportView.test.tsx`

- [ ] **Step 1: テストを先に書く**

```typescript
// packages/web/src/components/TransportView.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TransportView from './TransportView'

// 現在時刻を固定（平日 14:30）
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-23T14:30:00')) // 月曜日
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TransportView', () => {
  it('renders all 4 route names', () => {
    render(<TransportView />)
    expect(screen.getByText('りんかい線')).toBeInTheDocument()
    expect(screen.getByText('ゆりかもめ')).toBeInTheDocument()
    expect(screen.getByText('都バス')).toBeInTheDocument()
    expect(screen.getByText('BRT')).toBeInTheDocument()
  })

  it('renders direction labels', () => {
    render(<TransportView />)
    expect(screen.getByText('大崎方面')).toBeInTheDocument()
    expect(screen.getByText('新木場方面')).toBeInTheDocument()
    expect(screen.getByText('新橋方面')).toBeInTheDocument()
    expect(screen.getByText('豊洲方面')).toBeInTheDocument()
  })

  it('renders station name and walk time', () => {
    render(<TransportView />)
    expect(screen.getByText('有明テニスの森駅')).toBeInTheDocument()
    expect(screen.getByText('徒歩3分')).toBeInTheDocument()
  })

  it('shows only departures at or after current time', () => {
    render(<TransportView />)
    // 14:30以前の便は表示されない
    expect(screen.queryAllByText('06:17').length).toBe(0)
    // 14:34以降の便は表示される
    expect(screen.getAllByText('14:34').length).toBeGreaterThan(0)
  })

  it('shows weekday schedule on weekday', () => {
    // 2026-03-23は月曜日なので平日ダイヤ
    render(<TransportView />)
    // 平日ダイヤの時刻が存在することを確認（ゆりかもめ豊洲方面 14:34）
    expect(screen.queryByText('14:34')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm --filter web test -- TransportView
```

Expected: FAIL（コンポーネントが存在しない）

- [ ] **Step 3: コンポーネントを実装する**

```typescript
// packages/web/src/components/TransportView.tsx
'use client'

import { useMemo, useState, useEffect } from 'react'
import { timetable } from '../data/timetable'
import { isHoliday, filterUpcoming } from '../lib/timetableUtils'

function getNowString(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default function TransportView() {
  // 1分ごとに再レンダリングして時刻フィルタを最新に保つ
  const [now, setNow] = useState(getNowString)
  const holiday = isHoliday()

  useEffect(() => {
    const timer = setInterval(() => setNow(getNowString()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const routes = useMemo(
    () =>
      timetable.map((route) => ({
        ...route,
        directions: route.directions.map((dir) => ({
          ...dir,
          upcoming: filterUpcoming(
            holiday ? dir.holiday : dir.weekday,
            now
          ),
        })),
      })),
    [now, holiday]
  )

  return (
    <div className="p-4">
      <p className="text-xs text-slate-500 mb-3">
        {now} 以降の発車便 · {holiday ? '土休日' : '平日'}ダイヤ
      </p>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="border-collapse text-sm whitespace-nowrap">
          {/* 路線名（上位ヘッダー） */}
          <thead>
            <tr>
              {routes.map((route) => (
                <th
                  key={route.name}
                  colSpan={route.directions.length}
                  className="px-3 py-2 text-center font-bold bg-slate-800 text-white border border-slate-600"
                >
                  {route.name}
                </th>
              ))}
            </tr>

            {/* 最寄り駅 */}
            <tr>
              {routes.map((route) => (
                <td
                  key={route.name}
                  colSpan={route.directions.length}
                  className="px-3 py-1 text-center text-xs text-slate-400 bg-slate-900 border border-slate-700"
                >
                  {route.station}
                </td>
              ))}
            </tr>

            {/* 徒歩分数 */}
            <tr>
              {routes.map((route) => (
                <td
                  key={route.name}
                  colSpan={route.directions.length}
                  className="px-3 py-1 text-center text-xs text-slate-500 bg-slate-900 border border-slate-700"
                >
                  徒歩{route.walkMinutes}分
                </td>
              ))}
            </tr>

            {/* 方面名（下位ヘッダー） */}
            <tr>
              {routes.flatMap((route) =>
                route.directions.map((dir) => (
                  <th
                    key={`${route.name}-${dir.label}`}
                    className="px-3 py-1.5 text-center text-xs font-medium bg-slate-700 text-slate-200 border border-slate-600"
                  >
                    {dir.label}
                  </th>
                ))
              )}
            </tr>
          </thead>

          {/* 時刻データ */}
          <tbody>
            {Array.from({
              length: Math.max(0, ...routes.flatMap((r) => r.directions.map((d) => d.upcoming.length))),
            }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                {routes.flatMap((route) =>
                  route.directions.map((dir) => (
                    <td
                      key={`${route.name}-${dir.label}-${rowIndex}`}
                      className="px-4 py-1.5 text-center border border-slate-200 text-slate-700 tabular-nums"
                    >
                      {dir.upcoming[rowIndex] ?? ''}
                    </td>
                  ))
                )}
              </tr>
            ))}
            {routes.every((r) => r.directions.every((d) => d.upcoming.length === 0)) && (
              <tr>
                <td
                  colSpan={routes.reduce((sum, r) => sum + r.directions.length, 0)}
                  className="px-4 py-8 text-center text-slate-400 text-sm"
                >
                  本日の運行は終了しました
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm --filter web test -- TransportView
```

Expected: PASS（5テスト）

- [ ] **Step 5: コミット**

```bash
git add packages/web/src/components/TransportView.tsx packages/web/src/components/TransportView.test.tsx
git commit -m "feat: add TransportView component with horizontal timetable"
```

---

### Task 4: ViewTabs と page.tsx にタブを追加

**Files:**
- Modify: `packages/web/src/components/ViewTabs.tsx`
- Modify: `packages/web/src/components/ViewTabs.test.tsx`
- Modify: `packages/web/src/app/page.tsx`

- [ ] **Step 1: ViewTabs.test.tsx を更新する**

`ViewTabs.test.tsx` の `'renders 3 tabs'` テストを `'renders 4 tabs'` に変更し、「交通」の存在確認を追加:

```typescript
it('renders 4 tabs', () => {
  render(<ViewTabs activeView="today" onChangeView={vi.fn()} />)
  expect(screen.getByText('今日')).toBeInTheDocument()
  expect(screen.getByText('今週')).toBeInTheDocument()
  expect(screen.getByText('カレンダー')).toBeInTheDocument()
  expect(screen.getByText('交通')).toBeInTheDocument()
})
```

また `'calls onChangeView with correct view id'` に交通タブのテストを追加:

```typescript
it('calls onChangeView with transport view id', () => {
  const onChange = vi.fn()
  render(<ViewTabs activeView="today" onChangeView={onChange} />)
  fireEvent.click(screen.getByText('交通'))
  expect(onChange).toHaveBeenCalledWith('transport')
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm --filter web test -- ViewTabs
```

Expected: FAIL

- [ ] **Step 3: ViewTabs.tsx を修正する**

`ViewTabs.tsx` の `ViewType` と `TABS` を更新:

```typescript
type ViewType = 'today' | 'week' | 'calendar' | 'transport'

const TABS: { id: ViewType; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'week', label: '今週' },
  { id: 'calendar', label: 'カレンダー' },
  { id: 'transport', label: '交通' },
]
```

- [ ] **Step 4: page.tsx に TransportView を追加する**

`page.tsx` に以下の変更を行う:

1. `import TransportView from '../components/TransportView'` を追加
2. `activeView === 'transport'` の条件分岐を追加:

```typescript
{activeView === 'transport' && <TransportView />}
```

3. `transport` タブ表示時は `FilterBar` を非表示にする（交通情報はイベントと無関係）:

```typescript
{activeView !== 'transport' && (
  <FilterBar
    filters={filters}
    onSetFacility={setFacility}
    onSetCategory={setCategory}
  />
)}
```

- [ ] **Step 5: page.test.tsx に交通タブのテストを追加する**

`packages/web/src/app/page.test.tsx` に以下のテストを追加（既存テストの末尾に追記）:

```typescript
it('renders TransportView when transport tab is active', async () => {
  render(<Home />)
  await waitFor(() => expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument())
  fireEvent.click(screen.getByText('交通'))
  expect(screen.getByText('りんかい線')).toBeInTheDocument()
})

it('hides FilterBar when transport tab is active', async () => {
  render(<Home />)
  await waitFor(() => expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument())
  fireEvent.click(screen.getByText('交通'))
  expect(screen.queryByText('有明ガーデン')).not.toBeInTheDocument()
})
```

- [ ] **Step 6: 全テストが通ることを確認**

```bash
pnpm --filter web test
```

Expected: 全テスト PASS

- [ ] **Step 7: コミット**

```bash
git add packages/web/src/components/ViewTabs.tsx packages/web/src/components/ViewTabs.test.tsx packages/web/src/app/page.tsx packages/web/src/app/page.test.tsx
git commit -m "feat: add transport tab to ViewTabs and page"
```

---

## Chunk 3: GitHub Actions リマインダー

### Task 5: ダイヤ改正リマインダー GitHub Actions

**Files:**
- Create: `.github/workflows/timetable-reminder.yml`

- [ ] **Step 1: ワークフローファイルを作成する**

```yaml
# .github/workflows/timetable-reminder.yml
name: Timetable Update Reminder

on:
  schedule:
    # 毎年3月1日 09:00 JST (UTC 00:00)
    - cron: '0 0 1 3 *'
    # 毎年10月1日 09:00 JST (UTC 00:00)
    - cron: '0 0 1 10 *'
  workflow_dispatch: # 手動実行も可能

jobs:
  create-reminder-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Create timetable reminder issue
        uses: actions/github-script@v7
        with:
          script: |
            const month = new Date().getMonth() + 1
            const season = month === 3 ? '春' : '秋'
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚉 [定期] ${season}ダイヤ改正の確認をしてください`,
              body: [
                '## ダイヤ改正リマインダー',
                '',
                'このIssueはGitHub Actionsによって自動作成されました。',
                '以下の路線のダイヤ改正を確認し、必要であれば `packages/web/src/data/timetable.ts` を更新してください。',
                '',
                '## 確認先',
                '',
                '| 路線 | 公式サイト | 改正時期 |',
                '|---|---|---|',
                '| りんかい線 | https://www.twr.co.jp/ | 3月（JR連動） |',
                '| ゆりかもめ | https://www.yurikamome.co.jp/ | 3月 or 10月 |',
                '| 都バス | https://www.kotsu.metro.tokyo.jp/bus/ | 3〜4月・9〜10月 |',
                '| BRT | https://tokyo-brt.co.jp/ | 随時 |',
                '',
                '## 対応手順',
                '',
                '1. 各公式サイトで時刻表の変更有無を確認',
                '2. 変更があれば `packages/web/src/data/timetable.ts` を更新',
                '3. `pnpm --filter web test` で全テストが通ることを確認',
                '4. commit & push',
                '5. このIssueをcloseする',
              ].join('\n'),
              labels: ['maintenance'],
            })
```

- [ ] **Step 2: コミット**

```bash
git add .github/workflows/timetable-reminder.yml
git commit -m "ci: add timetable update reminder workflow (March and October)"
```

---

## 最終確認

- [ ] **全テスト実行**

```bash
pnpm --filter web test
```

Expected: 全テスト PASS

- [ ] **ビルド確認**

```bash
pnpm --filter web build
```

Expected: エラーなし

- [ ] **push**

```bash
git push
```

---

## 補足: 都バスの時刻表について

都バスは路線によって停留所名と行き先が異なります。実装前に以下を確認してください:

- **都05-2系統**: 東京駅丸の内南口 ↔ 有明テニスの森（門前仲町経由）
- **都05-1系統**: 東京駅丸の内南口 ↔ 有明テニスの森（錦糸町駅経由）

実際の停留所は「有明テニスの森」または「有明」です。公式サイト（https://tobus.jp/）で正確な停留所名と時刻を確認してください。
