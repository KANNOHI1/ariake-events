import cheerio from "cheerio";
import { fetchPageContent } from "../lib/browser.js";
import { parseDateRangeFromText, toISODate } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

const LIST_URL = "https://www.shopping-sumitomo-rd.com/ariake/event/";
const BASE_URL = "https://www.shopping-sumitomo-rd.com";

export const ariakeGardenScraper: FacilityScraper = {
  facility: "有明ガーデン",
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const events = [];

    const listHtml = await fetchPageContent(ctx.browser, LIST_URL);
    const $list = cheerio.load(listHtml);
    const linkSet = new Set<string>();
    $list("a[href^='/ariake/event/detail/']").each((_, el) => {
      const href = $list(el).attr("href");
      if (!href) return;
      const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      linkSet.add(full);
    });

    for (const url of Array.from(linkSet)) {
      try {
        const html = await fetchPageContent(ctx.browser, url);
        const $ = cheerio.load(html);
        const title = normalizeWhitespace($("div.event_title").first().text());
        const dateText = normalizeWhitespace($("div.date").first().text());
        const categoryRaw = normalizeWhitespace($("div.genre span.active").first().text()) ||
          normalizeWhitespace($("div.genre span").first().text());

        if (!title) {
          warnings.push(`Missing title: ${url}`);
          continue;
        }

        const range = parseDateRangeFromText(dateText);
        if (!range) {
          warnings.push(`Unable to parse date: ${title} (${url})`);
          continue;
        }

        const startDate = toISODate(range.start);
        const endDate = toISODate(range.end);

        const event = {
          id: makeEventId("有明ガーデン", title, startDate, url),
          eventName: title,
          facility: "有明ガーデン",
          category: mapCategory(categoryRaw),
          startDate,
          endDate,
          peakTimeStart: null,
          peakTimeEnd: null,
          estimatedAttendees: null,
          congestionRisk: null,
          sourceURL: url,
          lastUpdated: ctx.nowISO,
        };
        events.push(event);
      } catch (error) {
        errors.push(`Failed to scrape ${url}: ${(error as Error).message}`);
      }
    }

    return {
      facility: "有明ガーデン",
      sourceURL: LIST_URL,
      events,
      warnings,
      errors,
    };
  },
};

