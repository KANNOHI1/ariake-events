import { describe, expect, it } from "vitest";
import {
  toISODate,
  parseDateRange,
  isValidISODate,
} from "../../src/lib/date.js";

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
    const result = parseDateRange(
      "2026年03月17日（火）～2026年03月19日（木）",
    );
    expect(result).toEqual({ start: "2026-03-17", end: "2026-03-19" });
  });
  it("parses range with month-day only end: 2026 年 3 月 14 日 (土) ～ 3 月 22 日 (日)", () => {
    const result = parseDateRange(
      "2026 年 3 月 14 日 (土) ～ 3 月 22 日 (日)",
    );
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
