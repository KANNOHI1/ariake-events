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
  it("maps music keywords", () => {
    expect(mapCategory("ライブ")).toBe("music");
    expect(mapCategory("コンサート2026")).toBe("music");
  });
  it("maps sports keywords", () => {
    expect(mapCategory("Bリーグ")).toBe("sports");
  });
  it("maps exhibition keywords", () => {
    expect(mapCategory("展示会")).toBe("exhibition");
    expect(mapCategory("EXPO 2026")).toBe("exhibition");
  });
  it("maps eventlabel attributes", () => {
    expect(mapCategory("kids")).toBe("other");
    expect(mapCategory("food")).toBe("other");
    expect(mapCategory("exhibition")).toBe("exhibition");
  });
  it("defaults to other", () => {
    expect(mapCategory("キャンペーン")).toBe("other");
    expect(mapCategory(null)).toBe("other");
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
