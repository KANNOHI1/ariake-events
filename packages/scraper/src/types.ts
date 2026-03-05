export type EventItem = {
  id: string;
  eventName: string;
  facility: string;
  category: string;
  startDate: string;
  endDate: string;
  peakTimeStart: string | null;
  peakTimeEnd: string | null;
  estimatedAttendees: number | null;
  congestionRisk: number | null;
  sourceURL: string;
  lastUpdated: string;
};

export type ScrapeResult = {
  facility: string;
  sourceURL: string;
  events: EventItem[];
  warnings: string[];
  errors: string[];
};

export type ScrapeContext = {
  nowISO: string;
  nowDate: Date;
  timezone: string;
  browser: import('playwright').Browser;
  log: (message: string) => void;
};

export type FacilityScraper = {
  facility: string;
  run: (ctx: ScrapeContext) => Promise<ScrapeResult>;
};

