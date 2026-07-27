import { copyFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_BRANDS = resolve(ROOT, "..", "web", "src", "brands");
const THEMES = resolve(ROOT, "themes");

mkdirSync(THEMES, { recursive: true });

const brands = ["brand-a", "brand-b"];

for (const brand of brands) {
  const src = resolve(WEB_BRANDS, brand, "theme.css");
  const dest = resolve(THEMES, `${brand}.css`);
  copyFileSync(src, dest);
  console.log(`Synced ${brand}.css`);
}
