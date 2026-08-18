import { globSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { StoryTest } from './story-declarations';

const declarationsDirectory = dirname(fileURLToPath(import.meta.url));
const declarationPaths = globSync('../src/**/*.vr-test.tsx', {
  cwd: declarationsDirectory,
})
  .map((path) => resolve(declarationsDirectory, path))
  .sort();

export const storyTests: StoryTest[] = await Promise.all(
  declarationPaths.map(async (path) => {
    const declaration = await import(pathToFileURL(path).href);
    return declaration.default as StoryTest;
  }),
);
