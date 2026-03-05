import { createHash } from "crypto";

export const facilitySlugMap: Record<string, string> = {
  "有明ガーデン": "ariake-garden",
  "東京ガーデンシアター": "tokyo-garden-theater",
  "有明アリーナ": "ariake-arena",
  "TOYOTA ARENA TOKYO": "toyota-arena-tokyo",
  "東京ビッグサイト": "tokyo-big-sight",
};

export const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

export const removeNewTabNotice = (value: string) =>
  normalizeWhitespace(value.replace(/新規タブで開きます/g, "").replace(/\s*\u25a1\s*/g, ""));

export const mapCategory = (raw: string | null | undefined) => {
  if (!raw) return "other";
  if (/ライブ|コンサート|音楽|ショー|フェス|LIVE/i.test(raw)) return "music";
  if (/スポーツ|リーグ|試合|大会|カップ|選手権/i.test(raw)) return "sports";
  if (/展示|展覧|エキシビション|見本市|EXPO/i.test(raw)) return "exhibition";
  return "other";
};

export const makeEventId = (facility: string, eventName: string, startDate: string, sourceURL: string) => {
  const slug = facilitySlugMap[facility] ?? "facility";
  const hash = createHash("sha1")
    .update(`${facility}|${eventName}|${startDate}|${sourceURL}`)
    .digest("hex")
    .slice(0, 8);
  return `${slug}-${startDate.replace(/-/g, "")}-${hash}`;
};

