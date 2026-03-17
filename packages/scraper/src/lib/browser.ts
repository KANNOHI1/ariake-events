import {
  chromium,
  type Browser,
  type BrowserContext,
} from "playwright";

let browser: Browser | null = null;
let context: BrowserContext | null = null;

export const launchBrowser = async (): Promise<void> => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  });
};

export const closeBrowser = async (): Promise<void> => {
  await context?.close();
  await browser?.close();
  context = null;
  browser = null;
};

export const fetchHtml = async (url: string): Promise<string> => {
  if (!context)
    throw new Error("Browser not launched. Call launchBrowser() first.");
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2000);
    return await page.content();
  } finally {
    await page.close();
  }
};
