import type { EventItem } from "../types";
import { isValidISODate } from "./date";

export type ValidationResult = {
  valid: EventItem[];
  errors: string[];
};

export const validateEvents = (events: EventItem[]) => {
  const errors: string[] = [];
  const valid: EventItem[] = [];
  for (const event of events) {
    const issues: string[] = [];
    if (!event.eventName) issues.push("missing eventName");
    if (!event.facility) issues.push("missing facility");
    if (!event.startDate || !isValidISODate(event.startDate)) issues.push("invalid startDate");
    if (!event.endDate || !isValidISODate(event.endDate)) issues.push("invalid endDate");
    if (event.startDate && event.endDate && event.startDate > event.endDate) {
      issues.push("startDate after endDate");
    }
    if (!event.sourceURL || !/^https?:\/\//.test(event.sourceURL)) issues.push("invalid sourceURL");
    if (issues.length > 0) {
      errors.push(`Invalid event: ${event.eventName || "(no name)"} (${event.facility}) -> ${issues.join(", ")}`);
      continue;
    }
    valid.push(event);
  }
  return { valid, errors } satisfies ValidationResult;
};

export const dedupeEvents = (events: EventItem[]) => {
  const seen = new Set<string>();
  const deduped: EventItem[] = [];
  for (const event of events) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    deduped.push(event);
  }
  return deduped;
};

export const sortEvents = (events: EventItem[]) => {
  return [...events].sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
    return a.eventName.localeCompare(b.eventName);
  });
};

