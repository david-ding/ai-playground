import { readFileSync } from 'node:fs';
import { expect, test, openWithFonts, waitForFonts } from './fixtures';
import { storyTests } from './story-tests';
import type { StoryTest } from './story-declarations';

type StoryIndexEntry = { id: string; title?: string; type?: string };
type StoryIndex = { entries: Record<string, StoryIndexEntry> };

function slugify(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function slugifyTitle(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function resolveStoryId(storyTest: StoryTest, index: StoryIndex): string {
  const { module, exportName } = storyTest.story;
  const title = module.default.title;
  if (!title) throw new Error(`CSF module has no title for ${exportName}`);
  if (!(exportName in module)) throw new Error(`CSF story export not found: ${exportName}`);

  const id = `${slugifyTitle(title)}--${slugify(exportName)}`;
  const entry = index.entries[id];
  if (!entry || entry.type !== 'story' || entry.title !== title) {
    throw new Error(`Story is missing from generated Storybook index: ${id}`);
  }
  return entry.id;
}

function readIndex(brand: string): StoryIndex {
  return JSON.parse(
    readFileSync(new URL(`../storybook-static/${brand}/index.json`, import.meta.url), 'utf8'),
  ) as StoryIndex;
}

for (const storyTest of storyTests) {
  test(storyTest.description, async ({ page }, testInfo) => {
    const brand = testInfo.project.name;
    const storyId = resolveStoryId(storyTest, readIndex(brand));
    await openWithFonts(page, `/storybook/${brand}/iframe.html?id=${storyId}`);
    await page.locator('#storybook-root').waitFor({ state: 'attached' });
    await waitForFonts(page);
    await expect(page.locator('#storybook-root')).toHaveScreenshot(`${storyId}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.001,
    });
  });
}
