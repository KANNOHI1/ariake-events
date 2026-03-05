import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { chromium } from "playwright";
import { DateTime } from "luxon";

import { OUTPUT_PATH, PACKAGE_ROOT, TIMEZONE } from "./config.js";
import { createLogger } from "./lib/logger.js";
import { detectCountDrops } from "./lib/diff.js";
import { dedupeEvents, sortEvents, validateEvents } from "./lib/validate.js";
import { getEmailConfig, sendEmail } from "./lib/email.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "./types.js";
import {
  ariakeArenaScraper,
  ariakeGardenScraper,
  tokyoBigSightScraper,
  tokyoGardenTheaterScraper,
  toyotaArenaTokyoScraper,
} from "./sources/index.js";

const SCRAPERS: FacilityScraper[] = [
  ariakeGardenScraper,
  tokyoGardenTheaterScraper,
  ariakeArenaScraper,
  toyotaArenaTokyoScraper,
  tokyoBigSightScraper,
];

dotenv.config({ path: path.join(PACKAGE_ROOT, ".env") });

const readPreviousEvents = async () => {
  try {
    const data = await fs.readFile(OUTPUT_PATH, "utf-8");
    return JSON.parse(data) as unknown[];
  } catch {
    return [];
  }
};

const runWithRetries = async (scraper: FacilityScraper, ctx: ScrapeContext, retries = 3): Promise<ScrapeResult> => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      ctx.log(`Scraping ${scraper.facility} (attempt ${attempt}/${retries})`);
      return await scraper.run(ctx);
    } catch (error) {
      ctx.log(`Error on ${scraper.facility} attempt ${attempt}: ${(error as Error).message}`);
      if (attempt === retries) {
        return {
          facility: scraper.facility,
          sourceURL: "",
          events: [],
          warnings: [],
          errors: [`Failed after ${retries} attempts: ${(error as Error).message}`],
        };
      }
    }
  }
  return {
    facility: scraper.facility,
    sourceURL: "",
    events: [],
    warnings: [],
    errors: ["Unknown retry failure"],
  };
};

const formatReport = (results: ScrapeResult[], warnings: string[], errors: string[]) => {
  const lines: string[] = [];
  lines.push("Ariake Events Scraper Report");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  for (const result of results) {
    lines.push(`${result.facility}: ${result.events.length} events`);
    if (result.errors.length > 0) {
      lines.push(`  Errors: ${result.errors.join(" | ")}`);
    }
    if (result.warnings.length > 0) {
      lines.push(`  Warnings: ${result.warnings.join(" | ")}`);
    }
  }
  if (warnings.length > 0) {
    lines.push("");
    lines.push("Global warnings:");
    warnings.forEach((warning) => lines.push(`- ${warning}`));
  }
  if (errors.length > 0) {
    lines.push("");
    lines.push("Global errors:");
    errors.forEach((error) => lines.push(`- ${error}`));
  }
  return lines.join("\n");
};

const main = async () => {
  const log = createLogger();
  const now = DateTime.now().setZone(TIMEZONE);
  const nowISO = now.toUTC().toISO({ suppressMilliseconds: true }) ?? new Date().toISOString();

  const browser = await chromium.launch({ headless: true });
  const ctx: ScrapeContext = {
    nowISO,
    nowDate: now.toJSDate(),
    timezone: TIMEZONE,
    browser,
    log,
  };

  const results: ScrapeResult[] = [];
  for (const scraper of SCRAPERS) {
    const result = await runWithRetries(scraper, ctx, 3);
    results.push(result);
  }

  await browser.close();

  const collected = results.flatMap((result) => result.events);
  const deduped = dedupeEvents(collected);
  const { valid, errors: validationErrors } = validateEvents(deduped);
  const sorted = sortEvents(valid);

  const previousEvents = (await readPreviousEvents()) as typeof sorted;
  const diffWarnings = detectCountDrops(previousEvents, sorted);

  const facilityErrors = results.flatMap((result) =>
    result.errors.map((error) => `${result.facility}: ${error}`)
  );

  const globalWarnings = [...diffWarnings];
  const globalErrors = [...validationErrors, ...facilityErrors];

  if (globalErrors.length > 0) {
    log(`Errors detected: ${globalErrors.length}`);
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf-8");

  const emailConfig = getEmailConfig();
  const reportText = formatReport(results, globalWarnings, globalErrors);

  if (emailConfig) {
    const hasErrors = globalErrors.length > 0;
    if (hasErrors) {
      await sendEmail(emailConfig, "[Ariake Events] Scraper Errors", reportText);
    }

    const isWeekly = now.weekday === 1;
    if (isWeekly) {
      await sendEmail(emailConfig, "[Ariake Events] Weekly Summary", reportText);
    }
  } else {
    log("Email config missing. Skipping notifications.");
  }

  if (globalErrors.length > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});

