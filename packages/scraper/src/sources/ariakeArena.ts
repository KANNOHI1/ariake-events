import cheerio from "cheerio";
import { fetchPageContent } from "../lib/browser.js";
import { toISODate } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace } from "../lib/normalize.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

const URLS = [
  "https://ariake-arena.tokyo/event/",
  "https://ariake-arena.tokyo/event/next/",
  "https://ariake-arena.tokyo/event/two/",
  "https://ariake-arena.tokyo/event/three/",
  "https://ariake-arena.tokyo/event/last/",
];

const parseMonthDay = (text: string) => {
  const match = text.match(/(\d{1,2})\.(\d{1,2})/);
  if (!match) return null;
  return { month: Number(match[1]), day: Number(match[2]) };
};

export const ariakeArenaScraper: FacilityScraper = {
  facility: "有明アリーナ",
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const events = [];

    for (const url of URLS) {
      try {
        const html = await fetchPageContent(ctx.browser, url);
        const $ = cheerio.load(html);
        const active = $(".event_tab_menu li.active");
        const year = Number(active.find("span.year").first().text()) || new Date(ctx.nowDate).getUTCFullYear();
        const activeMonth = Number(active.find("span.month_number").first().text()) || new Date(ctx.nowDate).getUTCMonth() + 1;

        $("ul.event_detail_list > li").each((_, el) => {
          const dateSpans = $(el).find("div.event_day span");
          const startText = normalizeWhitespace(dateSpans.eq(0).text());
          const endText = normalizeWhitespace(dateSpans.eq(1).text());
          const startMD = parseMonthDay(startText);
          const endMD = parseMonthDay(endText || startText);
          if (!startMD || !endMD) {
            warnings.push(`Unable to parse date in ${url}`);
            return;
          }

          let startYear = year;
          let endYear = year;
          if (startMD.month > activeMonth && endMD.month <= activeMonth) {
            startYear = year - 1;
          }
          if (endMD.month < startMD.month) {
            endYear = startYear + 1;
          }

          const startDate = toISODate({ year: startYear, month: startMD.month, day: startMD.day });
          const endDate = toISODate({ year: endYear, month: endMD.month, day: endMD.day });

          const subTitle = normalizeWhitespace($(el).find("p.sub_title").first().text());
          const mainTitle = normalizeWhitespace($(el).find("div.event_name p").first().text());
          const title = subTitle || mainTitle;
          if (!title) {
            warnings.push(`Missing title in ${url}`);
            return;
          }

          const sourceLink = normalizeWhitespace($(el).find("tr.url_area a, a.other_link").first().attr("href") || "");
          const sourceURL = sourceLink && sourceLink.startsWith("http") ? sourceLink : url;

          events.push({
            id: makeEventId("有明アリーナ", title, startDate, sourceURL),
            eventName: title,
            facility: "有明アリーナ",
            category: mapCategory(title),
            startDate,
            endDate,
            peakTimeStart: null,
            peakTimeEnd: null,
            estimatedAttendees: null,
            congestionRisk: null,
            sourceURL,
            lastUpdated: ctx.nowISO,
          });
        });
      } catch (error) {
        errors.push(`Failed to scrape ${url}: ${(error as Error).message}`);
      }
    }

    return {
      facility: "有明アリーナ",
      sourceURL: URLS[0],
      events,
      warnings,
      errors,
    };
  },
};

