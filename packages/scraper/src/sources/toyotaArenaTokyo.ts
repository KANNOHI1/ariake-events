import cheerio from "cheerio";
import { DateTime } from "luxon";
import { fetchPageContent } from "../lib/browser.js";
import { toISODate } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

const BASE_URL = "https://www.toyota-arena-tokyo.jp";
const LIST_URL = `${BASE_URL}/events/`;
const pad2 = (value: number) => value.toString().padStart(2, "0");

export const toyotaArenaTokyoScraper: FacilityScraper = {
  facility: "TOYOTA ARENA TOKYO",
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const events = [];

    const base = DateTime.fromJSDate(ctx.nowDate, { zone: ctx.timezone }).startOf("month");
    for (let i = 0; i < 6; i += 1) {
      const targetDate = base.plus({ months: i });
      const year = targetDate.year;
      const month = targetDate.month;
      const url = `${LIST_URL}?year=${year}&month=${pad2(month)}`;

      try {
        const html = await fetchPageContent(ctx.browser, url);
        const $ = cheerio.load(html);
        const monthEvents = [];

        $("li").each((_, el) => {
          const dateSpan = $(el)
            .find("span")
            .filter((_, span) => /20\d{2}\.\d{1,2}\.\d{1,2}/.test($(span).text()))
            .first();
          const dateText = normalizeWhitespace(dateSpan.text());
          const dateMatch = dateText.match(/(20\d{2})\.(\d{1,2})\.(\d{1,2})/);
          if (!dateMatch) return;

          const titleNode = $(el)
            .find("p")
            .filter((_, p) => $(p).text().trim().length > 0)
            .first();
          let title = normalizeWhitespace(titleNode.text());
          if (!title) return;
          if (title.includes("アーティスト")) {
            title = normalizeWhitespace(title.split("アーティスト")[0]);
          }

          const href = $(el).find("a").first().attr("href") || "";
          const sourceURL = href.startsWith("http") ? href : `${BASE_URL}${href}`;

          const startDate = toISODate({
            year: Number(dateMatch[1]),
            month: Number(dateMatch[2]),
            day: Number(dateMatch[3]),
          });

          const event = {
            id: makeEventId("TOYOTA ARENA TOKYO", title, startDate, sourceURL),
            eventName: title,
            facility: "TOYOTA ARENA TOKYO",
            category: mapCategory(title),
            startDate,
            endDate: startDate,
            peakTimeStart: null,
            peakTimeEnd: null,
            estimatedAttendees: null,
            congestionRisk: null,
            sourceURL,
            lastUpdated: ctx.nowISO,
          };

          monthEvents.push(event);
        });

        if (monthEvents.length === 0) {
          ctx.log(`TOYOTA ARENA TOKYO ${year}年${month}月: イベントなし`);
        } else {
          ctx.log(`TOYOTA ARENA TOKYO ${year}年${month}月: ${monthEvents.length}件`);
          events.push(...monthEvents);
        }
      } catch (error) {
        errors.push(`Failed to scrape ${url}: ${(error as Error).message}`);
      }
    }

    return {
      facility: "TOYOTA ARENA TOKYO",
      sourceURL: LIST_URL,
      events,
      warnings,
      errors,
    };
  },
};
