import type { EventItem } from "../types.js";
import { isValidISODate } from "./date.js";

export type ValidationResult = {
  valid: EventItem[];
  errors: string[];
};

export const validateEvents = (events: EventItem[]): ValidationResult => {
  const valid: EventItem[] = [];
  const errors: string[] = [];

  for (const e of events) {
    const issues: string[] = [];
    if (!e.eventName) issues.push("missing eventName");
    if (!e.facility) issues.push("missing facility");
    if (!e.startDate || !isValidISODate(e.startDate))
      issues.push("invalid startDate");
    if (!e.endDate || !isValidISODate(e.endDate))
      issues.push("invalid endDate");
    if (e.startDate && e.endDate && e.startDate > e.endDate)
      issues.push("startDate > endDate");
    if (!e.sourceURL || !/^https?:\/\//.test(e.sourceURL))
      issues.push("invalid sourceURL");

    if (issues.length > 0) {
      errors.push(
        `[${e.facility}] ${e.eventName || "(no name)"}: ${issues.join(", ")}`,
      );
    } else {
      valid.push(e);
    }
  }
  return { valid, errors };
};

export const dedupeEvents = (events: EventItem[]): EventItem[] => {
  const seen = new Set<string>();
  return events.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
};

export const sortEvents = (events: EventItem[]): EventItem[] =>
  [...events].sort((a, b) =>
    a.startDate !== b.startDate
      ? a.startDate.localeCompare(b.startDate)
      : a.eventName.localeCompare(b.eventName),
  );
