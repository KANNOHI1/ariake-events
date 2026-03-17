import { createHash } from "node:crypto";

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

export const mapCategory = (raw: string | null | undefined): string => {
  if (!raw) return "other";
  const s = raw.toLowerCase();
  if (/ライブ|コンサート|音楽|ショー|フェス|live|music/.test(s))
    return "music";
  if (/スポーツ|リーグ|試合|大会|カップ|選手権|sports/.test(s))
    return "sports";
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
