import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { OUTPUT_PATH, TIMEZONE } from "./config.js";
import { launchBrowser, closeBrowser, fetchHtml, newPage } from "./lib/browser.js";
import { validateEvents, dedupeEvents, sortEvents } from "./lib/validate.js";
import { applyCongestionRisk, getDailyScores } from "./lib/congestion.js";
import type { FacilityScraper, ScrapeContext, ScrapeResult } from "./types.js";

import {
  ariakeGardenScraper,
  tokyoBigSightScraper,
  ariakeArenaScraper,
  toyotaArenaTokyoScraper,
  tokyoGardenTheaterScraper,
} from "./sources/index.js";

const SCRAPERS: FacilityScraper[] = [
  ariakeGardenScraper,
  tokyoBigSightScraper,
  ariakeArenaScraper,
  toyotaArenaTokyoScraper,
  tokyoGardenTheaterScraper,
];

const TIMEOUT_MS = 120_000; // 2 minutes per scraper

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label}: timeout after ${ms}ms`)), ms),
    ),
  ]);

const main = async (): Promise<void> => {
  const nowISO = new Date().toISOString();

  const ctx: ScrapeContext = {
    nowISO,
    timezone: TIMEZONE,
    fetchHtml,
    newPage,
    log: (msg: string) => console.log(`[scraper] ${msg}`),
  };

  console.log(`[scraper] Starting at ${nowISO}`);
  console.log(`[scraper] Running ${SCRAPERS.length} scrapers`);

  await launchBrowser();

  const results: ScrapeResult[] = [];

  try {
    for (const scraper of SCRAPERS) {
      try {
        const result = await withTimeout(
          scraper.run(ctx),
          TIMEOUT_MS,
          scraper.facility,
        );
        results.push(result);

        if (result.warnings.length > 0) {
          for (const w of result.warnings) {
            console.warn(`[scraper] ⚠ ${scraper.facility}: ${w}`);
          }
        }
        if (result.errors.length > 0) {
          for (const e of result.errors) {
            console.error(`[scraper] ✗ ${scraper.facility}: ${e}`);
          }
        }
      } catch (error) {
        console.error(
          `[scraper] ✗ ${scraper.facility}: ${(error as Error).message}`,
        );
        results.push({
          facility: scraper.facility,
          sourceURL: scraper.sourceURL,
          events: [],
          warnings: [],
          errors: [(error as Error).message],
        });
      }
    }
  } finally {
    await closeBrowser();
  }

  // Aggregate all events
  const allRawEvents = results.flatMap((r) => r.events);
  console.log(`[scraper] Total raw events: ${allRawEvents.length}`);

  // Validate
  const { valid, errors: validationErrors } = validateEvents(allRawEvents);
  for (const e of validationErrors) {
    console.warn(`[scraper] ⚠ validation: ${e}`);
  }

  // Dedupe and sort
  const deduped = sortEvents(dedupeEvents(valid));

  // Assign congestionRisk scores
  const finalEvents = applyCongestionRisk(deduped);
  console.log(`[scraper] Final events after validation/dedupe: ${finalEvents.length}`);

  // congestionRisk summary
  const scored = finalEvents.filter((e) => e.congestionRisk !== null && e.congestionRisk > 0);
  const maxRisk = scored.reduce((m, e) => Math.max(m, e.congestionRisk ?? 0), 0);
  console.log(`[scraper] congestionRisk: ${scored.length}/${finalEvents.length} events scored, max=${maxRisk.toFixed(3)}`);

  // Write output
  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(finalEvents, null, 2), "utf-8");
  console.log(`[scraper] Written to ${OUTPUT_PATH}`);

  // 履歴 JSON に今日のスコアを追記（過去 90 日分を保持）
  const HISTORY_PATH = path.join(path.dirname(OUTPUT_PATH), "history", "congestion-scores.json");
  const todayScores = getDailyScores(finalEvents);
  let history: Record<string, number> = {};
  if (existsSync(HISTORY_PATH)) {
    try {
      history = JSON.parse(readFileSync(HISTORY_PATH, "utf-8"));
    } catch {
      console.warn("[scraper] ⚠ Failed to read history JSON, starting fresh");
    }
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const merged = Object.fromEntries(
    Object.entries({ ...history, ...todayScores })
      .filter(([date]) => date >= cutoffStr)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  writeFileSync(HISTORY_PATH, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`[scraper] Written history (${Object.keys(merged).length} days) to ${HISTORY_PATH}`);

  // Summary per facility
  const facilityCounts = new Map<string, number>();
  for (const e of finalEvents) {
    facilityCounts.set(e.facility, (facilityCounts.get(e.facility) ?? 0) + 1);
  }

  // Build summary table for console + GitHub Actions
  const summaryRows: Array<{ facility: string; events: number; status: string }> = [];
  for (const r of results) {
    const count = facilityCounts.get(r.facility) ?? 0;
    const hasErrors = r.errors.length > 0;
    const status = hasErrors && count === 0 ? "FAIL" : count === 0 ? "WARN" : "OK";
    summaryRows.push({ facility: r.facility, events: count, status });
    console.log(`[scraper]   ${status} ${r.facility}: ${count} events`);
  }

  const failedFacilities = summaryRows.filter((r) => r.status === "FAIL");
  const warnFacilities = summaryRows.filter((r) => r.status === "WARN");

  if (failedFacilities.length > 0) {
    console.error(
      `[scraper] ${failedFacilities.length}/${SCRAPERS.length} facilities failed`,
    );
  }
  if (warnFacilities.length > 0) {
    console.warn(
      `[scraper] ${warnFacilities.length}/${SCRAPERS.length} facilities returned 0 events`,
    );
  }

  // Write GitHub Actions Job Summary (GITHUB_STEP_SUMMARY)
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const dateRange = finalEvents.length > 0
      ? `${finalEvents[0].startDate} ~ ${finalEvents[finalEvents.length - 1].startDate}`
      : "N/A";
    const md = [
      `## Scrape Results`,
      ``,
      `| Facility | Events | Status |`,
      `|---|---:|---|`,
      ...summaryRows.map(
        (r) => `| ${r.facility} | ${r.events} | ${r.status === "OK" ? "OK" : r.status === "WARN" ? "⚠ 0件" : "✗ FAIL"} |`,
      ),
      `| **Total** | **${finalEvents.length}** | |`,
      ``,
      `Date range: ${dateRange}`,
      `Validation errors: ${validationErrors.length}`,
      ``,
    ].join("\n");
    const { appendFileSync } = await import("node:fs");
    appendFileSync(summaryPath, md, "utf-8");
  }

  // Exit code: 1 only if zero total events collected
  if (finalEvents.length === 0) {
    console.error("[scraper] FATAL: No events collected from any facility");
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(`[scraper] Fatal error: ${(error as Error).message}`);
  process.exit(1);
});
