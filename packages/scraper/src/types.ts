export type EventItem = {
  id: string;
  eventName: string;
  facility: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  peakTimeStart: string | null;
  peakTimeEnd: string | null;
  estimatedAttendees: number | null;
  congestionRisk: number | null;
  sourceURL: string;
  lastUpdated: string; // ISO 8601
};

export type ScrapeResult = {
  facility: string;
  sourceURL: string;
  events: EventItem[];
  warnings: string[];
  errors: string[];
};

export type FacilityScraper = {
  facility: string;
  sourceURL: string;
  run: (ctx: ScrapeContext) => Promise<ScrapeResult>;
};

import type { Page } from "playwright";

export type ScrapeContext = {
  nowISO: string;
  timezone: string;
  fetchHtml: (url: string) => Promise<string>;
  /** Create a Playwright Page for direct browser interaction */
  newPage: () => Promise<Page>;
  log: (message: string) => void;
};
