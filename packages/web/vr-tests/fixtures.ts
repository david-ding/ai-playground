import { test as base, expect, type Page } from '@playwright/test';

export const FONT_CSS = `
@font-face {
  font-family: 'VR Inter';
  font-weight: 400;
  src: url('/fonts/inter-400.woff2') format('woff2');
}
@font-face {
  font-family: 'VR Inter';
  font-weight: 700;
  src: url('/fonts/inter-700.woff2') format('woff2');
}
:root {
  --font-sans: 'VR Inter', system-ui, sans-serif !important;
  --default-font-family: 'VR Inter', system-ui, sans-serif !important;
}
`;

export async function openWithFonts(page: Page, url: string) {
  await page.goto(url);
  await page.addStyleTag({ content: FONT_CSS });
}

export async function waitForFonts(page: Page) {
  await page.evaluate(() => (document as Document & { fonts: FontFaceSet }).fonts.ready);
}

export { expect };

export const test = base;
