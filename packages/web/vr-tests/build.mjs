import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { prepareBrand } from '../prepare-brand.mjs';

const ROOT = resolve(import.meta.dirname, '../../..');
const brands = JSON.parse(readFileSync(new URL('./brands.json', import.meta.url), 'utf8'));

for (const brand of brands) {
  const env = { ...process.env, VITE_BRAND: brand };

  prepareBrand(brand);

  console.log(`\n=== storybook build: ${brand} ===`);
  execSync(
    `storybook build --config-dir packages/web/.storybook --output-dir packages/web/storybook-static/${brand}`,
    { cwd: ROOT, env, stdio: 'inherit' },
  );

  console.log(`\n=== web build: ${brand} ===`);
  execSync(`vite build --outDir dist/${brand} --base /web/${brand}/`, {
    cwd: resolve(ROOT, 'packages/web'),
    env,
    stdio: 'inherit',
  });
}
