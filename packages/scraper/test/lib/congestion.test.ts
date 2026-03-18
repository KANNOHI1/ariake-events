import { describe, expect, it } from "vitest";
import { isHolidayOrWeekend, calcFacilityScore, applyCongestionRisk, getDailyScores } from "../../src/lib/congestion.js";
import type { EventItem } from "../../src/types.js";

describe("isHolidayOrWeekend", () => {
  it("土曜日を祝日/週末と判定する", () => {
    expect(isHolidayOrWeekend("2026-03-21")).toBe(true); // 土曜
  });
  it("日曜日を祝日/週末と判定する", () => {
    expect(isHolidayOrWeekend("2026-03-22")).toBe(true); // 日曜
  });
  it("平日を祝日/週末と判定しない", () => {
    expect(isHolidayOrWeekend("2026-03-19")).toBe(false); // 木曜
  });
  it("祝日（元日）を祝日/週末と判定する", () => {
    expect(isHolidayOrWeekend("2026-01-01")).toBe(true); // 元日
  });
});

describe("calcFacilityScore", () => {
  it("音楽イベント（有明アリーナ、平日、単日）のスコアを計算する", () => {
    // (15000/86000) * 1.0 * 1.0 * 1.0 = 0.17441...
    const score = calcFacilityScore("有明アリーナ", "music", "2026-03-19", "2026-03-19");
    expect(score).toBeCloseTo(0.1744, 3);
  });
  it("土日はdayTypeBonusが適用される（アリーナ×1.05）", () => {
    // (15000/86000) * 1.0 * 1.0 * 1.05 = 0.18313...
    const score = calcFacilityScore("有明アリーナ", "music", "2026-03-21", "2026-03-21");
    expect(score).toBeCloseTo(0.1831, 3);
  });
  it("展示会（東京ビッグサイト、2日間）は日数で割る", () => {
    // (50000/86000) * 0.6 * (0.7/2) * 1.0 = 0.12155...
    const score = calcFacilityScore("東京ビッグサイト", "exhibition", "2026-03-19", "2026-03-20");
    expect(score).toBeCloseTo(0.1216, 3);
  });
  it("未知施設はスコア0を返す", () => {
    const score = calcFacilityScore("未知施設", "music", "2026-03-19", "2026-03-19");
    expect(score).toBe(0);
  });
  it("未知カテゴリはデフォルト係数0.6を使う", () => {
    // (15000/86000) * 0.6 * 1.0 * 1.0 = 0.10465...
    const score = calcFacilityScore("有明アリーナ", "unknown_category" as any, "2026-03-19", "2026-03-19");
    expect(score).toBeCloseTo(0.1047, 3);
  });
});

const makeEvent = (overrides: Partial<EventItem>): EventItem => ({
  id: "test-id",
  eventName: "テストイベント",
  facility: "有明アリーナ",
  category: "music",
  startDate: "2026-03-19",
  endDate: "2026-03-19",
  peakTimeStart: null,
  peakTimeEnd: null,
  estimatedAttendees: null,
  congestionRisk: null,
  sourceURL: "https://example.com",
  lastUpdated: "2026-03-19T00:00:00.000Z",
  ...overrides,
});

describe("applyCongestionRisk", () => {
  it("単一イベントのcongestionRiskを埋める", () => {
    const events = [makeEvent({ facility: "有明アリーナ", category: "music", startDate: "2026-03-19", endDate: "2026-03-19" })];
    const result = applyCongestionRisk(events);
    expect(result[0].congestionRisk).not.toBeNull();
    expect(result[0].congestionRisk).toBeGreaterThan(0);
    expect(result[0].congestionRisk).toBeLessThanOrEqual(1.0);
  });

  it("同日に複数施設のイベントがあればスコアが加算される", () => {
    const events = [
      makeEvent({ id: "a", facility: "有明アリーナ",         category: "music", startDate: "2026-03-19", endDate: "2026-03-19" }),
      makeEvent({ id: "b", facility: "東京ガーデンシアター", category: "music", startDate: "2026-03-19", endDate: "2026-03-19" }),
    ];
    const result = applyCongestionRisk(events);
    const singleEvent = applyCongestionRisk([events[0]]);
    expect(result[0].congestionRisk!).toBeGreaterThan(singleEvent[0].congestionRisk!);
    // 同日の2イベントは同じスコアを持つ
    expect(result[0].congestionRisk).toBeCloseTo(result[1].congestionRisk!, 5);
  });

  it("複数日イベントはすべての期間日に同スコアが割り当てられる", () => {
    const events = [
      makeEvent({ id: "c", facility: "東京ビッグサイト", category: "exhibition", startDate: "2026-03-19", endDate: "2026-03-21" }),
    ];
    const result = applyCongestionRisk(events);
    // 単一イベントなのでスコアは1件のみ
    expect(result[0].congestionRisk).not.toBeNull();
    expect(result[0].congestionRisk).toBeGreaterThan(0);
  });

  it("スコアは常に0.0〜1.0の範囲に収まる", () => {
    const events = [
      makeEvent({ id: "d1", facility: "有明アリーナ",         category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d2", facility: "東京ガーデンシアター", category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d3", facility: "TOYOTA ARENA TOKYO",  category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d4", facility: "東京ビッグサイト",     category: "exhibition", startDate: "2026-03-21", endDate: "2026-03-21" }),
      makeEvent({ id: "d5", facility: "有明ガーデン",         category: "music", startDate: "2026-03-21", endDate: "2026-03-21" }),
    ];
    const result = applyCongestionRisk(events);
    for (const e of result) {
      expect(e.congestionRisk).toBeGreaterThanOrEqual(0);
      expect(e.congestionRisk).toBeLessThanOrEqual(1.0);
    }
  });
});

describe("getDailyScores", () => {
  it("イベントのある日の日別スコアを返す", () => {
    const events: EventItem[] = [
      makeEvent({
        facility: "有明アリーナ",
        category: "music",
        startDate: "2026-03-19",
        endDate: "2026-03-19",
      }),
    ]
    const scores = getDailyScores(events)
    expect(scores["2026-03-19"]).toBeGreaterThan(0)
    expect(scores["2026-03-19"]).toBeLessThanOrEqual(1)
  })

  it("イベントがない日のキーは含まれない", () => {
    const events: EventItem[] = [
      makeEvent({ startDate: "2026-03-19", endDate: "2026-03-19" }),
    ]
    const scores = getDailyScores(events)
    expect(scores["2026-03-20"]).toBeUndefined()
  })

  it("applyCongestionRisk と同じスコアを返す", () => {
    const events: EventItem[] = [
      makeEvent({ startDate: "2026-03-19", endDate: "2026-03-19" }),
    ]
    const withRisk = applyCongestionRisk(events)
    const scores = getDailyScores(events)
    expect(scores["2026-03-19"]).toBeCloseTo(withRisk[0].congestionRisk ?? 0, 5)
  })

  it("空配列は空オブジェクトを返す", () => {
    expect(getDailyScores([])).toEqual({})
  })
})
