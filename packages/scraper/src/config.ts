import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PACKAGE_ROOT = path.resolve(__dirname, "..", "..");
export const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");

export const OUTPUT_PATH = path.join(REPO_ROOT, "packages", "web", "public", "events.json");
export const TIMEZONE = "Asia/Tokyo";

