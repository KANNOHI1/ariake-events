import * as cheerio from "cheerio";
import { parseDateRange } from "../lib/date.js";
import {
  makeEventId,
  mapCategory,
  normalizeWhitespace,
} from "../lib/normalize.js";
import { makeScraper } from "../lib/scraper-factory.js";
import type { EventItem } from "../types.js";

const FACILITY = "有明ガーデン";
const LIST_URL = "https://www.shopping-sumitomo-rd.com/ariake/event/";
const BASE_URL = "https://www.shopping-sumitomo-rd.com";

export const parseAriakeGardenEvents = (
  html: string,
  nowISO: string,
): EventItem[] => {
  const $ = cheerio.load(html);
  const events: EventItem[] = [];

  $("a.card_wrap").each((_, el) => {
    const $el = $(el);
    const title = normalizeWhitespace(
      $el.find("h3.font_gothic.leader_01").first().text(),
    );
    if (!title) return;

    const href = $el.attr("href") ?? "";
    const sourceURL = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    // Extract dates from time[datetime] elements
    const times = $el.find("time[datetime]");
    const startRaw = times.eq(0).attr("datetime") ?? "";
    const endRaw =
      times.length > 1
        ? (times.eq(1).attr("datetime") ?? startRaw)
        : startRaw;

    const startRange = parseDateRange(startRaw);
    const endRange = parseDateRange(endRaw);
    if (!startRange || !endRange) return;

    const startDate = startRange.start;
    const endDate = endRange.start;

    // Categories from data-eventlabel spans
    const labels: string[] = [];
    $el.find("span[data-eventlabel]").each((_, span) => {
      labels.push($(span).attr("data-eventlabel") ?? "");
    });
    const category = mapCategory(labels.join(" "));

    const imgSrc = $el.find('.card_img_area img.lazy').first().attr('data-original') ?? ''
    const imageUrl = imgSrc ? `${BASE_URL}${imgSrc}` : null

    events.push({
      id: makeEventId(FACILITY, title, startDate, sourceURL),
      eventName: title,
      facility: FACILITY,
      category,
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

export const ariakeGardenScraper = makeScraper(
  FACILITY,
  LIST_URL,
  parseAriakeGardenEvents,
);
