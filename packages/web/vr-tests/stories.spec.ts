import { readFileSync } from 'node:fs';
import { expect, test, openWithFonts, waitForFonts } from './fixtures';
import { storyTests } from './story-tests';
import type { StoryTest } from './story-declarations';

type StoryIndexEntry = { id: string; title?: string; type?: string; exportName?: string };
type StoryIndex = { entries: Record<string, StoryIndexEntry> };

function resolveStoryId(storyTest: StoryTest, index: StoryIndex, brand: string): string {
  const { module, exportName } = storyTest.story;
  const title = module.default.title;
  if (!title) {
    throw new Error(
      `Story declaration "${storyTest.description}" has no CSF title for export "${exportName}" in brand "${brand}"`,
    );
  }
  if (!(exportName in module)) {
    throw new Error(
      `Story declaration "${storyTest.description}" references missing CSF export "${exportName}" in brand "${brand}"`,
    );
  }
  if (module[exportName] !== storyTest.story.value) {
    throw new Error(
      `Story declaration "${storyTest.description}" has mismatched CSF story metadata for "${title}.${exportName}" in brand "${brand}"`,
    );
  }

  const entries = Object.values(index.entries).filter(
    (entry) => entry.type === 'story' && entry.title === title,
  );
  const matchingEntries = entries.filter((entry) => entry.exportName === exportName);
  if (matchingEntries.length !== 1) {
    throw new Error(
      `Story declaration "${storyTest.description}" could not resolve CSF story "${title}.${exportName}" in brand "${brand}"`,
    );
  }
  return matchingEntries[0].id;
}

function readIndex(brand: string, description: string): StoryIndex {
  try {
    return JSON.parse(
      readFileSync(new URL(`../storybook-static/${brand}/index.json`, import.meta.url), 'utf8'),
    ) as StoryIndex;
  } catch (error) {
    throw new Error(
      `Story declaration "${description}" could not load the generated Storybook index for brand "${brand}"`,
      { cause: error },
    );
  }
}

for (const storyTest of storyTests) {
  test(storyTest.description, async ({ page }, testInfo) => {
    const brand = testInfo.project.name;
    const storyId = resolveStoryId(storyTest, readIndex(brand, storyTest.description), brand);
    await openWithFonts(page, `/storybook/${brand}/iframe.html?id=${storyId}`);
    await page.locator('#storybook-root').waitFor({ state: 'attached' });
    await waitForFonts(page);
    await expect(page.locator('#storybook-root')).toHaveScreenshot(`${storyId}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.001,
    });
  });
}
