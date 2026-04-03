import * as cheerio from "cheerio";
import { toISODate } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type {
  EventItem,
  FacilityScraper,
  ScrapeContext,
  ScrapeResult,
} from "../types.js";

const FACILITY = "有明アリーナ";
const BASE_URL = "https://ariake-arena.tokyo";
const MONTH_URLS = [
  "/event/",
  "/event/next/",
  "/event/two/",
  "/event/three/",
  "/event/last/",
];

/** Parse "M.D DAY" format (e.g., "3.7 SAT") into {month, day} */
const parseDotDate = (text: string): { month: number; day: number } | null => {
  const m = text.match(/(\d{1,2})\.(\d{1,2})/);
  if (!m) return null;
  return { month: +m[1], day: +m[2] };
};

export const parseAriakeArenaEvents = (
  html: string,
  nowISO: string,
  baseYear: number,
): EventItem[] => {
  const $ = cheerio.load(html);
  const events: EventItem[] = [];

  $("ul.event_detail_list > li[id^='detail-']").each((_, el) => {
    const $el = $(el);

    // Event name: prefer event_name p, fall back to sub_title
    const eventNameEl = $el.find("div.event_name p").first();
    const subTitle = normalizeWhitespace(
      $el.find("p.sub_title").first().text(),
    );
    const mainName = normalizeWhitespace(eventNameEl.text());
    const title = subTitle || mainName;
    if (!title) return;

    // Parse dates from spans in event_day
    const dateSpans = $el.find("div.event_day span");
    const dates: Array<{ month: number; day: number }> = [];
    dateSpans.each((_, span) => {
      const text = $(span).text().trim();
      if (!text) return;
      // Handle range format "M.D DAY - M.D DAY" in a single span
      const rangeParts = text.split(/\s*-\s*/);
      for (const part of rangeParts) {
        const parsed = parseDotDate(part.trim());
        if (parsed) dates.push(parsed);
      }
    });

    if (dates.length === 0) return;

    const first = dates[0];
    const last = dates[dates.length - 1];

    // Determine year — if month < current month, it might be next year
    const startYear =
      first.month < new Date(nowISO).getMonth() + 1 - 3
        ? baseYear + 1
        : baseYear;
    const endYear =
      last.month < first.month ? startYear + 1 : startYear;

    const startDate = toISODate(startYear, first.month, first.day);
    const endDate = toISODate(endYear, last.month, last.day);

    // URL from official site link
    const officialUrl = $el.find("tr.url_area a").attr("href") ?? "";
    const sourceURL = officialUrl || `${BASE_URL}/event/`;
    const imgSrc = $el.find("img").not('[src*=".svg"]').first().attr("src") ?? null;
    const imageUrl = imgSrc ?? null;

    const displayName = mainName && subTitle ? `${mainName} ${subTitle}` : title;

    events.push({
      id: makeEventId(FACILITY, displayName, startDate, sourceURL),
      eventName: displayName,
      facility: FACILITY,
      category: mapCategory(displayName),
      startDate,
      endDate,
      peakTimeStart: null,
      peakTimeEnd: null,
      estimatedAttendees: null,
      congestionRisk: null,
      imageUrl,
      sourceURL,
      lastUpdated: nowISO,
    });
  });

  return events;
};

export const ariakeArenaScraper: FacilityScraper = {
  facility: FACILITY,
  sourceURL: `${BASE_URL}/event/`,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    let allEvents: EventItem[] = [];

    const now = new Date(ctx.nowISO);
    const baseYear = now.getFullYear();

    for (const urlPath of MONTH_URLS) {
      const url = `${BASE_URL}${urlPath}`;
      try {
        const html = await ctx.fetchHtml(url);
        const events = parseAriakeArenaEvents(html, ctx.nowISO, baseYear);
        allEvents.push(...events);
      } catch (e) {
        warnings.push(`${urlPath}: ${(e as Error).message}`);
      }
    }

    ctx.log(`${FACILITY}: ${allEvents.length} events from ${MONTH_URLS.length} pages`);

    if (allEvents.length === 0 && warnings.length === 0) {
      warnings.push("No events found across all month pages");
    }

    return {
      facility: FACILITY,
      sourceURL: `${BASE_URL}/event/`,
      events: allEvents,
      warnings,
      errors,
    };
  },
};
