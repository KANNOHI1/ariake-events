import type { EventItem } from "../types";

export const countByFacility = (events: EventItem[]) => {
  return events.reduce<Record<string, number>>((acc, event) => {
    acc[event.facility] = (acc[event.facility] ?? 0) + 1;
    return acc;
  }, {});
};

export const detectCountDrops = (previous: EventItem[], current: EventItem[]) => {
  const warnings: string[] = [];
  const prevCounts = countByFacility(previous);
  const currCounts = countByFacility(current);
  for (const facility of Object.keys(prevCounts)) {
    const prev = prevCounts[facility] ?? 0;
    const curr = currCounts[facility] ?? 0;
    if (prev < 5) continue;
    if (curr <= Math.floor(prev * 0.1)) {
      warnings.push(`Event count drop >= 90% for ${facility}: ${prev} -> ${curr}`);
    }
  }
  return warnings;
};

