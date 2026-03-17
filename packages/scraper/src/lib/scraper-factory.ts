import type {
  EventItem,
  FacilityScraper,
  ScrapeContext,
  ScrapeResult,
} from "../types.js";

type ParseFn = (html: string, nowISO: string) => EventItem[];

/** Create a single-page scraper from a parse function. */
export const makeScraper = (
  facility: string,
  sourceURL: string,
  parseFn: ParseFn,
): FacilityScraper => ({
  facility,
  sourceURL,
  run: async (ctx: ScrapeContext): Promise<ScrapeResult> => {
    const warnings: string[] = [];
    const errors: string[] = [];
    try {
      const html = await ctx.fetchHtml(sourceURL);
      const events = parseFn(html, ctx.nowISO);
      if (events.length === 0) warnings.push("No events found on list page");
      return { facility, sourceURL, events, warnings, errors };
    } catch (error) {
      errors.push(`Failed: ${(error as Error).message}`);
      return { facility, sourceURL, events: [], warnings, errors };
    }
  },
});
