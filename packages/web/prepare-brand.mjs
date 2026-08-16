import { cpSync, copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export function prepareBrand(brand = process.env.VITE_BRAND || 'brand-a') {
  const source = require.resolve(`@david-ding/brand-theme/themes/${brand}.css`);
  const destination = resolve(ROOT, 'gen/brand.css');

  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
  cpSync(resolve(dirname(source), '..', 'fonts'), resolve(ROOT, 'fonts'), {
    recursive: true,
  });
}
