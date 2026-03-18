import { describe, expect, it } from "vitest";
import { isHolidayOrWeekend, calcFacilityScore } from "../../src/lib/congestion.js";

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
