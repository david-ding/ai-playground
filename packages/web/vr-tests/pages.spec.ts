import { expect, test, openWithFonts, waitForFonts } from './fixtures';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

for (const viewport of VIEWPORTS) {
  test(`home page ${viewport.name}`, async ({ page }, testInfo) => {
    const brand = testInfo.project.name;
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openWithFonts(page, `/web/${brand}/`);
    await page.locator('body').waitFor({ state: 'attached' });
    await waitForFonts(page);
    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.001,
    });
  });
}
