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

    const page = await ctx.newPage();
    try {
      await page.goto(LIST_URL, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });

      // Parse current month (SSR + hydrated)
      allEvents.push(
        ...parseToyotaArenaTokyoEvents(await page.content(), ctx.nowISO),
      );

      // Find future month buttons: all month buttons after the active one
      // Active month has bg-black class, future months have bg-gray-f5
      // Buttons contain spans with year (opacity-70) and month text
      const futureButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const monthButtons = buttons.filter((btn) => {
          const text = btn.textContent ?? "";
          return /\d{4}\D*\d{1,2}月/.test(text);
        });

        let foundActive = false;
        const futureIndices: number[] = [];
        monthButtons.forEach((btn, idx) => {
          if (btn.className.includes("bg-black")) {
            foundActive = true;
            return;
          }
          if (foundActive) {
            futureIndices.push(idx);
          }
        });
        return futureIndices;
      });

      ctx.log(
        `${FACILITY}: ${futureButtons.length} future month buttons found`,
      );

      // Click each future month button and collect events
      for (let i = 0; i < futureButtons.length; i++) {
        try {
          // Re-query buttons each time (DOM may change after click)
          const clicked = await page.evaluate((targetIdx) => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const monthButtons = buttons.filter((btn) => {
              const text = btn.textContent ?? "";
              return /\d{4}\D*\d{1,2}月/.test(text);
            });
            const btn = monthButtons[targetIdx];
            if (btn) {
              btn.click();
              return true;
            }
            return false;
          }, futureButtons[i]);

          if (!clicked) break;

          // Wait for content to update
          await page.waitForTimeout(2000);
          const html = await page.content();
          const events = parseToyotaArenaTokyoEvents(html, ctx.nowISO);
          allEvents.push(...events);
        } catch {
          warnings.push(`Failed to click month button ${i + 1}`);
          break;
        }
      }

      if (allEvents.length === 0) {
        warnings.push("No events found");
      }

      ctx.log(`${FACILITY}: ${allEvents.length} events total`);
    } catch (error) {
      errors.push(`Failed: ${(error as Error).message}`);
    } finally {
      await page.close();
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
