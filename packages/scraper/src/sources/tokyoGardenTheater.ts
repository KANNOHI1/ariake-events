import cheerio from "cheerio";
import { fetchPageContent } from "../lib/browser.js";
import { parseDateRangeFromText, toISODate } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

const BASE_URL = "https://www.shopping-sumitomo-rd.com";
const LIST_URL = "https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/";

export const tokyoGardenTheaterScraper: FacilityScraper = {
  facility: "東京ガーデンシアター",
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const events = [];

    const eventLinks = new Set<string>();
    const pageQueue: string[] = [LIST_URL];
    const visited = new Set<string>();

    while (pageQueue.length > 0 && visited.size < 24) {
      const url = pageQueue.shift();
      if (!url || visited.has(url)) continue;
      visited.add(url);

      const html = await fetchPageContent(ctx.browser, url);
      const $ = cheerio.load(html);

      $(".list_schedule li a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (full.includes("/tokyo_garden_theater/schedule/")) {
          eventLinks.add(full);
        }
      });

      $("a[href*='/tokyo_garden_theater/schedule/?date=']").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (!visited.has(full)) pageQueue.push(full);
      });

      $(".nav_scheduleMonthPagenation a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (!visited.has(full)) pageQueue.push(full);
      });
    }

    for (const url of Array.from(eventLinks)) {
      try {
        const html = await fetchPageContent(ctx.browser, url);
        const $ = cheerio.load(html);
        const title = normalizeWhitespace($("div.eventTitle").first().text());
        const tag = normalizeWhitespace($("div.tag").first().text());
        const dateText = normalizeWhitespace($("div.data").text());

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

        events.push({
          id: makeEventId("東京ガーデンシアター", title, startDate, url),
          eventName: title,
          facility: "東京ガーデンシアター",
          category: mapCategory(tag),
          startDate,
          endDate,
          peakTimeStart: null,
          peakTimeEnd: null,
          estimatedAttendees: null,
          congestionRisk: null,
          sourceURL: url,
          lastUpdated: ctx.nowISO,
        });
      } catch (error) {
        errors.push(`Failed to scrape ${url}: ${(error as Error).message}`);
      }
    }

    return {
      facility: "東京ガーデンシアター",
      sourceURL: LIST_URL,
      events,
      warnings,
      errors,
    };
  },
};

