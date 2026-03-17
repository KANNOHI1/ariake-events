import * as cheerio from "cheerio";
import { parseDateRange } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type {
  EventItem,
  FacilityScraper,
  ScrapeContext,
  ScrapeResult,
} from "../types.js";

const FACILITY = "TOYOTA ARENA TOKYO";
const BASE_URL = "https://toyota-arena-tokyo.jp";
const LIST_URL = `${BASE_URL}/events/`;

export const parseToyotaArenaTokyoEvents = (
  html: string,
  nowISO: string,
): EventItem[] => {
  const $ = cheerio.load(html);
  const events: EventItem[] = [];

  $("li.bg-gray-f5").each((_, el) => {
    const $li = $(el);

    // Title: from img[alt] (most reliable) or first substantial text
    const imgAlt = $li.find("img[alt]").first().attr("alt") ?? "";
    const title = normalizeWhitespace(imgAlt);
    if (!title || title.length < 3) return;

    // Date: look for YYYY.M.D pattern in spans or any descendant
    let dateText = "";
    $li.find("span, p, div").each((_, el) => {
      const text = $(el).text().trim();
      if (/\d{4}\.\d{1,2}\.\d{1,2}/.test(text) && text.length < 60) {
        dateText = text;
        return false; // break
      }
    });

    const range = parseDateRange(dateText);
    if (!range) return;

    // Event detail URL
    const eventHref =
      $li.find("a[href^='/events/']").first().attr("href") ?? "";
    const sourceURL =
      eventHref && eventHref !== "/events/"
        ? `${BASE_URL}${eventHref}`
        : LIST_URL;

    events.push({
      id: makeEventId(FACILITY, title, range.start, sourceURL),
      eventName: title,
      facility: FACILITY,
      category: mapCategory(title),
      startDate: range.start,
      endDate: range.end,
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

export const toyotaArenaTokyoScraper: FacilityScraper = {
  facility: FACILITY,
  sourceURL: LIST_URL,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    let allEvents: EventItem[] = [];

    // The page shows one month at a time, defaulting to current month.
    // Fetch current month page (contains all visible events via SSR).
    try {
      const html = await ctx.fetchHtml(LIST_URL);
      allEvents = parseToyotaArenaTokyoEvents(html, ctx.nowISO);
      ctx.log(`${FACILITY}: ${allEvents.length} events from main page`);

      if (allEvents.length === 0) {
        warnings.push("No events found on main page");
      }
    } catch (error) {
      errors.push(`Failed: ${(error as Error).message}`);
    }

    return {
      facility: FACILITY,
      sourceURL: LIST_URL,
      events: allEvents,
      warnings,
      errors,
    };
  },
};
