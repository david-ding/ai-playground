import { copyFileSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const ROOT = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function brandPlugin(): Plugin {
  const brand = process.env.VITE_BRAND || 'brand-a';
  return {
    name: 'brand-theme',
    buildStart() {
      const src = require.resolve(`@david-ding/brand-theme/themes/${brand}.css`);
      const dest = resolve(ROOT, 'gen/brand.css');
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(src, dest);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), brandPlugin()],
});
