import cheerio from "cheerio";
import { fetchPageContent } from "../lib/browser.js";
import { parseDateRangeFromText, toISODate } from "../lib/date.js";
import { makeEventId, mapCategory, normalizeWhitespace, removeNewTabNotice } from "../lib/normalize.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "../types.js";

const LIST_URL = "https://www.bigsight.jp/visitor/event/";
const PAGE_URL = "https://www.bigsight.jp/visitor/event/search.php?page=";

export const tokyoBigSightScraper: FacilityScraper = {
  facility: "東京ビッグサイト",
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const events = [];

    const listHtml = await fetchPageContent(ctx.browser, LIST_URL);
    const $list = cheerio.load(listHtml);
    let maxPage = 1;
    $list("a[href*='search.php?page=']").each((_, el) => {
      const href = $list(el).attr("href") || "";
      const match = href.match(/page=(\d+)/);
      if (match) {
        maxPage = Math.max(maxPage, Number(match[1]));
      }
    });
    maxPage = Math.min(maxPage, 10);

    const parsePage = (html: string) => {
      const $ = cheerio.load(html);
      $("article.lyt-event-01").each((_, el) => {
        const titleAnchor = $(el).find("h3.hdg-01 a").first();
        const rawTitle = normalizeWhitespace(titleAnchor.text());
        const title = removeNewTabNotice(rawTitle);
        if (!title) return;

        const info: Record<string, string> = {};
        $(el)
          .find("dl.list-01 div")
          .each((_, row) => {
            const dt = normalizeWhitespace($(row).find("dt").first().text());
            const dd = normalizeWhitespace($(row).find("dd").first().text());
            if (dt) info[dt] = dd;
          });

        const dateText = info["開催期間"] || "";
        const range = parseDateRangeFromText(dateText);
        if (!range) {
          warnings.push(`Unable to parse date: ${title}`);
          return;
        }

        const urlLink = $(el).find("dt:contains('URL')").next("dd").find("a").attr("href") || titleAnchor.attr("href") || LIST_URL;
        const sourceURL = urlLink.startsWith("http") ? urlLink : `https://www.bigsight.jp${urlLink}`;

        const startDate = toISODate(range.start);
        const endDate = toISODate(range.end);

        events.push({
          id: makeEventId("東京ビッグサイト", title, startDate, sourceURL),
          eventName: title,
          facility: "東京ビッグサイト",
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
    };

    parsePage(listHtml);
    for (let page = 2; page <= maxPage; page += 1) {
      try {
        const html = await fetchPageContent(ctx.browser, `${PAGE_URL}${page}`);
        parsePage(html);
      } catch (error) {
        warnings.push(`Failed to load page ${page}: ${(error as Error).message}`);
      }
    }

    return {
      facility: "東京ビッグサイト",
      sourceURL: LIST_URL,
      events,
      warnings,
      errors,
    };
  },
};

