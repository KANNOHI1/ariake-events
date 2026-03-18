import { describe, expect, it } from "vitest";
import { isHolidayOrWeekend } from "../../src/lib/congestion.js";

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
