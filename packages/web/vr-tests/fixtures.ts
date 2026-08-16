import { test as base, expect, type Page } from '@playwright/test';

export async function openWithFonts(page: Page, url: string) {
  await page.goto(url);
}

export async function waitForFonts(page: Page) {
  await page.evaluate(() => (document as Document & { fonts: FontFaceSet }).fonts.ready);
}

export { expect };

export const test = base;
