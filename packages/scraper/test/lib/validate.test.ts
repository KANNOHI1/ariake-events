import { describe, expect, it } from "vitest";
import {
  validateEvents,
  dedupeEvents,
  sortEvents,
} from "../../src/lib/validate.js";
import type { EventItem } from "../../src/types.js";

const makeEvent = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: "test-20260317-abc12345",
  eventName: "テストイベント",
  facility: "有明ガーデン",
  category: "other",
  startDate: "2026-03-17",
  endDate: "2026-03-17",
  peakTimeStart: null,
  peakTimeEnd: null,
  estimatedAttendees: null,
  congestionRisk: null,
  sourceURL: "https://example.com",
  lastUpdated: "2026-03-17T00:00:00Z",
  ...overrides,
});

describe("validateEvents", () => {
  it("accepts valid event", () => {
    const { valid, errors } = validateEvents([makeEvent()]);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });
  it("rejects event missing eventName", () => {
    const { valid, errors } = validateEvents([makeEvent({ eventName: "" })]);
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });
  it("rejects event with startDate after endDate", () => {
    const { valid } = validateEvents([
      makeEvent({ startDate: "2026-03-20", endDate: "2026-03-17" }),
    ]);
    expect(valid).toHaveLength(0);
  });
  it("rejects invalid sourceURL", () => {
    const { valid } = validateEvents([makeEvent({ sourceURL: "not-a-url" })]);
    expect(valid).toHaveLength(0);
  });
});

describe("dedupeEvents", () => {
  it("removes duplicate ids", () => {
    const events = [
      makeEvent(),
      makeEvent(),
      makeEvent({ id: "different-id" }),
    ];
    expect(dedupeEvents(events)).toHaveLength(2);
  });
});

describe("sortEvents", () => {
  it("sorts by startDate then eventName", () => {
    const events = [
      makeEvent({ startDate: "2026-03-20", eventName: "B" }),
      makeEvent({ startDate: "2026-03-17", eventName: "Z" }),
      makeEvent({ startDate: "2026-03-17", eventName: "A" }),
    ];
    const sorted = sortEvents(events);
    expect(sorted.map((e) => e.eventName)).toEqual(["A", "Z", "B"]);
  });
});
