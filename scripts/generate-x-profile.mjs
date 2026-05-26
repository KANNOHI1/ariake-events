import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scraperPkg = path.join(__dirname, "..", "packages", "scraper", "package.json");
const requireFromScraper = createRequire(pathToFileURL(scraperPkg).href);
const { chromium } = requireFromScraper("playwright");

const templatePath = path.join(__dirname, "x-profile-template.html");
const outputPath = path.join(__dirname, "..", "packages", "web", "public", "x-profile.png");

const main = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 400, height: 400 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(templatePath).href);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.screenshot({ path: outputPath, type: "png", omitBackground: false });
  await browser.close();
  console.log(`Generated: ${outputPath}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
