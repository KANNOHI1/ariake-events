import { describe, expect, it } from "vitest";
import {
  normalizeWhitespace,
  mapCategory,
  makeEventId,
  removeNewTabNotice,
} from "../../src/lib/normalize.js";

describe("normalizeWhitespace", () => {
  it("collapses whitespace and trims", () => {
    expect(normalizeWhitespace("  hello   world  ")).toBe("hello world");
  });
  it("handles newlines", () => {
    expect(normalizeWhitespace("foo\n\tbar")).toBe("foo bar");
  });
});

describe("removeNewTabNotice", () => {
  it("removes 新規タブで開きます", () => {
    expect(removeNewTabNotice("イベント名新規タブで開きます")).toBe(
      "イベント名",
    );
  });
});

describe("mapCategory", () => {
  // --- music ---
  it("maps Japanese music keywords", () => {
    expect(mapCategory("ライブ")).toBe("music");
    expect(mapCategory("コンサート2026")).toBe("music");
    expect(mapCategory("フェス")).toBe("music");
  });
  it("maps English tour/concert keywords", () => {
    expect(mapCategory("Da-iCE ARENA TOUR 2026 -TERMiNaL-")).toBe("music");
    expect(mapCategory("DREAMS COME TRUE CONCERT TOUR")).toBe("music");
    expect(mapCategory("Seiko Matsuda Concert Tour")).toBe("music");
    expect(mapCategory("Spring Tour 2026")).toBe("music");
  });

  // --- sports ---
  it("maps Japanese sports keywords", () => {
    expect(mapCategory("全国大会")).toBe("sports");
    expect(mapCategory("選手権")).toBe("sports");
    expect(mapCategory("Bリーグ")).toBe("sports"); // preserve existing coverage
  });
  it("maps English league keywords (B.LEAGUE, D.LEAGUE)", () => {
    expect(mapCategory("B.LEAGUE 2025-26シーズン 第25節")).toBe("sports");
    expect(mapCategory("D.LEAGUE 25-26 SEASON ROUND6")).toBe("sports");
  });
  it("maps combat sports (RIZIN)", () => {
    expect(mapCategory("RIZIN.52")).toBe("sports");
  });

  // --- exhibition ---
  it("maps Japanese exhibition keywords", () => {
    expect(mapCategory("展示会")).toBe("exhibition");
    expect(mapCategory("EXPO 2026")).toBe("exhibition");
  });
  it("maps standalone 展 suffix (Tokyo Big Sight trade shows)", () => {
    expect(
      mapCategory("AI/DX営業・マーケティング展 2026 Spring"),
    ).toBe("exhibition");
    expect(
      mapCategory("BATTERY JAPAN【春】～第20回 [国際] 二次電池展～"),
    ).toBe("exhibition");
    expect(mapCategory("第9回 AI・業務自動化 展【春】")).toBe("exhibition");
  });
  it("maps フェア/fair suffix", () => {
    expect(
      mapCategory("インターペット東京～人とペットの豊かな暮らしフェア～"),
    ).toBe("exhibition");
  });
  it("maps week/WEEK trade shows", () => {
    expect(mapCategory("SMART ENERGY WEEK 【春】2026")).toBe("exhibition");
    expect(mapCategory("Japan IT Week 春 2026")).toBe("exhibition");
    expect(mapCategory("EC・店舗 Week 春 2026")).toBe("exhibition");
  });
  it("maps data-eventlabel exhibition", () => {
    expect(mapCategory("exhibition")).toBe("exhibition");
  });

  // --- kids ---
  it("maps data-eventlabel kids", () => {
    expect(mapCategory("kids")).toBe("kids");
  });
  it("maps Japanese kids keywords", () => {
    expect(mapCategory("キッズチャレンジ")).toBe("kids");
    expect(mapCategory("ありあけ乗り物ガーデン")).toBe("kids");
    expect(mapCategory("こども向けイベント")).toBe("kids");
  });

  // --- food ---
  it("maps data-eventlabel food", () => {
    expect(mapCategory("food")).toBe("food");
  });
  it("maps Japanese food keywords", () => {
    expect(mapCategory("フードトラック出店")).toBe("food");
    expect(mapCategory("食材宅配サービス")).toBe("food");
    expect(mapCategory("グルメイベント")).toBe("food"); // グルメ keyword → food
    // Note: "グルメフェスタ" is NOT tested here — フェスタ contains フェス which the music
    // regex matches first. The music regex uses フェス(?!タ) to exclude フェスタ, so
    // グルメフェスタ → "food" is correct, but we use グルメイベント as a cleaner test case.
  });

  // --- fashion ---
  it("maps data-eventlabel fashion", () => {
    expect(mapCategory("fashion")).toBe("fashion");
  });
  it("maps Japanese fashion keywords", () => {
    expect(mapCategory("ファッションワールド春")).toBe("fashion");
    expect(mapCategory("レディースアパレル販売")).toBe("fashion");
  });

  // --- anime ---
  it("maps comic/doll events", () => {
    expect(mapCategory("HARU COMIC CITY 35")).toBe("anime");
    expect(mapCategory("I・Doll VOL.76")).toBe("anime");
  });

  // --- other ---
  it("defaults to other for unclassifiable events", () => {
    expect(mapCategory("キャンペーン")).toBe("other");
    expect(mapCategory("PRイベント")).toBe("other");
    expect(mapCategory(null)).toBe("other");
    expect(mapCategory("")).toBe("other");
  });
});

describe("makeEventId", () => {
  it("generates deterministic id", () => {
    const id1 = makeEventId(
      "有明ガーデン",
      "テスト",
      "2026-03-17",
      "https://example.com",
    );
    const id2 = makeEventId(
      "有明ガーデン",
      "テスト",
      "2026-03-17",
      "https://example.com",
    );
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^ariake-garden-20260317-[0-9a-f]{8}$/);
  });
  it("generates different ids for different events", () => {
    const id1 = makeEventId(
      "有明ガーデン",
      "テストA",
      "2026-03-17",
      "https://example.com",
    );
    const id2 = makeEventId(
      "有明ガーデン",
      "テストB",
      "2026-03-17",
      "https://example.com",
    );
    expect(id1).not.toBe(id2);
  });
});
