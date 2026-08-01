import { readFileSync } from 'node:fs';
import { expect, test, openWithFonts, waitForFonts } from './fixtures';

const BRAND = JSON.parse(readFileSync(new URL('./brands.json', import.meta.url), 'utf8'))[0];
type StoryIndexEntry = { id: string; type?: string };
const index = JSON.parse(
  readFileSync(
    new URL(`../storybook-static/${BRAND}/index.json`, import.meta.url),
    'utf8',
  ),
) as { entries: Record<string, StoryIndexEntry> };
const storyIds = Object.values(index.entries)
  .filter((entry) => entry.type === 'story')
  .map((entry) => entry.id);

for (const storyId of storyIds) {
  test(`renders ${storyId}`, async ({ page }, testInfo) => {
    const brand = testInfo.project.name;
    await openWithFonts(page, `/storybook/${brand}/iframe.html?id=${storyId}`);
    await page.locator('#storybook-root').waitFor({ state: 'attached' });
    await waitForFonts(page);
    await expect(page.locator('#storybook-root')).toHaveScreenshot(`${storyId}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.001,
    });
  });
}
