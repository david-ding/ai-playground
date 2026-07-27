import { copyFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const ROOT = import.meta.dirname;

function brandPlugin(): Plugin {
  const brand = process.env.VITE_BRAND || 'brand-a';
  return {
    name: 'brand-theme',
    buildStart() {
      const src = resolve(ROOT, `src/brands/${brand}/theme.css`);
      const dest = resolve(ROOT, 'gen/brand.css');
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(src, dest);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), brandPlugin()],
});
