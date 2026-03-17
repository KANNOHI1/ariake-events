import * as cheerio from "cheerio";
import { toISODate } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type {
  EventItem,
  FacilityScraper,
  ScrapeContext,
  ScrapeResult,
} from "../types.js";

const FACILITY = "東京ガーデンシアター";
const BASE_URL = "https://www.shopping-sumitomo-rd.com";
const LIST_URL = `${BASE_URL}/tokyo_garden_theater/schedule/`;

export const parseTokyoGardenTheaterEvents = (
  html: string,
  nowISO: string,
  baseYear: number,
): EventItem[] => {
  const $ = cheerio.load(html);
  const events: EventItem[] = [];

  $("li[class*='event_all']").each((_, el) => {
    const $li = $(el);

    // Title: prefer div.title, fall back to div.player
    const titleText = normalizeWhitespace($li.find("div.title").text());
    const playerText = normalizeWhitespace($li.find("div.player").text());
    const title = titleText || playerText;
    if (!title) return;

    // Date: div.m = month, div.d = day (inside div.ymd)
    const monthText = $li.find("div.m").first().text().trim();
    const dayText = $li.find("div.d").first().text().trim();
    const month = parseInt(monthText, 10);
    const day = parseInt(dayText, 10);
    if (!month || !day) return;

    // Determine year from context
    const year = month < new Date(nowISO).getMonth() + 1 - 3
      ? baseYear + 1
      : baseYear;

    const startDate = toISODate(year, month, day);
    const endDate = startDate; // Single-day events

    // Category from class name or tag element
    const liClass = $li.attr("class") ?? "";
    const tagText = normalizeWhitespace($li.find("div.tag").text());
    const category = mapCategory(tagText || liClass);

    // URL
    const href = $li.find("a").first().attr("href") ?? "";
    const sourceURL = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    // Full display name: combine player + title if both exist
    const displayName =
      titleText && playerText ? `${playerText} ${titleText}` : title;

    events.push({
      id: makeEventId(FACILITY, displayName, startDate, sourceURL),
      eventName: displayName,
      facility: FACILITY,
      category,
      startDate,
      endDate,
      peakTimeStart: null,
      peakTimeEnd: null,
      estimatedAttendees: null,
      congestionRisk: null,
      sourceURL,
      lastUpdated: nowISO,
    });
  });

  return events;
};

export const tokyoGardenTheaterScraper: FacilityScraper = {
  facility: FACILITY,
  sourceURL: LIST_URL,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];

    const now = new Date(ctx.nowISO);
    const baseYear = now.getFullYear();

    try {
      const html = await ctx.fetchHtml(LIST_URL);
      const events = parseTokyoGardenTheaterEvents(html, ctx.nowISO, baseYear);

      if (events.length === 0) {
        warnings.push("No events found on schedule page");
      }

      ctx.log(`${FACILITY}: ${events.length} events`);
      return { facility: FACILITY, sourceURL: LIST_URL, events, warnings, errors };
    } catch (error) {
      errors.push(`Failed: ${(error as Error).message}`);
      return { facility: FACILITY, sourceURL: LIST_URL, events: [], warnings, errors };
    }
  },
};
