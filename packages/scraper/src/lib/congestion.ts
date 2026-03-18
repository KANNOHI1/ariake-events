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
