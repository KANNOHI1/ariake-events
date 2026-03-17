import * as cheerio from "cheerio";
import { parseDateRange } from "../lib/date.js";
import {
  makeEventId,
  mapCategory,
  normalizeWhitespace,
  removeNewTabNotice,
} from "../lib/normalize.js";
import type {
  EventItem,
  FacilityScraper,
  ScrapeContext,
  ScrapeResult,
} from "../types.js";

const FACILITY = "東京ビッグサイト";
const LIST_URL = "https://www.bigsight.jp/visitor/event/";
const PAGE_URL = "https://www.bigsight.jp/visitor/event/search.php?page=";

export const parseTokyoBigSightEvents = (
  html: string,
  nowISO: string,
): EventItem[] => {
  const $ = cheerio.load(html);
  const events: EventItem[] = [];

  $("article.lyt-event-01").each((_, el) => {
    const $el = $(el);
    const titleEl = $el.find("h3.hdg-01 a").first();
    const rawTitle = normalizeWhitespace(titleEl.text());
    const title = removeNewTabNotice(rawTitle);
    if (!title) return;

    // Extract info from dl.list-01
    const info: Record<string, string> = {};
    $el.find("dl.list-01 div").each((_, row) => {
      const dt = normalizeWhitespace($(row).find("dt").first().text());
      const dd = normalizeWhitespace($(row).find("dd").first().text());
      if (dt) info[dt] = dd;
    });

    const dateText = info["開催期間"] ?? "";
    const range = parseDateRange(dateText);
    if (!range) return;

    // Get URL: prefer explicit URL field, fallback to title link
    const urlDd = $el
      .find("dt")
      .filter((_, dt) => $(dt).text().trim() === "URL")
      .first()
      .next("dd")
      .find("a")
      .attr("href");
    const titleHref = titleEl.attr("href");
    const rawUrl = urlDd ?? titleHref ?? LIST_URL;
    const sourceURL = rawUrl.startsWith("http")
      ? rawUrl
      : `https://www.bigsight.jp${rawUrl}`;

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

export const tokyoBigSightScraper: FacilityScraper = {
  facility: FACILITY,
  sourceURL: LIST_URL,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    let allEvents: EventItem[] = [];

    try {
      // First page
      const firstHtml = await ctx.fetchHtml(LIST_URL);
      allEvents.push(...parseTokyoBigSightEvents(firstHtml, ctx.nowISO));

      // Detect max page from pagination links
      const $ = cheerio.load(firstHtml);
      let maxPage = 1;
      $("a[href*='search.php?page=']").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        const m = href.match(/page=(\d+)/);
        if (m) maxPage = Math.max(maxPage, +m[1]);
      });
      maxPage = Math.min(maxPage, 10); // safety cap

      // Remaining pages
      for (let page = 2; page <= maxPage; page++) {
        try {
          const html = await ctx.fetchHtml(`${PAGE_URL}${page}`);
          allEvents.push(...parseTokyoBigSightEvents(html, ctx.nowISO));
        } catch (e) {
          warnings.push(`Page ${page}: ${(e as Error).message}`);
        }
      }

      ctx.log(`${FACILITY}: ${allEvents.length} events from ${maxPage} pages`);
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
