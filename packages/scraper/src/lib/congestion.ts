import Holidays from "date-holidays";
import type { EventItem } from "../types.js";

// ---- 施設定数 ----

const TOTAL_CAPACITY = 86_000;

const FACILITY_CONFIG: Record<
  string,
  { capacity: number; pattern: "concentrated" | "dispersed"; dayTypeBonus: number }
> = {
  "有明アリーナ":         { capacity: 15_000, pattern: "concentrated", dayTypeBonus: 1.05 },
  "TOYOTA ARENA TOKYO":  { capacity: 10_000, pattern: "concentrated", dayTypeBonus: 1.05 },
  "東京ガーデンシアター": { capacity:  8_000, pattern: "concentrated", dayTypeBonus: 1.05 },
  "東京ビッグサイト":     { capacity: 50_000, pattern: "dispersed",    dayTypeBonus: 1.2  },
  "有明ガーデン":         { capacity:  3_000, pattern: "dispersed",    dayTypeBonus: 1.8  },
};

const CATEGORY_MULTIPLIER: Record<string, number> = {
  music:      1.0,
  sports:     0.9,
  anime:      0.8,
  exhibition: 0.6,
  other:      0.6,
  kids:       0.5,
  fashion:    0.5,
  food:       0.4,
};
const DEFAULT_CATEGORY_MULTIPLIER = 0.6;

const MAX_POSSIBLE_SCORE = 0.74;

// ---- 祝日判定 ----

const hd = new Holidays("JP");

export const isHolidayOrWeekend = (dateStr: string): boolean => {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) return true;
  return hd.isHoliday(d) !== false;
};

/**
 * 1施設の1日分の施設スコアを計算する。
 * @param facility  event.facility の文字列値
 * @param category  event.category
 * @param startDate イベント開始日 YYYY-MM-DD
 * @param endDate   イベント終了日 YYYY-MM-DD
 * @returns 施設スコア（未正規化）。未知施設は 0。
 */
export const calcFacilityScore = (
  facility: string,
  category: string,
  startDate: string,
  endDate: string,
): number => {
  const config = FACILITY_CONFIG[facility];
  if (!config) return 0;

  const capacityScore = config.capacity / TOTAL_CAPACITY;
  const catMultiplier = CATEGORY_MULTIPLIER[category] ?? DEFAULT_CATEGORY_MULTIPLIER;

  // 来場パターン係数
  let timePatternFactor: number;
  if (config.pattern === "concentrated") {
    timePatternFactor = 1.0;
  } else {
    const start = new Date(startDate + "T00:00:00Z");
    const end   = new Date(endDate   + "T00:00:00Z");
    const n = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    timePatternFactor = Math.max(0.7 / n, 0.3);
  }

  // dayTypeBonus: startDate の曜日/祝日で判定
  const bonus = isHolidayOrWeekend(startDate) ? config.dayTypeBonus : 1.0;

  return capacityScore * catMultiplier * timePatternFactor * bonus;
};
