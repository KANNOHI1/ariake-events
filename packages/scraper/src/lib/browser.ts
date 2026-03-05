import type { Browser } from "playwright";

const DEFAULT_TIMEOUT_MS = 60_000;

export const fetchPageContent = async (browser: Browser, url: string, waitForSelector?: string) => {
  const context = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { timeout: DEFAULT_TIMEOUT_MS });
  }
  const content = await page.content();
  await context.close();
  return content;
};
