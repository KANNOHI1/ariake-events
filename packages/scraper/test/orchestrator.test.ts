import { describe, expect, it } from "vitest";
import { validateEvents, dedupeEvents, sortEvents } from "../src/lib/validate.js";
import type { EventItem } from "../src/types.js";

const makeEvent = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: "test-20260317-abc12345",
  eventName: "Test Event",
  facility: "Test Facility",
  category: "その他",
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

describe("orchestrator pipeline", () => {
  it("validates → dedupes → sorts correctly", () => {
    const events = [
      makeEvent({ id: "a", startDate: "2026-03-20", endDate: "2026-03-20", eventName: "C Event" }),
      makeEvent({ id: "b", startDate: "2026-03-17", eventName: "A Event" }),
      makeEvent({ id: "a", startDate: "2026-03-20", endDate: "2026-03-20", eventName: "C Event" }), // dupe
      makeEvent({ id: "c", startDate: "2026-03-17", eventName: "B Event" }),
    ];

    const { valid } = validateEvents(events);
    const deduped = dedupeEvents(valid);
    const sorted = sortEvents(deduped);

    expect(deduped).toHaveLength(3); // dupe removed
    expect(sorted[0].eventName).toBe("A Event");
    expect(sorted[1].eventName).toBe("B Event");
    expect(sorted[2].eventName).toBe("C Event");
  });

  it("filters out invalid events without crashing", () => {
    const events = [
      makeEvent({ id: "ok" }),
      makeEvent({ id: "bad", startDate: "not-a-date" }),
      makeEvent({ id: "bad2", eventName: "" }),
    ];

    const { valid, errors } = validateEvents(events);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(2);
  });

  it("handles empty input gracefully", () => {
    const { valid, errors } = validateEvents([]);
    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(0);

    const deduped = dedupeEvents([]);
    expect(deduped).toHaveLength(0);

    const sorted = sortEvents([]);
    expect(sorted).toHaveLength(0);
  });

  it("partial failure: some facilities return events, others fail", () => {
    // Simulates orchestrator collecting results where some have events, some don't
    const results = [
      { events: [makeEvent({ id: "a", facility: "Facility A" })], errors: [] },
      { events: [], errors: ["Timeout"] },
      { events: [makeEvent({ id: "b", facility: "Facility C" })], errors: [] },
    ];

    const allEvents = results.flatMap((r) => r.events);
    const { valid } = validateEvents(allEvents);
    const final = sortEvents(dedupeEvents(valid));

    expect(final).toHaveLength(2);
    const failedCount = results.filter(
      (r) => r.events.length === 0 && r.errors.length > 0,
    ).length;
    expect(failedCount).toBe(1);
    // Total > 0, so exit code should be 0 (not fail)
    expect(final.length).toBeGreaterThan(0);
  });
});
