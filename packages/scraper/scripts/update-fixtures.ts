/**
 * Fetch live HTML from all 5 facility sites and save as test fixtures.
 * Run: pnpm --filter scraper update-fixtures
 *
 * After updating, run tests to check if selectors still match:
 *   pnpm --filter scraper test
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const FIXTURES_DIR = resolve(import.meta.dirname, "../test/fixtures");

const PAGES = [
  {
    name: "ariake-garden",
    url: "https://www.shopping-sumitomo-rd.com/ariake/event/",
  },
  {
    name: "tokyo-big-sight",
    url: "https://www.bigsight.jp/visitor/event/",
  },
  {
    name: "ariake-arena",
    url: "https://ariake-arena.tokyo/event/",
  },
  {
    name: "toyota-arena-tokyo",
    url: "https://toyota-arena-tokyo.jp/events/",
  },
  {
    name: "tokyo-garden-theater",
    url: "https://www.shopping-sumitomo-rd.com/tokyo_garden_theater/schedule/",
  },
];

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  });

  for (const { name, url } of PAGES) {
    console.log(`Fetching ${name} from ${url}...`);
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      const html = await page.content();
      const outPath = resolve(FIXTURES_DIR, `${name}.html`);
      writeFileSync(outPath, html, "utf-8");
      console.log(`  Saved: ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
    } catch (error) {
      console.error(`  FAILED: ${(error as Error).message}`);
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();
  console.log("\nDone. Run 'pnpm --filter scraper test' to verify selectors.");
}

main().catch((error) => {
  console.error(`Fatal: ${(error as Error).message}`);
  process.exit(1);
});
