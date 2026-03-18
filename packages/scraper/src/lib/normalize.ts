import { createHash } from "node:crypto";
import type { EventCategory } from "../types.js";

const FACILITY_SLUG: Record<string, string> = {
  有明ガーデン: "ariake-garden",
  東京ガーデンシアター: "tokyo-garden-theater",
  有明アリーナ: "ariake-arena",
  "TOYOTA ARENA TOKYO": "toyota-arena-tokyo",
  東京ビッグサイト: "tokyo-big-sight",
};

export const normalizeWhitespace = (s: string): string =>
  s.replace(/\s+/g, " ").trim();

export const removeNewTabNotice = (s: string): string =>
  normalizeWhitespace(s.replace(/新規タブで開きます/g, ""));

export const mapCategory = (raw: string | null | undefined): EventCategory => {
  if (!raw) return "other";
  const s = raw.toLowerCase();

  // Music: concerts, live shows, tours
  // Note: フェス(?!タ) excludes フェスタ (which is a festival/event suffix, not a music fest)
  if (/ライブ|コンサート|フェス(?!タ)|ショー|live|music|concert/.test(s))
    return "music";
  if (/ツアー|tour/.test(s)) return "music";

  // Sports: leagues, tournaments, combat sports
  if (/スポーツ|試合|大会|カップ|選手権|sports/.test(s)) return "sports";
  if (/リーグ|league/.test(s)) return "sports"; // B.LEAGUE, D.LEAGUE
  if (/rizin|格闘/.test(s)) return "sports";

  // Exhibition: trade shows, fairs, expos
  // Note: /展/ matches standalone 展 suffix (二次電池展, AI業務自動化展)
  if (/展示|展覧|見本市|expo|exhibition/.test(s)) return "exhibition";
  if (/展/.test(s)) return "exhibition";
  if (/フェア|fair/.test(s)) return "exhibition";
  if (/\bweek\b/.test(s)) return "exhibition"; // Japan IT Week, SMART ENERGY WEEK

  // Kids: children's events (data-eventlabel "kids" + Japanese keywords)
  if (/\bkids\b|キッズ|こども|子ども|子供|乗り物/.test(s)) return "kids";

  // Food: food/beverage events (data-eventlabel "food" + Japanese keywords)
  if (/\bfood\b|フード|食材|グルメ/.test(s)) return "food";

  // Fashion: fashion shows and apparel (data-eventlabel "fashion" + Japanese)
  if (/\bfashion\b|ファッション|アパレル/.test(s)) return "fashion";

  // Anime/Comic: otaku culture events (comic markets, doll shows)
  if (/\bcomic\b|\bdoll\b/.test(s)) return "anime";

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
